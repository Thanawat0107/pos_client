import { Paper, Box, Stack, Typography, IconButton, Chip, Grid, Avatar, Button, Divider, Alert } from "@mui/material";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import PrintIcon from "@mui/icons-material/Print";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { getItemStatusConfig } from "../../utility/OrderHelpers";
import { Sd } from "../../helpers/SD"; // อย่าลืม Import SD

// 1. ✅ สร้าง Interface ให้ตรงกับ Backend DTO
interface OrderDetailOption {
  optionGroupName: string;
  optionValueName: string;
  extraPrice: number;
}

interface OrderDetail {
  id: number;
  menuItemName: string;
  menuItemImage?: string;
  quantity: number;
  totalPrice: number;
  kitchenStatus: string;
  isCancelled: boolean; // สำคัญ: ต้องมี field นี้จาก Backend
  orderDetailOptions: OrderDetailOption[];
}

interface Props {
  orderDetails: OrderDetail[]; // เปลี่ยนจาก any[] เป็น Type ชัดเจน
  subTotal: number;
  discount: number;
  total: number;
  appliedPromoCode?: string;
  canCancel: boolean; // รับค่ามาจาก OrderSuccess (Pending/PendingPayment)
  onCancelItem: (itemId: number, itemName: string) => void;
}

export default function OrderMenuList({ orderDetails, subTotal, discount, total, appliedPromoCode, canCancel, onCancelItem }: Props) {
  return (
    <Paper sx={{ p: 0, borderRadius: 4, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", mb: 3 }}>
      {/* Header */}
      <Box sx={{ p: 2.5, bgcolor: "#fff", borderBottom: "1px solid #eee" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={800} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <LocalDiningIcon color="primary" /> รายการอาหาร
            <Chip label={`${orderDetails?.length || 0}`} size="small" sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }} />
          </Typography>
          <IconButton size="small" onClick={() => window.print()} sx={{ bgcolor: "#f5f5f5" }}>
            <PrintIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {/* Items */}
      <Stack spacing={0} sx={{ p: 2 }}>
        {orderDetails?.map((item, index) => {
          // ดึง Config ของสถานะ
          const itemStatus = getItemStatusConfig(item.kitchenStatus);
          
          // 2. ✅ Logic การยกเลิกรายจาน (ละเอียดขึ้น)
          // - ต้องได้รับอนุญาตจาก Parent (canCancel = true)
          // - รายการนั้นต้องยังไม่ถูกยกเลิก (!item.isCancelled)
          // - รายการนั้นต้องยังไม่เสร็จ และยังไม่เริ่มทำ (Waiting หรือ None เท่านั้น)
          const isItemCancelable = 
             item.kitchenStatus === Sd.KDS_Waiting || 
             item.kitchenStatus === Sd.KDS_None;

          const showCancelButton = canCancel && !item.isCancelled && isItemCancelable;

          // ถ้าถูกยกเลิก ให้ทำสีจางลง
          const opacity = item.isCancelled ? 0.5 : 1;

          return (
            <Box key={index} sx={{ opacity }}>
              <Grid container spacing={2} alignItems="center" sx={{ py: 2 }}>
                {/* รูปภาพ */}
                <Grid>
                  <Avatar src={item.menuItemImage} variant="rounded" sx={{ width: 64, height: 64, bgcolor: "#f5f5f5" }}>
                    <RestaurantIcon color="disabled" />
                  </Avatar>
                </Grid>

                {/* รายละเอียด */}
                <Grid size="grow">
                  <Typography variant="subtitle1" fontWeight={800} lineHeight={1.2} sx={{ textDecoration: item.isCancelled ? 'line-through' : 'none' }}>
                    {item.quantity}x {item.menuItemName}
                  </Typography>
                  
                  {/* ✅ แสดง Options พร้อมราคา */}
                  {item.orderDetailOptions?.length > 0 && (
                    <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
                      {item.orderDetailOptions.map((o, i) => (
                        <Chip 
                            key={i}
                            label={`${o.optionValueName} ${o.extraPrice > 0 ? `(+${o.extraPrice})` : ''}`}
                            size="small"
                            sx={{ 
                                height: 20, 
                                fontSize: '0.7rem', 
                                bgcolor: "#f5f5f5", 
                                color: "#616161",
                                '& .MuiChip-label': { px: 1 }
                            }} 
                        />
                      ))}
                    </Stack>
                  )}

                  <Typography variant="subtitle2" fontWeight={700} color="primary.main" sx={{ mt: 0.5 }}>
                    ฿{item.totalPrice.toLocaleString()}
                  </Typography>
                </Grid>

                {/* สถานะและปุ่ม */}
                <Grid sx={{ textAlign: "right", minWidth: 90 }}>
                  <Chip
                    label={itemStatus.label}
                    icon={itemStatus.icon}
                    size="small"
                    sx={{ fontWeight: 700, bgcolor: "transparent", border: `1px solid ${itemStatus.border}`, color: itemStatus.text }}
                  />
                  
                  {showCancelButton && (
                    <Button
                      size="small" color="error" variant="outlined"
                      onClick={() => onCancelItem(item.id, item.menuItemName)}
                      sx={{ fontSize: "0.7rem", py: 0.2, width: "100%", mt: 1, borderRadius: 2 }}
                    >
                      ยกเลิก
                    </Button>
                  )}
                </Grid>
              </Grid>
              {index < orderDetails.length - 1 && <Divider sx={{ borderStyle: "dashed" }} />}
            </Box>
          );
        })}

        {/* Warning Alert */}
        {!canCancel && (
            <Alert severity="info" sx={{ mt: 2, fontSize: '0.85rem', bgcolor: '#E3F2FD' }}>
                <Typography variant="caption">
                    * หากต้องการยกเลิกหรือแก้ไขรายการหลังจากร้านรับออเดอร์แล้ว กรุณาติดต่อพนักงาน
                </Typography>
            </Alert>
        )}

      </Stack>

      {/* Footer Summary (เหมือนเดิม แต่เพิ่ม Logic PromoCode) */}
      <Box sx={{ p: 2.5, bgcolor: "#FAFAFA", borderTop: "2px dashed #eee" }}>
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">ยอดรวม</Typography>
            <Typography fontWeight={600}>฿{subTotal?.toLocaleString()}</Typography>
          </Stack>
          
          {/* แสดงส่วนลดเมื่อมีค่า > 0 */}
          {discount > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography color="error" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <LocalOfferIcon fontSize="small" /> ส่วนลด {appliedPromoCode ? `(${appliedPromoCode})` : ''}
              </Typography>
              <Typography fontWeight={700} color="error">-฿{discount.toLocaleString()}</Typography>
            </Stack>
          )}
          
          <Divider />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={700} color="text.secondary">ยอดรวมสุทธิ</Typography>
            <Typography variant="h4" fontWeight={900} color="primary.main">฿{total.toLocaleString()}</Typography>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
}