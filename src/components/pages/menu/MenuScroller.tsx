import * as React from "react";
import { useMemo, useRef, useEffect } from "react";
import { Box, useMediaQuery, useTheme, alpha, IconButton } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MenuCard from "./MenuCard"; // ไม่ต้อง import type { Menu } แล้ว
import type { MenuItemDto } from "../../../@types/dto/MenuItem";

// ✅ Import DTO มาใช้กำหนด Type

type Props = {
  items: MenuItemDto[]; // ✅ เปลี่ยนจาก Menu[] เป็น MenuItemDto[]
  onAddToCart?: (p: MenuItemDto) => void;
  maxWidth?: "sm" | "md" | "lg" | "xl" | false;
  currency?: string;
};

// Helper function
function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default function MenuScroller({
  items,
  onAddToCart,
  maxWidth = "lg",
  currency = "USD",
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();
  const upMd = useMediaQuery(theme.breakpoints.up("md"));

  const cols = upMd ? 3 : 2;
  const rows = 1;
  const perSlide = cols * rows;

  const slides = useMemo(() => chunk(items, perSlide), [items, perSlide]);

  // --- Logic: drag-to-scroll ---
  const drag = useRef({ active: false, x: 0, left: 0 });
  const onDown = (e: React.PointerEvent) => {
    const el = ref.current!;
    el.setPointerCapture(e.pointerId);
    drag.current = { active: true, x: e.clientX, left: el.scrollLeft };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current.active || !ref.current) return;
    e.preventDefault();
    ref.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
  };
  const onUp = (e: React.PointerEvent) => {
    if (!drag.current.active || !ref.current) return;
    drag.current.active = false;
    ref.current.releasePointerCapture(e.pointerId);
  };

  // --- Logic: wheel horizontal ---
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (ev: WheelEvent) => {
      if (Math.abs(ev.deltaX) < Math.abs(ev.deltaY)) {
        el.scrollLeft += ev.deltaY;
        ev.preventDefault();
      }
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  // --- Logic: Button Scroll ---
  const handleScroll = (direction: "left" | "right") => {
    if (!ref.current) return;
    const containerWidth = ref.current.clientWidth;
    const scrollAmount = direction === "left" ? -containerWidth : containerWidth;
    
    ref.current.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <Box
      sx={(t) => ({
        position: "relative",
        py: { xs: 1.5, sm: 2 },
        mx: "auto",
        maxWidth: maxWidth ? t.breakpoints.values[maxWidth] : "100%",

        "&::before, &::after": {
          content: '""',
          position: "absolute",
          top: 0,
          bottom: 0,
          width: { xs: 20, sm: 36 },
          pointerEvents: "none",
          zIndex: 1,
        },
        "&::before": {
          left: 0,
          background: `linear-gradient(90deg, ${t.palette.background.default}, ${alpha(
            t.palette.background.default, 0)})`,
        },
        "&::after": {
          right: 0,
          background: `linear-gradient(270deg, ${t.palette.background.default}, ${alpha(
            t.palette.background.default, 0)})`,
        },
      })}
    >
      {/* ปุ่มซ้าย */}
      <IconButton
        aria-label="scroll left"
        onClick={() => handleScroll("left")}
        sx={{
          position: "absolute",
          left: 10,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 2,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: 2,
          "&:hover": { bgcolor: "action.hover" },
          display: { xs: "none", md: "flex" },
        }}
      >
        <ChevronLeftIcon />
      </IconButton>

      {/* ปุ่มขวา */}
      <IconButton
        aria-label="scroll right"
        onClick={() => handleScroll("right")}
        sx={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 2,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: 2,
          "&:hover": { bgcolor: "action.hover" },
          display: { xs: "none", md: "flex" },
        }}
      >
        <ChevronRightIcon />
      </IconButton>

      <Box
        ref={ref}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        sx={{
          display: "grid",
          gridAutoFlow: "column",
          gridAutoColumns: {
            xs: "min(92vw, 560px)",
            md: "min(960px, 90vw)",
          },
          gap: { xs: 1.5, sm: 2 },
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollBehavior: "smooth",
          px: { xs: 1.25, sm: 2 },
          WebkitOverflowScrolling: "touch",
          overscrollBehaviorX: "contain",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": { display: "none" },
          cursor: "grab",
          "&:active": { cursor: "grabbing" },
        }}
      >
        {slides.map((slideItems, sIdx) => (
          <Box
            key={sIdx}
            sx={{
              scrollSnapAlign: "center",
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridAutoRows: "1fr",
              gap: { xs: 1.25, sm: 2 },
              alignItems: "stretch",
            }}
          >
            {slideItems.map((p, i) => (
              <MenuCard
                key={`${p.id}-${i}`}
                menu={p} // ส่ง MenuItemDto เข้าไปได้เลย
                onAddToCart={onAddToCart}
                currency={currency}
                sx={{
                  height: "100%",
                  transition: "transform .15s ease, box-shadow .15s ease",
                  "&:hover": {
                    transform: { md: "translateY(-2px)" },
                    boxShadow: { md: 6 },
                  },
                }}
              />
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}