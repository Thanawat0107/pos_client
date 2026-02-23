import { IconButton, Chip, useTheme, useMediaQuery } from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";

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
      className="relative w-full overflow-hidden"
      style={{ height: isMobile ? "55vw" : 420, maxHeight: 520 }}
    >
      {/* รูปอาหาร */}
      <img
        src={imageUrl || "https://placehold.co/1200x600?text=Menu"}
        alt={name}
        className="w-full h-full object-cover"
        style={{ filter: "brightness(0.88)" }}
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* ปุ่มย้อนกลับ */}
      <div
        className="absolute z-10"
        style={{ top: isMobile ? 16 : 24, left: isMobile ? 16 : 32 }}
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
      <div className="absolute bottom-4 left-4 md:bottom-6 md:left-8">
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
