import * as React from "react";
import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Stack,
  Button,
} from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";

// Icons
import MenuIcon from "@mui/icons-material/Menu";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";

import { Logo } from "./Logo";
import { ADMIN_NAV, MAIN_NAV } from "./navConfig";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
  onLogout: () => void;
  mode: string;
  onToggleTheme: () => void;
}

export const MobileSidebar = ({
  open,
  onClose,
  isAdmin,
  isAuthenticated,
  onLogout,
  mode,
  onToggleTheme,
}: MobileSidebarProps) => {
  const [openAdmin, setOpenAdmin] = React.useState(false);
  const location = useLocation();

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 300, borderRadius: "0 20px 20px 0" } }}
    >
      <Box
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Logo />
        <IconButton onClick={onClose}>
          <MenuIcon />
        </IconButton>
      </Box>

      <List sx={{ px: 2 }}>
        {/* แก้ไขส่วนการแสดงผล MAIN_NAV */}
        {MAIN_NAV.map((item) => (
          <ListItemButton
            key={item.path}
            component={RouterLink}
            to={item.path}
            onClick={onClose}
            selected={location.pathname === item.path}
            sx={{ borderRadius: "12px", mb: 1 }}
          >
            <ListItemIcon>
              {item.path === "/" ? (
                <HomeOutlinedIcon />
              ) : (
                <RestaurantMenuOutlinedIcon />
              )}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}

        {isAdmin && (
          <>
            <ListItemButton
              onClick={() => setOpenAdmin(!openAdmin)}
              sx={{ borderRadius: "12px" }}
            >
              <ListItemIcon>
                <SettingsOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="การจัดการ" />
              <ExpandMoreIcon
                sx={{
                  transform: openAdmin ? "rotate(180deg)" : "0",
                  transition: "0.2s",
                }}
              />
            </ListItemButton>

            <Collapse in={openAdmin} timeout="auto" unmountOnExit>
              <List disablePadding>
                {ADMIN_NAV.map((item) => (
                  <ListItemButton
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    onClick={onClose}
                    selected={location.pathname === item.path}
                    sx={{ pl: 4, borderRadius: "12px" }}
                  >
                    <ListItemIcon sx={{ minWidth: 35 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </>
        )}
      </List>

      <Box
        sx={{
          mt: "auto",
          p: 3,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack spacing={2}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={mode === "light" ? <LightModeIcon /> : <DarkModeIcon />}
            onClick={onToggleTheme}
            sx={{ borderRadius: "12px", textTransform: "none" }}
          >
            โหมด: {mode === "light" ? "สว่าง" : "มืด"}
          </Button>

          <Button
            fullWidth
            variant="contained"
            color={isAuthenticated ? "error" : "primary"}
            onClick={onLogout}
            component={isAuthenticated ? "button" : RouterLink}
            to={isAuthenticated ? undefined : "/login"}
            startIcon={isAuthenticated ? <LogoutIcon /> : <LoginIcon />}
            sx={{ borderRadius: "12px" }}
          >
            {isAuthenticated ? "ออกจากระบบ" : "เข้าสู่ระบบ"}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};
