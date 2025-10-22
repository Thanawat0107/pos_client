/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/layouts/Navbar.tsx
import * as React from "react";
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
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Badge,
} from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import AutoModeIcon from "@mui/icons-material/AutoMode";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import { useColorMode } from "../../contexts/color-mode";
import { colors } from "./theme";

export default function Navbar() {
  const { mode, toggle } = useColorMode();
  const location = useLocation();

  const colorModeIcon =
    mode === "light" ? <LightModeIcon /> : mode === "dark" ? <DarkModeIcon /> : <AutoModeIcon />;

  // Drawer (มือถือ)
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const toggleDrawer = (next: boolean) => () => setOpenDrawer(next);

  // Profile menu
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openProfile = Boolean(anchorEl);
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // mock cart count (ต่อกับ state/store จริงได้)
  const cartCount = 2;

  const NavLinks = (
    <Stack component="nav" direction="row" spacing={1.5} sx={{ display: { xs: "none", md: "flex" } }}>
      <Button component={RouterLink} to="/" variant="text" color="inherit">
        หน้าแรก
      </Button>
      <Button component={RouterLink} to="/menuItem" variant="text" color="inherit">
        เมนู
      </Button>
      <Button component={RouterLink} to="/cart" variant="text" color="inherit" aria-label="Cart">
        <Badge badgeContent={cartCount} color="primary">
          <ShoppingCartOutlinedIcon />
        </Badge>
      </Button>

      {/* ปุ่มโปรไฟล์ (เดสก์ท็อป) */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleMenuOpen}
        sx={{ fontWeight: 600, textTransform: "none", display: { xs: "none", md: "inline-flex" } }}
        startIcon={<PersonOutlineIcon />}
      >
        โปรไฟล์
      </Button>
    </Stack>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={1}
        sx={{
          background: (theme) =>
            theme.palette.mode === "light" ? "rgba(255,255,255,0.9)" : "rgba(18,18,18,0.85)",
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
            gap: 1,
            minHeight: { xs: 56, sm: 64 },
            px: { xs: 1.5, sm: 2.5, md: 3 },
            backgroundColor: (theme) =>
              theme.palette.mode === "light" ? "rgba(255,255,255,0.9)" : "rgba(18,18,18,0.9)",
            backdropFilter: "blur(8px)",
          }}
        >
          {/* Hamburger (มือถือ) */}
          <IconButton
            edge="start"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{ display: { xs: "inline-flex", md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          {/* โลโก้ */}
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            <Box
              component={RouterLink}
              to="/"
              sx={{ textDecoration: "none", color: "inherit", display: "inline-flex", alignItems: "center" }}
            >
              POS
              <Box component="span" sx={{ color: colors.primary, ml: 0.25 }}>
                .
              </Box>
            </Box>
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {/* ไอคอนขวา (มือถือ) */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: "flex", md: "none" } }}>
            {/* สลับโหมด */}
            <Tooltip title={`Mode: ${mode} (tap to toggle)`}>
              <IconButton onClick={toggle} color="inherit" size="large" aria-label="toggle color mode">
                {colorModeIcon}
              </IconButton>
            </Tooltip>

            {/* Cart */}
            <IconButton component={RouterLink} to="/cart" color="inherit" size="large" aria-label="Cart">
              <Badge badgeContent={cartCount} color="primary">
                <ShoppingCartOutlinedIcon />
              </Badge>
            </IconButton>

            {/* Profile เป็น IconButton บนมือถือ */}
            <IconButton
              onClick={handleMenuOpen}
              color="inherit"
              size="large"
              aria-label="open profile menu"
            >
              <PersonOutlineIcon />
            </IconButton>
          </Stack>

          {/* ลิงก์เต็ม (เดสก์ท็อป) */}
          {NavLinks}
        </Toolbar>
      </AppBar>

      {/* Profile Menu (ใช้ร่วมกันได้ทั้งมือถือ/เดสก์ท็อป) */}
      <Menu
        anchorEl={anchorEl}
        open={openProfile}
        onClose={handleMenuClose}
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            mt: 1.2,
            minWidth: 200,
            borderRadius: 2,
            boxShadow: (theme) =>
              theme.palette.mode === "light"
                ? "0px 4px 20px rgba(0,0,0,0.08)"
                : "0px 4px 20px rgba(0,0,0,0.5)",
            bgcolor: (theme) => (theme.palette.mode === "light" ? "#fff" : "#1E1E1E"),
            overflow: "hidden",
          },
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem component={RouterLink} to="/profile" onClick={handleMenuClose}>
          <ListItemIcon>
            <PersonOutlineIcon fontSize="small" />
          </ListItemIcon>
          ข้อมูลส่วนตัว
        </MenuItem>
        <MenuItem component={RouterLink} to="/settings" onClick={handleMenuClose}>
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

      {/* Drawer เมนู (มือถือ) */}
      <Drawer
        anchor="left"
        open={openDrawer}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: 280,
            borderRight: (theme) =>
              theme.palette.mode === "light" ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.1)",
          },
        }}
      >
        <Box sx={{ p: 2, pt: 2.5 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            เมนู
          </Typography>
        </Box>
        <Divider />
        <List sx={{ py: 0.5 }}>
          <ListItemButton
            component={RouterLink}
            to="/"
            selected={location.pathname === "/"}
            onClick={toggleDrawer(false)}
          >
            <ListItemIcon>
              <HomeOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="หน้าแรก" />
          </ListItemButton>

          <ListItemButton
            component={RouterLink}
            to="/menuItem"
            selected={location.pathname.startsWith("/menuItem")}
            onClick={toggleDrawer(false)}
          >
            <ListItemIcon>
              <RestaurantMenuOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="เมนู" />
          </ListItemButton>

          <ListItemButton
            component={RouterLink}
            to="/cart"
            selected={location.pathname.startsWith("/cart")}
            onClick={toggleDrawer(false)}
          >
            <ListItemIcon>
              <Badge badgeContent={cartCount} color="primary">
                <ShoppingCartOutlinedIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="ตะกร้า" />
          </ListItemButton>
        </List>

        <Divider sx={{ my: 0.5 }} />

        {/* โซนโปรไฟล์บน Drawer */}
        <List sx={{ py: 0.5 }}>
          <ListItemButton component={RouterLink} to="/profile" onClick={toggleDrawer(false)}>
            <ListItemIcon>
              <PersonOutlineIcon />
            </ListItemIcon>
            <ListItemText primary="ข้อมูลส่วนตัว" />
          </ListItemButton>
          <ListItemButton component={RouterLink} to="/settings" onClick={toggleDrawer(false)}>
            <ListItemIcon>
              <SettingsOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="ตั้งค่า" />
          </ListItemButton>
          <ListItemButton
            onClick={() => {
              console.log("logout clicked");
              setOpenDrawer(false);
            }}
            sx={{ color: "error.main" }}
          >
            <ListItemIcon sx={{ color: "error.main" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="ออกจากระบบ" />
          </ListItemButton>
        </List>

        <Divider sx={{ mt: "auto" }} />

        {/* toggle โหมดใน Drawer */}
        <Box sx={{ p: 2 }}>
          <Button
            onClick={toggle}
            fullWidth
            variant="outlined"
            startIcon={colorModeIcon}
            sx={{ textTransform: "none" }}
          >
            โหมด: {mode}
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
