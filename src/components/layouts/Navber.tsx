/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton, Tooltip, MenuItem,
  ListItemIcon, Divider, Menu, Fade, Drawer, List, ListItemButton,
  ListItemText, Stack, Badge, Collapse, useScrollTrigger
} from "@mui/material";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { alpha, useTheme } from "@mui/material/styles";

// Icons
import MenuIcon from "@mui/icons-material/Menu";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from '@mui/icons-material/Login';
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import AutoModeIcon from "@mui/icons-material/AutoMode";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AnnouncementOutlinedIcon from "@mui/icons-material/AnnouncementOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";

// Hooks & State
import { useColorMode } from "../../contexts/color-mode";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppHookState";
import { logout } from "../../stores/slices/authSlice";
import { storage } from "../../helpers/storageHelper";
import { SD_Roles } from "../../@types/Enum";

// 1. Menu Configuration - ปรับแก้ตรงนี้ที่เดียวเมนูเปลี่ยนทั้งเว็ป
const MAIN_NAV = [
  { text: "หน้าแรก", path: "/" },
  { text: "เมนูอาหาร", path: "/menuItem" },
];

const ADMIN_NAV = [
  { text: "จัดการเมนู", path: "/manage-menuItem", icon: <RestaurantMenuOutlinedIcon fontSize="small" /> },
  { text: "จัดการหมวดหมู่", path: "/manage-category", icon: <CategoryOutlinedIcon fontSize="small" /> },
  { text: "จัดการออเดอร์", path: "/manage-order", icon: <ReceiptLongOutlinedIcon fontSize="small" /> },
  { text: "จัดการคู่มือ", path: "/manage-manual", icon: <Inventory2OutlinedIcon fontSize="small" /> },
  { text: "จัดการข่าวสาร", path: "/manage-content", icon: <AnnouncementOutlinedIcon fontSize="small" /> },
];

