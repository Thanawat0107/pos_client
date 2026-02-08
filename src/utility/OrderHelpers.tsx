import StorefrontIcon from "@mui/icons-material/Storefront";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import SoupKitchenIcon from "@mui/icons-material/SoupKitchen";
import CancelIcon from "@mui/icons-material/Cancel";
import NewReleasesIcon from '@mui/icons-material/NewReleases'; // เพิ่มไอคอนใหม่
import { Sd } from "../helpers/SD";
import type { JSX } from "react";

type ChipColor = "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";

interface StatusResult {
  color: ChipColor;
  label: string;
  bg: string;
  text: string;
  iconColor: string;
  icon: JSX.Element;
}

// ==========================================
// 1. Get Status Configuration (สี, ข้อความ, พื้นหลัง)
// ใช้สำหรับ: Badge, Card Header, Status Label
// ==========================================
export const getStatusConfig = (status: string): StatusResult => {  switch (status) {
    // 🟡 Pending: รออนุมัติ (สำคัญมากสำหรับ Admin)
    case Sd.Status_Pending:
      return { 
        color: "warning", 
        label: "รออนุมัติ", 
        bg: "#FFF3E0", // ส้มอ่อน
        text: "#E65100", // ส้มเข้ม
        iconColor: "#EF6C00",
        icon: <NewReleasesIcon fontSize="small" />
      };

    // 💰 PendingPayment: รอจ่ายเงิน
    case Sd.Status_PendingPayment:
      return { 
        color: "error", // ปรับเป็น Error/Warning เพื่อเร่งลูกค้า
        label: "รอชำระเงิน", 
        bg: "#FFEBEE", // แดงอ่อน
        text: "#C62828", // แดงเข้ม
        iconColor: "#D32F2F",
        icon: <QrCodeScannerIcon fontSize="small" />
      };

    // 🟢 Approved: รับออเดอร์แล้ว (แต่ยังไม่ทำ หรือรอคิว)
    case Sd.Status_Approved:
      return { 
        color: "info", 
        label: "รับออเดอร์แล้ว", 
        bg: "#E3F2FD", // ฟ้าอ่อน
        text: "#0277BD", 
        iconColor: "#0288D1",
        icon: <StorefrontIcon fontSize="small" />
      };

    // 💵 Paid: จ่ายแล้ว (รอคิวเหมือนกัน)
    case Sd.Status_Paid:
      return { 
        color: "success", // หรือใช้ Info ก็ได้
        label: "ชำระเงินแล้ว", 
        bg: "#E8F5E9", 
        text: "#1B5E20", 
        iconColor: "#2E7D32",
        icon: <PendingActionsIcon fontSize="small" />
      };

    // 👨‍🍳 Preparing: กำลังทำ
    case Sd.Status_Preparing:
      return { 
        color: "secondary", 
        label: "กำลังปรุง", 
        bg: "#F3E5F5", 
        text: "#4A148C", 
        iconColor: "#9C27B0",
        icon: <RestaurantIcon fontSize="small" />
      };

    // ✅ Ready: เสร็จแล้ว
    case Sd.Status_Ready:
      return { 
        color: "success", 
        label: "พร้อมเสิร์ฟ", 
        bg: "#E8F5E9", 
        text: "#1B5E20", 
        iconColor: "#2E7D32",
        icon: <CheckCircleIcon fontSize="small" />
      };

    // 🏁 Completed: จบ
    case Sd.Status_Completed:
      return { 
        color: "primary", 
        label: "เรียบร้อย", 
        bg: "#E0F7FA", 
        text: "#006064", 
        iconColor: "#00BCD4",
        icon: <CheckCircleIcon fontSize="small" />
      };

    // ❌ Cancelled: ยกเลิก
    case Sd.Status_Cancelled:
      return { 
        color: "default", 
        label: "ยกเลิก", 
        bg: "#F5F5F5", 
        text: "#616161", 
        iconColor: "#757575",
        icon: <CancelIcon fontSize="small" />
      };

    default:
      return { 
        color: "default", 
        label: "สถานะ", 
        bg: "#F5F5F5", 
        text: "#000", 
        iconColor: "#000",
        icon: <StorefrontIcon fontSize="small" />
      };
  }
};

// ==========================================
// 2. Get Stepper Index (สำหรับ Progress Bar)
// ==========================================
export const getStatusStep = (status: string) => {
  switch (status) {
    case Sd.Status_Pending:
    case Sd.Status_PendingPayment:
      return 0; // Step 1: สั่งซื้อ/รออนุมัติ
      
    case Sd.Status_Approved: 
    case Sd.Status_Paid: 
      return 1; // Step 2: รับเรื่องแล้ว/รอคิว
      
    case Sd.Status_Preparing: 
      return 2; // Step 3: กำลังทำ
      
    case Sd.Status_Ready: 
      return 3; // Step 4: เสร็จแล้วรอรับ
      
    case Sd.Status_Completed: 
      return 4; // Step 5: จบ
      
    case Sd.Status_Cancelled: 
      return -1;
      
    default: 
      return 0;
  }
};

// ==========================================
// 3. Get Kitchen Item Status (สำหรับรายการอาหารย่อย)
// ==========================================
export const getItemStatusConfig = (status: string) => {
  switch (status) {
    case Sd.KDS_None:
       return { 
         label: "รอยืนยัน", 
         color: "default", 
         bg: "#fafafa",
         border: "#eeeeee", 
         text: "#9e9e9e", 
         icon: <HourglassEmptyIcon fontSize="inherit" /> 
       };

    case Sd.KDS_Waiting:
      return { 
        label: "รอคิว", 
        color: "info", 
        bg: "#E1F5FE",
        border: "#B3E5FC", 
        text: "#0277BD", 
        icon: <HourglassEmptyIcon fontSize="inherit" /> 
      };

    case Sd.KDS_Cooking:
      return { 
        label: "กำลังทำ", 
        color: "warning", 
        bg: "#FFF3E0",
        border: "#FFCC80", 
        text: "#EF6C00", 
        icon: <SoupKitchenIcon fontSize="inherit" /> 
      };

    case Sd.KDS_Done:
      return { 
        label: "เสร็จแล้ว", 
        color: "success", 
        bg: "#E8F5E9",
        border: "#A5D6A7", 
        text: "#2E7D32", 
        icon: <CheckCircleIcon fontSize="inherit" /> 
      };

    case Sd.KDS_Cancelled:
      return { 
        label: "ยกเลิก", 
        color: "error", 
        bg: "#FFEBEE",
        border: "#EF9A9A", 
        text: "#C62828", 
        icon: <CancelIcon fontSize="inherit" /> 
      };

    default:
      return { label: "-", color: "default", border: "#bdbdbd", text: "#757575" };
  }
};