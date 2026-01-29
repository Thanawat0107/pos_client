/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  TableRow, TableCell, Typography, Stack, Chip, IconButton, Tooltip, Box, Button, CircularProgress, Fade
} from "@mui/material";

// Icons
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import PhoneIcon from "@mui/icons-material/Phone";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ShoppingBasketOutlinedIcon from "@mui/icons-material/ShoppingBasketOutlined";
// Action Icons
import PaidIcon from '@mui/icons-material/Paid';
import SoupKitchenIcon from '@mui/icons-material/SoupKitchen';
import RoomServiceIcon from '@mui/icons-material/RoomService';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import type { OrderHeader } from "../../../../@types/dto/OrderHeader";
import { useUpdateOrderStatusMutation } from "../../../../services/orderApi";
import { Sd } from "../../../../helpers/SD"; 

// Helper Config สำหรับ "ปุ่ม Action ถัดไป"
const getNextActionConfig = (currentStatus: string) => {
  switch (currentStatus) {
    case Sd.Status_PendingPayment:
      return { label: "ยืนยันชำระเงิน", nextStatus: Sd.Status_Paid, color: "warning" as const, icon: <PaidIcon /> };
    case Sd.Status_Paid:
      return { label: "ส่งเข้าครัว", nextStatus: Sd.Status_Preparing, color: "primary" as const, icon: <SoupKitchenIcon /> };
    case Sd.Status_Preparing:
      return { label: "ปรุงเสร็จแล้ว", nextStatus: Sd.Status_Ready, color: "success" as const, icon: <RoomServiceIcon /> };
    case Sd.Status_Ready:
      return { label: "จบงาน/รับของ", nextStatus: Sd.Status_Completed, color: "info" as const, icon: <CheckCircleIcon /> };
    default: return null;
  }
};

// Helper Config สำหรับ Label สถานะปัจจุบัน
const getStatusDisplay = (status: string) => {
  switch (status) {
    case Sd.Status_PendingPayment: return { label: "รอชำระ", color: "warning" as const, variant: "outlined" as const };
    case Sd.Status_Paid:           return { label: "รอคิว", color: "info" as const, variant: "filled" as const };
    case Sd.Status_Preparing:      return { label: "กำลังปรุง", color: "primary" as const, variant: "filled" as const };
    case Sd.Status_Ready:          return { label: "พร้อมเสิร์ฟ", color: "success" as const, variant: "filled" as const };
    case Sd.Status_Completed:      return { label: "สำเร็จ", color: "default" as const, variant: "outlined" as const };
    case Sd.Status_Cancelled:      return { label: "ยกเลิก", color: "error" as const, variant: "filled" as const };
    default:                       return { label: status, color: "default" as const, variant: "outlined" as const };
  }
};

type Props = {
  row: OrderHeader;
  index: number;
  onView: (row: OrderHeader) => void;
};

export default function ManageOrderItem({ row, index, onView }: Props) {
  const statusInfo = getStatusDisplay(row.orderStatus);
  const actionInfo = getNextActionConfig(row.orderStatus);
  const totalItems = row.orderDetails.reduce((acc, item) => acc + item.quantity, 0);

  const [updateStatus, { isLoading }] = useUpdateOrderStatusMutation();

  const handleActionClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!actionInfo) return;
    try {
      await updateStatus({ id: row.id, newStatus: actionInfo.nextStatus }).unwrap();
    } catch (err) { console.error("Update failed", err); }
  };

  return (
    <TableRow 
      hover 
      onClick={() => onView(row)}
      sx={{ 
        cursor: "pointer",
        "&:last-child td, &:last-child th": { border: 0 },
        transition: "0.2s",
        "&:hover": { bgcolor: "action.hover" } 
      }}
    >
      {/* 1. ลำดับ */}
      <TableCell align="center" sx={{ width: 50 }}>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>{index}</Typography>
      </TableCell>

      {/* 2. Order Code */}
      <TableCell sx={{ minWidth: 140 }}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#D32F2F', fontFamily: 'monospace', letterSpacing: 0.5 }}>
            {row.orderCode}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {/* Chip รหัส Pickup สีส้มทึบ */}
            <Chip 
              label={row.pickUpCode || "-"} 
              size="small" 
              sx={{ 
                fontWeight: 900, 
                borderRadius: '6px', 
                height: 24, 
                fontSize: "0.75rem",
                bgcolor: '#FF5722', 
                color: 'white', 
                '& .MuiChip-label': { px: 1 } 
              }} 
            />
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase' }}>
              {row.channel}
            </Typography>
          </Stack>
        </Stack>
      </TableCell>

      {/* 3. Customer */}
      <TableCell sx={{ minWidth: 160 }}>
        <Stack spacing={0.5}>
          <Typography variant="body2" fontWeight={700}>
            {row.customerName || "ลูกค้าทั่วไป"}
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <PhoneIcon sx={{ fontSize: 14, color: "text.disabled" }} />
            <Typography variant="caption" color="text.secondary">
              {row.customerPhone}
            </Typography>
          </Stack>
        </Stack>
      </TableCell>

      {/* 4. Total */}
      <TableCell align="right" sx={{ minWidth: 100 }}>
        <Stack alignItems="flex-end">
          <Typography variant="body2" fontWeight={800}>
            ฿{row.total.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ShoppingBasketOutlinedIcon sx={{ fontSize: 12 }} /> {totalItems} รายการ
          </Typography>
        </Stack>
      </TableCell>

      {/* 5. Status Chip */}
      <TableCell sx={{ minWidth: 100 }}>
        <Chip 
          label={statusInfo.label} 
          color={statusInfo.color} 
          variant={statusInfo.variant} 
          size="small" 
          sx={{ fontWeight: 700, minWidth: 80 }}
        />
      </TableCell>

      {/* 6. Time */}
      <TableCell sx={{ minWidth: 100 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <AccessTimeIcon fontSize="inherit" sx={{ color: "text.disabled" }} />
          <Box>
            <Typography variant="caption" display="block" fontWeight={600}>
              {new Date(row.createdAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: "10px" }}>
              {new Date(row.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
            </Typography>
          </Box>
        </Stack>
      </TableCell>

      {/* 7. Action Buttons */}
      <TableCell align="right" sx={{ width: 180 }}>
        <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
          
          {actionInfo && (
            <Fade in={true}>
              <Button
                variant="contained"
                color={actionInfo.color}
                size="small"
                startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : actionInfo.icon}
                onClick={handleActionClick}
                disabled={isLoading}
                sx={{ 
                  borderRadius: 2, 
                  textTransform: 'none', 
                  fontWeight: 700,
                  boxShadow: 2,
                  minWidth: 110
                }}
              >
                {actionInfo.label}
              </Button>
            </Fade>
          )}

          <Tooltip title="ดูรายละเอียด">
            <IconButton 
              size="small" 
              onClick={(e) => { e.stopPropagation(); onView(row); }}
              sx={{ color: 'text.secondary' }}
            >
              <VisibilityOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

        </Stack>
      </TableCell>
    </TableRow>
  );
}