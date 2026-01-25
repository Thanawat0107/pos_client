/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  TableRow,
  TableCell,
  Typography,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Box,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import PhoneIcon from "@mui/icons-material/Phone";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ShoppingBasketOutlinedIcon from "@mui/icons-material/ShoppingBasketOutlined";
import type { OrderHeader } from "../../../../@types/dto/OrderHeader";

// ✅ Helper สำหรับจัดการสีและชื่อสถานะให้เป็นภาษาไทย/เข้าใจง่าย
const getStatusConfig = (status: string): { color: any; label: string; variant: "filled" | "outlined" } => {
  switch (status) {
    case "PendingPayment":
      return { color: "warning", label: "รอชำระเงิน", variant: "outlined" };
    case "Paid":
      return { color: "info", label: "จ่ายแล้ว", variant: "filled" };
    case "Preparing":
      return { color: "primary", label: "กำลังเตรียม", variant: "filled" };
    case "Ready":
      return { color: "success", label: "พร้อมรับ", variant: "filled" };
    case "Completed":
      return { color: "default", label: "สำเร็จ", variant: "outlined" };
    case "Cancelled":
      return { color: "error", label: "ยกเลิก", variant: "filled" };
    default:
      return { color: "default", label: status, variant: "outlined" };
  }
};

type Props = {
  row: OrderHeader;
  index: number;
  onView: (row: OrderHeader) => void;
};

export default function ManageOrderItem({ row, index, onView }: Props) {
  const statusCfg = getStatusConfig(row.orderStatus);

  // คำนวณจำนวนชิ้นสินค้าทั้งหมดในออเดอร์นี้
  const totalItems = row.orderDetails.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <TableRow hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
      {/* 1. ลำดับ */}
      <TableCell align="center" sx={{ width: 50 }}>
        <Typography variant="body2" fontWeight={600} color="text.secondary">
          {index}
        </Typography>
      </TableCell>

      {/* 2. เลขออเดอร์ และ รหัสรับอาหาร */}
      <TableCell sx={{ minWidth: 140 }}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle2" fontWeight={800} color="primary.dark">
            {row.orderCode}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={row.pickUpCode || "---"}
              size="small"
              color="primary"
              sx={{ fontWeight: 900, borderRadius: "4px", fontSize: "0.75rem" }}
            />
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              {row.channel}
            </Typography>
          </Stack>
        </Stack>
      </TableCell>

      {/* 3. ข้อมูลลูกค้า */}
      <TableCell sx={{ minWidth: 180 }}>
        <Stack spacing={0.3}>
          <Typography variant="body2" fontWeight={700}>
            {row.customerName || "Walk-in Customer"}
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <PhoneIcon sx={{ fontSize: 14, color: "text.disabled" }} />
            <Typography variant="caption" color="text.secondary">
              {row.customerPhone}
            </Typography>
          </Stack>
        </Stack>
      </TableCell>

      {/* 4. ยอดรวม และ จำนวนสินค้า */}
      <TableCell align="right" sx={{ minWidth: 120 }}>
        <Stack spacing={0.3} alignItems="flex-end">
          <Typography variant="body2" fontWeight={800}>
            ฿{row.total.toLocaleString()}
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <ShoppingBasketOutlinedIcon sx={{ fontSize: 13, color: "text.disabled" }} />
            <Typography variant="caption" color="text.secondary">
              {totalItems} รายการ
            </Typography>
          </Stack>
        </Stack>
      </TableCell>

      {/* 5. สถานะออเดอร์ */}
      <TableCell sx={{ minWidth: 120 }}>
        <Chip
          label={statusCfg.label}
          color={statusCfg.color}
          variant={statusCfg.variant}
          size="small"
          sx={{ fontWeight: "bold", width: "90px" }}
        />
      </TableCell>

      {/* 6. เวลาที่สั่งซื้อ */}
      <TableCell sx={{ minWidth: 100 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <AccessTimeIcon fontSize="inherit" sx={{ color: "text.disabled" }} />
          <Box>
            <Typography variant="caption" display="block" fontWeight={600}>
              {new Date(row.createdAt).toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
              })} น.
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: "10px" }}>
              {new Date(row.createdAt).toLocaleDateString("th-TH", {
                day: "numeric",
                month: "short",
              })}
            </Typography>
          </Box>
        </Stack>
      </TableCell>

      {/* 7. ปุ่มจัดการ */}
      <TableCell align="right" sx={{ width: 80 }}>
        <Tooltip title="ดูรายละเอียดออเดอร์" arrow>
          <IconButton
            onClick={() => onView(row)}
            size="small"
            sx={{
              bgcolor: "primary.lighter",
              color: "primary.main",
              "&:hover": { bgcolor: "primary.main", color: "white" },
              transition: "0.2s",
            }}
          >
            <VisibilityOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}