import { keyframes } from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import { Sd } from "../helpers/SD";

// Animation
export const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(46, 125, 50, 0); }
  100% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0); }
`;

// Status Helper
export const getStatusInfo = (status: string) => {
  switch (status) {
    case Sd.Status_PendingPayment:
      return {
        color: "#E65100",
        label: "รอชำระเงิน",
        icon: <QrCodeScannerIcon fontSize="small" />,
      };
    case Sd.Status_Paid:
      return {
        color: "#1565C0",
        label: "รอคิว",
        icon: <PendingActionsIcon fontSize="small" />,
      };
    case Sd.Status_Preparing:
      return {
        color: "#7B1FA2",
        label: "กำลังปรุง",
        icon: <RestaurantIcon fontSize="small" />,
      };
    case Sd.Status_Ready:
      return {
        color: "#2E7D32",
        label: "เสร็จแล้ว!",
        icon: <CheckCircleIcon fontSize="small" />,
      };
    default:
      return {
        color: "grey",
        label: "ดำเนินการ",
        icon: <StorefrontIcon fontSize="small" />,
      };
  }
};