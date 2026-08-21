"use client";

import { DataGridProps, GridApi } from "@mui/x-data-grid";
import { ReactNode, useLayoutEffect, useMemo, useRef, useState } from "react";
import { CustomGridToolbar } from "./CustomGridToolbar";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSession } from "next-auth/react";

const GRID_STATE_VERSION = 1;

type PersistedGridState = {
  version: typeof GRID_STATE_VERSION;
  columns?: object;
  pageSize: number;
  sortModel: NonNullable<DataGridProps["sortModel"]>;
};

export function parsePersistedGridState(
  value: string,
): PersistedGridState | null {
  try {
    const parsed = JSON.parse(value) as Partial<PersistedGridState>;
    if (
      parsed.version !== GRID_STATE_VERSION ||
      !Number.isInteger(parsed.pageSize) ||
      !parsed.pageSize ||
      parsed.pageSize < 1 ||
      parsed.pageSize > 100 ||
      !Array.isArray(parsed.sortModel) ||
      parsed.sortModel.length > 10 ||
      !parsed.sortModel.every(
        (item) =>
          item &&
          typeof item.field === "string" &&
          item.field.length <= 100 &&
          (item.sort === "asc" || item.sort === "desc"),
      ) ||
      (parsed.columns !== undefined &&
        (typeof parsed.columns !== "object" ||
          parsed.columns === null ||
          JSON.stringify(parsed.columns).length > 50_000))
    ) {
      return null;
    }
    return parsed as PersistedGridState;
  } catch {
    return null;
  }
}

export default function useDataGridServerSideHelper(
  name: string,
  props?: {
    showQuickFilter?: boolean;
    initialState?: DataGridProps["initialState"];
    extraActions?: {
      key: string;
      label: string;
      onClick?: () => void;
      loading?: boolean;
      disabled?: boolean;
      href?: string;
      icon: ReactNode;
    }[];
  }
) {
  const [rowSelectionModel, setRowSelectionModel] = useState<
    DataGridProps["rowSelectionModel"]
  >([]);
  const [filterModel, setFilterModel] = useState<DataGridProps["filterModel"]>({
    items: [],
    quickFilterValues: [],
  });
  const [sortModel, setSortModel] = useState<DataGridProps["sortModel"]>([]);
  const [paginationModel, setPaginationModel] = useState<
    NonNullable<DataGridProps["paginationModel"]>
  >({
    page: 0,
    pageSize: 50,
  });
  const [rowModesModel, setRowModesModel] = useState<
    DataGridProps["rowModesModel"]
  >({});
  const debouncedFilterModel = useDebouncedValue(filterModel, 400);
  const session = useSession();
  const userId = session.data?.user.id;

  const onSortModelChange: DataGridProps["onSortModelChange"] = (model) => {
    setSortModel(model);
    setPaginationModel((current) =>
      current.page === 0 ? current : { ...current, page: 0 },
    );
  };

  const onPaginationModelChange: DataGridProps["onPaginationModelChange"] = (
    model
  ) => {
    setPaginationModel(model);
  };

  const onFilterModelChange: DataGridProps["onFilterModelChange"] = (model) => {
    setFilterModel(model);
    setPaginationModel((current) =>
      current.page === 0 ? current : { ...current, page: 0 },
    );
  };

  const onRowSelectionModelChange: DataGridProps["onRowSelectionModelChange"] =
    (model) => {
      setRowSelectionModel(model);
    };

  const onRowModesModelChange: DataGridProps["onRowModesModelChange"] = (
    model
  ) => setRowModesModel(model);

  const apiRef = useRef<GridApi>(null);

  useLayoutEffect(() => {
    if (!apiRef.current || !userId) return;

    const storageKey = `fhhvr:grid:v${GRID_STATE_VERSION}:${userId}:${name}`;
    const storedState = localStorage.getItem(storageKey);
    const persistedState = storedState
      ? parsePersistedGridState(storedState)
      : null;
    if (persistedState) {
      apiRef.current.restoreState({
        columns: persistedState.columns,
        sorting: { sortModel: persistedState.sortModel },
        pagination: {
          paginationModel: {
            page: 0,
            pageSize: persistedState.pageSize,
          },
        },
      });
    }

    const abortController = new AbortController();

    function saveSnapshot() {
      try {
        if (!apiRef.current) return;
        const exportedState = apiRef.current.exportState();
        const safeState: PersistedGridState = {
          version: GRID_STATE_VERSION,
          columns: exportedState.columns,
          pageSize:
            exportedState.pagination?.paginationModel?.pageSize ??
            paginationModel.pageSize,
          sortModel: exportedState.sorting?.sortModel ?? [],
        };
        localStorage.setItem(storageKey, JSON.stringify(safeState));
      } catch {}
    }

    window.addEventListener("beforeunload", saveSnapshot, {
      signal: abortController.signal,
    });

    return () => {
      abortController.abort();
      saveSnapshot();
    };
  }, [name, paginationModel.pageSize, userId]);

  const result = useMemo(
    () => ({
      props: {
        columns: [],
        apiRef,
        pagination: true,
        rowSelectionModel,
        filterModel,
        sortModel,
        paginationModel,
        rowModesModel,
        onSortModelChange,
        onFilterModelChange,
        onRowSelectionModelChange,
        onPaginationModelChange,
        onRowModesModelChange,
        sortingMode: "server" as const,
        filterMode: "server" as const,
        paginationMode: "server" as const,
        editMode: "row" as const,
        checkboxSelection: true,
        disableMultipleRowSelection: false,
        disableVirtualization: false,
        slotProps: {
          loadingOverlay: {
            variant: "skeleton" as const,
            noRowsVariant: "skeleton" as const,
          },
          toolbar: {
            showQuickFilter: props?.showQuickFilter ?? true,
            extraActions: props?.extraActions,
          },
        },
        slots: {
          toolbar: CustomGridToolbar,
        },
      } as DataGridProps,
      setters: {
        setPaginationModel,
        setRowSelectionModel,
        setFilterModel,
        setSortModel,
        setRowModesModel,
      },
      query: {
        filterModel: debouncedFilterModel,
        paginationModel,
        sortModel,
      },
    }),
    [
      props?.extraActions,
      props?.showQuickFilter,
      filterModel,
      debouncedFilterModel,
      paginationModel,
      rowModesModel,
      rowSelectionModel,
      sortModel,
    ]
  );

  return result;
}
