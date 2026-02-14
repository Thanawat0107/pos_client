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
import PaymentIcon from "@mui/icons-material/Payment";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

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
  paymentMethod: string;
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
}: OrderSummaryProps) {
  const calculateItemTotal = (item: any) => (item.price || 0) * item.quantity;

  const getButtonLabel = () => {
    if (isConfirming) return "";
    return `สั่งซื้อและชำระเงิน • ฿${finalTotal.toLocaleString()}`;
  };

  return (
    <Card
      sx={{
        p: { xs: 2.5, sm: 3, md: 4 }, // ปรับ Padding ตามขนาดหน้าจอ
        borderRadius: 5,
        position: { md: "sticky" },
        top: { md: 24 },
        border: "1px solid #e0e0e0",
        boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
        bgcolor: "#fff",
      }}
    >
      <Typography
        variant="h5"
        fontWeight={900}
        gutterBottom
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          color: "#1a2a3a",
          mb: 3,
          fontSize: { xs: "1.25rem", sm: "1.5rem" }, // ปรับขนาดฟอนต์หัวข้อ
        }}
      >
        <ReceiptLongIcon
          color="primary"
          sx={{ fontSize: { xs: 26, sm: 30 } }}
        />{" "}
        สรุปออเดอร์
      </Typography>

      {/* รายการอาหาร */}
      <Stack
        spacing={2.5}
        sx={{
          my: 3,
          maxHeight: { xs: "none", md: "35vh" }, // มือถือให้แสดงไหลยาว คอมให้มี Scroll
          overflowY: "auto",
          pr: 1,
          "&::-webkit-scrollbar": { width: "5px" },
          "&::-webkit-scrollbar-thumb": {
            background: "#e0e0e0",
            borderRadius: "10px",
          },
        }}
      >
        {cartItems.map((item) => (
          <Box key={item.id} sx={{ display: "flex", gap: 2 }}>
            <Box
              component="img"
              src={
                item.menuItemImage || "https://placehold.co/100x100?text=Food"
              }
              sx={{
                width: { xs: 70, sm: 80 }, // ย่อขนาดรูปเล็กน้อยบนมือถือ
                height: { xs: 70, sm: 80 },
                borderRadius: 3,
                objectFit: "cover",
                border: "1px solid #f0f0f0",
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography
                fontWeight={800}
                lineHeight={1.2}
                sx={{ fontSize: { xs: "1rem", sm: "1.1rem" } }}
              >
                <Box component="span" sx={{ color: "primary.main", mr: 1 }}>
                  {item.quantity}x
                </Box>
                {item.menuItemName}
              </Typography>

              {item.options?.map((opt: any, i: number) => (
                <Typography
                  key={i}
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", fontSize: "0.85rem" }}
                >
                  + {opt.optionValueName}
                </Typography>
              ))}

              <Typography
                variant="body1"
                fontWeight={700}
                sx={{ mt: 0.5, color: "#2c3e50" }}
              >
                ฿{calculateItemTotal(item).toLocaleString()}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>

      <Divider sx={{ mb: 3, borderStyle: "dashed" }} />

      {/* ส่วนลด Promo */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="ใส่โค้ดส่วนลดที่นี่..."
          value={promoCode}
          onChange={(e) => {
            setPromoCode(e.target.value);
            if (appliedDiscount > 0) setAppliedDiscount(0);
          }}
          error={promoMessage.text !== "" && promoMessage.type === "error"}
          helperText={promoMessage.text}
          InputProps={{
            sx: {
              borderRadius: 3,
              height: { xs: "50px", sm: "55px" }, // ลดความสูงเล็กน้อย
              fontSize: { xs: "0.9rem", sm: "1rem" },
              fontWeight: 600,
            },
            startAdornment: (
              <InputAdornment position="start">
                <LocalOfferIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <Button
                onClick={handleApplyPromo}
                disabled={isVerifying || !promoCode.trim()}
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "0.85rem", sm: "0.95rem" },
                }}
              >
                {isVerifying ? <CircularProgress size={24} /> : "ใช้โค้ด"}
              </Button>
            ),
          }}
        />
      </Box>

      {/* ตารางสรุปราคา */}
      <Stack spacing={2} sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between">
          <Typography
            fontWeight={600}
            color="text.secondary"
            sx={{ fontSize: { xs: "1rem", sm: "1.1rem" } }}
          >
            ยอดรวม
          </Typography>
          <Typography
            fontWeight={700}
            sx={{ fontSize: { xs: "1rem", sm: "1.1rem" } }}
          >
            ฿{totalAmount.toLocaleString()}
          </Typography>
        </Stack>

        {appliedDiscount > 0 && (
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ bgcolor: "#fff3f3", p: 1, borderRadius: 2 }}
          >
            <Typography
              fontWeight={600}
              color="error"
              sx={{ fontSize: { xs: "1rem", sm: "1.1rem" } }}
            >
              ส่วนลด
            </Typography>
            <Typography
              fontWeight={800}
              color="error"
              sx={{ fontSize: { xs: "1rem", sm: "1.1rem" } }}
            >
              - ฿{appliedDiscount.toLocaleString()}
            </Typography>
          </Stack>
        )}

        <Box
          sx={{
            p: { xs: 1.5, sm: 2 },
            bgcolor: "#f8f9fa",
            borderRadius: 3,
            mt: 1,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              fontWeight={900}
              color="#1a2a3a"
              sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
            >
              ยอดสุทธิ
            </Typography>
            <Typography
              fontWeight={1000}
              color="primary.main"
              sx={{ fontSize: { xs: "1.75rem", sm: "2.25rem" } }}
            >
              ฿{finalTotal.toLocaleString()}
            </Typography>
          </Stack>
        </Box>
      </Stack>

      {/* ปุ่มยืนยันขนาดใหญ่ */}
      <Button
        fullWidth
        variant="contained"
        onClick={handleConfirmOrder}
        disabled={isConfirming || cartItems.length === 0}
        sx={{
          borderRadius: 4,
          py: { xs: 2, sm: 2.5 },
          fontSize: { xs: "1.05rem", sm: "1.25rem" }, // ลดขนาดฟอนต์บนปุ่มมือถือ
          fontWeight: 900,
          textTransform: "none",
          boxShadow: "0 12px 24px rgba(25, 118, 210, 0.3)",
          "&:hover": { boxShadow: "0 15px 30px rgba(25, 118, 210, 0.4)" },
        }}
        startIcon={
          !isConfirming && <PaymentIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
        }
      >
        {isConfirming ? (
          <CircularProgress size={30} color="inherit" />
        ) : (
          getButtonLabel()
        )}
      </Button>

      <Typography
        variant="caption"
        sx={{
          mt: 2,
          display: "block",
          textAlign: "center",
          color: "text.secondary",
          fontWeight: 500,
          fontSize: { xs: "0.75rem", sm: "0.85rem" },
        }}
      >
        🔒 ระบบชำระเงินมีความปลอดภัยสูง
      </Typography>
    </Card>
  );
}
