import * as React from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { SvgIconProps } from "@mui/material/SvgIcon";

const ITEM_HEIGHT = 48;

interface Option {
  name: string;
  action: () => void;
  icon?: React.ReactElement<SvgIconProps>;
}

interface OptionsButtonProps {
  options: Option[];
}

export default function OptionsButton({ options }: OptionsButtonProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? "long-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="long-menu"
        MenuListProps={{
          "aria-labelledby": "long-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 4.5,
            width: "20ch",
          },
        }}
      >
        {options.map((option, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              option.action();
              handleClose();
            }}
          >
            {option.icon &&
              React.cloneElement(option.icon, { style: { marginRight: 8 } })}
            {option.name}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
