/* eslint-disable @typescript-eslint/no-explicit-any */
import { Paper, Box, Stack, Typography, IconButton, Chip, Grid, Avatar, Button, Divider, Alert } from "@mui/material";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import PrintIcon from "@mui/icons-material/Print";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { getItemStatusConfig } from "../../helpers/OrderHelpers";

interface Props {
  orderDetails: any[];
  subTotal: number;
  discount: number;
  total: number;
  appliedPromoCode?: string;
  canCancel: boolean; // ✅ ตัวแปรสำคัญ: ควบคุมว่าออเดอร์นี้อนุญาตให้ยกเลิกหรือไม่ (มาจาก Parent)
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
        {orderDetails?.map((item: any, index: number) => {
          // ดึง Config ของสถานะ (เช่น สี, icon)
          const itemStatus = getItemStatusConfig(item.kitchenStatus);
          
          // ✅ Logic ใหม่: ปุ่มยกเลิกจะโชว์ก็ต่อเมื่อ 
          // 1. Parent อนุญาต (canCancel = true คือยังไม่จ่ายเงิน/รออนุมัติ)
          // 2. สถานะครัวอนุญาต (itemStatus.canCancel = true คือยังไม่เริ่มทำ)
          const showCancelButton = canCancel && itemStatus.canCancel;

          return (
            <Box key={index}>
              <Grid container spacing={2} alignItems="center" sx={{ py: 2 }}>
                <Grid>
                  <Avatar src={item.menuItemImage} variant="rounded" sx={{ width: 64, height: 64, bgcolor: "#f5f5f5" }}>
                    <RestaurantIcon color="disabled" />
                  </Avatar>
                </Grid>
                <Grid size="grow"> {/* เปลี่ยนจาก item xs เป็น size="grow" */}
                  <Typography variant="subtitle1" fontWeight={800} lineHeight={1.2}>
                    {item.quantity}x {item.menuItemName}
                  </Typography>
                  {item.orderDetailOptions?.length > 0 && (
                    <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
                      {item.orderDetailOptions.map((o: any, i: number) => (
                        <Typography key={i} variant="caption" sx={{ color: "#616161", bgcolor: "#f5f5f5", px: 0.8, py: 0.3, borderRadius: 1 }}>
                          {o.optionValueName}
                        </Typography>
                      ))}
                    </Stack>
                  )}
                  <Typography variant="subtitle2" fontWeight={700} color="primary.main" sx={{ mt: 0.5 }}>
                    ฿{item.totalPrice.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid sx={{ textAlign: "right", minWidth: 90 }}>
                  <Chip
                    label={itemStatus.label}
                    icon={itemStatus.icon}
                    size="small"
                    sx={{ fontWeight: 700, bgcolor: "transparent", border: `1px solid ${itemStatus.border}`, color: itemStatus.text }}
                  />
                  
                  {/* ✅ ปุ่มยกเลิก (Show/Hide ตาม Logic ใหม่) */}
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

        {/* ข้อความแจ้งเตือนเมื่อยกเลิกไม่ได้ */}
        {!canCancel && (
            <Alert severity="info" sx={{ mt: 2, fontSize: '0.85rem' }}>
                หากต้องการยกเลิกหรือแก้ไขรายการหลังจากชำระเงิน กรุณาติดต่อพนักงาน
            </Alert>
        )}

      </Stack>

      {/* Footer Summary */}
      <Box sx={{ p: 2.5, bgcolor: "#FAFAFA", borderTop: "2px dashed #eee" }}>
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">ยอดรวม</Typography>
            <Typography fontWeight={600}>฿{subTotal?.toLocaleString()}</Typography>
          </Stack>
          {discount > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography color="error" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <LocalOfferIcon fontSize="small" /> ส่วนลด ({appliedPromoCode})
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