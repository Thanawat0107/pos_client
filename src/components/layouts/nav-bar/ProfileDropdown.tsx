import { Menu, MenuItem, ListItemIcon, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";

interface ProfileDropdownProps {
  anchor: HTMLElement | null;
  onClose: () => void;
  isAuthenticated: boolean;
  onLogout: () => void;
}

export const ProfileDropdown = ({
  anchor,
  onClose,
  isAuthenticated,
  onLogout,
}: ProfileDropdownProps) => {
  const navigate = useNavigate();

  const handleAction = (path: string, action?: () => void) => {
    onClose();
    if (action) {
      action();
    } else {
      navigate(path);
    }
  };

  return (
    <Menu
      anchorEl={anchor}
      open={Boolean(anchor)}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      PaperProps={{
        sx: { mt: 1.5, minWidth: 200, borderRadius: "16px", p: 1 },
      }}
    >
      {isAuthenticated && (
        <MenuItem
          onClick={() => handleAction("/profile")}
          sx={{ borderRadius: "10px" }}
        >
          <ListItemIcon>
            <PersonOutlineIcon fontSize="small" />
          </ListItemIcon>
          ข้อมูลส่วนตัว
        </MenuItem>
      )}

      {isAuthenticated && <Divider sx={{ my: 1 }} />}

      <MenuItem
        onClick={() =>
          isAuthenticated ? handleAction("/", onLogout) : handleAction("/login")
        }
        sx={{
          borderRadius: "10px",
          color: isAuthenticated ? "error.main" : "primary.main",
        }}
      >
        <ListItemIcon sx={{ color: "inherit" }}>
          {isAuthenticated ? (
            <LogoutIcon fontSize="small" />
          ) : (
            <LoginIcon fontSize="small" />
          )}
        </ListItemIcon>
        {isAuthenticated ? "ออกจากระบบ" : "เข้าสู่ระบบ"}
      </MenuItem>
    </Menu>
  );
};
