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

// ✅ Animation สำหรับสถานะที่กำลังดำเนินการ
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
  // 1. ✅ ปรับ Mapping Step ให้มีความก้าวหน้ามากขึ้น
  const getActiveStep = () => {
    switch (orderStatus) {
      case Sd.Status_PendingPayment:
      case Sd.Status_Pending:
        return 0; // ช่วงรอ (เงิน/คน)
      case Sd.Status_Approved:
      case Sd.Status_Paid:
      case Sd.Status_Preparing:
        return 1; // เริ่มเข้าครัวหรือเตรียมของแล้ว
      case Sd.Status_Ready:
        return 2; // อาหารเสร็จแล้ว
      case Sd.Status_Completed:
        return 3; // จบงาน
      default:
        return 0;
    }
  };

  const activeStep = getActiveStep();

  // ✅ ถ้าถูกยกเลิก ไม่แสดง Timeline (ตาม Logic เดิมที่ถูกต้อง)
  if (orderStatus === Sd.Status_Cancelled) return null;

  // 2. ✅ ปรับ Logic การแสดงเวลาให้ดูเป็นมืออาชีพขึ้น
  const showTime =
    estimatedPickUpTime &&
    orderStatus !== Sd.Status_Completed &&
    // ป้องกันการโชว์เวลา "มั่ว" ถ้าวันข้างหลังส่งมาเป็นค่าว่างหรือ Invalid
    !isNaN(Date.parse(estimatedPickUpTime));

  // 3. ✅ Dynamic Label: สื่อสารกับลูกค้าให้ชัดเจนว่าอยู่จุดไหน
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
      return "กำลังเตรียมจัดส่งเข้าครัว";
    }
    return label;
  };

  // ✅ เลือกสี Alert ตามสถานะ
  const getAlertConfig = () => {
    if (orderStatus === Sd.Status_Ready) {
      return {
        severity: "success" as const,
        icon: <CheckCircleIcon />,
        text: "อาหารของคุณเสร็จเรียบร้อยแล้ว!",
      };
    }
    return {
      severity: "info" as const,
      icon: <AccessTimeFilledIcon />,
      text: "คาดว่าจะได้รับอาหารเวลา:",
    };
  };

  const alertConfig = getAlertConfig();

  return (
    <Paper
      sx={{
        p: 3,
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
        sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}
      >
        <RestaurantIcon color="primary" />
        {orderStatus === Sd.Status_Completed
          ? "ออเดอร์เสร็จสมบูรณ์"
          : "สถานะออเดอร์ล่าสุด"}
      </Typography>

      {/* ✅ ปรับปรุงส่วนแสดงเวลาให้เด่นชัดขึ้น */}
      {showTime && (
        <Alert
          severity={alertConfig.severity}
          icon={alertConfig.icon}
          sx={{
            mb: 4,
            borderRadius: 3,
            fontWeight: 700,
            boxShadow:
              alertConfig.severity === "success"
                ? "0 4px 12px rgba(76, 175, 80, 0.2)"
                : "none",
            "& .MuiAlert-message": { width: "100%" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              {alertConfig.text}
            </Typography>
            <Typography variant="h6" fontWeight={900}>
              {new Date(estimatedPickUpTime!).toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              น.
            </Typography>
          </Box>
        </Alert>
      )}

      <Box sx={{ width: "100%", py: 2 }}>
        <Stepper
          alternativeLabel
          activeStep={activeStep}
          connector={<ColorlibConnector />}
        >
          {steps.map((label, index) => {
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;

            // ✅ Pulse animation เฉพาะ step ที่กำลังทำและยังไม่จบออเดอร์
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
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 0.5,
                      fontWeight: isActive ? 900 : 600,
                      color: isActive
                        ? "primary.main"
                        : isCompleted
                          ? "text.primary"
                          : "text.disabled",
                      fontSize: isActive ? "0.8rem" : "0.75rem",
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
