import { Paper, Box, Typography, Stack, Chip, keyframes } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PaymentIcon from "@mui/icons-material/Payment";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SoupKitchenIcon from "@mui/icons-material/SoupKitchen";
import CancelIcon from "@mui/icons-material/Cancel";
import { Sd, paymentMethods } from "../../helpers/SD";
import { getStatusConfig } from "../../utility/OrderHelpers";

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
        return "ขอบคุณที่มาอุดหนุน";
      case Sd.Status_Cancelled:
        return "ออเดอร์ถูกยกเลิก";
      default:
        return "สถานะออเดอร์";
    }
  };

  const getMainIcon = () => {
    // ปรับขนาดไอคอนให้ Responsive: มือถือเล็กหน่อย (70), จอใหญ่ (90)
    const iconStyle = {
      fontSize: { xs: 70, sm: 90 },
      color: config.iconColor,
      mb: 1,
    };
    const pulseColor = config.iconColor + "44";

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
      default:
        return <StorefrontIcon sx={iconStyle} />;
    }
  };

  const getPaymentLabel = (method: string) => {
    const m = method?.toLowerCase() || "";
    // ปรับขนาดตัวหนังสือวิธีการชำระเงินให้เป็น body1 (ใหญ่ขึ้น)
    const labelStyle = {
      fontWeight: 700,
      fontSize: { xs: "0.95rem", sm: "1rem" },
    };

    if (
      m === paymentMethods.paymentStatus_PromptPay.toLowerCase() ||
      m.includes("qr") ||
      m.includes("transfer")
    ) {
      return (
        <Typography
          component="span"
          variant="body1"
          sx={{ ...labelStyle, color: "#1976D2" }}
        >
          โอนจ่าย (PromptPay / QR)
        </Typography>
      );
    }
    if (m === paymentMethods.paymentStatus_Cash.toLowerCase()) {
      return (
        <Typography
          component="span"
          variant="body1"
          sx={{ ...labelStyle, color: "#455A64" }}
        >
          เงินสด (ชำระหน้าร้าน)
        </Typography>
      );
    }
    return (
      <Typography component="span" variant="body1" sx={labelStyle}>
        {method}
      </Typography>
    );
  };

  const showQueueNumber =
    orderStatus !== Sd.Status_Pending &&
    orderStatus !== Sd.Status_PendingPayment &&
    orderStatus !== Sd.Status_Cancelled;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, sm: 5 }, // เพิ่ม Padding แนวตั้งให้ดูโปร่งขึ้น
        textAlign: "center",
        borderRadius: { xs: 5, sm: 6 },
        background: "#fff",
        boxShadow: "0 15px 50px rgba(0,0,0,0.06)", // เงาให้นุ่มขึ้น
        borderTop: `12px solid ${config.iconColor}`,
        transition: "all 0.5s ease",
      }}
    >
      <Box sx={{ mt: 1, display: "flex", justifyContent: "center" }}>
        {getMainIcon()}
      </Box>

      <Typography
        variant="h4"
        fontWeight={900}
        color={config.text}
        sx={{
          mb: 2,
          letterSpacing: -0.5,
          fontSize: { xs: "1.75rem", sm: "2.125rem" }, // ปรับขนาดพาดหัวตามหน้าจอ
        }}
      >
        {getHeadline()}
      </Typography>

      {showQueueNumber ? (
        <Paper
          elevation={0}
          sx={{
            bgcolor: config.bg,
            border: `2px dashed ${config.iconColor}`,
            py: { xs: 2.5, sm: 3.5 }, // เพิ่มพื้นที่ให้เลขคิวดูเด่น
            px: 2,
            borderRadius: 5,
            mb: 3,
            mx: "auto",
            maxWidth: { xs: 240, sm: 280 },
          }}
        >
          <Typography
            variant="overline"
            sx={{
              display: "block",
              letterSpacing: 2,
              fontWeight: 800,
              color: config.text,
              opacity: 0.7,
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
              lineHeight: 1.5,
            }}
          >
            คิวของคุณคือ
          </Typography>
          <Typography
            variant="h2"
            fontWeight={1000}
            color={config.text}
            sx={{
              fontSize: { xs: "4rem", sm: "5rem" }, // เลขคิวใหญ่มาก เห็นชัดแม้ถือห่างๆ
              lineHeight: 1,
              my: 0.5,
            }}
          >
            {pickUpCode || "---"}
          </Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            my: 4,
            p: 3,
            bgcolor: config.bg,
            borderRadius: 4,
            border: `1.5px dashed ${config.iconColor}`,
          }}
        >
          <Typography
            variant="body1"
            fontWeight={700}
            color={config.text}
            sx={{ fontSize: "1.1rem" }}
          >
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
        spacing={1}
        sx={{ mb: 4, opacity: 0.9 }}
      >
        <PaymentIcon
          sx={{ color: "text.disabled", fontSize: { xs: 22, sm: 24 } }}
        />
        {getPaymentLabel(paymentMethod)}
      </Stack>

      <Chip
        label={config.label}
        sx={{
          bgcolor: config.iconColor,
          color: "#fff",
          fontWeight: 800,
          px: { xs: 2, sm: 4 },
          height: { xs: 45, sm: 50 }, // ความสูงที่พอดีกับมือถือ
          fontSize: { xs: "1rem", sm: "1.1rem" },
          borderRadius: "100px",
          boxShadow: `0 8px 25px ${config.iconColor}55`,
          "& .MuiChip-label": { px: { xs: 2, sm: 3 } },
        }}
      />
    </Paper>
  );
}
