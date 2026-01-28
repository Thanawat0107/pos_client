import { Box, Card, Grid, Typography, Chip, Stack, Divider, Avatar } from "@mui/material";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import EditNoteIcon from "@mui/icons-material/EditNote";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SoupKitchenIcon from "@mui/icons-material/SoupKitchen";
import CancelIcon from "@mui/icons-material/Cancel";
import type { OrderDetails } from "../../@types/dto/OrderDetails";

interface OrderItemCardProps {
  item: OrderDetails;
}

export default function OrderItemCard({ item }: OrderItemCardProps) {
  // Helper สำหรับเลือกสีสถานะ
  const getStatusChip = (status: string) => {
    switch (status) {
      case "WAITING":
        return <Chip icon={<AccessTimeIcon />} label="รอคิว" size="small" color="default" variant="outlined" />;
      case "COOKING":
        return <Chip icon={<SoupKitchenIcon />} label="กำลังปรุง" size="small" color="warning" />;
      case "DONE":
        return <Chip icon={<CheckCircleIcon />} label="เสร็จแล้ว" size="small" color="success" />;
      case "CANCELLED":
        return <Chip icon={<CancelIcon />} label="ยกเลิก" size="small" color="error" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Card sx={{ p: 2, mb: 2, borderRadius: 3, border: "1px solid #f0f0f0", boxShadow: "none" }}>
      <Grid container spacing={2}>
        
        {/* 1. ส่วนรูปภาพเมนู */}
        <Grid item xs={3} sm={2} display="flex" alignItems="start" justifyContent="center">
          {item.menuItemImage ? (
            <Box
              component="img"
              src={item.menuItemImage}
              alt={item.menuItemName}
              sx={{
                width: "100%",
                aspectRatio: "1/1",
                objectFit: "cover",
                borderRadius: 2,
              }}
            />
          ) : (
            <Avatar variant="rounded" sx={{ width: "100%", height: "auto", aspectRatio: "1/1", bgcolor: "#f5f5f5" }}>
              <RestaurantMenuIcon sx={{ color: "#bdbdbd" }} />
            </Avatar>
          )}
        </Grid>

        {/* 2. รายละเอียดชื่อและ Options */}
        <Grid item xs={9} sm={7}>
          <Stack spacing={0.5}>
            {/* ชื่อเมนู และ จำนวน */}
            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
              <Box component="span" sx={{ color: "primary.main", mr: 1 }}>
                {item.quantity}x
              </Box>
              {item.menuItemName}
            </Typography>

            {/* แสดงสถานะครัว (เฉพาะกรณี Tracking) */}
            <Box sx={{ mt: 0.5 }}>
                {getStatusChip(item.kitchenStatus)}
            </Box>

            {/* รายการตัวเลือกเสริม (Options) */}
            {item.orderDetailOptions && item.orderDetailOptions.length > 0 && (
              <Box sx={{ mt: 1, pl: 1, borderLeft: "2px solid #eee" }}>
                {item.orderDetailOptions.map((opt) => (
                  <Typography key={opt.id} variant="caption" display="block" color="text.secondary">
                    • {opt.optionValueName} 
                    {opt.extraPrice > 0 && ` (+฿${opt.extraPrice})`}
                    {opt.quantity > 1 && ` (x${opt.quantity})`}
                  </Typography>
                ))}
              </Box>
            )}

            {/* หมายเหตุ (Note) */}
            {item.note && (
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1, color: "error.main" }}>
                <EditNoteIcon fontSize="small" />
                <Typography variant="caption" fontWeight={600}>
                  "{item.note}"
                </Typography>
              </Stack>
            )}
          </Stack>
        </Grid>

        {/* 3. ราคารวมของรายการนี้ */}
        <Grid item xs={12} sm={3} sx={{ display: "flex", flexDirection: "column", alignItems: { xs: "flex-end", sm: "flex-end" }, justifyContent: "flex-start" }}>
           {/* แสดงราคาต่อหน่วย (ถ้ามี Options หรือจำนวน > 1 จะได้ไม่งง) */}
           {(item.quantity > 1 || item.extraPrice > 0) && (
              <Typography variant="caption" color="text.secondary">
                ฿{(item.unitPrice + item.extraPrice).toLocaleString()} / ชิ้น
              </Typography>
           )}
           
           {/* ราคารวมบรรทัดนี้ */}
           <Typography variant="h6" fontWeight={700} color="text.primary">
             ฿{item.totalPrice.toLocaleString()}
           </Typography>
        </Grid>

      </Grid>
    </Card>
  );
}