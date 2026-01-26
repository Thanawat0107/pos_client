/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  Box, Container, Grid, Typography, TextField, Card, Stack,
  Button, Divider, RadioGroup, FormControlLabel, Radio,
  InputAdornment, Paper, CircularProgress, Alert
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PaymentIcon from "@mui/icons-material/Payment";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/useAppHookState";
import { useConfirmCartMutation } from "../services/orderApi";
import { clearLocalCart } from "../stores/slices/shoppingSlice";

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cartItems, totalAmount } = useAppSelector((state) => state.shoppingCart);

  // 1. States สำหรับข้อมูลลูกค้าและระบบ Validation
  const [customer, setCustomer] = useState({ name: "", phone: "", note: "" });
  const [errors, setErrors] = useState({ name: false, phone: false });
  const [promoCode, setPromoCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  // เพิ่ม state เพื่อเช็คว่าเรากำลังส่งข้อมูลหรือไม่
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🚩 แก้ไข useEffect ส่วนนี้
  useEffect(() => {
    // ถ้าตะกร้าว่าง และ ไม่ได้อยู่ในขั้นตอนส่งคำสั่งซื้อ ถึงค่อยดีดกลับหน้าแรก
    if (cartItems.length === 0 && !isSubmitting) {
      navigate("/");
    }
  }, [cartItems, navigate, isSubmitting]);

  const [confirmCart, { isLoading }] = useConfirmCartMutation();

  // 3. ฟังก์ชันตรวจสอบความถูกต้องของฟอร์ม (Validation Logic)
  const validateForm = () => {
    const newErrors = {
      name: !customer.name.trim(),
      phone: !customer.phone.trim() || customer.phone.length < 10,
    };
    setErrors(newErrors);
    return !newErrors.name && !newErrors.phone;
  };

  const handleConfirmOrder = async () => {
    if (!validateForm()) return;

    const token = localStorage.getItem("cartToken");
    if (!token) return navigate("/");

    setIsSubmitting(true);

    // อย่าลืมประกาศ payload ตรงนี้ครับ
    const payload = {
      cartToken: token,
      guestToken: token,
      customerName: customer.name.trim(),
      customerPhone: customer.phone.trim(),
      customerNote: customer.note.trim(),
      promoCode: promoCode.trim(),
      paymentMethod: paymentMethod,
    };
    try {
      const result = await confirmCart(payload).unwrap();
      const id = result.id;

      if (id) {
        // 1. ไปหน้า Success
        navigate(`/order-success/${id}`, { replace: true });

        // 2. เคลียร์ข้อมูล (ตอนนี้ useEffect จะไม่ทำงานแล้วเพราะหน้าจอกำลังจะเปลี่ยนไป)
        dispatch(clearLocalCart());
        localStorage.removeItem("cartToken");
      }
    } catch (err: any) {
      setIsSubmitting(false); // 🚩 ถ้า Error ให้ปลดล็อคเพื่อให้หน้า Checkout ยังทำงานปกติ
      console.error("Checkout Error:", err);
      alert(err.data?.message || "การสั่งซื้อล้มเหลว");
    }
  };

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh", py: { xs: 2, md: 5 } }}>
      <Container maxWidth="lg">
        {/* Navigation */}
        <Button
          startIcon={<ChevronLeftIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3, fontWeight: 700 }}
        >
          แก้ไขรายการในตะกร้า
        </Button>

        <Grid container spacing={4}>
          {/* ฝั่งซ้าย: ฟอร์มกรอกข้อมูล */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={3}>
              {/* ส่วนที่ 1: ข้อมูลผู้ติดต่อ */}
              <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PersonOutlineIcon color="primary" /> ข้อมูลผู้สั่งซื้อ
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth label="ชื่อผู้รับ"
                      value={customer.name}
                      error={errors.name}
                      helperText={errors.name ? "กรุณากรอกชื่อผู้รับ" : ""}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth label="เบอร์โทรศัพท์"
                      value={customer.phone}
                      error={errors.phone}
                      helperText={errors.phone ? "กรุณากรอกเบอร์โทร 10 หลัก" : ""}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value.replace(/\D/g, '') })}
                      inputProps={{ maxLength: 10 }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth multiline rows={2} label="หมายเหตุถึงร้านค้า (ถ้ามี)"
                      placeholder="เช่น ไม่เผ็ดมาก, แพ้ถั่ว..."
                      value={customer.note}
                      onChange={(e) => setCustomer({ ...customer, note: e.target.value })}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* ส่วนที่ 2: วิธีรับสินค้า */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <StorefrontIcon color="primary" /> การรับสินค้า
                </Typography>
                <Alert severity="info" sx={{ borderRadius: 2, bgcolor: "primary.50" }}>
                  <Typography variant="subtitle2" fontWeight={800}>รับที่หน้าร้าน (Pick up)</Typography>
                  กรุณามารับที่เคาน์เตอร์หลังจากออเดอร์เปลี่ยนสถานะเป็น "พร้อมรับ"
                </Alert>
              </Paper>

              {/* ส่วนที่ 3: ช่องทางจ่ายเงิน */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PaymentIcon color="primary" /> วิธีการชำระเงิน
                </Typography>
                <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <FormControlLabel
                    value="Cash"
                    control={<Radio />}
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Typography fontWeight={700}>ชำระเงินที่ร้าน</Typography>
                        <Typography variant="caption" color="text.secondary">จ่ายเงินสดหรือสแกนที่เคาน์เตอร์เมื่อรับของ</Typography>
                      </Box>
                    }
                    sx={{ mb: 1, p: 2, border: '1px solid #eee', borderRadius: 2, width: "100%", ml: 0 }}
                  />
                  <FormControlLabel
                    value="PromptPay"
                    control={<Radio />}
                    label={<Typography fontWeight={700} sx={{ ml: 1 }}>โอนผ่านพร้อมเพย์ (QR Code)</Typography>}
                    sx={{ p: 2, border: '1px solid #eee', borderRadius: 2, width: "100%", ml: 0 }}
                  />
                </RadioGroup>
              </Paper>
            </Stack>
          </Grid>

          {/* ฝั่งขวา: สรุปยอดเงิน */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ p: 3, borderRadius: 4, position: "sticky", top: 24, border: "1px solid #eee" }}>
              <Typography variant="h6" fontWeight={800} gutterBottom>สรุปคำสั่งซื้อ</Typography>
              
              <Stack spacing={2} sx={{ my: 3, maxHeight: "35vh", overflowY: "auto", pr: 1 }}>
                {cartItems.map((item) => (
                  <Stack key={item.id} direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="body2" sx={{ flex: 1, pr: 2 }}>
                      <Box component="span" fontWeight={800} color="primary.main">{item.quantity}x</Box> {item.menuItemName}
                      <Typography variant="caption" display="block" color="text.secondary">
                        {item.options?.map((o) => o.optionValueName).join(", ")}
                      </Typography>
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>฿{(item.price * item.quantity).toLocaleString()}</Typography>
                  </Stack>
                ))}
              </Stack>

              <Divider sx={{ mb: 2.5 }} />

              <TextField
                fullWidth size="small" placeholder="โค้ดส่วนลด"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LocalOfferIcon fontSize="small" /></InputAdornment>,
                  endAdornment: <Button variant="text" sx={{ fontWeight: 800 }}>ใช้โค้ด</Button>
                }}
              />

              <Stack spacing={1.5} sx={{ mb: 4 }}>
                <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">ยอดรวม</Typography><Typography fontWeight={700}>฿{totalAmount.toLocaleString()}</Typography></Stack>
                <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">ส่วนลด</Typography><Typography fontWeight={700} color="error">- ฿0</Typography></Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h6" fontWeight={800}>ยอดรวมทั้งสิ้น</Typography>
                  <Typography variant="h5" fontWeight={900} color="primary.main">
                    ฿{totalAmount.toLocaleString()}
                  </Typography>
                </Stack>
              </Stack>

              <Button
                fullWidth variant="contained" size="large"
                sx={{ borderRadius: 3, py: 2, fontSize: "1.1rem", fontWeight: 800, boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}
                onClick={handleConfirmOrder}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={26} color="inherit" /> : `สั่งซื้อสินค้า • ฿${totalAmount.toLocaleString()}`}
              </Button>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}