/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Card,
  Typography,
  Stack,
  Box,
  Divider,
  TextField,
  InputAdornment,
  Button,
  CircularProgress,
} from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import PaymentIcon from "@mui/icons-material/Payment";

interface OrderSummaryProps {
  cartItems: any[];
  totalAmount: number;
  appliedDiscount: number;
  finalTotal: number;
  promoCode: string;
  setPromoCode: (code: string) => void;
  setAppliedDiscount: (discount: number) => void;
  handleApplyPromo: () => void;
  isVerifying: boolean;
  promoMessage: { text: string; type: string };
  handleConfirmOrder: () => void;
  isConfirming: boolean;
  paymentMethod: string; // ✅ [เพิ่มใหม่] รับค่า Payment Method
}

export default function OrderSummary({
  cartItems,
  totalAmount,
  appliedDiscount,
  finalTotal,
  promoCode,
  setPromoCode,
  setAppliedDiscount,
  handleApplyPromo,
  isVerifying,
  promoMessage,
  handleConfirmOrder,
  isConfirming,
  paymentMethod, // ✅
}: OrderSummaryProps) {
    
  const calculateItemTotal = (item: any) => (item.price || 0) * item.quantity;

  // ✅ Logic เลือกข้อความบนปุ่ม
  const getButtonLabel = () => {
    if (isConfirming) return "";
    
    // ถ้าเลือกจ่ายเงินสด -> ยืนยันคำสั่งซื้อ
    if (paymentMethod === "cash") {
        return `ยืนยันคำสั่งซื้อ • ฿${finalTotal.toLocaleString()}`;
    }
    
    // ถ้าเลือกโอน/QR -> ชำระเงิน
    return `ชำระเงิน • ฿${finalTotal.toLocaleString()}`;
  };

  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 4,
        position: "sticky",
        top: 24,
        border: "1px solid #eee",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)" // เพิ่มเงาให้นูนสวยขึ้นนิดนึง
      }}
    >
      <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ShoppingBagIcon color="primary" /> สรุปคำสั่งซื้อ
      </Typography>

      <Stack
        spacing={2}
        sx={{ 
            my: 3, 
            maxHeight: "45vh", 
            overflowY: "auto", 
            pr: 1,
            // ปรับ Scrollbar ให้สวยงาม (Webkit)
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-track": { background: "#f1f1f1", borderRadius: "10px" },
            "&::-webkit-scrollbar-thumb": { background: "#ccc", borderRadius: "10px" },
            "&::-webkit-scrollbar-thumb:hover": { background: "#aaa" }
        }}
      >
        {cartItems.map((item) => (
          <Box
            key={item.id}
            sx={{
              display: "flex",
              gap: 2,
              mb: 2,
              pb: 2,
              borderBottom: "1px dashed #eee",
              "&:last-child": { borderBottom: "none", mb: 0, pb: 0 },
            }}
          >
            <Box
              component="img"
              src={
                item.menuItemImage ||
                "https://placehold.co/100x100?text=No+Image"
              }
              sx={{
                width: 70,
                height: 70,
                borderRadius: 2,
                objectFit: "cover",
                bgcolor: "#f0f0f0",
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    lineHeight={1.3}
                    sx={{ mb: 0.5 }}
                  >
                    <Box
                      component="span"
                      sx={{
                        color: "primary.main",
                        mr: 1,
                        bgcolor: "#e3f2fd",
                        px: 0.8,
                        py: 0.2,
                        borderRadius: 1,
                        fontSize: "0.85em",
                      }}
                    >
                      {item.quantity}x
                    </Box>
                    {item.menuItemName}
                  </Typography>
                  {item.options?.map((opt: any, i: number) => (
                    <Typography
                      key={i}
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block" }}
                    >
                      • {opt.optionValueName}{" "}
                      {opt.extraPrice > 0 && `(+฿${opt.extraPrice})`}
                    </Typography>
                  ))}
                  {item.note && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ display: "block" }}
                    >
                      * {item.note}
                    </Typography>
                  )}
                </Box>
                <Typography variant="body2" fontWeight={700}>
                  ฿{calculateItemTotal(item).toLocaleString()}
                </Typography>
              </Stack>
            </Box>
          </Box>
        ))}
      </Stack>

      <Divider sx={{ mb: 2.5 }} />

      {/* Promo Code Input */}
      <TextField
        fullWidth
        size="small"
        placeholder="โค้ดส่วนลด"
        value={promoCode}
        onChange={(e) => {
          setPromoCode(e.target.value);
          if (appliedDiscount > 0) setAppliedDiscount(0);
        }}
        error={
          promoMessage.text !== "" && promoMessage.type === "error"
        }
        helperText={promoMessage.text}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LocalOfferIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
          endAdornment: (
            <Button
              variant="text"
              onClick={handleApplyPromo}
              disabled={isVerifying || !promoCode.trim()}
              sx={{ fontWeight: 700 }}
            >
              {isVerifying ? (
                <CircularProgress size={20} />
              ) : (
                "ใช้โค้ด"
              )}
            </Button>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {/* Total Calculation */}
      <Stack spacing={1.5} sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between">
          <Typography color="text.secondary">ยอดรวม</Typography>
          <Typography fontWeight={700}>
            ฿{totalAmount.toLocaleString()}
          </Typography>
        </Stack>
        {appliedDiscount > 0 && (
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">ส่วนลด</Typography>
            <Typography fontWeight={700} color="error">
              - ฿{appliedDiscount.toLocaleString()}
            </Typography>
          </Stack>
        )}
        <Divider />
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={800}>
            ยอดรวมทั้งสิ้น
          </Typography>
          <Typography
            variant="h5"
            fontWeight={900}
            color="primary.main"
          >
            ฿{finalTotal.toLocaleString()}
          </Typography>
        </Stack>
      </Stack>

      <Button
        fullWidth
        variant="contained"
        size="large"
        sx={{ 
            borderRadius: 3, 
            py: 1.5, 
            fontWeight: 800,
            fontSize: '1.1rem',
            boxShadow: '0 8px 16px rgba(25, 118, 210, 0.24)'
        }}
        onClick={handleConfirmOrder}
        disabled={isConfirming || cartItems.length === 0} // ✅ ป้องกันการกดเมื่อตะกร้าว่าง
        startIcon={!isConfirming && (paymentMethod === "cash" ? <ShoppingBagIcon/> : <PaymentIcon/>)}
      >
        {isConfirming ? (
          <CircularProgress size={26} color="inherit" />
        ) : (
           getButtonLabel()
        )}
      </Button>
    </Card>
  );
}