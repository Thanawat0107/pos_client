/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Card,
  Stack,
  Button,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  Paper,
  CircularProgress,
  Alert,
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
import { useLazyVerifyPromoQuery } from "../services/contentApi";
import type { CreateOrder } from "../@types/createDto/CreateOrder";

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { cartItems, totalAmount } = useAppSelector(
    (state) => state.shoppingCart,
  );

  const [customer, setCustomer] = useState({ name: "", phone: "", note: "" });
  const [errors, setErrors] = useState({ name: false, phone: false });
  const [promoCode, setPromoCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const [triggerVerify, { isFetching: isVerifying }] =
    useLazyVerifyPromoQuery();
  const [confirmCart, { isLoading: isConfirming }] = useConfirmCartMutation();

  useEffect(() => {
    if (cartItems.length === 0 && !isConfirming) {
      navigate("/");
    }
  }, [cartItems, navigate, isConfirming]);

  const [promoMessage, setPromoMessage] = useState({
    text: "",
    type: "" as "success" | "error" | "",
  });

  // 2. ปรับ handleApplyPromo ให้เซ็ต Message ด้วย
  const handleApplyPromo = async () => {
    const trimmedCode = promoCode.trim();
    if (!trimmedCode) return;
    try {
      const response = await triggerVerify(trimmedCode).unwrap();
      const discount = response.result?.discountValue || 0;
      setAppliedDiscount(discount);
      setPromoMessage({ text: "ใช้รหัสส่วนลดสำเร็จ!", type: "success" });
    } catch (err: any) {
      const errorMsg = err.data?.message || "รหัสส่วนลดไม่ถูกต้อง";
      setPromoMessage({ text: errorMsg, type: "error" });
      setAppliedDiscount(0);
    }
  };

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

    const payload: CreateOrder = {
      channel: "PickUp",
      customerPhone: customer.phone.trim(),
      customerName: customer.name.trim(),
      customerNote: customer.note.trim(),
      cartToken: token,
      guestToken: token,
      promoCode: appliedDiscount > 0 ? promoCode.trim() : undefined,
      estimatedPickUpTime: new Date().toISOString(),
      orderDetails: cartItems.map((item) => ({
        menuItemId: item.menuItemId,
        menuItemName: item.menuItemName,
        unitPrice: item.price,
        quantity: item.quantity,
        note: item.note || null,
        orderDetailOptions: (item.options || []).map((opt: any) => ({
          menuOptionDetailId: opt.id,
          optionGroupName: opt.groupName,
          optionValueName: opt.valueName,
          extraPrice: opt.extraPrice,
          quantity: opt.quantity ?? 1,
        })),
      })),
    };

    try {
      const result = await confirmCart(payload).unwrap();

      if (result.id) {
        dispatch(clearLocalCart());
        localStorage.removeItem("cartToken");
        navigate(`/order-success/${result.id}`, { replace: true });
      }
    } catch (err: any) {
      console.error("Checkout Error:", err);
      alert(err.data?.message || "การสั่งซื้อล้มเหลว กรุณาลองใหม่อีกครั้ง");
    }
  };

  // คำนวณยอดสุทธิ (แสดงผลใน UI)
  const finalTotal = Math.max(0, totalAmount - appliedDiscount);

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh", py: { xs: 2, md: 5 } }}>
      <Container maxWidth="lg">
        <Button
          startIcon={<ChevronLeftIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3, fontWeight: 700 }}
        >
          แก้ไขรายการในตะกร้า
        </Button>

        <Grid container spacing={4}>
          {/* ฝั่งซ้าย: ฟอร์มข้อมูลลูกค้า (คงเดิม) */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={3}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <PersonOutlineIcon color="primary" /> ข้อมูลผู้สั่งซื้อ
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="ชื่อผู้รับ"
                      value={customer.name}
                      error={errors.name}
                      helperText={errors.name ? "กรุณากรอกชื่อผู้รับ" : ""}
                      onChange={(e) =>
                        setCustomer({ ...customer, name: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="เบอร์โทรศัพท์"
                      value={customer.phone}
                      error={errors.phone}
                      helperText={
                        errors.phone ? "กรุณากรอกเบอร์โทร 10 หลัก" : ""
                      }
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          phone: e.target.value.replace(/\D/g, ""),
                        })
                      }
                      inputProps={{ maxLength: 10 }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="หมายเหตุถึงร้านค้า (ถ้ามี)"
                      value={customer.note}
                      onChange={(e) =>
                        setCustomer({ ...customer, note: e.target.value })
                      }
                    />
                  </Grid>
                </Grid>
              </Paper>

              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <StorefrontIcon color="primary" /> การรับสินค้า
                </Typography>
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={800}>
                    รับที่หน้าร้าน (Pick up)
                  </Typography>
                  มารับที่เคาน์เตอร์เมื่อสถานะเป็น "พร้อมรับ"
                </Alert>
              </Paper>

              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <PaymentIcon color="primary" /> วิธีการชำระเงิน
                </Typography>
                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <FormControlLabel
                    value="Cash"
                    control={<Radio />}
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Typography fontWeight={700}>
                          ชำระเงินที่ร้าน
                        </Typography>
                      </Box>
                    }
                    sx={{
                      mb: 1,
                      p: 2,
                      border: "1px solid #eee",
                      borderRadius: 2,
                      width: "100%",
                      ml: 0,
                    }}
                  />
                  <FormControlLabel
                    value="PromptPay"
                    control={<Radio />}
                    label={
                      <Typography fontWeight={700} sx={{ ml: 1 }}>
                        โอนผ่านพร้อมเพย์
                      </Typography>
                    }
                    sx={{
                      p: 2,
                      border: "1px solid #eee",
                      borderRadius: 2,
                      width: "100%",
                      ml: 0,
                    }}
                  />
                </RadioGroup>
              </Paper>
            </Stack>
          </Grid>

          {/* ฝั่งขวา: สรุปยอดสั่งซื้อ (ปรับปรุงส่วนรายการอาหาร) */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card
              sx={{
                p: 3,
                borderRadius: 4,
                position: "sticky",
                top: 24,
                border: "1px solid #eee",
              }}
            >
              <Typography variant="h6" fontWeight={800} gutterBottom>
                สรุปคำสั่งซื้อ
              </Typography>

              <Stack
                spacing={2}
                sx={{ my: 3, maxHeight: "45vh", overflowY: "auto", pr: 1 }}
              >
                {cartItems.map((item) => (
                  <Box key={item.id}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          <Box
                            component="span"
                            fontWeight={800}
                            color="primary.main"
                            sx={{ mr: 1 }}
                          >
                            {item.quantity}x
                          </Box>
                          {/* 🚩 แก้ไขให้ตรงกับที่ส่งไป Backend */}
                          {item.menuItemName}
                        </Typography>

                        {/* แสดง Options */}
                        {item.options && item.options.length > 0 && (
                          <Stack sx={{ ml: 4, mt: 0.5 }}>
                            {item.options.map((opt: any, index: number) => (
                              <Typography
                                key={index}
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                • {opt.optionValueName}
                                {opt.extraPrice > 0 && (
                                  <Box component="span" sx={{ ml: 1 }}>
                                    (+฿{opt.extraPrice.toLocaleString()})
                                  </Box>
                                )}
                              </Typography>
                            ))}
                          </Stack>
                        )}
                      </Box>

                      <Typography variant="body2" fontWeight={700}>
                        ฿
                        {(
                          (item.price + (item.price || 0)) *
                          item.quantity
                        ).toLocaleString()}
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>

              <Divider sx={{ mb: 2.5 }} />

              {/* ส่วน PromoCode (คงเดิม) */}
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
                FormHelperTextProps={{
                  sx: {
                    color:
                      promoMessage.type === "success"
                        ? "success.main"
                        : "error.main",
                  },
                }}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocalOfferIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <Button
                      variant="text"
                      onClick={handleApplyPromo}
                      disabled={isVerifying || !promoCode.trim()}
                    >
                      {isVerifying ? <CircularProgress size={20} /> : "ใช้โค้ด"}
                    </Button>
                  ),
                }}
              />

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
                <Stack direction="row" justifyContent="space-between">
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
                sx={{ borderRadius: 3, py: 2, fontWeight: 800 }}
                onClick={handleConfirmOrder}
                // ตัด isSubmitting ออกตามที่คุณแจ้งว่าไม่มี
                disabled={isConfirming}
              >
                {isConfirming ? (
                  <CircularProgress size={26} color="inherit" />
                ) : (
                  `สั่งซื้อ • ฿${finalTotal.toLocaleString()}`
                )}
              </Button>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