export default function Navbar() {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { mode, toggle } = useColorMode();
  const { role, isAuthenticated, token } = useAppSelector((state) => state.auth);
  const isAdmin = !!token && isAuthenticated && role === SD_Roles.Admin;

  // ตรวจสอบการ Scroll
  const isScrolled = useScrollTrigger({
    disableHysteresis: true,
    threshold: 30,
  });

  // Menu States
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const [anchorProfile, setAnchorProfile] = React.useState<null | HTMLElement>(null);
  const [anchorManage, setAnchorManage] = React.useState<null | HTMLElement>(null);

  const cartCount = 2; // Mock data

  const handleLogout = () => {
    dispatch(logout());
    storage.remove("token");
    setAnchorProfile(null);
    setOpenDrawer(false);
    navigate("/");
  };

  const colorModeIcon = mode === "light" ? <LightModeIcon /> : mode === "dark" ? <DarkModeIcon /> : <AutoModeIcon />;

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          top: 0,
          transition: "all 0.3s ease-in-out",
          backgroundColor: isScrolled 
            ? alpha(theme.palette.background.default, 0.8) 
            : alpha(theme.palette.background.default, 0.5),
          backdropFilter: "blur(12px)", // เอฟเฟกต์เบลอ
          borderBottom: `1px solid ${isScrolled ? alpha(theme.palette.divider, 0.1) : "transparent"}`,
          color: theme.palette.text.primary,
        }}
      >
        <Toolbar sx={{ 
          height: isScrolled ? 64 : 80, // ย่อความสูงเมื่อเลื่อนลง
          transition: "height 0.3s ease-in-out",
          px: { xs: 2, md: 6 },
          justifyContent: "space-between"
        }}>
          
          {/* ส่วนซ้าย: Logo & Mobile Toggle */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton 
              edge="start" 
              onClick={() => setOpenDrawer(true)} 
              sx={{ display: { md: "none" }, color: "primary.main" }}
            >
              <MenuIcon />
            </IconButton>
            <Logo />
          </Stack>

          {/* ส่วนกลาง: Desktop Nav Links */}
          <Stack 
            direction="row" 
            spacing={1} 
            sx={{ display: { xs: "none", md: "flex" }, position: "absolute", left: "50%", transform: "translateX(-50%)" }}
          >
            {MAIN_NAV.map((item) => (
              <NavButton key={item.path} text={item.text} path={item.path} active={location.pathname === item.path} />
            ))}
            {isAdmin && (
              <Button 
                endIcon={<ExpandMoreIcon />} 
                onClick={(e) => setAnchorManage(e.currentTarget)} 
                sx={navButtonStyle}
              >
                การจัดการ
              </Button>
            )}
          </Stack>

          {/* ส่วนขวา: Actions (Cart, Profile, Theme) */}
          <Stack direction="row" spacing={{ xs: 0.5, md: 1.5 }} alignItems="center">
            <Tooltip title="ตะกร้าสินค้า">
              <IconButton component={RouterLink} to="/cart" sx={{ color: "inherit" }}>
                <Badge badgeContent={cartCount} color="primary">
                  <ShoppingCartOutlinedIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <IconButton onClick={toggle} color="inherit" sx={{ display: { xs: "none", sm: "inline-flex" } }}>
              {colorModeIcon}
            </IconButton>

            <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 20, my: "auto", display: { xs: "none", md: "block" } }} />

            <Button
              variant={isScrolled ? "contained" : "text"}
              onClick={(e) => setAnchorProfile(e.currentTarget)}
              startIcon={<PersonOutlineIcon />}
              sx={{ 
                borderRadius: "12px", 
                textTransform: 'none', 
                fontWeight: 600,
                display: { xs: "none", md: "inline-flex" }
              }}
            >
              โปรไฟล์
            </Button>

            <IconButton 
              onClick={(e) => setAnchorProfile(e.currentTarget)} 
              sx={{ display: { md: "none" }, bgcolor: alpha(theme.palette.primary.main, 0.1) }}
            >
              <PersonOutlineIcon color="primary" />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* --- Dropdown Menus --- */}
      <AdminDropdown anchor={anchorManage} onClose={() => setAnchorManage(null)} />
      <ProfileDropdown anchor={anchorProfile} onClose={() => setAnchorProfile(null)} token={token} onLogout={handleLogout} />
      
      {/* --- Mobile Sidebar --- */}
      <MobileNavigation
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        token={token}
        location={location}
        mode={mode}
        toggle={toggle}
        colorModeIcon={colorModeIcon}
      />
    </>
  );
}

// --- Sub-Components (Clean Code) ---

const Logo = () => (
  <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-1px', display: 'flex', alignItems: 'center' }}>
    <Box component={RouterLink} to="/" sx={{ textDecoration: "none", color: "inherit" }}>
      POS<Box component="span" sx={{ color: "primary.main" }}>.</Box>
    </Box>
  </Typography>
);

const navButtonStyle = {
  borderRadius: "12px",
  textTransform: "none",
  fontWeight: 600,
  px: 2,
  py: 1,
  color: "inherit",
  transition: "0.2s",
  "&:hover": { backgroundColor: (theme: any) => alpha(theme.palette.primary.main, 0.08), color: "primary.main" },
};

const NavButton = ({ text, path, active }: any) => (
  <Button 
    component={RouterLink} to={path} 
    sx={{ ...navButtonStyle, color: active ? "primary.main" : "inherit", backgroundColor: active ? (theme: any) => alpha(theme.palette.primary.main, 0.08) : "transparent" }}
  >
    {text}
  </Button>
);

