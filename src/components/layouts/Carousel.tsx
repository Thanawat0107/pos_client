/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useRef, useEffect } from "react";
import { Box, IconButton, Fade, useMediaQuery, Typography, Button, Stack } from "@mui/material";
import { ArrowBackIosNew, ArrowForwardIos } from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";
import type { Content } from "../../@types/dto/Content";
import { baseUrl } from "../../helpers/SD";

export default function Carousel({ items, autoPlay = true }: { items: Content[]; autoPlay?: boolean }) {
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  // Swipe logic
  const startX = useRef<number | null>(null);
  const deltaX = useRef(0);

  useEffect(() => { if (!autoPlay || items.length <= 1) return;
    const timer = setInterval(() => handleNext(), 7000);
    return () => clearInterval(timer);
  }, [index, autoPlay, items.length]);

  const handlePrev = () => setIndex((p) => (p === 0 ? items.length - 1 : p - 1));
  const handleNext = () => setIndex((p) => (p === items.length - 1 ? 0 : p + 1));

  if (!items?.length) return null;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: { xs: 300, sm: 400, md: 500, lg: 600 },
        borderRadius: { xs: 0, md: "24px" }, // โค้งมนรับกับธีมใหม่
        overflow: "hidden",
        boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
        bgcolor: "background.paper",
      }}
      onTouchStart={(e) => (startX.current = e.touches[0].clientX)}
      onTouchMove={(e) => startX.current && (deltaX.current = e.touches[0].clientX - startX.current)}
      onTouchEnd={() => {
        if (Math.abs(deltaX.current) > 50) deltaX.current < 0 ? handleNext() : handlePrev();
        startX.current = null; deltaX.current = 0;
      }}
    >
      {items.map((item, i) => (
        <Fade key={item.id} in={i === index} timeout={1000}>
          <Box sx={{ position: "absolute", inset: 0, display: i === index ? "block" : "none" }}>
            
            {/* 1. Image with Ken Burns Effect */}
            <Box
              component="img"
              src={item.imageUrl?.startsWith("http") ? item.imageUrl : baseUrl + item.imageUrl}
              alt={item.title}
              sx={{
                width: "100%", height: "100%", objectFit: "cover",
                animation: i === index ? "kenburns 15s ease-out forwards" : "none",
                "@keyframes kenburns": { "0%": { transform: "scale(1)" }, "100%": { transform: "scale(1.1)" } },
              }}
            />

            {/* 2. Deep Gradient Overlay (ช่วยให้ข้อความเด่น) */}
            <Box sx={{
              position: "absolute", inset: 0,
              background: `linear-gradient(to right, ${alpha("#000", 0.8)} 0%, ${alpha("#000", 0.4)} 50%, transparent 100%), 
                           linear-gradient(to top, ${alpha("#000", 0.6)} 0%, transparent 40%)`
            }} />

            {/* 3. Content Area with Entrance Animation */}
            <Box sx={{
              position: "absolute", inset: 0, display: "flex", flexDirection: "column",
              justifyContent: "center", p: { xs: 4, md: 10 }, color: "white",
              zIndex: 2,
            }}>
              <Box sx={{
                animation: i === index ? "slideUp 0.8s cubic-bezier(0.2, 1, 0.3, 1) forwards" : "none",
                "@keyframes slideUp": { "0%": { opacity: 0, transform: "translateY(30px)" }, "100%": { opacity: 1, transform: "translateY(0)" } }
              }}>
                <Typography 
                  variant="overline" 
                  sx={{ 
                    bgcolor: item.contentType === "Promotion" ? "primary.main" : "info.main",
                    px: 2, py: 0.5, borderRadius: "50px", fontWeight: 700, letterSpacing: 1
                  }}
                >
                  {item.contentType}
                </Typography>

                <Typography variant={isDesktop ? "h1" : "h3"} sx={{ mt: 2, mb: 1, fontWeight: 800, textShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
                  {item.title}
                </Typography>

                <Typography variant="h6" sx={{ mb: 4, opacity: 0.8, maxWidth: "600px", fontWeight: 400, display: { xs: 'none', sm: 'block' } }}>
                  {item.description}
                </Typography>

                <Stack direction="row" spacing={2}>
                  <Button 
                    variant="contained" size="large"
                    sx={{ borderRadius: "50px", px: 4, py: 1.5, fontSize: "1.1rem", boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.4)}` }}
                  >
                    สั่งเลยตอนนี้
                  </Button>
                  <Button 
                    variant="outlined" size="large"
                    sx={{ borderRadius: "50px", px: 4, color: "white", borderColor: "rgba(255,255,255,0.5)", "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" } }}
                  >
                    รายละเอียด
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Box>
        </Fade>
      ))}

      {/* Navigation Arrows */}
      <NavArrow direction="left" onClick={handlePrev} icon={<ArrowBackIosNew />} />
      <NavArrow direction="right" onClick={handleNext} icon={<ArrowForwardIos />} />

      {/* Indicators */}
      <Box sx={{ position: "absolute", bottom: 30, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 1.5, zIndex: 10 }}>
        {items.map((_, i) => (
          <Box
            key={i} component="button" onClick={() => setIndex(i)}
            sx={{
              width: i === index ? 30 : 10, height: 10, borderRadius: 5, border: "none", p: 0, cursor: "pointer",
              bgcolor: i === index ? "primary.main" : "rgba(255,255,255,0.4)",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

// Sub-component for Arrows
const NavArrow = ({ direction, onClick, icon }: any) => (
  <IconButton
    onClick={onClick}
    sx={{
      position: "absolute", top: "50%", transform: "translateY(-50%)",
      [direction]: 24, zIndex: 10, color: "white",
      bgcolor: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,0.2)",
      "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
      display: { xs: "none", md: "flex" }
    }}
  >
    {icon}
  </IconButton>
);