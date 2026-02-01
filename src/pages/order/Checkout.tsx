/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  Box, Container, Grid, Typography, TextField, Card, Stack,
  Button, Divider, RadioGroup, FormControlLabel, Radio,
  InputAdornment, Paper, CircularProgress,
} from "@mui/material";

// Icons
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PaymentIcon from "@mui/icons-material/Payment";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppHookState";
import { useLazyVerifyPromoQuery } from "../../services/contentApi";
import { useConfirmCartMutation } from "../../services/orderApi";
import type { CreateOrder } from "../../@types/createDto/CreateOrder";
import { clearLocalCart } from "../../stores/slices/shoppingSlice";
import { paymentMethods } from "../../helpers/SD";

const saveGuestToken = (newToken: string) => {
  try {
    const existingTokens = localStorage.getItem("guestTokens");
    let tokenList: string[] = existingTokens ? JSON.parse(existingTokens) : [];
    
    if (!tokenList.includes(newToken)) {
      tokenList.push(newToken);
    }
    
    localStorage.setItem("guestTokens", JSON.stringify(tokenList));
    localStorage.removeItem("guestToken"); 

    // 🔥 จุดที่ต้องเพิ่ม: ส่งสัญญาณบอก Component อื่นๆ ว่า LocalStorage เปลี่ยนแล้วนะ
    window.dispatchEvent(new Event("activeOrderUpdated"));
    
  } catch (error) {
    console.error("Error saving guest tokens:", error);
  }
};

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth);
  const { cartItems, totalAmount } = useAppSelector((state) => state.shoppingCart);

  // Form State
  const [customer, setCustomer] = useState({
    name: user?.userName || "",
    phone: user?.phoneNumber || "",
    note: ""
  });
  const [errors, setErrors] = useState({ name: false, phone: false });

  // Promo State
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState({ text: "", type: "" as "success" | "error" | "" });

  // Payment & Pickup State
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0].value);
  const [pickupType, setPickupType] = useState<"asap" | "scheduled">("asap");
  const [scheduledTime, setScheduledTime] = useState("");

  // API Hooks
  const [triggerVerify, { isFetching: isVerifying }] = useLazyVerifyPromoQuery();
  const [confirmCart, { isLoading: isConfirming }] = useConfirmCartMutation();

  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (!isOrderPlaced && cartItems.length === 0 && !isConfirming) {
      navigate("/");
    }
  }, [cartItems, navigate, isConfirming, isOrderPlaced]);

  // Calculations
  const calculateItemTotal = (item: any) => (item.price || 0) * item.quantity;
  const finalTotal = Math.max(0, totalAmount - appliedDiscount);

  // Handlers
  const handleApplyPromo = async () => {
    const trimmedCode = promoCode.trim();
    if (!trimmedCode) return;
    try {
      const response = await triggerVerify(trimmedCode).unwrap();
      const discount = response.result?.discountValue || 0;
      setAppliedDiscount(discount);
      setPromoMessage({ text: "ใช้รหัสส่วนลดสำเร็จ!", type: "success" });
    } catch (err: any) {
      setPromoMessage({ text: err.data?.message || "รหัสส่วนลดไม่ถูกต้อง", type: "error" });
      setAppliedDiscount(0);
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: !customer.name.trim(),
      phone: !customer.phone.trim() || customer.phone.length < 10,
    };
    setErrors(newErrors);

    if (pickupType === "scheduled") {
      if (!scheduledTime) {
        alert("กรุณาระบุเวลาที่ต้องการรับสินค้า");
        return false;
      }
      if (new Date(scheduledTime) < new Date()) {
        alert("ไม่สามารถเลือกเวลาย้อนหลังได้");
        return false;
      }
    }
    return !newErrors.phone;
  };

  const handleConfirmOrder = async () => {
    if (!validateForm()) return;

    // 1. ดึง Cart Token เดิม (Session ของตะกร้าสินค้า)
    const cartToken = localStorage.getItem("cartToken");
    if (!cartToken) {
      alert("ไม่พบข้อมูลตะกร้าสินค้า");
      return navigate("/");
    }

    let finalPickUpTime = new Date().toISOString();
    if (pickupType === "scheduled" && scheduledTime) {
      finalPickUpTime = new Date(scheduledTime).toISOString();
    }

    const payload: CreateOrder = {
      channel: "pickUp",
      paymentMethod: paymentMethod, // ส่งค่าที่เลือกไปด้วย
      customerPhone: customer.phone.trim(),
      customerName: customer.name.trim() || undefined,
      customerNote: customer.note.trim() || undefined,
      cartToken: cartToken,
      guestToken: cartToken, // ส่งไปเพื่อให้ Backend รู้ว่าเป็น Guest คนเดิม
      userId: user?.userId || undefined,
      promoCode: appliedDiscount > 0 ? promoCode.trim() : undefined,
      estimatedPickUpTime: finalPickUpTime,
    };

    try {
    const result = await confirmCart(payload).unwrap();

    if (result) {
      setIsOrderPlaced(true);

      // ---------------------------------------------------------
      // 🔥 แก้ไขจุดนี้: เปลี่ยนจากผูกขาด Token เดียว เป็นการสะสม Token
      // ---------------------------------------------------------
      if (!user.userId) {
        if (result.guestToken) {
          // แทนการใช้ localStorage.setItem("guestToken", result.guestToken);
          // ให้เรียกใช้ฟังก์ชันที่เราสร้างไว้ด้านบน
          saveGuestToken(result.guestToken);
        }
      }

      // ส่วนของ orderHistory คุณสามารถเก็บไว้หรือลบทิ้งก็ได้
      // เพราะตอนนี้เราใช้ guestTokens array เป็นหลักแล้ว
      const currentHistory = JSON.parse(
        localStorage.getItem("orderHistory") || "[]",
      );
      const newOrderEntry = {
        id: result.id,
        token: result.guestToken || cartToken,
        timestamp: new Date().toISOString(),
        status: result.orderStatus,
      };
      localStorage.setItem(
        "orderHistory",
        JSON.stringify([...currentHistory, newOrderEntry]),
      );

      // 3. Clear ตะกร้า
      dispatch(clearLocalCart());
      localStorage.removeItem("cartToken");

      // 4. แจ้งเตือน และ Navigate
      window.dispatchEvent(new Event("activeOrderUpdated"));
      navigate(`/order-success/${result.id}`, { replace: true });
    }
    } catch (err: any) {
      console.error("Checkout Error:", err);
      if (err.data?.message?.includes("สิทธิ์การใช้งานโปรโมชั่นนี้เต็มแล้ว")) {
        alert("ขออภัย โค้ดส่วนลดหมดอายุพอดี");
        setAppliedDiscount(0);
        setPromoMessage({ text: "โค้ดหมดอายุ/เต็มแล้ว", type: "error" });
      } else {
        alert(err.data?.message || "การสั่งซื้อล้มเหลว กรุณาลองใหม่อีกครั้ง");
      }
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 20 - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

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
          {/* Left Side: Forms */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={3}>
              {/* Customer Info */}
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
                      inputProps={{ maxLength: 10 }}
                      onChange={(e) =>
                        setCustomer({
                          ...customer,
                          phone: e.target.value.replace(/\D/g, ""),
                        })
                      }
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

              {/* Pickup Info */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <StorefrontIcon color="primary" /> การรับสินค้า
                </Typography>
                <RadioGroup
                  value={pickupType}
                  onChange={(e) =>
                    setPickupType(e.target.value as "asap" | "scheduled")
                  }
                >
                  <FormControlLabel
                    value="asap"
                    control={<Radio />}
                    label={
                      <Typography fontWeight={700} sx={{ ml: 1 }}>
                        รับทันที / รอรับหน้าร้าน{" "}
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                        >
                          (~15-20 นาที)
                        </Typography>
                      </Typography>
                    }
                    sx={{
                      mb: 1,
                      p: 1,
                      border:
                        pickupType === "asap"
                          ? "2px solid #1976d2"
                          : "1px solid #eee",
                      borderRadius: 2,
                      width: "100%",
                      ml: 0,
                    }}
                  />
                  <FormControlLabel
                    value="scheduled"
                    control={<Radio />}
                    label={
                      <Typography fontWeight={700} sx={{ ml: 1 }}>
                        ระบุเวลารับ (ล่วงหน้า)
                      </Typography>
                    }
                    sx={{
                      p: 1,
                      border:
                        pickupType === "scheduled"
                          ? "2px solid #1976d2"
                          : "1px solid #eee",
                      borderRadius: 2,
                      width: "100%",
                      ml: 0,
                    }}
                  />
                </RadioGroup>
                {pickupType === "scheduled" && (
                  <Box
                    sx={{
                      mt: 2,
                      ml: 1,
                      p: 2,
                      bgcolor: "#f0f4ff",
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="primary"
                      gutterBottom
                    >
                      <AccessTimeIcon
                        sx={{
                          fontSize: 16,
                          verticalAlign: "text-bottom",
                          mr: 0.5,
                        }}
                      />{" "}
                      เลือกวันและเวลา:
                    </Typography>
                    <TextField
                      fullWidth
                      type="datetime-local"
                      variant="outlined"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      inputProps={{ min: getMinDateTime() }}
                      sx={{ bgcolor: "white" }}
                    />
                  </Box>
                )}
              </Paper>

              {/* Payment Info */}
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
                  {paymentMethods.map((method) => (
                    <FormControlLabel
                      key={method.value}
                      value={method.value}
                      control={<Radio />}
                      label={
                        <Typography fontWeight={700} sx={{ ml: 1 }}>
                          {method.label}
                        </Typography>
                      }
                      sx={{
                        mb: method.value === "cash" ? 1 : 0, // เว้นระยะห่างยกเว้นตัวสุดท้าย
                        p: 2,
                        border: "1px solid #eee",
                        borderRadius: 2,
                        width: "100%",
                        ml: 0,
                        // เพิ่มลูกเล่น: ถ้าเลือกอยู่ให้เปลี่ยนสีขอบ
                        borderColor:
                          paymentMethod === method.value
                            ? "primary.main"
                            : "#eee",
                        bgcolor:
                          paymentMethod === method.value
                            ? "action.hover"
                            : "transparent",
                      }}
                    />
                  ))}
                </RadioGroup>
              </Paper>
            </Stack>
          </Grid>

          {/* Right Side: Order Summary */}
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