const AdminDropdown = ({ anchor, onClose }: any) => (
  <Menu
    anchorEl={anchor} open={Boolean(anchor)} onClose={onClose} TransitionComponent={Fade}
    PaperProps={{ sx: { mt: 1.5, minWidth: 220, borderRadius: "16px", boxShadow: "0 10px 40px rgba(0,0,0,0.1)", p: 1 } }}
  >
    {ADMIN_NAV.map((item) => (
      <MenuItem key={item.path} component={RouterLink} to={item.path} onClick={onClose} sx={{ borderRadius: "10px", mb: 0.5 }}>
        <ListItemIcon sx={{ color: "primary.main" }}>{item.icon}</ListItemIcon>
        <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 500 }} />
      </MenuItem>
    ))}
  </Menu>
);

const ProfileDropdown = ({ anchor, onClose, token, onLogout }: any) => (
  <Menu
    anchorEl={anchor} open={Boolean(anchor)} onClose={onClose}
    PaperProps={{ sx: { mt: 1.5, minWidth: 200, borderRadius: "16px", p: 1 } }}
  >
    <MenuItem component={RouterLink} to="/profile" onClick={onClose} sx={{ borderRadius: "10px" }}>
      <ListItemIcon><PersonOutlineIcon fontSize="small" /></ListItemIcon>
      ข้อมูลส่วนตัว
    </MenuItem>
    <Divider sx={{ my: 1 }} />
    <MenuItem onClick={token ? onLogout : onClose} sx={{ borderRadius: "10px", color: token ? "error.main" : "primary.main" }}>
      <ListItemIcon sx={{ color: "inherit" }}>{token ? <LogoutIcon fontSize="small" /> : <LoginIcon fontSize="small" />}</ListItemIcon>
      {token ? "ออกจากระบบ" : "เข้าสู่ระบบ"}
    </MenuItem>
  </Menu>
);

const MobileNavigation = ({ open, onClose, isAdmin, onLogout, token, location, mode, toggle, colorModeIcon }: any) => {
  const [openAdmin, setOpenAdmin] = React.useState(false);
  return (
    <Drawer anchor="left" open={open} onClose={onClose} PaperProps={{ sx: { width: 300, borderRadius: "0 20px 20px 0" } }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo />
        <IconButton onClick={onClose}><MenuIcon /></IconButton>
      </Box>
      <List sx={{ px: 2 }}>
        {MAIN_NAV.map((item) => (
          <ListItemButton key={item.path} component={RouterLink} to={item.path} onClick={onClose} sx={{ borderRadius: "12px", mb: 1 }} selected={location.pathname === item.path}>
            <ListItemIcon>{item.path === "/" ? <HomeOutlinedIcon /> : <RestaurantMenuOutlinedIcon />}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
        {isAdmin && (
          <>
            <ListItemButton onClick={() => setOpenAdmin(!openAdmin)} sx={{ borderRadius: "12px" }}>
              <ListItemIcon><SettingsOutlinedIcon /></ListItemIcon>
              <ListItemText primary="การจัดการ" />
              <ExpandMoreIcon sx={{ transform: openAdmin ? "rotate(180deg)" : "0", transition: "0.2s" }} />
            </ListItemButton>
            <Collapse in={openAdmin} timeout="auto"><List disablePadding>
              {ADMIN_NAV.map((item) => (
                <ListItemButton key={item.path} component={RouterLink} to={item.path} onClick={onClose} sx={{ pl: 4, borderRadius: "12px" }} selected={location.pathname === item.path}>
                  <ListItemIcon sx={{ minWidth: 35 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              ))}
            </List></Collapse>
          </>
        )}
      </List>
      <Box sx={{ mt: "auto", p: 3, borderTop: "1px solid", borderColor: "divider" }}>
        <Stack spacing={2}>
          <Button fullWidth variant="outlined" startIcon={colorModeIcon} onClick={toggle} sx={{ borderRadius: "12px", textTransform: 'none' }}>
            โหมด: {mode}
          </Button>
          <Button fullWidth variant="contained" color={token ? "error" : "primary"} onClick={onLogout} startIcon={token ? <LogoutIcon /> : <LoginIcon />} sx={{ borderRadius: "12px" }}>
            {token ? "ออกจากระบบ" : "เข้าสู่ระบบ"}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};