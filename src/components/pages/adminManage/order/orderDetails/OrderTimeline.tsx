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
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // ✅ เปลี่ยนจาก RoomService เป็น Check
import FlagIcon from "@mui/icons-material/Flag";
import { Sd } from "../../../../../helpers/SD";

const BRAND_COLOR = "#D32F2F";

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 27 },
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
    backgroundColor: theme.palette.mode === "dark" ? theme.palette.grey[800] : "#eaeaf0",
    borderRadius: 1,
  },
}));

const ColorlibStepIconRoot = styled("div")<{
  ownerState: { completed?: boolean; active?: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.mode === "dark" ? theme.palette.grey[700] : "#ccc",
  zIndex: 1,
  color: "#fff",
  width: 54,
  height: 54,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  boxShadow: "0 4px 10px 0 rgba(0,0,0,.08)",
  ...(ownerState.active && {
    backgroundImage: `linear-gradient( 136deg, #ff5252 0%, ${BRAND_COLOR} 50%, #b71c1c 100%)`,
    boxShadow: "0 6px 20px 0 rgba(211, 47, 47, 0.45)",
    transform: "scale(1.18)",
  }),
  ...(ownerState.completed && {
    backgroundImage: `linear-gradient( 136deg, #81c784 0%, #4caf50 50%, #2e7d32 100%)`,
  }),
}));

function ColorlibStepIcon(props: StepIconProps) {
  const icons: { [index: string]: React.ReactElement } = {
    1: <NewReleasesIcon fontSize="medium" />,
    2: <PaidIcon fontSize="medium" />,
    3: <SoupKitchenIcon fontSize="medium" />,
    4: <CheckCircleIcon fontSize="medium" />,
    5: <FlagIcon fontSize="medium" />,
  };

  return (
    <ColorlibStepIconRoot ownerState={{ completed: props.completed, active: props.active }}>
      {icons[String(props.icon)]}
    </ColorlibStepIconRoot>
  );
}

export default function OrderTimeline({ status }: { status: string }) {
  if (status === Sd.Status_Cancelled) return null;

  // ✅ ปรับ Logic ให้สอดคล้องกับพฤติกรรมจริงของพนักงาน
  const getActiveStep = (s: string) => {
    switch (s) {
      case Sd.Status_Pending: 
        return 0; // รับเรื่อง
      case Sd.Status_PendingPayment:
      case Sd.Status_Approved:
      case Sd.Status_Paid: 
        return 1; // ยืนยันเงิน/คิว
      case Sd.Status_Preparing: 
        return 2; // กำลังปรุง
      case Sd.Status_Ready: 
        return 3; // รอส่งมอบ
      case Sd.Status_Completed: 
        return 4; // เรียบร้อย
      default: 
        return 0;
    }
  };

  const stepsLabel = [
    "รออนุมัติ",
    "รับออเดอร์", // ✅ สั้นและเข้าใจง่ายกว่า
    "กำลังทำ",
    "พร้อมเสิร์ฟ",
    "สำเร็จ",
  ];

  const currentStep = getActiveStep(status);
  const isFinished = status === Sd.Status_Completed;

  return (
    <Box
      sx={{
        width: "100%",
        py: { xs: 1.5, sm: 2 },
        px: { xs: 0.5, sm: 1 },
        bgcolor: "white",
        borderRadius: 3,
        border: "1px solid #f0f0f0",
      }}
    >
      <Stepper
        alternativeLabel
        activeStep={isFinished ? 5 : currentStep}
        connector={<ColorlibConnector />}
      >
        {stepsLabel.map((label, index) => {
          const isActive = currentStep === index && !isFinished;
          const isDone = isFinished || currentStep > index;
          return (
            <Step key={label}>
              <StepLabel StepIconComponent={ColorlibStepIcon}>
                <Typography
                  fontWeight={isActive ? 900 : 600}
                  sx={{
                    mt: 0.75,
                    display: "block",
                    color: isActive
                      ? BRAND_COLOR
                      : isDone
                      ? "#4caf50"
                      : "text.disabled",
                    fontSize: { xs: "0.7rem", sm: "0.8rem" },
                    lineHeight: 1.3,
                    transition: "all 0.3s",
                  }}
                >
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
}