import { Stack, Button, alpha, type Theme } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { MAIN_NAV } from "./navConfig";

interface DesktopMenuProps {
  isAdmin: boolean;
  onOpenAdminMenu: (event: React.MouseEvent<HTMLElement>) => void;
}

export const DesktopMenu = ({ isAdmin, onOpenAdminMenu }: DesktopMenuProps) => {
  const location = useLocation();

  const btnStyle = (active: boolean) => ({
    borderRadius: "12px",
    textTransform: "none",
    fontWeight: 600,
    px: 2,
    color: active ? "primary.main" : "inherit",
    backgroundColor: active
      ? (theme: Theme) => alpha(theme.palette.primary.main, 0.08)
      : "transparent",
    "&:hover": {
      backgroundColor: (theme: Theme) =>
        alpha(theme.palette.primary.main, 0.08),
    },
  });

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        display: { xs: "none", md: "flex" },
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
      }}
    >
      {MAIN_NAV.map((item) => (
        <Button
          key={item.path}
          component={RouterLink}
          to={item.path}
          sx={btnStyle(location.pathname === item.path)}
        >
          {item.text}
        </Button>
      ))}
      {isAdmin && (
        <Button
          endIcon={<ExpandMoreIcon />}
          onClick={onOpenAdminMenu}
          sx={btnStyle(false)}
        >
          การจัดการ
        </Button>
      )}
    </Stack>
  );
};
