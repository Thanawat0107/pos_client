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
  if (status === Sd.Status_Cancelled) return null;

  // ✅ แก้ไข Logic ตรงนี้ให้เป็น Linear Flow (เรียงลำดับจริง)
  const getActiveStep = (s: string) => {
    switch (s) {
      case Sd.Status_Pending:
        return 0; // Step 1: รออนุมัติ

      case Sd.Status_PendingPayment: // รอจ่าย (Step 2)
      case Sd.Status_Approved: // รับออเดอร์แล้ว (Step 2)
      case Sd.Status_Paid: // จ่ายเงินแล้ว (Step 2)
        return 1; // รวมกลุ่มนี้ไว้ที่ "ชำระเงิน/รอคิว"

      case Sd.Status_Preparing:
        return 2; // Step 3: กำลังปรุง

      case Sd.Status_Ready:
        return 3; // Step 4: พร้อมรับ

      case Sd.Status_Completed:
        return 4; // Step 5: สำเร็จ

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

  return (
    <Box sx={{ width: "100%", py: 2 }}>
      <Stepper
        alternativeLabel
        activeStep={getActiveStep(status)}
        connector={<ColorlibConnector />}
      >
        {stepsLabel.map((label) => (
          <Step key={label}>
            <StepLabel StepIconComponent={ColorlibStepIcon}>
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{ mt: 1, display: "block" }}
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
