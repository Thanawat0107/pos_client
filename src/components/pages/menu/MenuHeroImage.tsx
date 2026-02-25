import { IconButton, Chip, useTheme, useMediaQuery } from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import { getImage } from "../../../helpers/imageHelper";

interface MenuHeroImageProps {
  imageUrl?: string;
  name: string;
  categoryName?: string | null;
  onBack: () => void;
}

export default function MenuHeroImage({ imageUrl, name, categoryName, onBack }: MenuHeroImageProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <div
      style={{ position: "relative", width: "100%", overflow: "hidden", height: isMobile ? "75vw" : 520, maxHeight: 620 }}
    >
      {/* รูปอาหาร */}
      <img
        src={getImage(imageUrl, "https://placehold.co/1200x600?text=Menu")}
        alt={name}
        style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.88)", display: "block" }}
      />

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      {/* ปุ่มย้อนกลับ */}
      <div
        style={{ position: "absolute", zIndex: 10, top: isMobile ? 16 : 24, left: isMobile ? 16 : 32 }}
      >
        <IconButton
          onClick={onBack}
          sx={{
            bgcolor: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "#fff",
            "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
            transition: "all 0.2s",
          }}
        >
          <ArrowBackIosNewRoundedIcon fontSize="small" />
        </IconButton>
      </div>

      {/* Category badge */}
      <div style={{ position: "absolute", bottom: isMobile ? 48 : 24, left: isMobile ? 16 : 32 }}>
        <Chip
          icon={
            <LocalOfferRoundedIcon
              sx={{ fontSize: "14px !important", color: "#fff !important" }}
            />
          }
          label={categoryName ?? ""}
          size="small"
          sx={{
            bgcolor: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(8px)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.3)",
            fontWeight: 700,
            letterSpacing: 0.5,
          }}
        />
      </div>
    </div>
  );
}
