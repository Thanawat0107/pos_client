import * as React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Tooltip,
  Stack,
  Divider,
  Button,
  alpha,
  useTheme,
  useScrollTrigger,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useColorMode } from "../../contexts/color-mode";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppHookState";
import { logoutAndClear } from "../../stores/slices/authSlice";
import { storage } from "../../helpers/storageHelper";
import { SD_Roles } from "../../@types/Enum";
import { useGetCartQuery } from "../../services/shoppingCartApi";
import { Logo } from "./nav-bar/Logo";
import { DesktopMenu } from "./nav-bar/DesktopMenu";
import { AdminDropdown } from "./nav-bar/AdminDropdown";
import { ProfileDropdown } from "./nav-bar/ProfileDropdown";
import { MobileSidebar } from "./nav-bar/MobileSidebar";

export default function Navbar() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { mode, toggle } = useColorMode();

  // Auth State
  const { role, isAuthenticated, token } = useAppSelector(
    (state) => state.auth,
  );
  const isAdmin = !!token && isAuthenticated && role === SD_Roles.Admin;

  // Cart Data
  const cartToken = localStorage.getItem("cartToken");
  const { data: cartData } = useGetCartQuery(cartToken);
  const cartCount = cartData?.totalItemsCount || 0;

  // UI State
  const isScrolled = useScrollTrigger({
    disableHysteresis: true,
    threshold: 30,
  });
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const [anchorProfile, setAnchorProfile] = React.useState<null | HTMLElement>(
    null,
  );
  const [anchorManage, setAnchorManage] = React.useState<null | HTMLElement>(
    null,
  );

  const handleLogout = () => {
    dispatch(logoutAndClear());
    storage.remove("token");
    setAnchorProfile(null);
    setOpenDrawer(false);
    navigate("/");
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: isScrolled
            ? alpha(theme.palette.background.default, 0.8)
            : alpha(theme.palette.background.default, 0.5),
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${isScrolled ? theme.palette.divider : "transparent"}`,
          transition: "0.3s",
          color: theme.palette.text.primary,
        }}
      >
        <Toolbar
          sx={{
            height: isScrolled ? 64 : 80,
            px: { xs: 2, md: 6 },
            justifyContent: "space-between",
            transition: "0.3s",
          }}
        >
          {/* Left: Mobile Menu & Logo */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton
              onClick={() => setOpenDrawer(true)}
              sx={{ display: { md: "none" }, color: "primary.main" }}
            >
              <MenuIcon />
            </IconButton>
            <Logo />
          </Stack>

          {/* Center: Desktop Links */}
          <DesktopMenu
            isAdmin={isAdmin}
            onOpenAdminMenu={(e) => setAnchorManage(e.currentTarget)}
          />

          {/* Right: Actions */}
          <Stack
            direction="row"
            spacing={{ xs: 0.5, md: 1.5 }}
            alignItems="center"
          >
            <Tooltip title="ตะกร้าสินค้า">
              <IconButton component={RouterLink} to="/cart" color="inherit">
                <Badge
                  badgeContent={cartCount}
                  color="primary"
                  sx={{
                    "& .MuiBadge-badge": {
                      animation: cartCount > 0 ? "pulse 2s infinite" : "none",
                    },
                  }}
                >
                  <ShoppingCartOutlinedIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Divider
              orientation="vertical"
              flexItem
              sx={{
                mx: 1,
                height: 20,
                my: "auto",
                display: { xs: "none", md: "block" },
              }}
            />

            <Button
              variant={isScrolled ? "contained" : "text"}
              onClick={(e) => setAnchorProfile(e.currentTarget)}
              startIcon={<PersonOutlineIcon />}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                display: { xs: "none", md: "inline-flex" },
              }}
            >
              {isAuthenticated ? "โปรไฟล์" : "เข้าสู่ระบบ"}
            </Button>

            <IconButton
              onClick={(e) => setAnchorProfile(e.currentTarget)}
              sx={{
                display: { md: "none" },
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              }}
            >
              <PersonOutlineIcon color="primary" />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* --- Overlay Components --- */}
      <AdminDropdown
        anchor={anchorManage}
        onClose={() => setAnchorManage(null)}
      />

      <ProfileDropdown
        anchor={anchorProfile}
        onClose={() => setAnchorProfile(null)}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />

      <MobileSidebar
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        isAdmin={isAdmin}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        mode={mode}
        onToggleTheme={toggle}
      />
    </>
  );
}
