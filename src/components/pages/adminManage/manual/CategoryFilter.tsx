import { Box, Stack, Typography, ButtonBase } from "@mui/material";
import {
  WaterDrop as WaterIcon,
  Restaurant as FoodIcon,
  Wc as ToiletIcon,
  AutoAwesome as AllIcon,
} from "@mui/icons-material";

const CATEGORIES = [
  { id: "all", name: "ทั้งหมด", icon: <AllIcon sx={{ fontSize: 32 }} />, color: "#D32F2F" },
  { id: "water", name: "น้ำดื่ม", icon: <WaterIcon sx={{ fontSize: 32 }} />, color: "#1976D2" },
  { id: "equipment", name: "อุปกรณ์", icon: <FoodIcon sx={{ fontSize: 32 }} />, color: "#F57C00" },
  { id: "toilet", name: "ห้องน้ำ", icon: <ToiletIcon sx={{ fontSize: 32 }} />, color: "#7B1FA2" },
];

interface Props {
  selected: string;
  onSelect: (id: string) => void;
}

export const CategoryFilter = ({ selected, onSelect }: Props) => (
  <Box
    sx={{
      overflowX: "auto",
      py: 2,
      px: 1,
      display: "flex",
      "&::-webkit-scrollbar": { display: "none" },
      scrollbarWidth: "none",
    }}
  >
    <Stack direction="row" spacing={2} sx={{ minWidth: "max-content", px: 2 }}>
      {CATEGORIES.map((cat) => {
        const isActive = selected === cat.id;

        return (
          <ButtonBase
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            sx={{
              flexDirection: "column",
              width: 90,
              height: 100,
              borderRadius: "20px",
              // ใช้สีขาวเป็นหลัก ถ้าเลือกใช้สีแดงที่ดูแพงขึ้น (Darker Red)
              bgcolor: isActive ? "#111827" : "white", 
              color: isActive ? "white" : "#4B5563",
              // ใช้เงาแทนเส้นขอบเพื่อความมินิมอล
              boxShadow: isActive 
                ? "0 10px 15px -3px rgba(0, 0, 0, 0.1)" 
                : "0 1px 3px rgba(0, 0, 0, 0.05)",
              border: isActive ? "2px solid #111827" : "1px solid #F3F4F6",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:active": { transform: "scale(0.95)" },
            }}
          >
            <Box
              sx={{
                mb: 0.5,
                // สีไอคอนจะสดเฉพาะตอนที่ไม่ได้ถูกเลือก เพื่อเป็นจุดนำสายตา
                color: isActive ? "#FFD700" : cat.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {cat.icon}
            </Box>

            <Typography
              variant="caption"
              sx={{
                fontSize: "14px",
                fontWeight: "700",
                lineHeight: 1,
              }}
            >
              {cat.name}
            </Typography>

            {/* Indicator ขีดเล็กๆ ด้านล่างแทนจุดกลม */}
            {isActive && (
              <Box
                sx={{
                  width: 20,
                  height: 3,
                  bgcolor: "#FFD700",
                  borderRadius: "2px",
                  mt: 1,
                }}
              />
            )}
          </ButtonBase>
        );
      })}
    </Stack>
  </Box>
);