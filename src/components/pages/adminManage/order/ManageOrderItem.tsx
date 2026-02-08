import {
  TableRow, TableCell, Typography, Stack, Chip, IconButton, Tooltip, Box, Button, CircularProgress, Fade
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import PhoneIcon from "@mui/icons-material/Phone";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ShoppingBasketOutlinedIcon from "@mui/icons-material/ShoppingBasketOutlined";
import PaidIcon from '@mui/icons-material/Paid';
import SoupKitchenIcon from '@mui/icons-material/SoupKitchen';
import RoomServiceIcon from '@mui/icons-material/RoomService';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
// import NewReleasesIcon from '@mui/icons-material/NewReleases'; // ไอคอนใหม่
import type { OrderHeader } from "../../../../@types/dto/OrderHeader";
import { useUpdateOrderStatusMutation } from "../../../../services/orderApi";
import { Sd } from "../../../../helpers/SD"; 
import OrderStatusBadge from "../../../../utility/OrderStatusBadge";

// Helper สำหรับ Action Button (ปุ่มถัดไปคืออะไร)
const getNextActionConfig = (currentStatus: string) => {
  switch (currentStatus) {
    // 🟡 Pending: ปุ่ม "รับออเดอร์" (สำคัญมาก!)
    case Sd.Status_Pending:
      return { 
        label: "รับออเดอร์", 
        nextStatus: Sd.Status_Approved, // กดแล้วไป Approved
        color: "warning" as const, // สีส้มเด่นๆ
        icon: <CheckCircleIcon /> 
      };

    // 💰 PendingPayment: ปุ่ม "ยืนยันการจ่าย"
    case Sd.Status_PendingPayment:
      return { 
        label: "ยืนยันชำระเงิน", 
        nextStatus: Sd.Status_Paid, 
        color: "error" as const, // สีแดง/ส้มเข้ม
        icon: <PaidIcon /> 
      };

    // 🟢 Approved & Paid: ปุ่ม "ส่งเข้าครัว" (หรือเริ่มปรุง)
    case Sd.Status_Approved:
    case Sd.Status_Paid:
      return { 
        label: "เริ่มปรุงอาหาร", 
        nextStatus: Sd.Status_Preparing, 
        color: "primary" as const, 
        icon: <SoupKitchenIcon /> 
      };

    // 👨‍🍳 Preparing: ปุ่ม "ปรุงเสร็จ"
    case Sd.Status_Preparing:
      return { 
        label: "ปรุงเสร็จแล้ว", 
        nextStatus: Sd.Status_Ready, 
        color: "secondary" as const, // สีม่วง
        icon: <RoomServiceIcon /> 
      };

    // 🔔 Ready: ปุ่ม "จบงาน"
    case Sd.Status_Ready:
      return { 
        label: "จบงาน/รับของ", 
        nextStatus: Sd.Status_Completed, 
        color: "success" as const, 
        icon: <CheckCircleIcon /> 
      };

    default: return null;
  }
};

type Props = {
  row: OrderHeader;
  index: number;
  onView: () => void;
  isPendingAction?: boolean; // (Optional) รับ Prop นี้มาเล่น Effect ได้ถ้าต้องการ
};

export default function ManageOrderItem({ row, index, onView }: Props) {
  // ไม่ต้องใช้ getStatusDisplay แล้ว เพราะเราใช้ OrderStatusBadge แทน
  const actionInfo = getNextActionConfig(row.orderStatus);
  const totalItems = row.orderDetails.reduce((acc, item) => acc + item.quantity, 0);

  const [updateStatus, { isLoading }] = useUpdateOrderStatusMutation();

  // ฟังก์ชันเปลี่ยนสถานะ (Next Step)
  const handleActionClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!actionInfo) return;
    try {
      await updateStatus({ id: row.id, newStatus: actionInfo.nextStatus }).unwrap();
    } catch (err) { console.error("Update failed", err); }
  };

  // ฟังก์ชันยกเลิก (เฉพาะตอน Pending)
  const handleCancelClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if(window.confirm("ยืนยันการปฏิเสธ/ยกเลิกออเดอร์นี้?")) {
        try {
            await updateStatus({ id: row.id, newStatus: Sd.Status_Cancelled }).unwrap();
        } catch (err) { console.error("Cancel failed", err); }
    }
  }

  // Effect พื้นหลังกระพริบ ถ้าเป็น Pending
  const isPending = row.orderStatus === Sd.Status_Pending;
  const bgStyle = isPending ? {
    bgcolor: '#fff3e0', // พื้นหลังส้มอ่อนๆ
    animation: 'pulse-bg 2s infinite',
    '&:hover': { bgcolor: '#ffe0b2' }
  } : {
    transition: "0.2s",
    "&:hover": { bgcolor: "action.hover" },
  };

  return (
    <>
    {/* ใส่ Keyframes สำหรับ Animation */}
    <style>{`
        @keyframes pulse-bg {
            0% { background-color: #fff3e0; }
            50% { background-color: #ffe0b2; }
            100% { background-color: #fff3e0; }
        }
    `}</style>

    <TableRow
      hover={!isPending} // ถ้า Pending ไม่ต้อง Hover เพราะมีสีพื้นหลังแล้ว
      onClick={onView}
      sx={{
        cursor: "pointer",
        "&:last-child td, &:last-child th": { border: 0 },
        ...bgStyle // ใช้ Style ตามเงื่อนไข
      }}
    >
      {/* 1. ลำดับ */}
      <TableCell align="center" sx={{ width: 50 }}>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {index}
        </Typography>
      </TableCell>

      {/* 2. Order Code */}
      <TableCell sx={{ minWidth: 140 }}>
        <Stack spacing={0.5}>
          <Typography
            variant="subtitle2"
            fontWeight={800}
            sx={{
              color: "#D32F2F",
              fontFamily: "monospace",
              letterSpacing: 0.5,
            }}
          >
            {row.orderCode}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {/* Chip รหัส Pickup */}
            <Chip
              label={row.pickUpCode || "-"}
              size="small"
              sx={{
                fontWeight: 900,
                borderRadius: "6px",
                height: 24,
                fontSize: "0.75rem",
                bgcolor: "#FF5722",
                color: "white",
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              sx={{ textTransform: "uppercase" }}
            >
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
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <ShoppingBasketOutlinedIcon sx={{ fontSize: 12 }} /> {totalItems} รายการ
          </Typography>
        </Stack>
      </TableCell>

      {/* 5. Status Chip (ใช้ Component ใหม่) */}
      <TableCell sx={{ minWidth: 100 }}>
        <OrderStatusBadge status={row.orderStatus} />
      </TableCell>

      {/* 6. Time */}
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

      {/* 7. Action Buttons */}
      <TableCell align="right" sx={{ width: 180 }}>
        <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
          
          {/* ✅ ปุ่ม Action หลัก (Next Step) */}
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
                  textTransform: "none",
                  fontWeight: 700,
                  boxShadow: 2,
                  minWidth: 110,
                }}
              >
                {actionInfo.label}
              </Button>
            </Fade>
          )}

          {/* ✅ ปุ่มยกเลิก (เฉพาะตอน Pending) */}
          {isPending && (
             <Tooltip title="ปฏิเสธ/ยกเลิก">
                <IconButton 
                    size="small" 
                    color="error" 
                    onClick={handleCancelClick}
                    disabled={isLoading}
                    sx={{ border: '1px solid #ffcdd2', bgcolor: '#ffebee' }}
                >
                    <CancelIcon fontSize="small" />
                </IconButton>
             </Tooltip>
          )}

          {/* ปุ่มดูรายละเอียด (แสดงตลอด ยกเว้นตอน Pending พื้นที่อาจจะเต็ม) */}
          {!isPending && (
            <Tooltip title="ดูรายละเอียด">
                <IconButton
                size="small"
                onClick={(e) => {
                    e.stopPropagation();
                    onView();
                }}
                sx={{ color: "text.secondary" }}
                >
                <VisibilityOutlinedIcon fontSize="small" />
                </IconButton>
            </Tooltip>
          )}
        </Stack>
      </TableCell>
    </TableRow>
    </>
  );
}