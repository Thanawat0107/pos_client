import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Paper, Typography, Fade, useMediaQuery, useTheme } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import StorefrontIcon from "@mui/icons-material/Storefront";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useGetOrderByIdQuery } from "../../services/orderApi";

export default function ActiveOrderFloating() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  // เช็คว่าเป็นหน้าจอมือถือหรือไม่ (เล็กกว่า md)
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [orderId, setOrderId] = useState<string | null>(null);

  // 1. ดึง ID จาก LocalStorage เมื่อ Component โหลด
  useEffect(() => {
    const storedId = localStorage.getItem("activeOrderId");
    if (storedId) setOrderId(storedId);
    // เพิ่ม event listener ดักจับการเปลี่ยนแปลง localStorage (เผื่อกรณีเปิดหลาย tab)
    const handleStorageChange = () => {
        const currentId = localStorage.getItem("activeOrderId");
        setOrderId(currentId);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 2. ดึงข้อมูล Real-time
  const { data: order } = useGetOrderByIdQuery(Number(orderId), {
    skip: !orderId,
  });

  // 3. Logic ซ่อนปุ่ม
  // ซ่อนถ้าไม่มีข้อมูล หรือถ้าอยู่ในหน้า Checkout (เกะกะตอนกรอกข้อมูล) หรือหน้า OrderSuccess ของออเดอร์นั้นๆ
  if (!orderId || !order || location.pathname.includes(`/order-success/${orderId}`) || location.pathname === '/checkout') {
    return null;
  }

  // 4. ถ้าจบงานแล้ว -> ซ่อน
  if (["Completed", "Cancelled"].includes(order.orderStatus)) {
    // หมายเหตุ: การลบ localStorage ตรงนี้อาจจะทำให้ component render loop ในบาง case
    // ถ้าเจอปัญหา ให้ลบเฉพาะตอน unmount หรือใช้ useEffect แยก
    if(localStorage.getItem("activeOrderId")) {
       localStorage.removeItem("activeOrderId");
       setOrderId(null);
    }
    return null;
  }

  // Config สีและ Icon
  const isReady = order.orderStatus === "Ready";
  const bgColor = isReady ? theme.palette.success.main : theme.palette.primary.main; // ใช้สีจาก theme

  return (
    <Fade in={true}>
      <Paper
        onClick={() => navigate(`/order-success/${orderId}`)}
        elevation={isMobile ? 8 : 6}
        sx={{
          position: "fixed",
          zIndex: 1300,
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          bgcolor: bgColor,
          color: "white",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",

          // ⭐⭐⭐ ส่วนที่ปรับปรุงสำหรับมือถือ ⭐⭐⭐
          // ถ้าเป็นมือถือ (xs): ติดขอบล่าง, เต็มความกว้าง, มนเฉพาะมุมบน
          // ถ้าเป็นจอใหญ่ (md ขึ้นไป): ลอยมุมขวา, มีระยะห่าง, มนทั้งชิ้น
          bottom: { xs: 0, md: 24 },
          right: { xs: 0, md: 24 },
          left: { xs: 0, md: 'auto' }, // มือถือต้องการ left:0 เพื่อให้เต็มจอ
          width: { xs: '100%', md: 'auto' },
          maxWidth: { xs: '100%', md: '400px' }, // จำกัดความกว้างสูงสุดบนจอใหญ่
          borderRadius: { xs: '16px 16px 0 0', md: 4 }, // มือถือมนบน, จอใหญ่มนหมด
          p: { xs: 1.5, md: 2 }, // มือถือลด padding ลงนิดหน่อย
          pb: { xs: 2, md: 2 }, // เพิ่ม padding ล่างสำหรับมือถือเผื่อพื้นที่ safe area (เช่น iPhone รุ่นใหม่)

          "&:hover": {
             transform: { md: "translateY(-4px)" }, // ขยับขึ้นเฉพาะจอใหญ่
             boxShadow: 10
          },
        }}
      >
        {/* Icon ด้านซ้าย */}
        <Box
          sx={{
            bgcolor: "rgba(255,255,255,0.2)",
            borderRadius: "50%",
            p: { xs: 0.75, md: 1 }, // ลด padding icon บนมือถือ
            mr: { xs: 1.5, md: 2 },
            display: "flex",
          }}
        >
          {isReady ? <CheckCircleIcon fontSize={isMobile ? "small" : "medium"} /> : <StorefrontIcon fontSize={isMobile ? "small" : "medium"} />}
        </Box>

        {/* ข้อความตรงกลาง */}
        <Box sx={{ mr: 1, flexGrow: 1 }}> {/* flexGrow: 1 เพื่อดันลูกศรไปขวาสุด */}
          <Typography variant="caption" sx={{ opacity: 0.9, display: "block", lineHeight: 1.2 }}>
            {isReady ? "อาหารพร้อมแล้ว!" : `ออเดอร์ #${order.pickUpCode || order.id}`}
          </Typography>
          <Typography variant={isMobile ? "body2" : "subtitle2"} fontWeight={700} noWrap>
            {isReady ? "รับที่เคาน์เตอร์" : "กำลังดำเนินการ..."}
          </Typography>
        </Box>

        {/* ลูกศรขวา */}
        <ArrowForwardIosIcon sx={{ fontSize: { xs: 14, md: 16 }, opacity: 0.7 }} />
      </Paper>
    </Fade>
  );
}