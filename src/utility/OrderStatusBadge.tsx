import { Chip } from "@mui/material";
import { getStatusConfig } from "./OrderHelpers";

export default function OrderStatusBadge({ status }: { status: string }) {
  // ดึงค่า Config จาก Helper
  const config = getStatusConfig(status);

  return (
    <Chip 
      label={config.label} 
      color={config.color} // warning, success, info, etc.
      size="small" 
      icon={config.icon}   // ใส่ไอคอนสวยๆ เข้าไปเลย
      sx={{ 
        fontWeight: 'bold', 
        minWidth: 100,
        // ถ้าอยากได้ Custom Color เพิ่มเติมจาก theme MUI
        // bgcolor: config.bg,
        // color: config.text,
      }} 
      variant={config.color === "warning" ? "filled" : "outlined"} 
    />
  );
}