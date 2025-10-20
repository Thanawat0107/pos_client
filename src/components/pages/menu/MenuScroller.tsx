import * as React from "react";
import { Box } from "@mui/material";
import MenuCard, { type Menu } from "./MenuCard";

type Props = {
  items: Menu[];
  onAddToCart?: (p: Menu) => void;
  maxWidth?: "sm" | "md" | "lg" | "xl" | false;
  currency?: string;
};

export default function MenuScroller({
  items,
  onAddToCart,
  maxWidth = "lg",
  currency = "USD",
}: Props) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  // drag-to-scroll
  const drag = React.useRef({ active: false, x: 0, left: 0 });
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

  // wheel vertical -> horizontal
  React.useEffect(() => {
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
    <Box sx={{ py: 2 }}>
      <Box
        ref={ref}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        sx={{
          display: "grid",
          gridAutoFlow: "column",
          gridAutoColumns: "min(88vw, 340px)",
          gap: 3,
          overflowX: "auto",
          scrollSnapType: "x proximity",
          px: { xs: 1, sm: 2 },
          mx: "auto",
          maxWidth: (t) => (maxWidth ? t.breakpoints.values[maxWidth] : "100%"),
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": { display: "none" },
          cursor: "grab",
          "&:active": { cursor: "grabbing" },
        }}
      >
        {items.map((p) => (
          <MenuCard
            key={p.id}
            menu={p}
            onAddToCart={onAddToCart}
            currency={currency}
            sx={{ scrollSnapAlign: "center" }}
          />
        ))}
      </Box>
    </Box>
  );
}
