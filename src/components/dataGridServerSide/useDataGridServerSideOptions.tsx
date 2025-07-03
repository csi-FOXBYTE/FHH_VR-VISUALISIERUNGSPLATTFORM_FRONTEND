"use client";

import { DataGridProps, GridApi } from "@mui/x-data-grid";
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

    if (localStorage.getItem(name)) {
      try {
        apiRef.current.restoreState(
          JSON.parse(localStorage.getItem(name) ?? "")
        );
      } catch {}
    }

    const abortController = new AbortController();

    function saveSnapshot() {
      try {
        if (!apiRef.current) return;
        localStorage.setItem(
          name,
          JSON.stringify(apiRef.current.exportState())
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
