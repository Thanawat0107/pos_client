import {
  Paper,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Alert,
  keyframes,
} from "@mui/material";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Sd } from "../../helpers/SD";
import {
  ColorlibConnector,
  ColorlibStepIcon,
} from "../../utility/OrderStepper";

interface Props {
  orderStatus: string;
  estimatedPickUpTime: string | null;
}

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(25, 118, 210, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
`;

const steps = ["รับออเดอร์", "กำลังปรุง", "พร้อมเสิร์ฟ", "เรียบร้อย"];

export default function OrderTimeline({
  orderStatus,
  estimatedPickUpTime,
}: Props) {
  const getActiveStep = () => {
    switch (orderStatus) {
      case Sd.Status_PendingPayment:
      case Sd.Status_Pending:
        return 0;
      case Sd.Status_Approved:
      case Sd.Status_Paid:
      case Sd.Status_Preparing:
        return 1;
      case Sd.Status_Ready:
        return 2;
      case Sd.Status_Completed:
        return 3;
      default:
        return 0;
    }
  };

  const activeStep = getActiveStep();

  if (orderStatus === Sd.Status_Cancelled) return null;

  const showTime =
    estimatedPickUpTime &&
    orderStatus !== Sd.Status_Completed &&
    !isNaN(Date.parse(estimatedPickUpTime));

  const getStepLabel = (label: string, index: number) => {
    if (index === 0) {
      if (orderStatus === Sd.Status_PendingPayment) return "รอชำระเงิน";
      if (orderStatus === Sd.Status_Pending) return "รอร้านยืนยัน";
      return "ยืนยันออเดอร์แล้ว";
    }
    if (
      index === 1 &&
      (orderStatus === Sd.Status_Approved || orderStatus === Sd.Status_Paid)
    ) {
      return "กำลังเตรียมจัดส่ง";
    }
    return label;
  };

  const getAlertConfig = () => {
    if (orderStatus === Sd.Status_Ready) {
      return {
        severity: "success" as const,
        icon: <CheckCircleIcon sx={{ fontSize: "1.8rem" }} />,
        text: "อาหารของคุณเสร็จแล้ว!",
      };
    }
    return {
      severity: "info" as const,
      icon: <AccessTimeFilledIcon sx={{ fontSize: "1.8rem" }} />,
      text: "เวลารับโดยประมาณ:",
    };
  };

  const alertConfig = getAlertConfig();

  return (
    <Paper
      sx={{
        p: { xs: 2.5, sm: 3 }, // ปรับ Padding ให้เหมาะกับมือถือ
        borderRadius: 4,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        mb: 3,
        background: "linear-gradient(to bottom, #ffffff, #fafafa)",
      }}
    >
      <Typography
        variant="h6"
        fontWeight={800}
        gutterBottom
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mb: 2.5,
          fontSize: { xs: "1.15rem", sm: "1.25rem" }, // ตัวหนังสือหัวข้อใหญ่ขึ้น
        }}
      >
        <RestaurantIcon color="primary" />
        {orderStatus === Sd.Status_Completed
          ? "ออเดอร์เสร็จสมบูรณ์"
          : "สถานะออเดอร์ล่าสุด"}
      </Typography>

      {/* ส่วนแสดงเวลา - ปรับให้ใหญ่อ่านง่ายมากบนมือถือ */}
      {showTime && (
        <Alert
          severity={alertConfig.severity}
          icon={alertConfig.icon}
          sx={{
            mb: { xs: 3, sm: 4 },
            borderRadius: 3,
            boxShadow:
              alertConfig.severity === "success"
                ? "0 4px 12px rgba(76, 175, 80, 0.2)"
                : "none",
            "& .MuiAlert-message": { width: "100%", py: 0.5 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "row", sm: "row" }, // สามารถปรับเป็น column ได้ถ้าเวลาซ้อน
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography
              variant="body1"
              fontWeight={700}
              sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}
            >
              {alertConfig.text}
            </Typography>
            <Typography
              variant="h5"
              fontWeight={900}
              color="inherit"
              sx={{ fontSize: { xs: "1.3rem", sm: "1.5rem" } }}
            >
              {new Date(estimatedPickUpTime!).toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              น.
            </Typography>
          </Box>
        </Alert>
      )}

      {/* Stepper Timeline */}
      <Box sx={{ width: "100%", py: { xs: 1, sm: 2 }, overflow: "visible" }}>
        <Stepper
          alternativeLabel
          activeStep={activeStep}
          connector={<ColorlibConnector />}
        >
          {steps.map((label, index) => {
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;
            const shouldPulse = isActive && orderStatus !== Sd.Status_Completed;

            return (
              <Step key={label} completed={isCompleted}>
                <StepLabel
                  StepIconComponent={ColorlibStepIcon}
                  sx={{
                    "& .MuiStepLabel-iconContainer": shouldPulse
                      ? {
                          animation: `${pulse} 2s infinite`,
                          borderRadius: "50%",
                        }
                      : {},
                  }}
                >
                  <Typography
                    sx={{
                      display: "block",
                      mt: 0.5,
                      fontWeight: isActive ? 900 : 600,
                      color: isActive
                        ? "primary.main"
                        : isCompleted
                          ? "text.primary"
                          : "text.disabled",
                      // ปรับขนาดตัวหนังสือ Step ให้ใหญ่ขึ้นจาก 0.75rem -> 0.85rem
                      fontSize: { xs: "0.85rem", sm: "0.9rem" },
                      lineHeight: 1.2,
                      transition: "all 0.3s",
                    }}
                  >
                    {getStepLabel(label, index)}
                  </Typography>
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </Box>
    </Paper>
  );
}
