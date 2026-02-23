import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { Content } from "../../../../@types/dto/Content";
import { formatThaiDate } from "../../../../utility/utils";
import { getImage, getTypeConfig, fadeSlideUp } from "./newsHelpers";
import TypeChip from "./TypeChip";

interface RegularCardProps {
  item: Content;
  index: number;
  onClick: () => void;
}

export default function RegularCard({ item, index, onClick }: RegularCardProps) {
  const image = getImage(item.imageUrl, "https://placehold.co/600x600?text=News");
  const cfg = getTypeConfig(item.contentType);

  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: "pointer",
        borderRadius: 1.5,
        overflow: "hidden",
        bgcolor: "grey.900",
        animation: `${fadeSlideUp} 0.6s ${0.15 * index}s ease both`,
        // IG hover effect
        "&:hover .rcard-img": { transform: "scale(1.05)", filter: "brightness(0.6)" },
        "&:hover .rcard-overlay": { opacity: 1 },
      }}
    >
      {/* รูป — square 1:1 */}
      <Box sx={{ position: "relative", paddingBottom: "100%", overflow: "hidden" }}>
        <Box
          className="rcard-img"
          component="img"
          src={image}
          alt={item.title}
          sx={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%", objectFit: "cover",
            transition: "transform 0.45s ease, filter 0.45s ease",
          }}
        />

        {/* TypeChip — เหมือน IG story ring */}
        <Box sx={{ position: "absolute", top: 14, left: 14, zIndex: 2 }}>
          <TypeChip contentType={item.contentType} overlay />
        </Box>

        {/* IG hover overlay — แสดง title + description เหมือน IG explore */}
        <Box
          className="rcard-overlay"
          sx={{
            position: "absolute", inset: 0, zIndex: 1,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            opacity: 0, transition: "opacity 0.3s ease",
            px: 2.5, textAlign: "center", gap: 1,
          }}
        >
          <Typography
            sx={{
              color: "white", fontWeight: 900, fontSize: "1rem", lineHeight: 1.3,
              textShadow: "0 2px 12px rgba(0,0,0,0.6)",
              display: "-webkit-box", WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical", overflow: "hidden",
            }}
          >
            {item.title}
          </Typography>
          {item.description && (
            <Typography
              sx={{
                color: alpha("#ffffff", 0.82), fontSize: "0.78rem", lineHeight: 1.5,
                display: "-webkit-box", WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical", overflow: "hidden",
              }}
            >
              {item.description}
            </Typography>
          )}
        </Box>
      </Box>

      {/* IG caption bar ใต้รูป */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 1.5, py: 1,
          bgcolor: "background.paper",
          borderTop: `2px solid ${cfg.color}`,
        }}
      >
        <Typography
          sx={{
            fontWeight: 700, fontSize: "0.82rem", color: "text.primary",
            display: "-webkit-box", WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical", overflow: "hidden", flex: 1, mr: 1,
          }}
        >
          {item.title}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.disabled", flexShrink: 0, fontSize: "0.72rem" }}>
          {formatThaiDate(item.createdAt, { day: "numeric", month: "short" })}
        </Typography>
      </Stack>
    </Box>
  );
}
