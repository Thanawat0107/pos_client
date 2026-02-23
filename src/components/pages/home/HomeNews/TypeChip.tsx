import { Chip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { getTypeConfig } from "./newsHelpers";

interface TypeChipProps {
  contentType: string;
  overlay?: boolean;
}

export default function TypeChip({ contentType, overlay = false }: TypeChipProps) {
  const cfg = getTypeConfig(contentType);

  return (
    <Chip
      size="small"
      icon={cfg.icon}
      label={cfg.label}
      sx={{
        fontWeight: 800,
        fontSize: "0.72rem",
        letterSpacing: 0.5,
        height: 26,
        ...(overlay
          ? {
              color: "white",
              bgcolor: alpha(cfg.color, 0.85),
              backdropFilter: "blur(12px)",
              border: `1px solid ${alpha("#ffffff", 0.25)}`,
              "& .MuiChip-icon": { color: "white" },
            }
          : {
              color: cfg.color,
              bgcolor: cfg.bg,
              border: `1px solid ${alpha(cfg.color, 0.18)}`,
              "& .MuiChip-icon": { color: cfg.color },
            }),
      }}
    />
  );
}
