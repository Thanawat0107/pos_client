import { Paper, Typography, Box, Stepper, Step, StepLabel, Alert, keyframes } from "@mui/material";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import { Sd } from "../../helpers/SD";
import { getStatusStep } from "../../helpers/OrderHelpers";
import { ColorlibConnector, ColorlibStepIcon } from "../../helpers/OrderStepper";

interface Props {
  orderStatus: string;
  estimatedPickUpTime: string | null;
}

// Animation ให้จุด Active เต้นตุ้บๆ ดูมีชีวิตชีวา
const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.7); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255, 152, 0, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 152, 0, 0); }
`;

const steps = ["รับออเดอร์", "กำลังปรุง", "พร้อมเสิร์ฟ", "เสร็จสิ้น"];

export default function OrderTimeline({ orderStatus, estimatedPickUpTime }: Props) {
  const activeStep = getStatusStep(orderStatus);

  if (orderStatus === Sd.Status_Cancelled) return null;

  // ✅ Logic 1: ซ่อนเวลา ถ้าออเดอร์จบแล้ว หรือ "ยังไม่จ่ายเงิน" (PendingPayment)
  // เพราะถ้ายังไม่จ่าย ครัวยังไม่เริ่มนับเวลา
  const showTime = estimatedPickUpTime && 
                   orderStatus !== Sd.Status_Completed && 
                   orderStatus !== Sd.Status_PendingPayment;

  // ✅ Logic 2: เปลี่ยนชื่อ Step แรก ตามสถานะ
  const getStepLabel = (index: number) => {
    if (index === 0 && orderStatus === Sd.Status_PendingPayment) {
        return "รอชำระเงิน";
    }
    return steps[index];
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 4, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", mb: 3 }}>
      <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <AccessTimeFilledIcon color="action" /> สถานะออเดอร์
      </Typography>

      {showTime && (
        <Alert severity="info" icon={<AccessTimeFilledIcon />} sx={{ mb: 3, borderRadius: 2 }}>
          คาดว่าจะได้รับเวลา:{" "}
          <strong>
            {new Date(estimatedPickUpTime!).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.
          </strong>
        </Alert>
      )}

      <Box sx={{ mt: 2 }}>
        <Stepper alternativeLabel activeStep={activeStep} connector={<ColorlibConnector />}>
          {steps.map((label, index) => {
            const isActive = index === activeStep;
            
            return (
                <Step key={label}>
                <StepLabel 
                    StepIconComponent={ColorlibStepIcon}
                    sx={{
                        // ใส่ Animation ให้ Step ปัจจุบัน
                        "& .MuiStepLabel-iconContainer": isActive ? {
                            animation: `${pulse} 2s infinite`,
                            borderRadius: '50%'
                        } : {}
                    }}
                >
                    <Typography 
                        variant="caption" 
                        fontWeight={isActive ? 800 : 700}
                        color={isActive ? "primary.main" : "text.secondary"}
                    >
                    {getStepLabel(index)}
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