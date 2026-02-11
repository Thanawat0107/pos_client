import { Paper, Box, Typography, Stack, Chip, keyframes } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PaymentIcon from "@mui/icons-material/Payment";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SoupKitchenIcon from "@mui/icons-material/SoupKitchen";
import CancelIcon from "@mui/icons-material/Cancel";
import { Sd } from "../../helpers/SD";
import { getStatusConfig } from "../../utility/OrderHelpers";

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.2); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(0, 0, 0, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
`;

interface Props {
  orderStatus: string;
  pickUpCode: string;
  paymentMethod: string;
}

export default function OrderStatusCard({
  orderStatus,
  pickUpCode,
  paymentMethod,
}: Props) {
  const config = getStatusConfig(orderStatus);

  const getHeadline = () => {
    switch (orderStatus) {
      case Sd.Status_Pending:
        return "รอร้านยืนยัน";
      case Sd.Status_PendingPayment:
        return "รอชำระเงิน";
      case Sd.Status_Approved:
        return "รับออเดอร์แล้ว";
      case Sd.Status_Paid:
        return "ชำระเงินแล้ว";
      case Sd.Status_Preparing:
        return "กำลังปรุงอาหาร...";
      case Sd.Status_Ready:
        return "อาหารเสร็จแล้ว!";
      case Sd.Status_Completed:
        return "ขอบคุณที่ใช้บริการ";
      case Sd.Status_Cancelled:
        return "ออเดอร์ถูกยกเลิก";
      default:
        return "สถานะออเดอร์";
    }
  };

  const getMainIcon = () => {
    const iconStyle = { fontSize: 80, color: config.iconColor, mb: 1 };

    switch (orderStatus) {
      case Sd.Status_Pending:
      case Sd.Status_PendingPayment:
        return (
          <AccessTimeIcon
            sx={{ ...iconStyle, animation: `${pulse} 2s infinite` }}
          />
        );

      case Sd.Status_Preparing:
        return (
          <SoupKitchenIcon
            sx={{ ...iconStyle, animation: `${pulse} 1.5s infinite` }}
          />
        );

      case Sd.Status_Ready:
      case Sd.Status_Completed:
        return <CheckCircleIcon sx={{ ...iconStyle, color: "#2E7D32" }} />;

      case Sd.Status_Cancelled:
        return <CancelIcon sx={{ ...iconStyle, color: "#D32F2F" }} />;

      default: // Approved, Paid
        return <StorefrontIcon sx={iconStyle} />;
    }
  };

  // 3. แปลงชื่อวิธีชำระเงิน (เหมือนเดิม)
  const getPaymentLabel = (method: string) => {
    const m = method?.toLowerCase() || "";
    // ถ้า Backend ส่งเป็น "Transfer" หรือ "PromptPay"
    if (m.includes("promptpay") || m.includes("transfer") || m.includes("qr"))
      return <span style={{ color: "#1976D2" }}>โอนจ่าย / QR Code</span>;
    // ถ้า Backend ส่งเป็น "Cash"
    if (m.includes("cash")) return <span>เงินสด (ชำระหน้าร้าน)</span>;

    return <span>{method}</span>;
  };

  // 4. ✅ Logic การโชว์เลขคิว
  // โชว์เฉพาะตอนร้านรับแล้ว (Approved/Paid/Preparing/Ready/Completed)
  // ซ่อนตอน Pending, PendingPayment, Cancelled
  const showQueueNumber =
    orderStatus !== Sd.Status_Pending &&
    orderStatus !== Sd.Status_PendingPayment &&
    orderStatus !== Sd.Status_Cancelled;

  return (
    <Paper
      elevation={4}
      sx={{
        p: 4,
        textAlign: "center",
        borderRadius: 5,
        overflow: "hidden",
        position: "relative",
        background: "#fff",
        borderTop: `8px solid ${config.iconColor}`, // ใช้ borderTop แทน Box แยกจะง่ายกว่า
      }}
    >
      {/* ไอคอนแสดงอารมณ์ */}
      <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
        {getMainIcon()}
      </Box>

      {/* หัวข้อสถานะ */}
      <Typography
        variant="h4"
        fontWeight={800}
        color={config.text}
        gutterBottom
      >
        {getHeadline()}
      </Typography>

      {/* กล่องแสดงเลขคิว */}
      {showQueueNumber ? (
        <Paper
          elevation={0}
          sx={{
            bgcolor: config.bg,
            border: `2px dashed ${config.iconColor}`,
            py: 2,
            px: 3,
            borderRadius: 4,
            mb: 3,
            mx: "auto",
            maxWidth: 280,
          }}
        >
          <Typography
            variant="overline"
            color={config.text}
            sx={{ letterSpacing: 2, fontWeight: 800, display: "block", mb: -1 }}
          >
            คิวรับอาหาร
          </Typography>
          <Typography
            variant="h2"
            fontWeight={900}
            color={config.text}
            sx={{ fontSize: { xs: "3.5rem", md: "4.5rem" }, lineHeight: 1.2 }}
          >
            {pickUpCode || "-"}
          </Typography>
        </Paper>
      ) : (
        // กล่องข้อความแจ้งเตือน (กรณีไม่ได้คิว)
        <Box
          sx={{
            my: 3,
            p: 2,
            bgcolor: config.bg,
            borderRadius: 3,
            border: `1px dashed ${config.iconColor}`,
          }}
        >
          <Typography variant="body1" fontWeight={600} color={config.text}>
            {orderStatus === Sd.Status_Cancelled
              ? "รายการนี้ถูกยกเลิกแล้ว"
              : "กรุณารอสักครู่เพื่อให้ได้คิว"}
          </Typography>
        </Box>
      )}

      {/* วิธีชำระเงิน */}
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={1}
        sx={{ mb: 3 }}
      >
        <PaymentIcon color="action" fontSize="small" />
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {getPaymentLabel(paymentMethod)}
        </Typography>
      </Stack>

      {/* Chip สถานะ (สรุป) */}
      <Chip
        label={config.label} // ดึง label ภาษาไทยจาก Helper
        sx={{
          bgcolor: config.iconColor,
          color: "#fff",
          fontWeight: 700,
          px: 2,
          py: 2.5,
          fontSize: "1rem",
          borderRadius: 50,
          boxShadow: `0 4px 12px ${config.bg}`,
        }}
      />
    </Paper>
  );
}
