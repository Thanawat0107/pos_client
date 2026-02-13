import { Paper, Box, Typography, Stack, Chip, keyframes } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PaymentIcon from "@mui/icons-material/Payment";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SoupKitchenIcon from "@mui/icons-material/SoupKitchen";
import CancelIcon from "@mui/icons-material/Cancel";
import { Sd, paymentMethods } from "../../helpers/SD";
import { getStatusConfig } from "../../utility/OrderHelpers";

// ✅ ปรับ Pulse Animation ให้รับสีแบบ Dynamic (ถ้าต้องการ)
// หรือใช้สีที่ Soft ลงเพื่อให้เข้ากับสไตล์ Modern
const pulse = (color: string) => keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 ${color}; }
  70% { transform: scale(1.05); box-shadow: 0 0 0 12px rgba(0, 0, 0, 0); }
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

  // 1. ✅ ปรับหัวข้อให้สื่อสารชัดเจนขึ้น
  const getHeadline = () => {
    switch (orderStatus) {
      case Sd.Status_Pending:
        return "รอร้านยืนยันออเดอร์";
      case Sd.Status_PendingPayment:
        return "รอการชำระเงิน";
      case Sd.Status_Approved:
        return "เตรียมส่งเข้าครัว";
      case Sd.Status_Paid:
        return "รับออเดอร์เรียบร้อย";
      case Sd.Status_Preparing:
        return "เชฟกำลังปรุงอาหาร...";
      case Sd.Status_Ready:
        return "อาหารเสร็จแล้วครับ!";
      case Sd.Status_Completed:
        return "ขอบคุณที่มาอุดหนุนครับ";
      case Sd.Status_Cancelled:
        return "ออเดอร์ถูกยกเลิก";
      default:
        return "สถานะออเดอร์";
    }
  };

  // 2. ✅ ปรับไอคอนหลักให้มีลูกเล่น (Animation)
  const getMainIcon = () => {
    const iconStyle = { fontSize: 85, color: config.iconColor, mb: 1 };
    // สร้างสีสำหรับ Pulse จาก config.iconColor
    const pulseColor = config.iconColor + "44"; // เติม 44 เพื่อให้โปร่งแสง (Alpha)

    switch (orderStatus) {
      case Sd.Status_Pending:
      case Sd.Status_PendingPayment:
        return (
          <AccessTimeIcon
            sx={{
              ...iconStyle,
              animation: `${pulse(pulseColor)} 2.2s infinite ease-in-out`,
            }}
          />
        );

      case Sd.Status_Preparing:
        return (
          <SoupKitchenIcon
            sx={{
              ...iconStyle,
              animation: `${pulse(pulseColor)} 1.8s infinite ease-in-out`,
            }}
          />
        );

      case Sd.Status_Ready:
        return (
          <CheckCircleIcon
            sx={{
              ...iconStyle,
              color: "#2E7D32",
              animation: `${pulse("#2E7D3244")} 2s infinite`,
            }}
          />
        );

      case Sd.Status_Completed:
        return <CheckCircleIcon sx={{ ...iconStyle, color: "#2E7D32" }} />;

      case Sd.Status_Cancelled:
        return <CancelIcon sx={{ ...iconStyle, color: "#D32F2F" }} />;

      default: // Approved, Paid
        return <StorefrontIcon sx={iconStyle} />;
    }
  };

  // 3. ✅ ปรับ Logic การโชว์วิธีจ่ายเงินให้ Robust ขึ้น
  const getPaymentLabel = (method: string) => {
    const m = method?.toLowerCase() || "";
    if (
      m === paymentMethods.paymentStatus_PromptPay.toLowerCase() ||
      m.includes("qr") ||
      m.includes("transfer")
    ) {
      return (
        <Typography
          component="span"
          variant="body2"
          sx={{ color: "#1976D2", fontWeight: 700 }}
        >
          โอนจ่าย (PromptPay / QR)
        </Typography>
      );
    }
    if (m === paymentMethods.paymentStatus_Cash.toLowerCase()) {
      return (
        <Typography
          component="span"
          variant="body2"
          sx={{ color: "#455A64", fontWeight: 700 }}
        >
          เงินสด (ชำระหน้าร้าน)
        </Typography>
      );
    }
    return (
      <Typography component="span" variant="body2" fontWeight={700}>
        {method}
      </Typography>
    );
  };

  // 4. ✅ Logic เลขคิว (คุมความปลอดภัย)
  const showQueueNumber =
    orderStatus !== Sd.Status_Pending &&
    orderStatus !== Sd.Status_PendingPayment &&
    orderStatus !== Sd.Status_Cancelled;

  return (
    <Paper
      elevation={0} // ใช้ 0 แล้วคุมเงาด้วย sx จะดู Modern กว่า
      sx={{
        p: 4,
        textAlign: "center",
        borderRadius: 6,
        background: "#fff",
        boxShadow: "0 10px 40px rgba(0,0,0,0.04)",
        borderTop: `10px solid ${config.iconColor}`,
        transition: "all 0.5s ease", // เวลาเปลี่ยนสถานะจะได้ดู Smooth
      }}
    >
      <Box sx={{ mt: 1, display: "flex", justifyContent: "center" }}>
        {getMainIcon()}
      </Box>

      <Typography
        variant="h4"
        fontWeight={900}
        color={config.text}
        sx={{ mb: 1, letterSpacing: -0.5 }}
      >
        {getHeadline()}
      </Typography>

      {showQueueNumber ? (
        <Paper
          elevation={0}
          sx={{
            bgcolor: config.bg,
            border: `2px dashed ${config.iconColor}`,
            py: 2.5,
            px: 3,
            borderRadius: 5,
            mb: 3,
            mx: "auto",
            maxWidth: 260,
          }}
        >
          <Typography
            variant="overline"
            sx={{
              letterSpacing: 3,
              fontWeight: 900,
              color: config.text,
              opacity: 0.8,
            }}
          >
            คิวของคุณคือ
          </Typography>
          <Typography
            variant="h2"
            fontWeight={1000}
            color={config.text}
            sx={{ fontSize: { xs: "3.8rem", md: "4.8rem" }, lineHeight: 1 }}
          >
            {pickUpCode || "---"}
          </Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            my: 3,
            p: 2.5,
            bgcolor: config.bg,
            borderRadius: 4,
            border: `1px dashed ${config.iconColor}`,
          }}
        >
          <Typography variant="body1" fontWeight={700} color={config.text}>
            {orderStatus === Sd.Status_Cancelled
              ? "คำสั่งซื้อนี้ถูกยกเลิกแล้ว"
              : "ร้านกำลังตรวจสอบออเดอร์ของคุณ..."}
          </Typography>
        </Box>
      )}

      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={1.5}
        sx={{ mb: 3, opacity: 0.8 }}
      >
        <PaymentIcon sx={{ color: "text.disabled", fontSize: 20 }} />
        {getPaymentLabel(paymentMethod)}
      </Stack>

      <Chip
        label={config.label}
        sx={{
          bgcolor: config.iconColor,
          color: "#fff",
          fontWeight: 800,
          px: 3,
          py: 3,
          fontSize: "1.1rem",
          borderRadius: "100px",
          boxShadow: `0 8px 20px ${config.iconColor}44`,
        }}
      />
    </Paper>
  );
}
