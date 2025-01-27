import { useCallback, useMemo } from 'react';
import { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { z } from 'zod';
import { parseAsFloat, parseAsJson, parseAsString, useQueryState } from 'nuqs';

const usePaginationAndSorting = () => {
    const [pageSize, setPageSize] = useQueryState(
        "pageSize",
        parseAsFloat.withDefault(25)
    );

    const [page, setPage] = useQueryState("page", parseAsFloat.withDefault(1));

    const paginationModel = useMemo(() => {
        return {
            page: Math.max(page, 1),
            pageSize,
        };
    }, [page, pageSize]);

    const handlePaginationModelChange = useCallback(
        ({ page, pageSize }: GridPaginationModel) => {
            console.log("Pagination changed: ", { page, pageSize });
            setPage(Math.max(page, 1));
            setPageSize(pageSize);
        },
        [setPage, setPageSize]
    );

    const [sortOrder, setSortOrder] = useQueryState(
        "sortOrder",
        parseAsJson(z.enum(["asc", "desc"]).optional().parse)
    );

    const [sortBy, setSortyBy] = useQueryState(
        "sortBy",
        parseAsString.withDefault("")
    );

    const handleSortModelChange = useCallback(
        (model: GridSortModel) => {
            if (model.length === 0) {
                setSortyBy("");
                setSortOrder(null);
            } else {
                setSortyBy(model[0].field);
                setSortOrder(model[0].sort ?? null);
            }
        },
        [setSortOrder, setSortyBy]
    );

    const sortModel = useMemo<GridSortModel>(() => {
        if (sortBy === "" || sortOrder === null) return [];
        return [
            {
                field: sortBy,
                sort: sortOrder === "asc" ? "asc" : "desc",
            },
        ];
    }, [sortBy, sortOrder]);

    return {
        paginationModel,
        handlePaginationModelChange,
        sortModel,
        handleSortModelChange,
        sortBy,
        sortOrder,
    };
};

export default usePaginationAndSorting;