/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useState, useRef } from "react";
import {
  Paper,
  Box,
  Typography,
  Stack,
  ButtonBase,
  Chip,
  IconButton,
} from "@mui/material";
import {
  Place,
  ChevronRight,
  ChevronLeft,
  ImageNotSupported,
} from "@mui/icons-material";
import { baseUrl, SD_ServiceType } from "../../../../helpers/SD";
import type { Manual } from "../../../../@types/dto/Manual";

const CATEGORY_META: Record<string, { bg: string; text: string; label: string }> = {
  [SD_ServiceType.Water]:    { bg: "#E3F2FD", text: "#1565C0", label: "น้ำดื่ม" },
  [SD_ServiceType.Utensils]: { bg: "#FFF3E0", text: "#E65100", label: "อุปกรณ์" },
  [SD_ServiceType.Restroom]: { bg: "#F3E5F5", text: "#6A1B9A", label: "ห้องน้ำ" },
};
const DEFAULT_META = { bg: "#F3F4F6", text: "#374151", label: "ทั่วไป" };

interface Props {
  manual: Manual;
  onOpen: (manual: Manual) => void;
}

export const ManualCard = ({ manual, onOpen }: Props) => {
  const [imgIndex, setImgIndex] = useState(0);
  const images = manual.images ?? [];
  const hasMultiple = images.length > 1;
  const meta = CATEGORY_META[manual.category] ?? DEFAULT_META;
  const touchStartX = useRef<number | null>(null);

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex((i) => (i - 1 + images.length) % images.length);
  };

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex((i) => (i + 1) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !hasMultiple) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      // swipe ซ้าย → รูปถัดไป, swipe ขวา → รูปก่อนหน้า
      diff > 0
        ? setImgIndex((i) => (i + 1) % images.length)
        : setImgIndex((i) => (i - 1 + images.length) % images.length);
    }
    touchStartX.current = null;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        textAlign: "left",
        borderRadius: "24px",
        overflow: "hidden",
        border: "1.5px solid #F0F0F0",
        bgcolor: "white",
        transition: "box-shadow 0.2s ease",
        "&:hover": { boxShadow: "0 10px 28px rgba(0,0,0,0.10)" },
      }}
    >
      {/* ── ส่วนรูปภาพ + carousel ── */}
      <Box
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        sx={{
          position: "relative",
          width: "100%",
          height: 240,
          bgcolor: "#F3F4F6",
          flexShrink: 0,
          touchAction: "pan-y",
        }}
      >
        {images.length > 0 ? (
          <Box
            component="img"
            src={baseUrl + images[imgIndex]}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ width: "100%", height: "100%", gap: 1 }}
          >
            <ImageNotSupported sx={{ fontSize: 48, color: "#D1D5DB" }} />
            <Typography sx={{ color: "#9CA3AF", fontSize: 14, fontWeight: 600 }}>
              ไม่มีรูปภาพ
            </Typography>
          </Stack>
        )}

        {/* ── ปุ่มซ้าย / ขวา ── */}
        {hasMultiple && (
          <>
            {/* ซ่อนปุ่มบนมือถือ — ใช้ swipe แทน */}
            <IconButton
              onClick={prev}
              size="small"
              sx={{
                display: { xs: "none", sm: "flex" },
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "rgba(255,255,255,0.88)",
                backdropFilter: "blur(4px)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                "&:hover": { bgcolor: "white" },
              }}
            >
              <ChevronLeft sx={{ fontSize: 22 }} />
            </IconButton>
            <IconButton
              onClick={next}
              size="small"
              sx={{
                display: { xs: "none", sm: "flex" },
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "rgba(255,255,255,0.88)",
                backdropFilter: "blur(4px)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                "&:hover": { bgcolor: "white" },
              }}
            >
              <ChevronRight sx={{ fontSize: 22 }} />
            </IconButton>

            {/* ── Dots indicator ── */}
            <Stack
              direction="row"
              spacing={0.6}
              sx={{
                position: "absolute",
                bottom: 12,
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              {images.map((_, i) => (
                <Box
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setImgIndex(i);
                  }}
                  sx={{
                    width: i === imgIndex ? 22 : 8,
                    height: 8,
                    borderRadius: "4px",
                    bgcolor:
                      i === imgIndex ? "white" : "rgba(255,255,255,0.5)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                  }}
                />
              ))}
            </Stack>

            {/* ── Badge จำนวนรูป ── */}
            <Box
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                bgcolor: "rgba(0,0,0,0.50)",
                color: "white",
                borderRadius: "20px",
                px: 1.5,
                py: 0.35,
                fontSize: "13px",
                fontWeight: 700,
                backdropFilter: "blur(4px)",
                lineHeight: 1.6,
              }}
            >
              {imgIndex + 1} / {images.length}
            </Box>
          </>
        )}

        {/* ── Category chip บนรูป ── */}
        <Box sx={{ position: "absolute", top: 10, left: 10 }}>
          <Chip
            label={meta.label}
            size="small"
            sx={{
              bgcolor: meta.bg,
              color: meta.text,
              fontWeight: 800,
              fontSize: "13px",
              height: 26,
              boxShadow: "0 1px 6px rgba(0,0,0,0.12)",
            }}
          />
        </Box>
      </Box>

      {/* ── เนื้อหา (คลิกเพื่อเปิด) ── */}
      <ButtonBase
        onClick={() => onOpen(manual)}
        sx={{ width: "100%", textAlign: "left", "&:active": { opacity: 0.8 } }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ px: 2.5, py: 2.25, width: "100%" }}
        >
          <Box sx={{ flex: 1 }}>
            {/* ชื่อ */}
            <Typography
              sx={{
                fontSize: "20px",
                fontWeight: 900,
                color: "#111827",
                lineHeight: 1.25,
                mb: 0.75,
              }}
            >
              {manual.title}
            </Typography>

            {/* ตำแหน่ง */}
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Place sx={{ fontSize: 18, color: "#EF4444" }} />
              <Typography
                sx={{ fontSize: "15px", fontWeight: 600, color: "#6B7280" }}
              >
                {manual.location || "—"}
              </Typography>
            </Stack>
          </Box>

          {/* ลูกศรชี้ขวา */}
          <Box
            sx={{
              bgcolor: "#F3F4F6",
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ChevronRight sx={{ color: "#9CA3AF", fontSize: 24 }} />
          </Box>
        </Stack>
      </ButtonBase>
    </Paper>
  );
};
