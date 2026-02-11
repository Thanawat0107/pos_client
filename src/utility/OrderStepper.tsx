/* eslint-disable @typescript-eslint/no-explicit-any */
import { styled } from "@mui/material/styles";
import StepConnector, { stepConnectorClasses } from "@mui/material/StepConnector";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CelebrationIcon from "@mui/icons-material/Celebration";
import NewReleasesIcon from "@mui/icons-material/NewReleases";

// --- Stepper Styles ---
export const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 23, // ✅ ปรับจาก 22 เป็น 23 (เพื่อให้เส้นอยู่กึ่งกลางแนวตั้งพอดี: 50/2 - 4/2)
    left: "calc(-45% + 30px)", // ✅ ปรับให้เส้นลึกเข้าไปในไอคอนนิดนึง (20px) แล้วใช้ zIndex บังเอา จะได้ไม่เห็นรอยต่อ
    right: "calc(45% + 30px)",
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: "linear-gradient( 95deg, #FF9800 0%, #FF5722 100%)",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: "linear-gradient( 95deg, #4CAF50 0%, #2E7D32 100%)",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 4,
    border: 0,
    backgroundColor:
      theme.palette.mode === "dark" ? theme.palette.grey[800] : "#e0e0e0",
    borderRadius: 1,
  },
}));

const ColorlibStepIconRoot = styled("div")<{
  ownerState: { completed?: boolean; active?: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.mode === "dark" ? theme.palette.grey[700] : "#ccc",
  zIndex: 10, // ✅ ชั้น Layer สูงกว่าเส้น
  position: 'relative', // ✅ [สำคัญ] ต้องใส่เพื่อยืนยัน zIndex
  color: "#fff",
  width: 50,
  height: 50,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  border: '3px solid #fff',
  boxShadow: '0 0 0 1px #eee',
  transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  ...(ownerState.active && {
    backgroundImage: "linear-gradient( 136deg, #FF9800 0%, #FF5722 100%)",
    boxShadow: "0 4px 15px 0 rgba(255, 87, 34, 0.4)",
    animation: "pulse-orange 2s infinite", // ✅ ใส่ Pulse เข้าไปที่นี่
    transform: "scale(1.2)",
    border: 'none',
  }),
  ...(ownerState.completed && {
    backgroundImage: "linear-gradient( 136deg, #4CAF50 0%, #2E7D32 100%)",
    border: 'none',
    animation: "pulse-green 2s infinite", // ✅ ใส่ Pulse เข้าไปที่นี่
}),
  // ✅ เพิ่ม Keyframes สำหรับ Animation
  "@keyframes pulse-orange": {
    "0%": { boxShadow: "0 0 0 0 rgba(255, 87, 34, 0.7)" },
    "70%": { boxShadow: "0 0 0 10px rgba(255, 87, 34, 0)" },
    "100%": { boxShadow: "0 0 0 0 rgba(255, 87, 34, 0)" },
  },
  "@keyframes pulse-green": {
    "0%": { boxShadow: "0 0 0 0 rgba(46, 125, 50, 0.7)" },
    "70%": { boxShadow: "0 0 0 10px rgba(46, 125, 50, 0)" },
    "100%": { boxShadow: "0 0 0 0 rgba(46, 125, 50, 0)" },
  },
}));

export function ColorlibStepIcon(props: any) {
  const { active, completed, className, icon } = props; // ดึง icon ออกมาตรงๆ

  const icons: { [index: string]: React.ReactElement } = {
    // 1: รออนุมัติ / ตรวจสอบสลิป
    1: <NewReleasesIcon />, 
    // 2: จ่ายเงินแล้ว / รอคิว
    2: <PendingActionsIcon />, 
    // 3: กำลังปรุง
    3: <RestaurantIcon />, 
    // 4: พร้อมรับ (แจ้งเตือน)
    4: <NotificationsActiveIcon />, 
    // 5: สำเร็จ / จบงาน
    5: <CelebrationIcon />, 
  };

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {icons[String(icon)]}
    </ColorlibStepIconRoot>
  );
}