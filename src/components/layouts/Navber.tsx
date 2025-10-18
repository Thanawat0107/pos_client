// components/layouts/Navbar.tsx
import * as React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
  Box,
  Sheet,
  Typography,
  IconButton,
  Button,
  Link,
  Drawer,
  List,
  ListItem,
  ListDivider,
} from "@mui/joy";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Products", to: "/products" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = React.useState(false);
  const { pathname } = useLocation();

  return (
    <Sheet
      component="header"
      variant="soft"
      color="neutral"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1100,
        backdropFilter: "saturate(120%) blur(6px)",
        borderBottom: "1px solid",
        borderColor: "neutral.outlinedBorder",
      }}
    >
      {/* container */}
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 2, sm: 3 },
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        {/* logo */}
        <Typography
          level="title-md"
          sx={{ fontWeight: 700, letterSpacing: 0.2 }}
        >
          your<span style={{ color: "var(--joy-palette-primary-solidBg)" }}>Logo</span>
        </Typography>

        {/* desktop nav */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            gap: 1,
          }}
        >
          {NAV_LINKS.map((item) => {
            const active = pathname === item.to;
            return (
              <Button
                key={item.to}
                component={RouterLink}
                to={item.to}
                size="sm"
                variant={active ? "soft" : "plain"}
                color={active ? "primary" : "neutral"}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>

        {/* mobile menu button */}
        <IconButton
          variant="plain"
          color="neutral"
          onClick={() => setOpen(true)}
          sx={{ display: { xs: "inline-flex", md: "none" } }}
          aria-label="Open navigation menu"
        >
          <MenuRoundedIcon />
        </IconButton>
      </Box>

      {/* mobile drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        size="sm"
        slotProps={{
          content: {
            sx: {
              bgcolor: "background.body",
              borderLeft: "1px solid",
              borderColor: "neutral.outlinedBorder",
            },
          },
        }}
      >
        <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography level="title-md" sx={{ fontWeight: 700 }}>
            Menu
          </Typography>
          <Box sx={{ flex: 1 }} />
          <IconButton
            variant="plain"
            color="neutral"
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
          >
            <CloseRoundedIcon />
          </IconButton>
        </Box>
        <List
          size="lg"
          sx={{
            px: 1,
            "& a": { textDecoration: "none" },
          }}
        >
          {NAV_LINKS.map((item, idx) => {
            const active = pathname === item.to;
            return (
              <React.Fragment key={item.to}>
                <ListItem>
                  <Link
                    component={RouterLink}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    sx={{
                      width: "100%",
                      px: 1,
                      py: 1,
                      borderRadius: "lg",
                      color: active ? "primary.solidBg" : "text.primary",
                      fontWeight: active ? 700 : 500,
                      "&:hover": { bgcolor: "neutral.softBg" },
                    }}
                  >
                    {item.label}
                  </Link>
                </ListItem>
                {idx < NAV_LINKS.length - 1 && <ListDivider inset="gutter" />}
              </React.Fragment>
            );
          })}
        </List>
      </Drawer>
    </Sheet>
  );
}
