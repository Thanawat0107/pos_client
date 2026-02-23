import { keyframes } from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Sd } from "../helpers/SD";

// ✅ 1. เพิ่ม Animation หลายสี (แดงสำหรับจ่ายเงิน / เขียวสำหรับของเสร็จ)
export const pulseGreen = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(46, 125, 50, 0); }
  100% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0); }
`;

export const pulseOrange = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(230, 81, 0, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(230, 81, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(230, 81, 0, 0); }
`;

// ✅ 2. ปรับปรุง Status Helper ให้ครอบคลุมทุกสถานะ Business Logic
export const getStatusInfo = (status: string) => {
  switch (status) {
    // 🟠 รออนุมัติ (ออเดอร์เงินสด < 200)
    case Sd.Status_Pending:
      return {
        color: "#EF6C00", // ส้มเข้ม
        label: "รอร้านอนุมัติ",
        icon: <NewReleasesIcon fontSize="small" />,
        animation: pulseOrange,
      };

    // 🔴 รอชำระเงิน (PromptPay หรือ ยอดสูง)
    case Sd.Status_PendingPayment:
      return {
        color: "#D32F2F", // แดง
        label: "รอชำระเงิน",
        icon: <QrCodeScannerIcon fontSize="small" />,
        animation: pulseOrange,
      };

    // 🔵 รับออเดอร์แล้ว / จ่ายแล้ว (รอเข้าคิวปรุง)
    case Sd.Status_Approved:
    case Sd.Status_Paid:
      return {
        color: "#1976D2", // น้ำเงิน
        label: "รอคิวปรุง",
        icon: <PendingActionsIcon fontSize="small" />,
      };

    // 🟣 กำลังปรุง
    case Sd.Status_Preparing:
      return {
        color: "#7B1FA2", // ม่วง
        label: "กำลังปรุงอาหาร",
        icon: <RestaurantIcon fontSize="small" />,
      };

    // 🟢 เสร็จแล้ว (พร้อมเสิร์ฟ)
    case Sd.Status_Ready:
      return {
        color: "#2E7D32", // เขียว
        label: "อาหารเสร็จแล้ว!",
        icon: <CheckCircleIcon fontSize="small" />,
        animation: pulseGreen, // ให้กระพริบเตือนว่าของเสร็จแล้ว
      };

    // ⚪ ยกเลิก
    case Sd.Status_Cancelled:
      return {
        color: "#757575", // เทา
        label: "ยกเลิกแล้ว",
        icon: <ErrorOutlineIcon fontSize="small" />,
      };

    default:
      return {
        color: "#9E9E9E",
        label: "ดำเนินการ",
        icon: <StorefrontIcon fontSize="small" />,
      };
  }
};

// ─── Thai date/time helpers (timezone-safe) ────────────────────────────────
const TH_TZ = "Asia/Bangkok";

/** วันที่ภาษาไทย — default: "22 ก.พ. 2569" */
export const formatThaiDate = (
  date: string | Date,
  options: Omit<Intl.DateTimeFormatOptions, "timeZone"> = {
    day: "numeric",
    month: "short",
    year: "numeric",
  },
): string =>
  new Date(date).toLocaleDateString("th-TH", { timeZone: TH_TZ, ...options });

/** เวลาภาษาไทย — default: "14:27" */
export const formatThaiTime = (
  date: string | Date,
  options: Omit<Intl.DateTimeFormatOptions, "timeZone"> = {
    hour: "2-digit",
    minute: "2-digit",
  },
): string =>
  new Date(date).toLocaleTimeString("th-TH", { timeZone: TH_TZ, ...options });

/** วัน + เวลาเต็ม — "22 ก.พ. 2569 14:27 น." */
export const formatThaiDateTime = (date: string | Date): string =>
  `${formatThaiDate(date)} ${formatThaiTime(date)} น.`;