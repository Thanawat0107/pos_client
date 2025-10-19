import * as React from "react";
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Stack,
} from "@mui/material";

export type Product = {
  id: string;
  name: string;
  price: number;      // ใช้สกุลเงินเองได้
  image: string;      // url หรือ data uri
  description?: string;
};

type Props = {
  items: Product[];
  onAddToCart?: (p: Product) => void;
  maxWidth?: "sm" | "md" | "lg" | "xl" | false;  // ความกว้างรวมของ scroller
};

export default function ProductScroller({
  items,
  onAddToCart,
  maxWidth = "lg",
}: Props) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  // ---- Drag to scroll ----
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

  // ---- Wheel vertical -> horizontal ----
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
          gridAutoColumns: "min(88vw, 340px)", // card width (responsive)
          gap: 3,
          overflowX: "auto",
          scrollSnapType: "x proximity",
          px: { xs: 1, sm: 2 },
          mx: "auto",
          maxWidth: (t) => (maxWidth ? t.breakpoints.values[maxWidth] : "100%"),
          // hide scrollbar
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": { display: "none" },
          cursor: "grab",
          "&:active": { cursor: "grabbing" },
        }}
      >
        {items.map((p) => (
          <Card
            key={p.id}
            sx={{
              height: "100%",
              borderRadius: 2,
              boxShadow: 3,
              scrollSnapAlign: "center",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Image */}
            <Box sx={{ p: 2, pb: 0 }}>
              <Box
                component="img"
                src={p.image}
                alt={p.name}
                loading="lazy"
                sx={{
                  width: "100%",
                  aspectRatio: "1/1",
                  objectFit: "cover",
                  borderRadius: 1,
                  bgcolor: "grey.100",
                  display: "block",
                }}
              />
            </Box>

            {/* Content */}
            <CardContent sx={{ flexGrow: 1 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="subtitle1" fontWeight={700}>
                  {p.name}
                </Typography>
                <Typography variant="subtitle1" fontWeight={700}>
                  {p.price.toLocaleString(undefined, {
                    style: "currency",
                    currency: "USD",
                  })}
                </Typography>
              </Stack>

              {p.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1.5 }}
                >
                  {p.description}
                </Typography>
              )}
            </CardContent>

            {/* Button */}
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                onClick={() => onAddToCart?.(p)}
                sx={{
                  borderRadius: 2,
                  bgcolor: "action.hover",
                  borderColor: "divider",
                  fontWeight: 700,
                  py: 1.25,
                }}
              >
                ADD TO CART
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
