import { TableCell, Stack, Typography, Box } from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import ShoppingBasketOutlinedIcon from "@mui/icons-material/ShoppingBasketOutlined";

type Props = {
  name?: string;
  phone?: string;
  total: number;
  totalItems: number;
};

export default function OrderItemCustomer({ name, phone, total, totalItems }: Props) {
  return (
    <>
      {/* ── ชื่อลูกค้า + เบอร์ ── */}
      <TableCell sx={{ minWidth: 170, py: 2.5 }}>
        <Stack spacing={0.5}>
          <Typography
            sx={{ fontSize: "1.05rem", fontWeight: 800, color: "#1E293B", lineHeight: 1.2 }}
          >
            {name || "ลูกค้าทั่วไป"}
          </Typography>
          <Stack direction="row" spacing={0.6} alignItems="center">
            <PhoneIcon sx={{ fontSize: 15, color: "text.disabled" }} />
            <Typography sx={{ fontSize: "0.85rem", color: "text.secondary", fontWeight: 500 }}>
              {phone || "-"}
            </Typography>
          </Stack>
        </Stack>
      </TableCell>

      {/* ── ยอดรวม + จำนวนรายการ ── */}
      <TableCell align="right" sx={{ minWidth: 120, py: 2.5 }}>
        <Stack alignItems="flex-end" spacing={0.4}>
          <Typography
            sx={{
              fontSize: "1.25rem",
              fontWeight: 900,
              color: "#0F172A",
              lineHeight: 1,
              letterSpacing: "-0.01em",
            }}
          >
            ฿{total.toLocaleString()}
          </Typography>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              px: 1,
              py: 0.3,
              borderRadius: "8px",
              bgcolor: "#F1F5F9",
              border: "1px solid #E2E8F0",
            }}
          >
            <ShoppingBasketOutlinedIcon sx={{ fontSize: 13, color: "#64748B" }} />
            <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748B" }}>
              {totalItems} รายการ
            </Typography>
          </Box>
        </Stack>
      </TableCell>
    </>
  );
}
