import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Fade,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { ADMIN_NAV } from "./navConfig";

interface AdminDropdownProps {
  anchor: HTMLElement | null;
  onClose: () => void;
}

export const AdminDropdown = ({ anchor, onClose }: AdminDropdownProps) => (
  <Menu
    anchorEl={anchor}
    open={Boolean(anchor)}
    onClose={onClose}
    TransitionComponent={Fade}
    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    transformOrigin={{ vertical: "top", horizontal: "right" }}
    PaperProps={{
      sx: {
        mt: 1.5,
        minWidth: 220,
        borderRadius: "16px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
        p: 1,
      },
    }}
  >
    {ADMIN_NAV.map((item) => (
      <MenuItem
        key={item.path}
        component={RouterLink}
        to={item.path}
        onClick={onClose} // ปิดเมนูเมื่อคลิกเลือก
        sx={{ borderRadius: "10px", mb: 0.5 }}
      >
        <ListItemIcon sx={{ color: "primary.main" }}>{item.icon}</ListItemIcon>
        <ListItemText
          primary={item.text}
          primaryTypographyProps={{ fontWeight: 500 }}
        />
      </MenuItem>
    ))}
  </Menu>
);
