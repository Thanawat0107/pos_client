/* eslint-disable @typescript-eslint/no-unused-expressions */
import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Box, IconButton, Fade, useMediaQuery } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";

const images = [
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  "https://images.unsplash.com/photo-1500534623283-312aade485b7",
];

export default function Carousel() {
  const [index, setIndex] = useState(0);
  const isDesktop = useMediaQuery("(min-width:900px)");

  // ---- swipe state ----
  const startX = useRef<number | null>(null);
  const deltaX = useRef(0);
  const SWIPE_THRESHOLD = 40; // px

  const handlePrev = () => setIndex((p) => (p === 0 ? images.length - 1 : p - 1));
  const handleNext = () => setIndex((p) => (p === images.length - 1 ? 0 : p + 1));

  // Mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    deltaX.current = 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startX.current == null) return;
    deltaX.current = e.touches[0].clientX - startX.current;
  };
  const onTouchEnd = () => {
    if (Math.abs(deltaX.current) > SWIPE_THRESHOLD) {
      deltaX.current < 0 ? handleNext() : handlePrev();
    }
    startX.current = null;
    deltaX.current = 0;
  };

  // Keyboard (desktop accessibility)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const withParams = (url: string) => {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}auto=format&fit=crop&w=1600&q=80`;
};

  return (
    <Box
      role="region"
      aria-label="Carousel"
      sx={{
        position: "relative",
        width: "100%",
        // สูงแบบ responsive (มือถือเด่นสุด)
        height: { xs: 220, sm: 300, md: 420, lg: 560 },
        borderRadius: { xs: 2, md: 3 },
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
        mx: "auto",
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {images.map((img, i) => (
        <Fade key={i} in={i === index} timeout={400}>
          <Box
            component="img"
            src={withParams(img)}
            alt={`slide-${i + 1}`}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/fallback.jpg";
            }} // เผื่อไว้
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: i === index ? "block" : "none",
              objectPosition: "center",
            }}
          />
        </Fade>
      ))}

      {/* ปุ่มซ้าย/ขวา — ซ่อนไว้บนมือถือเพื่อความโล่ง */}
      <IconButton
        onClick={handlePrev}
        aria-label="previous slide"
        sx={{
          position: "absolute",
          top: "50%",
          left: 8,
          transform: "translateY(-50%)",
          color: "white",
          bgcolor: "rgba(0,0,0,0.32)",
          "&:hover": { bgcolor: "rgba(0,0,0,0.5)" },
          display: { xs: "none", md: "inline-flex" },
        }}
      >
        <ArrowBackIos />
      </IconButton>

      <IconButton
        onClick={handleNext}
        aria-label="next slide"
        sx={{
          position: "absolute",
          top: "50%",
          right: 8,
          transform: "translateY(-50%)",
          color: "white",
          bgcolor: "rgba(0,0,0,0.32)",
          "&:hover": { bgcolor: "rgba(0,0,0,0.5)" },
          display: { xs: "none", md: "inline-flex" },
        }}
      >
        <ArrowForwardIos />
      </IconButton>

      {/* จุดบอกตำแหน่ง — แตะง่ายขึ้นบนมือถือ */}
      <Box
        sx={{
          position: "absolute",
          bottom: 12,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 1,
          px: 2,
          pointerEvents: "auto",
        }}
      >
        {images.map((_, i) => {
          const active = i === index;
          return (
            <Box
              key={i}
              component="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                appearance: "none",
                border: 0,
                background: "transparent",
                cursor: "pointer",
              }}
              // hit area ใหญ่ขึ้นบนมือถือ
              sx={{
                width: { xs: 10, sm: 10 },
                height: { xs: 10, sm: 10 },
                borderRadius: "50%",
                bgcolor: active ? "common.white" : "rgba(255,255,255,0.55)",
                outline: "2px solid transparent",
                outlineOffset: 2,
                transition: "transform .2s ease, background-color .2s ease",
                "&:hover": { transform: "scale(1.1)" },
                "&:focus-visible": {
                  outlineColor: "rgba(255,255,255,0.9)",
                },
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}
