import { Box, Stack, Typography, ButtonBase } from "@mui/material";
import {
  WaterDrop as WaterIcon,
  Restaurant as UtensilsIcon,
  Wc as RestroomIcon,
  GridView as AllIcon,
} from "@mui/icons-material";
import { SD_ServiceType } from "../../../../helpers/SD";

const CATEGORIES = [
  {
    id: "all",
    name: "ทั้งหมด",
    icon: <AllIcon sx={{ fontSize: 40 }} />,
    color: "#374151",
    bg: "#F3F4F6",
  },
  {
    id: SD_ServiceType.Water,
    name: "น้ำดื่ม",
    icon: <WaterIcon sx={{ fontSize: 40 }} />,
    color: "#1565C0",
    bg: "#E3F2FD",
  },
  {
    id: SD_ServiceType.Utensils,
    name: "อุปกรณ์",
    icon: <UtensilsIcon sx={{ fontSize: 40 }} />,
    color: "#E65100",
    bg: "#FFF3E0",
  },
  {
    id: SD_ServiceType.Restroom,
    name: "ห้องน้ำ",
    icon: <RestroomIcon sx={{ fontSize: 40 }} />,
    color: "#6A1B9A",
    bg: "#F3E5F5",
  },
];

interface Props {
  selected: string;
  onSelect: (id: string) => void;
}

export const CategoryFilter = ({ selected, onSelect }: Props) => (
  <Box
    sx={{
      overflowX: "auto",
      py: 2.5,
      px: { xs: 1.5, sm: 2 },
      display: "flex",
      justifyContent: { xs: "flex-start", sm: "center" },
      "&::-webkit-scrollbar": { display: "none" },
      scrollbarWidth: "none",
    }}
  >
    <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} sx={{ minWidth: "max-content", px: 0.5 }}>
      {CATEGORIES.map((cat) => {
        const isActive = selected === cat.id;
        return (
          <ButtonBase
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            sx={{
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: { xs: 84, sm: 100 },
              height: { xs: 95, sm: 110 },
              borderRadius: "24px",
              bgcolor: isActive ? cat.color : cat.bg,
              border: isActive
                ? `3px solid ${cat.color}`
                : "2px solid transparent",
              boxShadow: isActive
                ? `0 8px 20px ${cat.color}40`
                : "0 2px 6px rgba(0,0,0,0.06)",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:active": { transform: "scale(0.93)" },
              gap: 0.5,
            }}
          >
            {/* ไอคอนใหญ่—สีขาวเมื่อ active สีตามธีมเมื่อ inactive */}
            <Box
              sx={{
                color: isActive ? "#fff" : cat.color,
                display: "flex",
                lineHeight: 1,
              }}
            >
              {cat.icon}
            </Box>

            <Typography
              sx={{
                fontSize: "15px",
                fontWeight: 800,
                lineHeight: 1,
                color: isActive ? "#fff" : cat.color,
                letterSpacing: "-0.2px",
              }}
            >
              {cat.name}
            </Typography>

            {/* ขีดยืนยันเมื่อ active */}
            {isActive && (
              <Box
                sx={{
                  width: 24,
                  height: 3,
                  bgcolor: "rgba(255,255,255,0.7)",
                  borderRadius: "2px",
                }}
              />
            )}
          </ButtonBase>
        );
      })}
    </Stack>
  </Box>
);
