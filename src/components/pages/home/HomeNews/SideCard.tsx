import { Box, Stack, Typography } from "@mui/material";
import type { Content } from "../../../../@types/dto/Content";
import { formatThaiDate } from "../../../../utility/utils";
import { getImage, getTypeConfig, fadeSlideUp } from "./newsHelpers";
import TypeChip from "./TypeChip";

interface SideCardProps {
  item: Content;
  index: number;
  onClick: () => void;
}

export default function SideCard({ item, index, onClick }: SideCardProps) {
  const image = getImage(item.imageUrl, "https://placehold.co/400x400?text=News");
  const cfg = getTypeConfig(item.contentType);

  return (
    <Box
      onClick={onClick}
      sx={{
        flex: 1,
        minHeight: 0,
        cursor: "pointer",
        borderRadius: 1.5,
        overflow: "hidden",
        position: "relative",
        animation: `${fadeSlideUp} 0.6s ${0.1 + index * 0.1}s ease both`,
        bgcolor: "grey.900",
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "0 0 0 1px rgba(255,255,255,0.07), 0 2px 16px rgba(0,0,0,0.45)"
            : "0 0 0 1px rgba(0,0,0,0.06), 0 2px 16px rgba(0,0,0,0.10)",
        // hover: IG hover dimming
        "&:hover .scard-img": { transform: "scale(1.05)", filter: "brightness(0.65)" },
        "&:hover .scard-overlay": { opacity: 1 },
      }}
    >
      {/* รูป — square-ish aspect */}
      <Box sx={{ position: "relative", paddingBottom: "75%", overflow: "hidden" }}>
        <Box
          className="scard-img"
          component="img"
          src={image}
          alt={item.title}
          sx={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%", objectFit: "cover",
            transition: "transform 0.45s ease, filter 0.45s ease",
          }}
        />

        {/* TypeChip — always visible */}
        <Box sx={{ position: "absolute", top: 12, left: 12, zIndex: 2 }}>
          <TypeChip contentType={item.contentType} overlay />
        </Box>

        {/* IG hover overlay — title ตรงกลาง */}
        <Box
          className="scard-overlay"
          sx={{
            position: "absolute", inset: 0, zIndex: 1,
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: 0, transition: "opacity 0.3s ease",
            px: 2, textAlign: "center",
          }}
        >
          <Typography
            sx={{
              color: "white", fontWeight: 800, fontSize: "0.95rem", lineHeight: 1.3,
              textShadow: "0 2px 8px rgba(0,0,0,0.5)",
              display: "-webkit-box", WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical", overflow: "hidden",
            }}
          >
            {item.title}
          </Typography>
        </Box>
      </Box>

      {/* ข้อความใต้รูป — IG caption style */}
      <Stack
        spacing={0.4}
        sx={{
          px: 1.5, py: 1.2,
          bgcolor: "background.paper",
          borderTop: `2px solid ${cfg.color}`,
        }}
      >
        <Typography
          sx={{
            fontWeight: 700, fontSize: "0.85rem", lineHeight: 1.3, color: "text.primary",
            display: "-webkit-box", WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}
        >
          {item.title}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.disabled", fontSize: "0.72rem" }}>
          {formatThaiDate(item.createdAt, { day: "numeric", month: "short" })}
        </Typography>
      </Stack>
    </Box>
  );
}
