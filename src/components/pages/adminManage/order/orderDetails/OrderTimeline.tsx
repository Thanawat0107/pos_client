import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  StepConnector,
  stepConnectorClasses,
  styled,
} from "@mui/material";
import type { StepIconProps } from "@mui/material";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import PaidIcon from "@mui/icons-material/Paid";
import SoupKitchenIcon from "@mui/icons-material/SoupKitchen";
import RoomServiceIcon from "@mui/icons-material/RoomService";
import FlagIcon from "@mui/icons-material/Flag";
import { Sd } from "../../../../../helpers/SD";

const BRAND_COLOR = "#D32F2F";

// ... (ส่วน styled components เหมือนเดิม ไม่ต้องแก้) ...
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 22 },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: `linear-gradient( 95deg, ${BRAND_COLOR} 0%, #ff8a80 50%, #e0e0e0 100%)`,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: `linear-gradient( 95deg, ${BRAND_COLOR} 0%, ${BRAND_COLOR} 100%)`,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor:
      theme.palette.mode === "dark" ? theme.palette.grey[800] : "#eaeaf0",
    borderRadius: 1,
  },
}));

const ColorlibStepIconRoot = styled("div")<{
  ownerState: { completed?: boolean; active?: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor:
    theme.palette.mode === "dark" ? theme.palette.grey[700] : "#ccc",
  zIndex: 1,
  color: "#fff",
  width: 50,
  height: 50,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 10px 0 rgba(0,0,0,.1)",
  ...(ownerState.active && {
    backgroundImage: `linear-gradient( 136deg, #ff5252 0%, ${BRAND_COLOR} 50%, #b71c1c 100%)`,
    boxShadow: "0 4px 20px 0 rgba(211, 47, 47, 0.5)",
    transform: "scale(1.2)",
  }),
  ...(ownerState.completed && {
    backgroundImage: `linear-gradient( 136deg, #ff5252 0%, ${BRAND_COLOR} 100%)`,
  }),
}));

function ColorlibStepIcon(props: StepIconProps) {
  const icons: { [index: string]: React.ReactElement } = {
    1: <NewReleasesIcon />,
    2: <PaidIcon />,
    3: <SoupKitchenIcon />,
    4: <RoomServiceIcon />,
    5: <FlagIcon />,
  };
  return (
    <ColorlibStepIconRoot
      ownerState={{ completed: props.completed, active: props.active }}
    >
      {icons[String(props.icon)]}
    </ColorlibStepIconRoot>
  );
}

export default function OrderTimeline({ status }: { status: string }) {
  // หากยกเลิก ไม่แสดง Timeline
  if (status === Sd.Status_Cancelled) return null;

  /**
   * Logic การกำหนด Active Step (0-4)
   * activeStep จะบอกว่า "ขั้นตอนปัจจุบัน" คือขั้นตอนไหน
   * ขั้นตอนที่ผ่านมาแล้วจะถูกแสดงเป็น 'Completed' โดยอัตโนมัติ
   */
  const getActiveStep = (s: string) => {
    switch (s) {
      case Sd.Status_Pending:
        return 0; // กำลังรออนุมัติ (Step 1 Active)

      case Sd.Status_PendingPayment:
      case Sd.Status_Approved:
      case Sd.Status_Paid:
        return 1; // อยู่ในขั้นตอนชำระเงินหรือรอคิว (Step 2 Active)

      case Sd.Status_Preparing:
        return 2; // กำลังปรุงอาหาร (Step 3 Active)

      case Sd.Status_Ready:
        return 3; // อาหารเสร็จแล้ว พร้อมรับ (Step 4 Active)

      case Sd.Status_Completed:
        return 4; // จบออเดอร์แล้ว (Step 5 Active)

      default:
        return 0;
    }
  };

  const stepsLabel = [
    "รออนุมัติ",
    "ชำระเงิน/รอคิว",
    "กำลังปรุง",
    "พร้อมรับ",
    "สำเร็จ",
  ];

  // กรณีจบออเดอร์ (Completed) เราอาจต้องการให้แสดงว่า "ผ่านครบทุกขั้นตอน"
  // โดยการส่งค่าที่มากกว่าจำนวน step จริง (เช่น 5) เข้าไปใน activeStep
  // หรือจะปล่อยไว้ที่ 4 เพื่อให้ไอคอนสุดท้ายสว่างก็ได้
  const currentStep = getActiveStep(status);

  return (
    <Box sx={{ width: "100%", py: 2 }}>
      <Stepper
        alternativeLabel
        // หากต้องการให้ 'สำเร็จ' แสดงเป็นสถานะที่ทำเสร็จแล้ว (Checkmark)
        // ให้ใช้เงื่อนไข: status === Sd.Status_Completed ? 5 : currentStep
        activeStep={status === Sd.Status_Completed ? 5 : currentStep}
        connector={<ColorlibConnector />}
      >
        {stepsLabel.map((label, index) => (
          <Step key={label}>
            <StepLabel StepIconComponent={ColorlibStepIcon}>
              <Typography
                variant="caption"
                fontWeight={currentStep === index ? 800 : 600}
                sx={{
                  mt: 1,
                  display: "block",
                  color: currentStep === index ? BRAND_COLOR : "text.secondary",
                  transition: "all 0.3s",
                }}
              >
                {label}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
