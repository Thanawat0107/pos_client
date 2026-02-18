/* eslint-disable @typescript-eslint/no-explicit-any */
import { Paper, Box, Typography, Stack, ButtonBase } from "@mui/material";
import { ChevronRight, Place } from "@mui/icons-material";

export const ManualCard = ({ manual, onOpen }: any) => (
  <Paper
    elevation={0}
    onClick={() => onOpen(manual)}
    component={ButtonBase} // ทำให้ทั้ง Card เป็นปุ่มที่กดได้ลื่นไหล
    sx={{
      width: "100%",
      display: "flex",
      p: 2,
      borderRadius: "20px",
      textAlign: "left",
      bgcolor: "white",
      border: "1px solid #F3F4F6", // เส้นบางๆ สีเทา
      transition: "all 0.2s",
      "&:hover": {
        bgcolor: "#FDFDFD",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      },
    }}
  >
    <Stack
      direction="row"
      spacing={2}
      sx={{ width: "100%", alignItems: "center" }}
    >
      {/* รูปภาพแบบ Minimal */}
      <Box
        component="img"
        src={manual.fileUrl}
        sx={{
          width: 80,
          height: 80,
          borderRadius: "14px",
          objectFit: "cover",
          bgcolor: "#F3F4F6",
        }}
      />

      <Box sx={{ flex: 1 }}>
        <Typography
          variant="subtitle1"
          fontWeight="800"
          sx={{ color: "#111827", lineHeight: 1.2 }}
        >
          {manual.title}
        </Typography>
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          sx={{ mt: 0.5 }}
        >
          <Place sx={{ fontSize: 16, color: "#D32F2F" }} />
          <Typography
            variant="body2"
            sx={{ color: "#6B7280", fontWeight: 500 }}
          >
            {manual.location}
          </Typography>
        </Stack>
      </Box>

      <ChevronRight sx={{ color: "#D1D5DB" }} />
    </Stack>
  </Paper>
);
