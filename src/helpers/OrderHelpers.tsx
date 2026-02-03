import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import SoupKitchenIcon from "@mui/icons-material/SoupKitchen";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { Sd } from "./SD";

// --- Status Helpers ---

export const getStatusStep = (status: string) => {
  switch (status) {
    case Sd.Status_PendingPayment:
    case Sd.Status_Approved: // ✅ เพิ่มตรงนี้ (เข้าระบบแล้ว รอคิว)
    case Sd.Status_Paid: 
      return 0; // ขั้นตอนที่ 1: รับออเดอร์/ชำระเงิน
    case Sd.Status_Preparing: 
      return 1; // ขั้นตอนที่ 2: กำลังทำ
    case Sd.Status_Ready: 
      return 2; // ขั้นตอนที่ 3: เสร็จแล้ว
    case Sd.Status_Completed: 
      return 4; // ขั้นตอนที่ 4: จบงาน (3 คือ index, 4 อาจจะเป็นค่า step active)
    case Sd.Status_Cancelled: 
      return -1;
    default: 
      return 0;
  }
};

export const getStatusConfig = (status: string) => {
  switch (status) {
    case Sd.Status_PendingPayment:
      return { color: "warning", label: "รอชำระเงิน", bg: "#FFF3E0", text: "#E65100", iconColor: "#FB8C00" };
    
    // ✅ เพิ่ม Status_Approved
    case Sd.Status_Approved:
      // ใช้สี Info (ฟ้า) หรือ Success (เขียว) ก็ได้ เพื่อสื่อว่าผ่านแล้ว
      return { color: "info", label: "รับออเดอร์แล้ว", bg: "#E3F2FD", text: "#0277BD", iconColor: "#0288D1" };

    case Sd.Status_Paid:
      return { color: "success", label: "ชำระเงินแล้ว", bg: "#E8F5E9", text: "#1B5E20", iconColor: "#2E7D32" }; // ปรับ Paid เป็นสีเขียวจะดูดีกว่า (เดิมเป็น Info)

    case Sd.Status_Preparing:
      return { color: "secondary", label: "กำลังปรุงอาหาร", bg: "#F3E5F5", text: "#4A148C", iconColor: "#9C27B0" };
    case Sd.Status_Ready:
      return { color: "success", label: "อาหารเสร็จแล้ว!", bg: "#E8F5E9", text: "#1B5E20", iconColor: "#2E7D32" };
    case Sd.Status_Completed:
      return { color: "primary", label: "รับสินค้าแล้ว", bg: "#E0F7FA", text: "#006064", iconColor: "#00BCD4" };
    case Sd.Status_Cancelled:
      return { color: "error", label: "ยกเลิก", bg: "#FFEBEE", text: "#B71C1C", iconColor: "#D32F2F" };
    default:
      return { color: "primary", label: "รับออเดอร์แล้ว", bg: "#E3F2FD", text: "#0D47A1", iconColor: "#1976D2" };
  }
};

export const getItemStatusConfig = (status: string) => {
  switch (status) {
    // ✅ เพิ่ม KDS_None (สถานะเริ่มต้น)
    case Sd.KDS_None:
       return { label: "รอยืนยัน", color: "default", border: "#eeeeee", text: "#9e9e9e", icon: <HourglassEmptyIcon fontSize="inherit" />, canCancel: true };

    case Sd.KDS_Waiting:
      return { label: "รอคิว", color: "default", border: "#bdbdbd", text: "#757575", icon: <HourglassEmptyIcon fontSize="inherit" />, canCancel: true };
    case Sd.KDS_Cooking:
      return { label: "กำลังทำ", color: "warning", border: "#FF9800", text: "#EF6C00", icon: <SoupKitchenIcon fontSize="inherit" />, canCancel: false };
    case Sd.KDS_Done:
      return { label: "เสร็จแล้ว", color: "success", border: "#4CAF50", text: "#2E7D32", icon: <CheckCircleIcon fontSize="inherit" />, canCancel: false };
    case Sd.KDS_Cancelled:
      return { label: "ยกเลิก", color: "error", border: "#EF5350", text: "#C62828", icon: <CancelIcon fontSize="inherit" />, canCancel: false };
    default:
      return { label: "รอยืนยัน", color: "default", border: "#bdbdbd", text: "#757575", icon: <HourglassEmptyIcon fontSize="inherit" />, canCancel: true };
  }
};