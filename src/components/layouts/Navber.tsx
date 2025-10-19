import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import AutoModeIcon from "@mui/icons-material/AutoMode";
import { useColorMode } from "../../contexts/color-mode";
import { colors } from "./theme";

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
          <Button component={RouterLink} to="/orders" variant="text">
            Orders
          </Button>
          <Button component={RouterLink} to="/products" variant="text">
            Products
          </Button>
          <Button component={RouterLink} to="/settings" variant="contained">
            Settings
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
