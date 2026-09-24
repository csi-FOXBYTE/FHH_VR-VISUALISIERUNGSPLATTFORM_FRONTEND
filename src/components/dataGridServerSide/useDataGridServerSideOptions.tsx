"use client";

import {
  DataGridProps,
  GridApi,
  GridInitialState,
  GridSortModel,
} from "@mui/x-data-grid";
import { ReactNode, useLayoutEffect, useMemo, useRef, useState } from "react";
import { CustomGridToolbar } from "./CustomGridToolbar";

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
    DataGridProps["paginationModel"]
  >({
    page: 0,
    pageSize: 50,
  });
  const [rowModesModel, setRowModesModel] = useState<
    DataGridProps["rowModesModel"]
  >({});

  const onSortModelChange: DataGridProps["onSortModelChange"] = (model) => {
    setSortModel(model);
  };

  const onPaginationModelChange: DataGridProps["onPaginationModelChange"] = (
    model
  ) => {
    setPaginationModel(model);
  };

  const onFilterModelChange: DataGridProps["onFilterModelChange"] = (model) => {
    setFilterModel(model);
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
    if (!apiRef.current) return;

    // Earlier versions stored the complete grid state (including filters and
    // the page) under the plain name. Restoring that into the controlled grid
    // could replay filters or sort items the server cannot handle, so it is
    // discarded and only a reduced state is kept under a versioned key.
    const storageKey = `${name}:v2`;

    try {
      localStorage.removeItem(name);

      const stored = JSON.parse(localStorage.getItem(storageKey) ?? "null") as {
        columns?: GridInitialState["columns"];
        sortModel?: GridSortModel;
        pageSize?: number;
      } | null;

      if (stored) {
        if (stored.columns && typeof stored.columns === "object") {
          apiRef.current.restoreState({ columns: stored.columns });
        }

        if (Array.isArray(stored.sortModel)) {
          setSortModel(
            stored.sortModel.filter(
              (item) =>
                (item?.sort === "asc" || item?.sort === "desc") &&
                apiRef.current?.getColumn(item.field)?.sortable === true
            )
          );
        }

        if (
          Number.isInteger(stored.pageSize) &&
          stored.pageSize! >= 1 &&
          stored.pageSize! <= 100
        ) {
          setPaginationModel({ page: 0, pageSize: stored.pageSize! });
        }
      }
    } catch {}

    const abortController = new AbortController();

    function saveSnapshot() {
      try {
        if (!apiRef.current) return;
        const exportedState = apiRef.current.exportState();
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            columns: exportedState.columns,
            sortModel: exportedState.sorting?.sortModel ?? [],
            pageSize: exportedState.pagination?.paginationModel?.pageSize,
          })
        );
      } catch {}
    }

    window.addEventListener("beforeunload", saveSnapshot, {
      signal: abortController.signal,
    });

    return () => {
      abortController.abort();
      saveSnapshot();
    };
  }, [name]);

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
    }),
    [
      props?.extraActions,
      props?.showQuickFilter,
      filterModel,
      paginationModel,
      rowModesModel,
      rowSelectionModel,
      sortModel,
    ]
  );

  return result;
}
