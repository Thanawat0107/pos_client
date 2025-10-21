import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Tooltip,
  MenuItem,
  ListItemIcon,
  Divider,
  Menu,
  Fade,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import AutoModeIcon from "@mui/icons-material/AutoMode";
import { useColorMode } from "../../contexts/color-mode";
import { colors } from "./theme";
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import { useState } from "react";

export default function Navbar() {
  const { mode, toggle } = useColorMode();

  const icon =
    mode === "light" ? (
      <LightModeIcon />
    ) : mode === "dark" ? (
      <DarkModeIcon />
    ) : (
      <AutoModeIcon />
    );

     // --- Profile menu state ---
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{
        background: (theme) =>
          theme.palette.mode === "light"
            ? "rgba(255,255,255,0.9)"
            : "rgba(18,18,18,0.85)",
        color: (theme) => theme.palette.text.primary,
        boxShadow: (theme) =>
          theme.palette.mode === "light"
            ? "0 4px 12px rgba(0,0,0,0.08)"
            : "0 4px 12px rgba(0,0,0,0.4)",
        backdropFilter: "blur(8px)",
      }}
    >
      <Toolbar
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? "rgba(255,255,255,0.9)"
              : "rgba(18,18,18,0.9)",
          backdropFilter: "blur(8px)", // ทำให้โปร่ง + ฟุ้งนิดๆ
        }}
      >
        <IconButton
          edge="start"
          aria-label="menu"
          sx={{ display: { xs: "inline-flex", md: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          <Box
            component={RouterLink}
            to="/"
            sx={{ textDecoration: "none", color: "inherit" }}
          >
            POS<span style={{ color: colors.primary }}>.</span>
          </Box>
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {/* ปุ่มสลับโหมด */}
        <Tooltip title={`Mode: ${mode} (click to toggle)`}>
          <IconButton
            onClick={toggle}
            color="inherit"
            size="large"
            aria-label="toggle color mode"
          >
            {icon}
          </IconButton>
        </Tooltip>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button component={RouterLink} to="/" variant="text">
            หน้าแรก
          </Button>
          <Button component={RouterLink} to="/menuItem" variant="text">
            เมนู
          </Button>
          <Button component={RouterLink} to="/cart" variant="text">
            <ShoppingCartOutlinedIcon />
          </Button>

          {/* ปุ่มโปรไฟล์ */}
          <Button
            variant="text"
            onClick={handleMenuOpen}
            startIcon={<PersonOutlineIcon />}
            sx={{ fontWeight: 600, textTransform: "none" }}
          >
            โปรไฟล์
          </Button>

          {/* Menu โปรไฟล์ */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            TransitionComponent={Fade}
            PaperProps={{
              sx: {
                mt: 1.2,
                minWidth: 180,
                borderRadius: 2,
                boxShadow: (theme) =>
                  theme.palette.mode === "light"
                    ? "0px 4px 20px rgba(0,0,0,0.08)"
                    : "0px 4px 20px rgba(0,0,0,0.5)",
                bgcolor: (theme) =>
                  theme.palette.mode === "light" ? "#fff" : "#1E1E1E",
                overflow: "hidden",
              },
            }}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem
              component={RouterLink}
              to="/profile"
              onClick={handleMenuClose}
            >
              <ListItemIcon>
                <PersonOutlineIcon fontSize="small" />
              </ListItemIcon>
              ข้อมูลส่วนตัว
            </MenuItem>

            <MenuItem
              component={RouterLink}
              to="/settings"
              onClick={handleMenuClose}
            >
              <ListItemIcon>
                <SettingsOutlinedIcon fontSize="small" />
              </ListItemIcon>
              ตั้งค่า
            </MenuItem>

            <Divider sx={{ my: 0.5 }} />

            <MenuItem
              onClick={() => {
                handleMenuClose();
                console.log("logout clicked");
              }}
              sx={{ color: "error.main" }}
            >
              <ListItemIcon sx={{ color: "error.main" }}>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              ออกจากระบบ
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
