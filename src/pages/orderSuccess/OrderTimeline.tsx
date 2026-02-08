import { Paper, Typography, Box, Stepper, Step, StepLabel, Alert, keyframes } from "@mui/material";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import { Sd } from "../../helpers/SD";
import { ColorlibConnector, ColorlibStepIcon } from "../../utility/OrderStepper";

interface Props {
  orderStatus: string;
  estimatedPickUpTime: string | null;
}

// Animation
const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.7); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255, 152, 0, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 152, 0, 0); }
`;

// ชื่อ Step หลัก (Default)
const steps = ["รับออเดอร์", "กำลังปรุง", "พร้อมเสิร์ฟ", "เรียบร้อย"];

export default function OrderTimeline({ orderStatus, estimatedPickUpTime }: Props) {
  
  // 1. ✅ คำนวณ Active Step ให้ตรงกับสถานะ Backend
  const getActiveStep = () => {
    switch (orderStatus) {
      case Sd.Status_Pending:
      case Sd.Status_PendingPayment:
      case Sd.Status_Approved:
      case Sd.Status_Paid:
        return 0; // Step 1: รับออเดอร์ (รวมรอจ่าย/รออนุมัติ)
      case Sd.Status_Preparing:
        return 1; // Step 2: กำลังปรุง
      case Sd.Status_Ready:
        return 2; // Step 3: พร้อมเสิร์ฟ
      case Sd.Status_Completed:
        return 3; // Step 4: จบงาน
      default:
        return 0;
    }
  };

  const activeStep = getActiveStep();

  // ถ้าถูกยกเลิก ไม่ต้องโชว์ Timeline
  if (orderStatus === Sd.Status_Cancelled) return null;

  // 2. ✅ Logic การแสดงเวลา (Estimated Time)
  // จะโชว์ก็ต่อเมื่อ: มีเวลาส่งมา AND ร้านรับเรื่องแล้ว (Approved/Paid/Preparing/Ready)
  // และต้องซ่อนเมื่อ: ยังไม่จ่าย(PendingPayment) หรือ รอร้านกดรับ(Pending) หรือ จบงานแล้ว(Completed)
  const showTime = estimatedPickUpTime &&
                   orderStatus !== Sd.Status_Pending && 
                   orderStatus !== Sd.Status_PendingPayment &&
                   orderStatus !== Sd.Status_Completed;

  // 3. ✅ Logic เปลี่ยนชื่อ Step แรก ตามบริบท (Dynamic Label)
  const getStepLabel = (label: string, index: number) => {
    if (index === 0) {
        if (orderStatus === Sd.Status_PendingPayment) return "รอชำระเงิน";
        if (orderStatus === Sd.Status_Pending) return "รอร้านยืนยัน";
        if (orderStatus === Sd.Status_Approved || orderStatus === Sd.Status_Paid) return "รับออเดอร์แล้ว";
    }
    return label;
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 4, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", mb: 3 }}>
      <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <RestaurantIcon color="primary" /> สถานะการจัดเตรียม
      </Typography>

      {/* ส่วนแสดงเวลาที่คาดว่าจะได้รับ */}
      {showTime && (
        <Alert 
            severity="info" 
            icon={<AccessTimeFilledIcon fontSize="inherit" />} 
            sx={{ 
                mb: 3, 
                borderRadius: 2, 
                alignItems: 'center',
                '& .MuiAlert-message': { width: '100%' }
            }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span>คาดว่าจะได้รับ:</span>
              <Typography variant="h6" fontWeight={800} color="primary.dark">
                {new Date(estimatedPickUpTime!).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.
              </Typography>
          </Box>
        </Alert>
      )}

      <Box sx={{ mt: 2 }}>
        <Stepper alternativeLabel activeStep={activeStep} connector={<ColorlibConnector />}>
          {steps.map((label, index) => {
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;

            return (
              <Step key={label} completed={isCompleted}>
                <StepLabel
                  StepIconComponent={ColorlibStepIcon}
                  sx={{
                    // Animation: เฉพาะจุดที่เป็น Active ปัจจุบัน
                    "& .MuiStepLabel-iconContainer": isActive
                      ? {
                          animation: `${pulse} 2s infinite`,
                          borderRadius: "50%",
                        }
                      : {},
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={isActive ? 800 : 500}
                    color={isActive ? "primary.main" : "text.secondary"}
                    sx={{ 
                        transition: 'all 0.3s',
                        transform: isActive ? 'scale(1.1)' : 'scale(1)'
                    }}
                  >
                    {/* เรียกฟังก์ชันเปลี่ยนชื่อ Step */}
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