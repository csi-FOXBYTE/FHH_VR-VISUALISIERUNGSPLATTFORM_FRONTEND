"use client";

import { Link } from "@/server/i18n/routing";
import { Download, Share } from "@mui/icons-material";
import {
  Button,
  ButtonGroup,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
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
import { ArrowDropDownIcon } from "@mui/x-date-pickers";
import ExcelJS from "exceljs";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
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
  extraActions = [],
  ...props
}: GridToolbarProps & {
  extraActions?: {
    key: string;
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    href?: string;
    icon: ReactNode;
  }[];
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const extraActionFirst = extraActions.slice(0, 1)[0];
  const extraActionsRest = extraActions.slice(1);

  return (
    <GridToolbarContainer
      sx={{ alignItems: "center", padding: 0, justifyContent: "space-between" }}
      {...props}
    >
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
      {extraActionFirst ? (
        <ButtonGroup>
          <Button
            variant="contained"
            loading={extraActionFirst.loading}
            disabled={extraActionFirst.disabled}
            key={extraActionFirst.key}
            onClick={extraActionFirst.onClick}
            startIcon={extraActionFirst.icon}
            LinkComponent={extraActionFirst.href ? Link : undefined}
            href={extraActionFirst.href}
          >
            {extraActionFirst.label}
          </Button>
          {extraActionsRest.length > 0 ? (
            <PopupState variant="popover">
              {(popupState) => (
                <>
                  <Button variant="contained" {...bindTrigger(popupState)}>
                    <ArrowDropDownIcon />
                  </Button>
                  <Menu {...bindMenu(popupState)}>
                    {extraActionsRest.map((extraAction) => (
                      <ListItem key={extraAction.key} disablePadding>
                        <ListItemButton
                          disabled={extraAction.disabled}
                          LinkComponent={extraAction.href ? Link : undefined}
                          href={extraAction.href ?? ""}
                          onClick={extraAction.onClick}
                        >
                          <ListItemIcon>{extraAction.icon}</ListItemIcon>
                          <ListItemText primary={extraAction.label} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </Menu>
                </>
              )}
            </PopupState>
          ) : null}
        </ButtonGroup>
      ) : null}
    </GridToolbarContainer>
  );
};
