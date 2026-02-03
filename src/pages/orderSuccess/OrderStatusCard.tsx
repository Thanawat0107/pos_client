import { Paper, Box, Typography, Stack, Chip, keyframes } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PaymentIcon from "@mui/icons-material/Payment";
import PendingIcon from '@mui/icons-material/Pending'; // เพิ่มไอคอนรอ
import AccessTimeIcon from '@mui/icons-material/AccessTime'; // เพิ่มไอคอนนาฬิกา
import { Sd } from "../../helpers/SD";
import { getStatusConfig } from "../../helpers/OrderHelpers";

// Animation ให้ Checkmark หรือ Pending เต้นตุ้บๆ
const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(39, 174, 96, 0.4); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(39, 174, 96, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(39, 174, 96, 0); }
`;

interface Props {
  orderStatus: string;
  pickUpCode: string;
  paymentMethod: string;
}

export default function OrderStatusCard({ orderStatus, pickUpCode, paymentMethod }: Props) {
  const config = getStatusConfig(orderStatus);

  // 1. Logic การเลือกข้อความหัวข้อ
  const getHeadline = () => {
    if (orderStatus === Sd.Status_PendingPayment) return "รอชำระเงิน";
    if (orderStatus === Sd.Status_Ready) return "อาหารเสร็จแล้ว!";
    if (orderStatus === Sd.Status_Cancelled) return "ยกเลิกออเดอร์";
    return "สั่งซื้อสำเร็จ";
  };

  // 2. Logic การเลือกไอคอนหลัก
  const getMainIcon = () => {
    if (orderStatus === Sd.Status_Ready) {
      return <CheckCircleIcon sx={{ fontSize: 90, color: "#2E7D32", animation: `${pulse} 1.5s infinite` }} />;
    }
    if (orderStatus === Sd.Status_PendingPayment) {
      return <AccessTimeIcon sx={{ fontSize: 90, color: config.iconColor, animation: `${pulse} 2s infinite` }} />;
    }
    if (orderStatus === Sd.Status_Cancelled) {
        return <PendingIcon sx={{ fontSize: 90, color: config.iconColor }} />;
    }
    return <StorefrontIcon sx={{ fontSize: 70, color: config.iconColor, opacity: 0.9 }} />;
  };

  // 3. แปลงชื่อวิธีชำระเงินเป็นไทย
  const getPaymentLabel = (method: string) => {
      // เช็ค string ตามที่คุณส่งมาจาก Backend
      const m = method?.toLowerCase() || "";
      if (m.includes("promptpay") || m.includes("transfer") || m.includes("qr")) 
          return <span style={{ color: "#1976D2" }}>โอนจ่าย / QR Code</span>;
      if (m.includes("cash")) 
          return <span>เงินสด (ชำระหน้าร้าน)</span>;
      return <span>{method}</span>;
  };

  return (
    <Paper
      elevation={4}
      sx={{
        p: 4, textAlign: "center", borderRadius: 5, overflow: "hidden", position: "relative", background: "#fff",
      }}
    >
      {/* แถบสีด้านบน */}
      <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 10, bgcolor: config.iconColor }} />
      
      {/* ไอคอนแสดงอารมณ์ */}
      <Box sx={{ mt: 2, mb: 1 }}>
        {getMainIcon()}
      </Box>

      {/* หัวข้อสถานะ */}
      <Typography variant="h4" fontWeight={900} color="text.primary" gutterBottom>
        {getHeadline()}
      </Typography>

      {/* กล่องแสดงเลขคิว (ซ่อนถ้ายังไม่จ่ายเงิน) */}
      {orderStatus !== Sd.Status_PendingPayment && orderStatus !== Sd.Status_Cancelled ? (
        <Paper
            elevation={0}
            sx={{
            bgcolor: config.bg, border: `2px dashed ${config.iconColor}`, py: 2, px: 3, borderRadius: 4, mb: 3, mx: "auto", maxWidth: 280,
            }}
        >
            <Typography variant="overline" color={config.text} sx={{ letterSpacing: 2, fontWeight: 800, display: "block", mb: -1 }}>
            คิวรับอาหาร
            </Typography>
            <Typography variant="h2" fontWeight={900} color={config.text} sx={{ fontSize: { xs: "3.5rem", md: "4.5rem" }, lineHeight: 1.2 }}>
            {pickUpCode || "-"}
            </Typography>
        </Paper>
      ) : (
        // ถ้ายังไม่จ่าย โชว์ข้อความให้ไปจ่ายก่อน
        <Box sx={{ my: 3, p: 2, bgcolor: "#FFF3E0", borderRadius: 3, border: "1px dashed #FF9800" }}>
             <Typography variant="body1" fontWeight={600} color="#E65100">
                {orderStatus === Sd.Status_Cancelled ? "รายการถูกยกเลิก" : "กรุณาชำระเงินเพื่อให้ได้คิว"}
             </Typography>
        </Box>
      )}

      {/* วิธีชำระเงิน */}
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <PaymentIcon color="action" fontSize="small" />
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          ช่องทางชำระ: {getPaymentLabel(paymentMethod)}
        </Typography>
      </Stack>

      {/* Chip สถานะ */}
      <Chip
        label={config.label}
        sx={{ 
            bgcolor: config.iconColor, 
            color: "#fff", 
            fontWeight: 800, 
            px: 3, py: 3, 
            fontSize: "1.1rem", 
            borderRadius: 50,
            boxShadow: `0 4px 10px ${config.bg}` // เพิ่มเงาสีเดียวกับธีม
        }}
      />
    </Paper>
  );
}