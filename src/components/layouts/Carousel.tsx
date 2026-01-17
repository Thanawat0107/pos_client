/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useState, useRef, useEffect } from "react";
import { Box, IconButton, Fade, useMediaQuery, Typography, Button } from "@mui/material";
import { ArrowBackIosNew, ArrowForwardIos } from "@mui/icons-material"; // เปลี่ยนไอคอนให้ดูมนขึ้น
import type { Content } from "../../@types/dto/Content";
import { baseUrl } from "../../helpers/SD";

type Props = {
  items: Content[];
  autoPlay?: boolean;
};

export default function Carousel({ items, autoPlay = true }: Props) {
  const [index, setIndex] = useState(0);
  const isDesktop = useMediaQuery("(min-width:900px)");

  // ---- Swipe State ----
  const startX = useRef<number | null>(null);
  const deltaX = useRef(0);
  const SWIPE_THRESHOLD = 40;

  useEffect(() => {
    setIndex(0);
  }, [items]);

  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 6000); // เพิ่มเวลาเป็น 6 วิ ให้คนอ่านทัน
    return () => clearInterval(timer);
  }, [index, autoPlay, items.length]);

  const handlePrev = () => setIndex((p) => (p === 0 ? items.length - 1 : p - 1));
  const handleNext = () => setIndex((p) => (p === items.length - 1 ? 0 : p + 1));

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

  if (!items || items.length === 0) return null;

  return (
    <Box
      role="region"
      aria-label="Promotional Carousel"
      sx={{
        position: "relative",
        width: "100%",
        // ปรับความสูงให้ดูโปร่งขึ้น
        height: { xs: 240, sm: 360, md: 450, lg: 550 },
        // เพิ่มเงาฟุ้งๆ ด้านล่างให้ดูลอยออกมา
        boxShadow: {
          xs: "0 4px 12px rgba(0,0,0,0.1)",
          sm: "0 10px 40px -10px rgba(0,0,0,0.2)",
        },
        borderRadius: { xs: 0, sm: 4 }, // มุมมนขึ้นอีก
        overflow: "hidden",
        mx: "auto",
        bgcolor: "grey.100",
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {items.map((item, i) => (
        <Fade key={item.id} in={i === index} timeout={800}>
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: i === index ? "block" : "none",
            }}
          >
            {/* 1. รูปภาพพื้นหลัง (Ken Burns Effect เบาๆ) */}
            <Box
              component="img"
              // เช็คก่อนว่า imageUrl เป็น Full URL หรือ Path ถ้าเป็น Path ให้ต่อ baseUrl
              src={
                item.imageUrl
                  ? item.imageUrl.startsWith("http")
                    ? item.imageUrl
                    : baseUrl + item.imageUrl
                  : "https://placehold.co/1200x600?text=Promotion"
              }
              alt={item.title}
              // ✅ เพิ่มตรงนี้: ถ้าโหลดพัง ให้เปลี่ยน src เป็นรูปสำรองทันที
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; // กัน Loop นรกเผื่อรูปสำรองก็พัง
                target.src = "https://placehold.co/1200x600?text=No+Image";
              }}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                // Animation: Zoom เข้าช้าๆ
                animation:
                  i === index ? "kenburns 10s infinite alternate" : "none",
                "@keyframes kenburns": {
                  from: { transform: "scale(1)" },
                  to: { transform: "scale(1.05)" },
                },
              }}
            />

            {/* 2. Modern Gradient Overlay */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                // ไล่เฉดสีดำจากล่างขึ้นบน + มุมซ้ายล่างเข้มพิเศษให้อ่าน Text ง่าย
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0) 100%)",
              }}
            />

            {/* 3. Text Content Area */}
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                p: { xs: 3, md: 6 },
                pt: { xs: 8, md: 12 },
                color: "white",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "flex-end",
                // Glassmorphism Effect จางๆ
                backdropFilter: "blur(0px)",
              }}
            >
              {/* Badge ประเภท Content */}
              <Box
                sx={{
                  bgcolor:
                    item.contentType === "Promotion" ? "#FF5722" : "#2196F3",
                  color: "white",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  mb: 1.5,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {item.contentType}
              </Box>

              <Typography
                variant={isDesktop ? "h3" : "h5"}
                fontWeight={800}
                sx={{
                  textShadow: "0 4px 12px rgba(0,0,0,0.4)",
                  lineHeight: 1.2,
                  mb: 1,
                  maxWidth: "90%",
                }}
              >
                {item.title}
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  opacity: 0.85,
                  maxWidth: { xs: "100%", md: "60%" },
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  mb: 2,
                  lineHeight: 1.6,
                  fontSize: { xs: "0.9rem", md: "1.1rem" },
                }}
              >
                {item.description}
              </Typography>

              {/* Action Button */}
              {item.contentType === "Promotion" && (
                <Button
                  variant="contained"
                  color="primary" // หรือใช้สีส้ม '#FF5722'
                  size={isDesktop ? "large" : "medium"}
                  onClick={() => console.log("Click Banner:", item)}
                  sx={{
                    borderRadius: 50,
                    px: 4,
                    py: 1,
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "1rem",
                    boxShadow: "0 4px 14px rgba(255, 87, 34, 0.4)",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: "0 6px 20px rgba(255, 87, 34, 0.6)",
                    },
                  }}
                >
                  ดูรายละเอียด
                </Button>
              )}
            </Box>
          </Box>
        </Fade>
      ))}

      {/* Navigation Arrows (Glass style) */}
      {items.length > 1 && (
        <>
          <IconButton
            onClick={handlePrev}
            sx={{
              position: "absolute",
              top: "50%",
              left: 16,
              transform: "translateY(-50%)",
              color: "white",
              bgcolor: "rgba(255,255,255,0.15)", // ใสๆ
              backdropFilter: "blur(4px)", // เบลอพื้นหลังปุ่ม
              border: "1px solid rgba(255,255,255,0.2)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
              display: { xs: "none", md: "inline-flex" },
              width: 48,
              height: 48,
            }}
          >
            <ArrowBackIosNew fontSize="small" />
          </IconButton>
          <IconButton
            onClick={handleNext}
            sx={{
              position: "absolute",
              top: "50%",
              right: 16,
              transform: "translateY(-50%)",
              color: "white",
              bgcolor: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255,255,255,0.2)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
              display: { xs: "none", md: "inline-flex" },
              width: 48,
              height: 48,
            }}
          >
            <ArrowForwardIos fontSize="small" />
          </IconButton>
        </>
      )}

      {/* Dots Indicator (Modern pill shape) */}
      {items.length > 1 && (
        <Box
          sx={{
            position: "absolute",
            bottom: 20,
            right: 24, // ย้ายมาขวาล่าง
            display: "flex",
            gap: 0.8,
            zIndex: 2,
            // พื้นหลังจางๆ รองรับ dots
            p: 0.8,
            px: 1.5,
            borderRadius: 20,
            bgcolor: "rgba(0,0,0,0.2)",
            backdropFilter: "blur(4px)",
          }}
        >
          {items.map((_, i) => (
            <Box
              key={i}
              component="button"
              onClick={() => setIndex(i)}
              sx={{
                width: i === index ? 24 : 8,
                height: 8,
                borderRadius: 4,
                bgcolor: i === index ? "white" : "rgba(255,255,255,0.4)",
                border: "none",
                padding: 0,
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}