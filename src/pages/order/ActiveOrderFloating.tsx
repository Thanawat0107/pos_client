import { useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Paper, Typography, Fade, useMediaQuery, useTheme, keyframes, Badge } from "@mui/material";

// Icons
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import StorefrontIcon from "@mui/icons-material/Storefront";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'; // Icon สำหรับหลายออเดอร์

import { useGetOrderHistoryQuery } from "../../services/orderApi"; // ✅ เปลี่ยน API
import { Sd } from "../../helpers/SD"; 
import { useAppSelector } from "../../hooks/useAppHookState";

// Animation
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(46, 125, 50, 0); }
  100% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0); }
`;

export default function ActiveOrderFloating() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // -------------------------------------------------------------
  // 1. ระบุตัวตน (ต้องส่งทั้ง UserID และ GuestToken)
  // -------------------------------------------------------------
  // สมมติว่าใน Redux Store คุณเก็บ User ไว้ที่ state.account.user หรือ state.auth.user
  // ถ้าหาไม่เจอ ให้ลอง console.log(state) ดูครับ
  const userId = useAppSelector((state) => state.auth?.userId);
  // 🔥 [จุดแก้] ลองดึงทั้ง 2 ชื่อ เผื่อเราจำชื่อ key ผิด
  const guestToken =
    localStorage.getItem("cartToken") ||
    localStorage.getItem("guestToken") ||
    "";

  // 🔍 [Debug] เช็คค่าที่ Console (สำคัญมาก!)
  useEffect(() => {
    console.log("🔍 [ActiveFloating] Identity Check:", { userId, guestToken });
  }, [userId, guestToken]);

  // 2. ดึงข้อมูล
  const {
    data: orders = [],
    isError,
    error,
  } = useGetOrderHistoryQuery(
    { userId, guestToken },
    { skip: !userId && !guestToken }, // ถ้าไม่มีทั้งคู่ จะไม่ยิง API
  );

  // 🔍 [Debug] เช็คผลลัพธ์จาก API
  useEffect(() => {
    if (orders.length > 0)
      console.log("✅ [ActiveFloating] Found Orders:", orders.length);
    if (isError) console.error("❌ [ActiveFloating] API Error:", error);
  }, [orders, isError, error]);

  // 3. กรองออเดอร์ที่ยังไม่จบ
  const activeOrders = useMemo(() => {
    if (!orders) return [];
    return orders
      .filter(
        (o) =>
          ![Sd.Status_Completed, Sd.Status_Cancelled].includes(o.orderStatus),
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [orders]);

  // 4. Validate Logic (ซ่อนถ้าไม่มีออเดอร์)
  if (
    activeOrders.length === 0 ||
    location.pathname === "/checkout" ||
    location.pathname === "/my-orders"
  ) {
    return null;
  }

  // ... (ส่วน Config และ Render เหมือนเดิมเป๊ะ ไม่ต้องแก้) ...
  const isMultiple = activeOrders.length > 1;
  const latestOrder = activeOrders[0];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case Sd.Status_PendingPayment:
        return {
          bg: "#E65100",
          text: "รอชำระเงิน",
          sub: "แตะเพื่อสแกนจ่าย",
          icon: <QrCodeScannerIcon fontSize="small" />,
        };
      case Sd.Status_Paid:
        return {
          bg: "#1565C0",
          text: "รับออเดอร์แล้ว",
          sub: "กำลังรอคิว",
          icon: <PendingActionsIcon fontSize="small" />,
        };
      case Sd.Status_Preparing:
        return {
          bg: "#7B1FA2",
          text: "กำลังปรุงอาหาร",
          sub: "รอสักครู่...",
          icon: <RestaurantIcon fontSize="small" />,
        };
      case Sd.Status_Ready:
        return {
          bg: "#2E7D32",
          text: "อาหารเสร็จแล้ว!",
          sub: "รับที่เคาน์เตอร์",
          icon: <CheckCircleIcon fontSize="small" />,
          isReady: true,
        };
      default:
        return {
          bg: theme.palette.primary.main,
          text: `ออเดอร์ #${latestOrder.pickUpCode}`,
          sub: "กำลังดำเนินการ",
          icon: <StorefrontIcon fontSize="small" />,
        };
    }
  };

  // ถ้ามีหลายออเดอร์ ให้ใช้ Config กลาง
  const config = isMultiple
    ? {
        bg: "#37474f", // สีเทาเข้ม ดู Premium
        text: "กำลังดำเนินการ",
        sub: `${activeOrders.length} รายการ`,
        icon: <ReceiptLongIcon fontSize="small" />,
        isReady: activeOrders.some((o) => o.orderStatus === Sd.Status_Ready), // ถ้ามีอันไหนเสร็จ ก็ให้กระพริบ
      }
    : getStatusConfig(latestOrder.orderStatus);

  // 6. Handle Click
  const handleClick = () => {
    if (isMultiple) {
      // ถ้ามีหลายอัน ไปหน้าประวัติรวม
      navigate("/my-orders");
    } else {
      // ถ้ามีอันเดียว ไปหน้า Detail ของอันนั้น
      navigate(`/order-success/${latestOrder.id}`);
    }
  };

  return (
    <Fade in={true}>
      <Paper
        onClick={handleClick}
        elevation={isMobile ? 8 : 10}
        sx={{
          position: "fixed",
          zIndex: 1300,
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          bgcolor: config.bg,
          color: "white",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          bottom: { xs: 0, md: 24 },
          right: { xs: 0, md: 24 },
          left: { xs: 0, md: "auto" },
          width: { xs: "100%", md: "auto" },
          maxWidth: { xs: "100%", md: "380px" },
          minWidth: { md: "300px" },
          borderRadius: { xs: "16px 16px 0 0", md: 4 },
          p: { xs: 1.5, md: 2 },
          pb: { xs: 2.5, md: 2 },
          animation: config.isReady ? `${pulse} 2s infinite` : "none",
          "&:hover": { transform: { md: "translateY(-4px)" }, boxShadow: 12 },
        }}
      >
        <Box
          sx={{
            bgcolor: "rgba(255,255,255,0.2)",
            borderRadius: "50%",
            p: { xs: 0.8, md: 1 },
            mr: { xs: 1.5, md: 2 },
            display: "flex",
            backdropFilter: "blur(4px)",
          }}
        >
          {isMultiple ? (
            <Badge badgeContent={activeOrders.length} color="error">
              {config.icon}
            </Badge>
          ) : (
            config.icon
          )}
        </Box>

        <Box sx={{ mr: 1, flexGrow: 1 }}>
          <Typography
            variant="body2"
            sx={{ opacity: 0.9, fontWeight: 500, lineHeight: 1.2, mb: 0.3 }}
          >
            {config.text}
          </Typography>
          <Typography
            variant={isMobile ? "body1" : "subtitle1"}
            fontWeight={800}
            sx={{ lineHeight: 1.1 }}
          >
            {config.sub}
          </Typography>
        </Box>

        <ArrowForwardIosIcon
          sx={{ fontSize: { xs: 14, md: 16 }, opacity: 0.8 }}
        />
      </Paper>
    </Fade>
  );
}