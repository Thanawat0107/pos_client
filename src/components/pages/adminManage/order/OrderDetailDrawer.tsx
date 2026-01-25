 import {
  Drawer,
  Box,
  Stack,
  Typography,
  IconButton,
  Divider,
  Avatar,
  Paper,
  Button,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";
import PlayArrowIcon from "@mui/icons-material/PlayArrow"; // เริ่มปรุง
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // เสร็จแล้ว
import TakeoutDiningIcon from "@mui/icons-material/TakeoutDining"; // รับอาหาร
import type { OrderHeader } from "../../../../@types/dto/OrderHeader";

// ✅ นำเข้า Hook สำหรับอัปเดตสถานะ (สมมติชื่อตามมาตรฐาน RTK Query)
import { useUpdateOrderStatusMutation } from "../../../../services/orderApi";

type Props = {
  open: boolean;
  onClose: () => void;
  order: OrderHeader | null;
};

export default function OrderDetailDrawer({ open, onClose, order }: Props) {
  // Hook สำหรับยิง API อัปเดตสถานะ
  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  if (!order) return null;

  // ✅ ฟังก์ชันจัดการการเปลี่ยนสถานะ
  const handleAction = async (nextStatus: string) => {
    try {
      await updateStatus({ 
        id: order.id, 
        newStatus: nextStatus 
      }).unwrap();
      // เมื่อสำเร็จอาจจะให้ปิด Drawer หรือแสดง Notification
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("ไม่สามารถอัปเดตสถานะได้");
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 500 }, bgcolor: "#fbfbfb" } }}
    >
      {/* --- Header --- */}
      <Box sx={{ p: 2, bgcolor: "white", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #eee" }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: "primary.main" }}><ReceiptLongIcon /></Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={800}>{order.orderCode}</Typography>
            <Typography variant="caption" color="text.secondary">สถานะ: {order.orderStatus}</Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </Box>

      <Box sx={{ p: 3, flex: 1, overflowY: "auto" }}>
        <Stack spacing={3}>
          
          {/* --- 🚀 ส่วนของปุ่มควบคุม (Dynamic Action Buttons) --- */}
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "white", border: "1px solid", borderColor: "primary.light" }}>
            <Typography variant="caption" fontWeight={700} color="primary" gutterBottom display="block">
              จัดการออเดอร์ (Order Actions)
            </Typography>
            
            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
              {/* ปุ่ม: เริ่มปรุงอาหาร (แสดงเมื่อชำระเงินแล้ว) */}
              {order.orderStatus === "Paid" && (
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={isUpdating ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
                  onClick={() => handleAction("Preparing")}
                  disabled={isUpdating}
                >
                  เริ่มปรุงอาหาร
                </Button>
              )}

              {/* ปุ่ม: อาหารเสร็จแล้ว (แสดงเมื่อกำลังเตรียม) */}
              {order.orderStatus === "Preparing" && (
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  startIcon={isUpdating ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                  onClick={() => handleAction("Ready")}
                  disabled={isUpdating}
                >
                  ปรุงเสร็จแล้ว
                </Button>
              )}

              {/* ปุ่ม: ส่งมอบอาหาร (แสดงเมื่อพร้อมรับ) */}
              {order.orderStatus === "Ready" && (
                <Button
                  fullWidth
                  variant="contained"
                  color="info"
                  startIcon={isUpdating ? <CircularProgress size={20} color="inherit" /> : <TakeoutDiningIcon />}
                  onClick={() => handleAction("Completed")}
                  disabled={isUpdating}
                >
                  ส่งมอบอาหารสำเร็จ
                </Button>
              )}

              {/* ปุ่ม: พิมพ์ใบเสร็จ (แสดงตลอดเวลา) */}
              <Button 
                variant="outlined" 
                color="inherit" 
                sx={{ minWidth: 50 }}
                onClick={() => window.print()} 
              >
                <LocalPrintshopIcon fontSize="small" />
              </Button>
            </Stack>

            {/* ปุ่มยกเลิก (แสดงเฉพาะสถานะที่ยังไม่เสร็จ) */}
            {["Paid", "Preparing", "Ready"].includes(order.orderStatus) && (
              <Button
                fullWidth
                color="error"
                size="small"
                sx={{ mt: 1, fontSize: "0.7rem" }}
                onClick={() => { if(window.confirm("ยืนยันการยกเลิกออเดอร์?")) handleAction("Cancelled"); }}
              >
                ยกเลิกรายการนี้
              </Button>
            )}
          </Paper>

          {/* --- ส่วนรายละเอียดอื่นๆ (เหมือนเวอร์ชันก่อนหน้า) --- */}
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={800} gutterBottom>รายการอาหาร</Typography>
            {order.orderDetails.map((item) => (
              <Box key={item.id} sx={{ mb: 2, pb: 1, borderBottom: "1px dashed #eee" }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" fontWeight={700}>{item.quantity}x {item.menuItemName}</Typography>
                  <Typography variant="body2">฿{item.totalPrice.toLocaleString()}</Typography>
                </Stack>
                {item.orderDetailOptions.map((opt) => (
                  <Typography key={opt.id} variant="caption" color="text.secondary" display="block">
                    - {opt.optionValueName} (+฿{opt.extraPrice})
                  </Typography>
                ))}
              </Box>
            ))}
          </Paper>

          {/* สรุปยอดเงิน */}
          <Box sx={{ p: 2, bgcolor: "grey.100", borderRadius: 2 }}>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">รวมยอดสินค้า</Typography>
                <Typography variant="body2">฿{order.subTotal.toLocaleString()}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="error">ส่วนลด</Typography>
                <Typography variant="body2" color="error">-฿{order.discount.toLocaleString()}</Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle1" fontWeight={800}>ยอดรวมสุทธิ</Typography>
                <Typography variant="subtitle1" fontWeight={800} color="primary">฿{order.total.toLocaleString()}</Typography>
              </Stack>
            </Stack>
          </Box>

        </Stack>
      </Box>
    </Drawer>
  );
}