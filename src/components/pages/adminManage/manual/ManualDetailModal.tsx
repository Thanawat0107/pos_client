/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useState, useRef } from "react";
import {
  Dialog,
  IconButton,
  Typography,
  Box,
  Chip,
  Stack,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Close as CloseIcon,
  Place as PlaceIcon,
  CheckCircle as CheckIcon,
  ChevronLeft,
  ChevronRight,
  ImageNotSupported,
} from "@mui/icons-material";
import type { Manual } from "../../../../@types/dto/Manual";
import { baseUrl, SD_ServiceType } from "../../../../helpers/SD";

const CATEGORY_META: Record<string, { bg: string; text: string; label: string }> = {
  [SD_ServiceType.Water]:    { bg: "#E3F2FD", text: "#1565C0", label: "น้ำดื่ม" },
  [SD_ServiceType.Utensils]: { bg: "#FFF3E0", text: "#E65100", label: "อุปกรณ์" },
  [SD_ServiceType.Restroom]: { bg: "#F3E5F5", text: "#6A1B9A", label: "ห้องน้ำ" },
};
const DEFAULT_META = { bg: "#F3F4F6", text: "#374151", label: "ทั่วไป" };

interface Props {
  open: boolean;
  onClose: () => void;
  manual: Manual | null;
}

export const ManualDetailModal = ({ open, onClose, manual }: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [imgIndex, setImgIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (!manual) return null;

  const images = manual.images ?? [];
  const hasMultiple = images.length > 1;
  const meta = CATEGORY_META[manual.category] ?? DEFAULT_META;
  const steps = manual.content?.split("\n").filter((s) => s.trim()) ?? [];

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
      diff > 0
        ? setImgIndex((i) => (i + 1) % images.length)
        : setImgIndex((i) => (i - 1 + images.length) % images.length);
    }
    touchStartX.current = null;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : "28px",
          overflow: "hidden",
          bgcolor: "#FAFAFA",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* ----- รูปภาพ + carousel + ปุ่มปิด ----- */}
      <Box
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        sx={{
          position: "relative",
          flexShrink: 0,
          height: isMobile ? 220 : 280,
          bgcolor: "#E5E7EB",
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
            <ImageNotSupported sx={{ fontSize: 56, color: "#D1D5DB" }} />
            <Typography sx={{ color: "#9CA3AF", fontSize: 15, fontWeight: 600 }}>
              ไม่มีรูปภาพ
            </Typography>
          </Stack>
        )}

        {/* ปุ่มซ้าย/ขวา — ซ่อนบนมือถือ ใช้ swipe แทน */}
        {hasMultiple && (
          <>
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

            {/* Dots indicator */}
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
                  onClick={(e) => { e.stopPropagation(); setImgIndex(i); }}
                  sx={{
                    width: i === imgIndex ? 22 : 8,
                    height: 8,
                    borderRadius: "4px",
                    bgcolor: i === imgIndex ? "white" : "rgba(255,255,255,0.5)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                  }}
                />
              ))}
            </Stack>

            {/* Badge จำนวนรูป */}
            <Box
              sx={{
                position: "absolute",
                top: 10,
                right: 50,
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

        {/* ปุ่มปิด */}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: "absolute",
            top: 14,
            right: 14,
            bgcolor: "rgba(0,0,0,0.45)",
            color: "#fff",
            "&:hover": { bgcolor: "rgba(0,0,0,0.65)" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* ----- เนื้อหา ----- */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 3, pt: 3, pb: 1 }}>
        {/* Chip หมวดหมู่ */}
        <Chip
          label={meta.label}
          sx={{
            bgcolor: meta.bg,
            color: meta.text,
            fontWeight: 800,
            fontSize: "15px",
            height: 30,
            mb: 1.5,
          }}
        />

        {/* ชื่อ */}
        <Typography
          sx={{ fontSize: "30px", fontWeight: 900, color: "#111827", lineHeight: 1.15, mb: 1.5 }}
        >
          {manual.title}
        </Typography>

        {/* ตำแหน่งบริการ */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
          <Box
            sx={{
              bgcolor: "#FEE2E2",
              borderRadius: "12px",
              px: 1.5,
              py: 0.75,
              display: "flex",
              alignItems: "center",
              gap: 0.75,
            }}
          >
            <PlaceIcon sx={{ fontSize: 22, color: "#DC2626" }} />
            <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "#DC2626" }}>
              {manual.location || "จุดบริการ"}
            </Typography>
          </Box>
        </Stack>

        {/* ขั้นตอนวิธีใช้งาน */}
        {steps.length > 0 && (
          <>
            <Typography
              sx={{
                fontSize: "18px",
                fontWeight: 800,
                color: "#6B7280",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                mb: 2,
              }}
            >
              วิธีใช้งาน
            </Typography>

            <Stack spacing={2.5} sx={{ mb: 3 }}>
              {steps.map((step, index) => (
                <Stack key={index} direction="row" spacing={2} alignItems="flex-start">
                  <Box
                    sx={{
                      minWidth: 44,
                      height: 44,
                      borderRadius: "50%",
                      bgcolor: meta.text,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Typography sx={{ fontSize: "20px", fontWeight: 900, color: "#fff" }}>
                      {index + 1}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      bgcolor: "white",
                      borderRadius: "16px",
                      px: 2.5,
                      py: 1.75,
                      flex: 1,
                      border: "1.5px solid #F3F4F6",
                    }}
                  >
                    <Typography
                      sx={{ fontSize: "20px", fontWeight: 600, color: "#1F2937", lineHeight: 1.4 }}
                    >
                      {step}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </>
        )}
      </Box>

      {/* ----- ปุ่มด้านล่าง ----- */}
      <Box sx={{ px: 3, pb: 3, pt: 2, flexShrink: 0 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={onClose}
          startIcon={<CheckIcon sx={{ fontSize: 26 }} />}
          sx={{
            bgcolor: "#111827",
            "&:hover": { bgcolor: "#1F2937" },
            borderRadius: "18px",
            py: 2,
            fontSize: "20px",
            fontWeight: 800,
            textTransform: "none",
            boxShadow: "none",
          }}
        >
          เข้าใจแล้ว
        </Button>
      </Box>
    </Dialog>
  );
};
