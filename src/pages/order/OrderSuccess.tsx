/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box, Container, Paper, Typography, Stack, Divider, 
  Button, CircularProgress, Chip, IconButton
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import StorefrontIcon from "@mui/icons-material/Storefront";
import HomeIcon from "@mui/icons-material/Home";
import PrintIcon from "@mui/icons-material/Print";
import { useParams, useNavigate } from "react-router-dom";
import { useGetOrderByIdQuery } from "../../services/orderApi";

// Helper สำหรับกำหนดสีและข้อความตามสถานะ
const getStatusDisplay = (status: string) => {
  switch (status) {
    case "PendingPayment": return { color: "warning", label: "รอชำระเงิน" };
    case "Paid": return { color: "info", label: "รับออเดอร์แล้ว" };
    case "Preparing": return { color: "secondary", label: "กำลังปรุงอาหาร" };
    case "Ready": return { color: "success", label: "อาหารเสร็จแล้ว!" };
    case "Completed": return { color: "default", label: "เสร็จสิ้น" };
    case "Cancelled": return { color: "error", label: "ยกเลิก" };
    default: return { color: "primary", label: status };
  }
};

export default function OrderSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // ✅ ดึงข้อมูลออเดอร์ (SignalR จะทำงานเบื้องหลังผ่าน RTK Query Cache)
  const { data: order, isLoading, isError } = useGetOrderByIdQuery(Number(id));
  if (isLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <CircularProgress size={60} />
    </Box>
  );

  if (isError || !order) return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
      <Typography variant="h6" color="error">ไม่พบข้อมูลออเดอร์</Typography>
      <Button onClick={() => navigate("/")} sx={{ mt: 2 }}>กลับหน้าหลัก</Button>
    </Container>
  );

  const statusConfig: any = getStatusDisplay(order.orderStatus);

  return (
    <Box sx={{ bgcolor: "#f4f6f8", minHeight: "100vh", py: { xs: 4, md: 8 } }}>
      <Container maxWidth="sm">
        <Stack spacing={3}>
          
          {/* ส่วนที่ 1: บัตรคิวรับอาหาร (Main Focus) */}
          <Paper sx={{ 
            p: 4, textAlign: 'center', borderRadius: 6, 
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* แถบสีสถานะด้านบน */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, bgcolor: `${statusConfig.color}.main` }} />
            
            <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.main', mb: 1 }} />
            <Typography variant="h5" fontWeight={800}>สั่งซื้อสำเร็จ!</Typography>
            <Typography variant="body2" color="text.secondary" mb={4}>
              แสดงรหัสนี้ให้พนักงานเมื่อมารับสินค้า
            </Typography>
            
            <Box sx={{ 
              bgcolor: '#fff', border: '3px dashed #eceff1', 
              py: 4, borderRadius: 5, mb: 3,
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.02)'
            }}>
              <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 3, fontWeight: 700 }}>
                คิวรับอาหารของคุณ
              </Typography>
              <Typography variant="h1" fontWeight={900} color="primary.main" sx={{ fontSize: { xs: '4.5rem', md: '6rem' }, my: 1, lineHeight: 1 }}>
                {order.pickUpCode}
              </Typography>
            </Box>

            <Chip 
              icon={<AccessTimeIcon />} 
              label={statusConfig.label} 
              color={statusConfig.color} 
              sx={{ fontWeight: 800, px: 3, py: 3, fontSize: '1.2rem', borderRadius: 3 }}
            />
          </Paper>

          {/* ส่วนที่ 2: สถานะแบบข้อความแจ้งเตือน */}
          <Paper sx={{ 
            p: 2, borderRadius: 4, 
            bgcolor: order.orderStatus === "Ready" ? "success.100" : "primary.50",
            border: '1px solid',
            borderColor: order.orderStatus === "Ready" ? "success.200" : "primary.100"
          }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <StorefrontIcon color={order.orderStatus === "Ready" ? "success" : "primary"} sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={800}>
                   {order.orderStatus === "Ready" ? "อาหารของคุณเสร็จแล้ว!" : "รับได้ที่เคาน์เตอร์หน้าร้าน"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {order.orderStatus === "Ready" 
                    ? "กรุณามารับที่ช่องรับสินค้าได้เลย" 
                    : "เราจะแจ้งให้คุณทราบทันทีเมื่ออาหารพร้อมเสิร์ฟ"}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* ส่วนที่ 3: สรุปรายการ (Receipt Summary) */}
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptLongIcon fontSize="small" /> รายละเอียดรายการ
              </Typography>
              <IconButton size="small" onClick={() => window.print()}>
                <PrintIcon fontSize="small" />
              </IconButton>
            </Stack>
            
            <Stack spacing={2}>
              {order.orderDetails?.map((item: any) => (
                <Stack key={item.id} direction="row" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" fontWeight={700}>{item.quantity}x {item.menuItemName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.orderDetailOptions?.map((o: any) => o.optionValueName).join(", ")}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={700}>฿{item.totalPrice.toLocaleString()}</Typography>
                </Stack>
              ))}
              <Divider sx={{ borderStyle: 'dashed', my: 1 }} />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6" fontWeight={800}>ยอดรวมสุทธิ</Typography>
                <Typography variant="h6" fontWeight={900} color="primary.main">฿{order.total.toLocaleString()}</Typography>
              </Stack>
            </Stack>
          </Paper>

          {/* ปุ่มการทำงาน */}
          <Button 
            fullWidth 
            variant="contained" 
            size="large"
            startIcon={<HomeIcon />}
            onClick={() => navigate("/")}
            sx={{ borderRadius: 4, py: 2, fontWeight: 800, fontSize: '1.1rem' }}
          >
            กลับหน้าหลัก / สั่งเพิ่ม
          </Button>

          <Typography variant="caption" textAlign="center" color="text.secondary">
            Order ID: #{order.orderCode} • {new Date(order.createdAt).toLocaleString('th-TH')}
          </Typography>

        </Stack>
      </Container>
    </Box>
  );
}