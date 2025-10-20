/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import {
  Box,
  Container,
  IconButton,
  Paper,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LocalPizzaIcon from "@mui/icons-material/LocalPizza";
import SetMealIcon from "@mui/icons-material/SetMeal";
import RamenDiningIcon from "@mui/icons-material/RamenDining";
import LocalDrinkIcon from "@mui/icons-material/LocalDrink";
import EggAltIcon from "@mui/icons-material/EggAlt";

export type CategoryItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;  // ให้ส่งรูป <img/> ก็ได้
};

type Props = {
  items: CategoryItem[];
  value?: string;
  onChange?: (id: string) => void;
  maxWidth?: "sm" | "md" | "lg" | "xl" | false;
};

export default function CategoryScroller({
  items,
  value,
  onChange,
  maxWidth = "lg",
}: Props) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  const scrollBy = (px: number) => {
    ref.current?.scrollBy({ left: px, behavior: "smooth" });
  };

  // ให้ล้อเมาส์เลื่อนแนวนอนแบบธรรมชาติ
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler as any);
  }, []);

  // เลือกแล้วเลื่อน item เข้ากลาง
  React.useEffect(() => {
    if (!value || !ref.current) return;
    const target = ref.current.querySelector<HTMLDivElement>(
      `[data-id="${value}"]`
    );
    target?.scrollIntoView({ inline: "center", behavior: "smooth", block: "nearest" });
  }, [value]);

  return (
    <Box
      sx={(t) => ({
        position: "relative",
        py: 2,
        // เงา gradient ซ้าย/ขวาเพื่อบอกว่ามีของให้เลื่อนต่อ
        "&::before, &::after": {
          content: '""',
          position: "absolute",
          top: 0,
          bottom: 0,
          width: 40,
          pointerEvents: "none",
          zIndex: 1,
        },
        "&::before": {
          left: 0,
          background: `linear-gradient(90deg, ${t.palette.background.default}, ${alpha(
            t.palette.background.default,
            0
          )})`,
        },
        "&::after": {
          right: 0,
          background: `linear-gradient(270deg, ${t.palette.background.default}, ${alpha(
            t.palette.background.default,
            0
          )})`,
        },
      })}
    >
      <Container maxWidth={maxWidth} sx={{ position: "relative" }}>
        {/* ปุ่มเลื่อน */}
        <IconButton
          aria-label="scroll left"
          onClick={() => scrollBy(-320)}
          sx={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            "&:hover": { bgcolor: "action.hover" },
            display: { xs: "none", sm: "flex" },
          }}
        >
          <ChevronLeftIcon />
        </IconButton>

        <IconButton
          aria-label="scroll right"
          onClick={() => scrollBy(320)}
          sx={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            "&:hover": { bgcolor: "action.hover" },
            display: { xs: "none", sm: "flex" },
          }}
        >
          <ChevronRightIcon />
        </IconButton>

        {/* แถวเลื่อนแนวนอน */}
        <Box
          ref={ref}
          sx={{
            display: "grid",
            gridAutoFlow: "column",
            gridAutoColumns: "minmax(88px, max-content)",
            gap: 16,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            scrollBehavior: "smooth",
            px: { xs: 1, sm: 5 },
            // ซ่อน scrollbar
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {items.map((it) => {
            const selected = value === it.id;
            return (
              <Stack
                key={it.id}
                data-id={it.id}
                alignItems="center"
                spacing={1}
                sx={{ scrollSnapAlign: "center", cursor: "pointer" }}
                onClick={() => onChange?.(it.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onChange?.(it.id);
                }}
              >
                <Paper
                  variant="outlined"
                  sx={(t) => ({
                    width: 72,
                    height: 72,
                    borderRadius: 3,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: selected
                      ? alpha(t.palette.primary.light, 0.2)
                      : alpha(t.palette.primary.light, 0.12),
                    borderColor: selected ? "primary.main" : "divider",
                    transition: "all .2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 2,
                    },
                  })}
                >
                  {/* icon */}
                  <Box
                    sx={{
                      fontSize: 30,
                      color: selected ? "primary.main" : "text.primary",
                    }}
                  >
                    {it.icon}
                  </Box>
                </Paper>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: selected ? 700 : 500 }}
                >
                  {it.label}
                </Typography>
              </Stack>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}

/* ---------- ตัวอย่าง data พร้อม icons ของ MUI ---------- */
export const demoCategories: CategoryItem[] = [
  { id: "pizza", label: "Pizza", icon: <LocalPizzaIcon /> },
  { id: "meat", label: "Meat", icon: <SetMealIcon /> },
  { id: "fish", label: "Fish", icon: <EggAltIcon /> },
  { id: "soup", label: "Soup", icon: <RamenDiningIcon /> },
  { id: "drink", label: "Drinks", icon: <LocalDrinkIcon /> },
  { id: "dessert", label: "Dessert", icon: <EggAltIcon /> },
];
