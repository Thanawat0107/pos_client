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
} from "@mui/material";
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

  // --- ⭐ 1. เพิ่ม State สำหรับจัดการเวลารับ ---
  // 'asap' = รับทันที, 'scheduled' = ระบุเวลา
  const [pickupType, setPickupType] = useState<"asap" | "scheduled">("asap");
  const [scheduledTime, setScheduledTime] = useState("");

  const [promoMessage, setPromoMessage] = useState({
    text: "",
    type: "" as "success" | "error" | "",
  });

  const [triggerVerify, { isFetching: isVerifying }] =
    useLazyVerifyPromoQuery();
  const [confirmCart, { isLoading: isConfirming }] = useConfirmCartMutation();

  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  useEffect(() => {
    // ถ้าตะกร้าว่าง และ ไม่ได้กำลังโหลด และ "ยังสั่งไม่เสร็จ" -> ให้กลับหน้าแรก
    if (!isOrderPlaced && cartItems.length === 0 && !isConfirming) {
      navigate("/");
    }
  }, [cartItems, navigate, isConfirming, isOrderPlaced]); // อย่าลืมใส่ dependency

  // --- ⭐ ฟังก์ชันช่วยคำนวณราคา (แก้ไขใหม่) ---
  const calculateItemTotal = (item: any) => {
    // เนื่องจาก Backend ส่ง item.price ที่รวมค่า Option มาให้แล้ว
    // สูตรที่ถูกต้องคือ: ราคาต่อหน่วย * จำนวน
    return (item.price || 0) * item.quantity;
  };

  const handleApplyPromo = async () => {
    const trimmedCode = promoCode.trim();
    if (!trimmedCode) return;
    try {
      const response = await triggerVerify(trimmedCode).unwrap();
      // สมมติ response.result มี discountValue
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
      name: !customer.name.trim(), // ถ้า name เป็น optional ลบบรรทัดนี้ได้
      phone: !customer.phone.trim() || customer.phone.length < 10,
    };
    setErrors(newErrors);

    if (pickupType === "scheduled") {
      if (!scheduledTime) {
        alert("กรุณาระบุเวลาที่ต้องการรับสินค้า");
        return false;
      }

      // ⭐ เพิ่ม: เช็กว่าเวลาที่เลือก ต้องมากกว่าเวลาปัจจุบัน
      const selectedDate = new Date(scheduledTime);
      const now = new Date();
      if (selectedDate < now) {
        alert("ไม่สามารถเลือกเวลาย้อนหลังได้");
        return false;
      }
    }

    return !newErrors.phone;
  };

  const handleConfirmOrder = async () => {
    if (!validateForm()) return;

    const token = localStorage.getItem("cartToken");
    if (!token) {
      alert("ไม่พบข้อมูลตะกร้าสินค้า");
      return navigate("/");
    }

    // ⭐ คำนวณเวลา PickUp ที่จะส่งไป Backend
    let finalPickUpTime = new Date().toISOString(); // Default = Now (ASAP)
    if (pickupType === "scheduled" && scheduledTime) {
      // แปลงจาก input string เป็น ISO String
      finalPickUpTime = new Date(scheduledTime).toISOString();
    }
    // สร้าง Payload แบบเบา (Lightweight) ตรงกับ CreateOrderDto
    const payload: CreateOrder = {
      channel: "pickUp", // Backend น่าจะชอบ PascalCase มากกว่า camelCase
      // ข้อมูลลูกค้า
      customerPhone: customer.phone.trim(),
      customerName: customer.name.trim() || undefined, // ส่ง undefined ดีกว่าส่ง string ว่าง
      customerNote: customer.note.trim() || undefined,
      // Tokens
      cartToken: token,
      guestToken: token, // ใช้ token เดียวกันระบุตัวตน (Guest)
      // Promo (ส่งไปเฉพาะตอนที่มีการ Apply ผ่านแล้วเท่านั้น)
      promoCode: appliedDiscount > 0 ? promoCode.trim() : undefined,
      // เวลา
      estimatedPickUpTime: finalPickUpTime,
    };

    try {
      const result = await confirmCart(payload).unwrap();

      if (result) {
        // ปกติ unwrap จะ throw error ถ้าไม่สำเร็จ result ที่ได้คือ success data
        setIsOrderPlaced(true);
        dispatch(clearLocalCart());
        localStorage.removeItem("cartToken");
        // ⭐ [เพิ่มใหม่] บันทึก ID ออเดอร์ล่าสุดไว้
        localStorage.setItem("activeOrderId", result.id.toString());
        navigate(`/order-success/${result.id}`, { replace: true });
      }
    } catch (err: any) {
      console.error("Checkout Error:", err);

      // จัดการ Error Case พิเศษ
      if (err.data?.message?.includes("สิทธิ์การใช้งานโปรโมชั่นนี้เต็มแล้ว")) {
        alert("ขออภัย โค้ดส่วนลดหมดอายุพอดี กรุณาลองใหม่อีกครั้ง");
        setAppliedDiscount(0); // Reset ส่วนลด
        setPromoMessage({ text: "โค้ดหมดอายุ/เต็มแล้ว", type: "error" });
      } else {
        alert(err.data?.message || "การสั่งซื้อล้มเหลว กรุณาลองใหม่อีกครั้ง");
      }
    }
  };

  const finalTotal = Math.max(0, totalAmount - appliedDiscount);

  // Helper สำหรับทำ Min Date ของ input type="datetime-local" (ป้องกันเลือกเวลาในอดีต)
  // ใน getMinDateTime
  const getMinDateTime = () => {
    const now = new Date();
    // ⭐ บวกเพิ่ม 20 นาที (เผื่อเวลาเตรียมของ)
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
          {/* ฝั่งซ้าย: ฟอร์มข้อมูลลูกค้า */}
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

              {/* การรับสินค้า */}
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
                      <Box sx={{ ml: 1 }}>
                        <Typography fontWeight={700}>
                          รับทันที / รอรับหน้าร้าน
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ทางร้านจะจัดเตรียมสินค้าให้เร็วที่สุด (ประมาณ 15-20
                          นาที)
                        </Typography>
                      </Box>
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
                      transition: "0.2s",
                    }}
                  />
                  <FormControlLabel
                    value="scheduled"
                    control={<Radio />}
                    label={
                      <Box sx={{ ml: 1, width: "100%" }}>
                        <Typography fontWeight={700}>
                          ระบุเวลารับ (ล่วงหน้า)
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          เลือกเวลาที่สะดวกเข้ามารับสินค้า
                        </Typography>
                      </Box>
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
                      transition: "0.2s",
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
                      gutterBottom
                      fontWeight={600}
                      color="primary"
                    >
                      <AccessTimeIcon
                        sx={{
                          fontSize: 16,
                          verticalAlign: "text-bottom",
                          mr: 0.5,
                        }}
                      />{" "}
                      เลือกวันและเวลาที่ต้องการรับ:
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

          {/* ฝั่งขวา: สรุปยอดสั่งซื้อ */}
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
                    {/* รูปภาพเมนู */}
                    <Box
                      component="img"
                      src={
                        item.menuItemImage ||
                        "https://placehold.co/100x100?text=No+Image"
                      }
                      alt={item.menuItemName}
                      sx={{
                        width: 70,
                        height: 70,
                        borderRadius: 2,
                        objectFit: "cover",
                        bgcolor: "#f0f0f0",
                      }}
                    />

                    {/* รายละเอียด */}
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

                          {/* Options */}
                          {item.options && item.options.length > 0 && (
                            <Stack spacing={0.5}>
                              {item.options.map((opt: any, index: number) => (
                                <Typography
                                  key={index}
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ display: "block", lineHeight: 1.2 }}
                                >
                                  • {opt.optionValueName}{" "}
                                  {opt.extraPrice > 0 &&
                                    `(+฿${opt.extraPrice.toLocaleString()})`}
                                </Typography>
                              ))}
                            </Stack>
                          )}
                          {item.note && (
                            <Typography
                              variant="caption"
                              color="error"
                              sx={{ display: "block", mt: 0.5 }}
                            >
                              * {item.note}
                            </Typography>
                          )}
                        </Box>

                        {/* ราคารวมของรายการนี้ */}
                        <Stack alignItems="flex-end">
                          <Typography variant="body2" fontWeight={700}>
                            {/* ⭐ เรียกใช้ Function คำนวณราคาที่ถูกต้อง */}฿
                            {calculateItemTotal(item).toLocaleString()}
                          </Typography>

                          {/* ราคาต่อหน่วย */}
                          {item.quantity > 1 && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              (฿{item.price.toLocaleString()} / ชิ้น)
                            </Typography>
                          )}
                        </Stack>
                      </Stack>
                    </Box>
                  </Box>
                ))}
              </Stack>

              <Divider sx={{ mb: 2.5 }} />

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