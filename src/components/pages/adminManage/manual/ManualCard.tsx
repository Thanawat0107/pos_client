/* eslint-disable @typescript-eslint/no-explicit-any */
import { Paper, Box, Typography, Stack, ButtonBase, Chip } from "@mui/material";
import { Place, ChevronRight } from "@mui/icons-material";
import { baseUrl } from "../../../../helpers/SD";

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  water:     { bg: "#E3F2FD", text: "#1565C0" },
  equipment: { bg: "#FFF3E0", text: "#E65100" },
  toilet:    { bg: "#F3E5F5", text: "#6A1B9A" },
  all:       { bg: "#F3F4F6", text: "#374151" },
};

export const ManualCard = ({ manual, onOpen }: any) => {
  const categoryColor =
    CATEGORY_COLORS[manual.category] ?? { bg: "#F3F4F6", text: "#374151" };

  return (
    <Paper
      elevation={0}
      onClick={() => onOpen(manual)}
      component={ButtonBase}
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        textAlign: "left",
        borderRadius: "24px",
        overflow: "hidden",
        border: "1.5px solid #F3F4F6",
        bgcolor: "white",
        transition: "all 0.2s ease",
        "&:hover": { boxShadow: "0 8px 24px rgba(0,0,0,0.08)" },
        "&:active": { transform: "scale(0.98)" },
      }}
    >
      {/* รูปภาพเต็มกว้าง — สูงขึ้นเพื่อให้มองเห็นได้ชัด */}
      <Box
        component="img"
        src={baseUrl + manual.fileUrl}
        sx={{
          width: "100%",
          height: 170,
          objectFit: "cover",
          bgcolor: "#F3F4F6",
          display: "block",
        }}
      />

      {/* เนื้อหา */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{ px: 2.5, py: 2, width: "100%" }}
      >
        <Box sx={{ flex: 1 }}>
          {/* หมวดหมู่ — Chip เล็ก */}
          <Chip
            label={manual.category}
            size="small"
            sx={{
              bgcolor: categoryColor.bg,
              color: categoryColor.text,
              fontWeight: 800,
              fontSize: "13px",
              height: 26,
              mb: 0.75,
            }}
          />

          {/* ชื่อ — ตัวใหญ่ หนา */}
          <Typography
            sx={{
              fontSize: "22px",
              fontWeight: 900,
              color: "#111827",
              lineHeight: 1.2,
              mb: 0.75,
            }}
          >
            {manual.title}
          </Typography>

          {/* ตำแหน่ง */}
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Place sx={{ fontSize: 20, color: "#EF4444" }} />
            <Typography
              sx={{ fontSize: "16px", fontWeight: 600, color: "#6B7280" }}
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
    </Paper>
  );
};
