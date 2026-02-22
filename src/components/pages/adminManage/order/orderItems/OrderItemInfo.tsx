import { TableCell, Typography, Stack, Chip, Box } from "@mui/material";
import FiberNewIcon from "@mui/icons-material/FiberNew";

type Props = {
  index: number;
  orderCode: string;
  pickUpCode?: string;
  channel?: string;
  accentColor?: string;
  isNew?: boolean;
};

const channelConfig: Record<string, { label: string; bg: string; color: string }> = {
  PickUp:   { label: "รับหน้าร้าน", bg: "#FEF3C7", color: "#92400E" },
  DineIn:   { label: "ทานที่ร้าน",  bg: "#EFF6FF", color: "#1E40AF" },
  Delivery: { label: "เดลิเวอรี่",  bg: "#F0FDF4", color: "#166534" },
};

export default function OrderItemInfo({
  index,
  orderCode,
  pickUpCode,
  channel,
  accentColor = "#E5E7EB",
  isNew = false,
}: Props) {
  const ch = channelConfig[channel ?? ""] ?? { label: channel ?? "", bg: "#F3F4F6", color: "#6B7280" };

  return (
    <>
      {/* ── ลำดับ ── */}
      <TableCell
        align="center"
        sx={{
          width: 64,
          borderLeft: `5px solid ${accentColor}`,
          transition: "border-color 0.3s",
          py: 2.5,
        }}
      >
        <Typography sx={{ fontSize: "1.05rem", fontWeight: 800, color: "text.secondary" }}>
          {index}
        </Typography>
      </TableCell>

      {/* ── เลขออเดอร์ ── */}
      <TableCell sx={{ minWidth: 170, py: 2.5 }}>
        <Stack spacing={0.75}>
          {/* orderCode + NEW badge */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography
              sx={{
                fontSize: "1.15rem",
                fontWeight: 900,
                color: "#C62828",
                fontFamily: "monospace",
                letterSpacing: 1,
                lineHeight: 1.1,
              }}
            >
              {orderCode}
            </Typography>
            {isNew && (
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.4,
                  px: 0.9,
                  py: 0.25,
                  borderRadius: "8px",
                  bgcolor: "#EFF6FF",
                  border: "1.5px solid #BFDBFE",
                  animation: "pulse 1.5s infinite",
                  boxShadow: "0 0 8px #93C5FD88",
                }}
              >
                <FiberNewIcon sx={{ fontSize: "1rem", color: "#2563EB" }} />
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 900, color: "#2563EB", lineHeight: 1 }}>
                  ใหม่
                </Typography>
              </Box>
            )}
          </Stack>

          {/* รหัสรับ + ช่องทาง */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={pickUpCode || "-"}
              size="small"
              sx={{
                fontWeight: 900,
                borderRadius: "8px",
                height: 26,
                fontSize: "0.82rem",
                bgcolor: "#FF5722",
                color: "white",
                letterSpacing: 0.5,
                boxShadow: "0 2px 6px #FF572244",
              }}
            />
            <Chip
              label={ch.label}
              size="small"
              sx={{
                fontWeight: 700,
                borderRadius: "8px",
                height: 24,
                fontSize: "0.78rem",
                bgcolor: ch.bg,
                color: ch.color,
                border: `1px solid ${ch.color}33`,
              }}
            />
          </Stack>
        </Stack>
      </TableCell>
    </>
  );
}
