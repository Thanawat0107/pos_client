import * as React from "react";
import { useMemo, useRef, useEffect } from "react";
import { Box, useMediaQuery, useTheme, alpha } from "@mui/material";
import MenuCard, { type Menu } from "./MenuCard";

type Props = {
  items: Menu[];
  onAddToCart?: (p: Menu) => void;
  maxWidth?: "sm" | "md" | "lg" | "xl" | false;
  currency?: string;
};

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

  // ✅ มือถือ: 2 คอลัมน์ ต่อสไลด์ (1 แถว)
  // ✅ เดสก์ท็อป: 3 คอลัมน์ ต่อสไลด์ (1 แถว)
  const cols = upMd ? 3 : 2;
  const rows = 1;                // <<— ตามโจทย์: 1 แถวแนวนอน
  const perSlide = cols * rows;  // xs: 2, md+: 3 (ไล่ไปทีละสไลด์)

  const slides = useMemo(() => chunk(items, perSlide), [items, perSlide]);

  // drag-to-scroll (mouse/touch)
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

  // wheel: vertical -> horizontal (desktop)
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

  return (
    <Box
      sx={(t) => ({
        position: "relative",
        py: { xs: 1.5, sm: 2 },
        mx: "auto",
        maxWidth: maxWidth ? t.breakpoints.values[maxWidth] : "100%",

        // ฮินท์เลื่อน: gradient ซ้าย/ขวา
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
      {/* แนวนอน: 1 "คอลัมน์ grid" = 1 สไลด์ */}
      <Box
        ref={ref}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        sx={{
          display: "grid",
          gridAutoFlow: "column",
          // กำหนดความกว้างของ 1 สไลด์ (ให้พอดีกับจำนวนคอลัมน์)
          gridAutoColumns: {
            xs: "min(92vw, 560px)",   // มือถือ: เต็มตาหน่อย ให้เห็นขอบนิดๆ
            md: "min(960px, 90vw)",   // เดสก์ท็อป: กว้างขึ้นรองรับ 3 คอลัมน์
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
              gridTemplateColumns: `repeat(${cols}, 1fr)`, // <<— 2 คอลัมน์ xs, 3 คอลัมน์ md+
              gridAutoRows: "1fr",
              gap: { xs: 1.25, sm: 2 },
              alignItems: "stretch",
            }}
          >
            {slideItems.map((p, i) => (
              <MenuCard
                key={`${p.id}-${i}`}
                menu={p}
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
