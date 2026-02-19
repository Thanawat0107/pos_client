import * as React from "react";
import { useMemo, useRef, useEffect, useState } from "react";
import { Box, useMediaQuery, useTheme, alpha, IconButton, Snackbar, Alert } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useNavigate } from "react-router-dom";

import MenuCard from "./MenuCard";
import type { MenuItemDto } from "../../../@types/dto/MenuItem";
import { useAddtoCartMutation } from "../../../services/shoppingCartApi";
import { useAppSelector } from "../../../hooks/useAppHookState";

type Props = {
  items: MenuItemDto[];
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
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();
  const upMd = useMediaQuery(theme.breakpoints.up("md"));

  // --- Cart ---
  const [addtoCart] = useAddtoCartMutation();
  const { userId } = useAppSelector((state) => state.auth);
  const [snackMsg, setSnackMsg] = useState<string | null>(null);

  // ✅ Quick Add: ไม่ส่ง optionIds → backend เลือก IsDefault ให้เอง
  const handleAddToCart = async (m: MenuItemDto) => {
    if (onAddToCart) { onAddToCart(m); return; } // เผื่อ backward compat
    const cartToken = localStorage.getItem("cartToken") || undefined;
    try {
      const result = await addtoCart({
        menuItemId: m.id,
        quantity: 1,
        userId: userId?.toString(),
        cartToken,
      }).unwrap();
      if (result.cartToken && !cartToken) {
        localStorage.setItem("cartToken", result.cartToken);
      }
      setSnackMsg(`เพิ่ม "${m.name}" ลงตะกร้าแล้ว`);
    } catch {
      setSnackMsg(`เกิดข้อผิดพลาด ไม่สามารถเพิ่ม "${m.name}" ได้`);
    }
  };

  const cols = upMd ? 3 : 2;
  const rows = 1;
  const perSlide = cols * rows;

  const slides = useMemo(() => chunk(items, perSlide), [items, perSlide]);

  // --- Logic: Drag vs Click ---
  const isDragging = useRef(false);
  const drag = useRef({ active: false, x: 0, left: 0 });

  const onDown = (e: React.PointerEvent) => {
    // ❌ เอา setPointerCapture ออกจากตรงนี้! (นี่คือจุดที่แก้ปัญหา)
    const el = ref.current!;
    drag.current = { active: true, x: e.clientX, left: el.scrollLeft };
    isDragging.current = false; // Reset สถานะเริ่มใหม่
  };

  const onMove = (e: React.PointerEvent) => {
    if (!drag.current.active || !ref.current) return;
    
    const dx = Math.abs(e.clientX - drag.current.x);

    // ✅ ถ้าขยับเมาส์เกิน 5px ถึงจะเริ่มนับว่าเป็นการ Drag
    if (dx > 5) {
      isDragging.current = true;
      e.preventDefault();

      // สั่ง Capture ตรงนี้แทน เพื่อให้ลากเมาส์ออกนอกจอก็ยังเลื่อนต่อได้
      if (!ref.current.hasPointerCapture(e.pointerId)) {
        ref.current.setPointerCapture(e.pointerId);
      }

      ref.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
    }
  };

  const onUp = (e: React.PointerEvent) => {
    // ปล่อย Capture
    if (ref.current && ref.current.hasPointerCapture(e.pointerId)) {
      ref.current.releasePointerCapture(e.pointerId);
    }
    drag.current.active = false;
    
    // Safety timeout เพื่อให้ Event Click ทำงานทันก่อนจะ Reset Flag
    setTimeout(() => {
        isDragging.current = false;
    }, 0);
  };

  // ✅ ฟังก์ชัน Click ที่ปลอดภัย (ถ้า Drag อยู่จะไม่เปลี่ยนหน้า)
  const handleItemClick = (id: number) => {
    if (!isDragging.current) {
      navigate(`/menu/${id}`);
    }
  };

  // --- Wheel & Button Logic (เหมือนเดิม) ---
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

  const handleScroll = (direction: "left" | "right") => {
    if (!ref.current) return;
    const w = ref.current.clientWidth;
    ref.current.scrollBy({ left: direction === "left" ? -w : w, behavior: "smooth" });
  };

  return (
    <Box
      sx={(t) => ({
        position: "relative",
        py: { xs: 1.5, sm: 2 },
        mx: "auto",
        maxWidth: maxWidth ? t.breakpoints.values[maxWidth] : "100%",
        "&::before, &::after": {
          content: '""', position: "absolute", top: 0, bottom: 0, width: { xs: 20, sm: 36 }, pointerEvents: "none", zIndex: 1
        },
        "&::before": { left: 0, background: `linear-gradient(90deg, ${t.palette.background.default}, ${alpha(t.palette.background.default, 0)})` },
        "&::after": { right: 0, background: `linear-gradient(270deg, ${t.palette.background.default}, ${alpha(t.palette.background.default, 0)})` },
      })}
    >
      <IconButton onClick={() => handleScroll("left")} sx={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", zIndex: 2, bgcolor: "background.paper", boxShadow: 2, display: { xs: "none", md: "flex" } }}>
        <ChevronLeftIcon />
      </IconButton>
      <IconButton onClick={() => handleScroll("right")} sx={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", zIndex: 2, bgcolor: "background.paper", boxShadow: 2, display: { xs: "none", md: "flex" } }}>
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
          gridAutoColumns: { xs: "min(92vw, 560px)", md: "min(960px, 90vw)" },
          gap: { xs: 1.5, sm: 2 },
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollBehavior: "smooth",
          px: { xs: 1.25, sm: 2 },
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          cursor: "grab",
          "&:active": { cursor: "grabbing" },
          userSelect: "none" // ✅ ป้องกันการเลือก Text ตอนลาก
        }}
      >
        {slides.map((slideItems, sIdx) => (
          <Box key={sIdx} sx={{ scrollSnapAlign: "center", display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: { xs: 1.25, sm: 2 } }}>
            {slideItems.map((p, i) => (
              <MenuCard
                key={`${p.id}-${i}`}
                menu={p}
                onAddToCart={handleAddToCart}
                currency={currency}
                // ✅ ส่ง onClick ไปให้ MenuCard
                onClick={() => handleItemClick(p.id)}
                sx={{
                  height: "100%",
                  transition: "transform .15s ease",
                  "&:hover": { transform: { md: "translateY(-2px)" }, boxShadow: { md: 6 }, cursor: "pointer" },
                }}
              />
            ))}
          </Box>
        ))}
      </Box>
      {/* Feedback Snackbar */}
      <Snackbar
        open={!!snackMsg}
        autoHideDuration={2500}
        onClose={() => setSnackMsg(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackMsg(null)}
          severity={snackMsg?.startsWith("เกิด") ? "error" : "success"}
          variant="filled"
          sx={{ width: "100%", borderRadius: 3 }}
        >
          {snackMsg}
        </Alert>
      </Snackbar>    </Box>
  );
}