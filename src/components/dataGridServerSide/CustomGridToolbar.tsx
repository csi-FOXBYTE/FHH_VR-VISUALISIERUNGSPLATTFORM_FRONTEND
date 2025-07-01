"use client";

import { Download, Share } from "@mui/icons-material";
import {
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem
} from "@mui/material";
import {
  GridApi,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarProps,
  GridToolbarQuickFilter,
  useGridApiContext,
} from "@mui/x-data-grid";
import ExcelJS from "exceljs";
import { ReactNode, useState } from "react";

async function generateExcelFile(api: GridApi) {
  const columns = api
    .getVisibleColumns()
    .filter((column) => column.type !== "actions" && column.type !== "custom")
    .map((column) => ({
      header: column.headerName,
      key: column.field,
    }));

  const rows = api.getSortedRows();

  const workBook = new ExcelJS.Workbook();

  const workSheet = workBook.addWorksheet("Default", {});

  workSheet.columns = columns;

  workSheet.addRows(rows);

  const buffer = await workBook.xlsx.writeBuffer();

  return buffer;
}

const CustomGridToolbarShare = () => {
  const apiRef = useGridApiContext();

  async function handleShare() {
    const excelBuffer = await generateExcelFile(apiRef.current);

    const dataUrl =
      "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," +
      Buffer.from(excelBuffer).toString("base64");

    const a = document.createElement("a");

    document.body.appendChild(a);

    a.href = `mailto:janedoe@huf-group.de?subject=PMC&body=${encodeURIComponent(
      `<a href="${dataUrl}">Excel</a>`
    )}`;

    a.click();

    document.body.removeChild(a);
  }

  return (
    <MenuItem disabled onClick={handleShare}>
      <ListItemIcon>
        <Share />
      </ListItemIcon>
      <ListItemText>Share</ListItemText>
    </MenuItem>
  );
};

const CustomGridToolbarExport = () => {
  const apiRef = useGridApiContext();

  const handleExportToExcel = async () => {
    const buffer = await generateExcelFile(apiRef.current);

    const a = document.createElement("a");

    const fileURL = URL.createObjectURL(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
    );

    a.href = fileURL.toString();
    a.download = "true";

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(fileURL);
  };

  return (
    <MenuItem onClick={handleExportToExcel}>
      <ListItemIcon>
        <Download />
      </ListItemIcon>
      <ListItemText>Export to Excel</ListItemText>
    </MenuItem>
  );
};

export const CustomGridToolbar = ({
  showQuickFilter,
  extraActions,
  ...props
}: GridToolbarProps & {
  extraActions?: ReactNode;
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <GridToolbarContainer sx={{ alignItems: "center", padding: 0, justifyContent: "space-between" }} {...props}>
      <div style={{ display: "flex" }}>
        <GridToolbarFilterButton />
        <GridToolbarColumnsButton />
        <Menu
          anchorEl={anchorEl}
          open={anchorEl !== null}
          onClose={() => setAnchorEl(null)}
        >
          <CustomGridToolbarExport />
          <CustomGridToolbarShare />
        </Menu>
      </div>
      {showQuickFilter ? (
        <GridToolbarQuickFilter
          sx={{ paddingBottom: 0 }}
          variant="outlined"
          size="small"
        />
      ) : null}
      {extraActions ?? null}
    </GridToolbarContainer>
  );
};
