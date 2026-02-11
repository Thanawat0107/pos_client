import { Chip } from "@mui/material";
import { getStatusConfig } from "./OrderHelpers";

export default function OrderStatusBadge({ status }: { status: string }) {
  const config = getStatusConfig(status);

  return (
    <Chip 
      label={config.label} 
      size="small" 
      icon={config.icon}
      sx={{ 
        fontWeight: '800', 
        minWidth: 110,
        bgcolor: config.bg,    // ✅ ใช้สีพื้นหลังที่ตั้งไว้
        color: config.text,     // ✅ ใช้สีข้อความที่ตั้งไว้
        border: `1px solid ${config.text}20`, // เพิ่มเส้นขอบจางๆ
        ".MuiChip-icon": { color: config.text }
      }} 
    />
  );
}