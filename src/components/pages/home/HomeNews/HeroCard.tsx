import { Card, Box, Stack, Typography, Button, Chip } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import { alpha } from "@mui/material/styles";
import type { Content } from "../../../../@types/dto/Content";
import { formatThaiDate } from "../../../../utility/utils";
import { getImage, fadeSlideUp } from "./newsHelpers";
import TypeChip from "./TypeChip";

export default function HeroCard({ item, onClick }: { item: Content; onClick: () => void }) {
  const image = getImage(item.imageUrl, "https://placehold.co/1400x900?text=Featured");

  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        position: "relative",
        height: { xs: 360, sm: 460, md: "100%" },
        minHeight: { md: 520 },
        borderRadius: 2,
        overflow: "hidden",
        cursor: "pointer",
        "&:hover .hero-img": { transform: "scale(1.06)" },
        "&:hover .hero-btn": { gap: 1.5 },
        animation: `${fadeSlideUp} 0.6s ease both`,
      }}
    >
      {/* รูปภาพ */}
      <Box
        className="hero-img"
        component="img"
        src={image}
        alt={item.title}
        sx={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", transition: "transform 0.9s cubic-bezier(0.4,0,0.2,1)",
        }}
      />

      {/* Gradient layers */}
      <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,0,0,0.05) 0%, transparent 60%)" }} />
      <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 45%, transparent 75%)" }} />

      {/* TOP : ป้ายประเภทและ Featured */}
      <Box sx={{ position: "absolute", top: 28, left: 28, display: "flex", gap: 1, alignItems: "center" }}>
        <TypeChip contentType={item.contentType} overlay />
        <Chip
          size="small"
          label="FEATURED"
          sx={{
            fontWeight: 900, fontSize: "0.65rem", letterSpacing: 1.5, height: 26,
            color: "white", bgcolor: alpha("#000", 0.45), backdropFilter: "blur(12px)",
            border: `1px solid ${alpha("#ffffff", 0.2)}`,
          }}
        />
      </Box>

      {/* BOTTOM : ชื่อเรื่องและปุ่ม */}
      <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, p: { xs: 3, md: 4.5 }, color: "white" }}>
        <Stack direction="row" alignItems="center" spacing={0.8} mb={1.5}>
          <CalendarTodayOutlinedIcon sx={{ fontSize: 14, opacity: 0.75 }} />
          <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 600, fontSize: "0.8rem" }}>
            {formatThaiDate(item.createdAt, { day: "numeric", month: "long", year: "numeric" })}
          </Typography>
        </Stack>

        <Typography
          sx={{
            fontWeight: 900, lineHeight: 1.25, fontSize: { xs: "1.7rem", sm: "2.1rem", md: "2.5rem" },
            textShadow: "0 2px 16px rgba(0,0,0,0.4)", mb: 1.5,
            display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}
        >
          {item.title}
        </Typography>

        {item.description && (
          <Typography
            variant="body2"
            sx={{
              opacity: 0.78, mb: 2.5, lineHeight: 1.6,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}
          >
            {item.description}
          </Typography>
        )}

        <Button
          className="hero-btn"
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          sx={{
            borderRadius: 50, textTransform: "none", fontWeight: 700, px: 3.5, py: 1.1, gap: 1,
            bgcolor: "white", color: "grey.900", transition: "all 0.3s ease",
            "&:hover": { bgcolor: "white", transform: "translateX(4px)" },
          }}
        >
          อ่านรายละเอียด
        </Button>
      </Box>
    </Card>
  );
}
