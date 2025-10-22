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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

// (icons demo) — ลบได้ถ้าใช้ของจริง
import LocalPizzaIcon from "@mui/icons-material/LocalPizza";
import SetMealIcon from "@mui/icons-material/SetMeal";
import RamenDiningIcon from "@mui/icons-material/RamenDining";
import LocalDrinkIcon from "@mui/icons-material/LocalDrink";
import EggAltIcon from "@mui/icons-material/EggAlt";
import { useEffect, useRef } from "react";

export type CategoryItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
};

type Props = {
  items: CategoryItem[];
  value?: string;
  onChange?: (id: string) => void;
  maxWidth?: "sm" | "md" | "lg" | "xl" | false;
  /** ทำให้เต็มขอบจอบนมือถือ (แนะนำ) */
  mobileFullBleed?: boolean;
  defaultValue?: string; // 👈 เพิ่ม option สำหรับ uncontrolled
};

export default function CategoryScroller({
  items,
  value,
  onChange,
  maxWidth = "lg",
  mobileFullBleed = true,
  defaultValue, // 👈
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();
  const upSm = useMediaQuery(theme.breakpoints.up("sm"));

  // 👇 ถ้าไม่ส่ง value มา ให้คอมโพเนนต์ถือ state เอง (uncontrolled)
  const [innerValue, setInnerValue] = React.useState<string | undefined>(defaultValue);
  const current = value ?? innerValue;

    const handleSelect = (id: string) => {
    if (value === undefined) setInnerValue(id); // uncontrolled
    onChange?.(id);                              // แจ้งพาเรนต์เสมอ
  };

  const scrollBy = (px: number) =>
    ref.current?.scrollBy({ left: px, behavior: "smooth" });

  // ให้ล้อเมาส์เลื่อนแนวนอน (desktop)
  useEffect(() => {
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

 // เลือกแล้วเลื่อนเข้ากลาง (อิง current)
  React.useEffect(() => {
    if (!current || !ref.current) return;
    const target = ref.current.querySelector<HTMLDivElement>(
      `[data-id="${current}"]`
    );
    target?.scrollIntoView({
      inline: "center",
      behavior: "smooth",
      block: "nearest",
    });
  }, [current]);

  return (
    <Box
      sx={(t) => ({
        position: "relative",
        py: { xs: 1.5, sm: 3 },
        // ขอบแสงบอกว่ามีของให้เลื่อนต่อ (เบาลงบนมือถือ)
        "&::before, &::after": {
          content: '""',
          position: "absolute",
          top: 0,
          bottom: 0,
          width: { xs: 24, sm: 40 },
          pointerEvents: "none",
          zIndex: 1,
        },
        "&::before": {
          left: 0,
          background: `linear-gradient(90deg, ${
            t.palette.background.default
          }, ${alpha(t.palette.background.default, 0)})`,
        },
        "&::after": {
          right: 0,
          background: `linear-gradient(270deg, ${
            t.palette.background.default
          }, ${alpha(t.palette.background.default, 0)})`,
        },
      })}
    >
      {/* full-bleed บนมือถือ: ดึงขอบให้เต็มจอ */}
      <Container
        maxWidth={maxWidth}
        disableGutters={mobileFullBleed}
        sx={{
          position: "relative",
          px: { xs: mobileFullBleed ? 0 : 2, sm: 3 },
        }}
      >
        {/* ปุ่มเลื่อน (desktop/tablet เท่านั้น) */}
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
            // mobile-first: ช่องกว้างกำลังดี + แตะง่าย
            gridAutoColumns: {
              xs: "minmax(90px, max-content)",
              sm: "minmax(100px, max-content)",
            },
            gap: { xs: 12, sm: 16 },
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            scrollBehavior: "smooth",
            px: { xs: mobileFullBleed ? 12 : 8, sm: 5 },
            // โมเมนตัม + ซ่อนสกรอลบาร์
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorX: "contain",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {items.map((it) => {
            const selected = current === it.id; // 👈 ใช้ current
            return (
              <Stack
                key={it.id}
                data-id={it.id}
                alignItems="center"
                spacing={{ xs: 0.75, sm: 1 }}
                sx={{ scrollSnapAlign: "center", cursor: "pointer" }}
                onClick={() => handleSelect(it.id)} // 👈 ใช้ handler เดียว
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault(); // กัน scroll ตอนกด space
                    handleSelect(it.id);
                  }
                }}
              >
                <Paper
                  variant="outlined"
                  sx={(t) => ({
                    position: "relative", // 👈 ให้ ::after ยึดกับ Paper
                    width: { xs: 68, sm: 76 },
                    height: { xs: 68, sm: 76 },
                    borderRadius: 3,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: selected
                      ? alpha(t.palette.primary.light, 0.22)
                      : alpha(t.palette.primary.light, 0.12),
                    borderColor: selected ? "primary.main" : "divider",
                    transition: "all .18s",
                    "&:hover": upSm
                      ? { transform: "translateY(-2px)", boxShadow: 2 }
                      : undefined,
                    // ขยาย hit area เล็กน้อยบนมือถือ
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      inset: -4,
                      pointerEvents: "none", // 👈 สำคัญ: อย่าบังคลิก
                    },
                  })}
                >
                  {/* icon */}
                  <Box
                    sx={{
                      fontSize: { xs: 28, sm: 32, md: 34 },
                      color: selected ? "primary.main" : "text.primary",
                    }}
                  >
                    {it.icon}
                  </Box>
                </Paper>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: selected ? 700 : 500,
                    maxWidth: 88,
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                  }}
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

/* ---------- ตัวอย่าง data demo ---------- */
export const demoCategories: CategoryItem[] = [
  { id: "pizza", label: "Pizza", icon: <LocalPizzaIcon /> },
  { id: "meat", label: "Meat", icon: <SetMealIcon /> },
  { id: "fish", label: "Fish", icon: <EggAltIcon /> },
  { id: "soup", label: "Soup", icon: <RamenDiningIcon /> },
  { id: "drink", label: "Drinks", icon: <LocalDrinkIcon /> },
  { id: "dessert", label: "Dessert", icon: <EggAltIcon /> },
];
