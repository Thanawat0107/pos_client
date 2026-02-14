/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Box, Container, Grid, Button, Stack, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppHookState";
import { useLazyVerifyPromoQuery } from "../../services/contentApi";
import { useConfirmCartMutation } from "../../services/orderApi";
import type { CreateOrder } from "../../@types/createDto/CreateOrder";
import { clearLocalCart } from "../../stores/slices/shoppingSlice";
import { Channel, paymentMethods } from "../../helpers/SD";

// นำเข้า Component ลูก
import CustomerForm from "./CustomerForm";
import PickupSection from "./PickupSection";
import PaymentSection from "./PaymentSection";
import OrderSummary from "./OrderSummary";

const saveGuestToken = (newToken: string) => {
  try {
    const existingTokens = localStorage.getItem("guestTokens");
    let tokenList: string[] = existingTokens ? JSON.parse(existingTokens) : [];
    if (!tokenList.includes(newToken)) tokenList.push(newToken);
    localStorage.setItem("guestTokens", JSON.stringify(tokenList));
    localStorage.removeItem("guestToken");
    window.dispatchEvent(new Event("activeOrderUpdated"));
  } catch (error) {
    console.error("Error saving guest tokens:", error);
  }
};

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth);
  const { cartItems, totalAmount } = useAppSelector(
    (state) => state.shoppingCart,
  );

  // --- 1. Form State ---
  const [customer, setCustomer] = useState({
    name: user?.userName || "",
    phone: user?.phoneNumber || "",
    note: "",
  });
  const [errors, setErrors] = useState({ name: false, phone: false });

  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState({
    text: "",
    type: "" as "success" | "error" | "",
  });

  const [paymentMethod, setPaymentMethod] = useState(
    paymentMethods.paymentStatus_PromptPay,
  );
  const [pickupType, setPickupType] = useState<"asap" | "scheduled">("asap");
  const [scheduledTime, setScheduledTime] = useState("");

  const [triggerVerify, { isFetching: isVerifying }] = useLazyVerifyPromoQuery();
  const [confirmCart, { isLoading: isConfirming }] = useConfirmCartMutation();
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  const finalTotal = Math.max(0, totalAmount - appliedDiscount);

  useEffect(() => {
    if (!isOrderPlaced && cartItems.length === 0 && !isConfirming) {
      navigate("/");
    }
  }, [cartItems, navigate, isConfirming, isOrderPlaced]);

  const handleApplyPromo = async () => {
    const trimmedCode = promoCode.trim();
    if (!trimmedCode) return;

    try {
      const cartToken = localStorage.getItem("cartToken");
      const response = await triggerVerify({
        code: trimmedCode,
        amount: totalAmount,
        userId: user?.userId || undefined,
        guestToken: cartToken || undefined,
      }).unwrap();

      const discount = response.result?.discountValue || 0;
      setAppliedDiscount(discount);
      setPromoMessage({ text: "ใช้รหัสส่วนลดสำเร็จ!", type: "success" });
    } catch (err: any) {
      setPromoMessage({
        text: err.data?.message || "รหัสส่วนลดไม่ถูกต้อง",
        type: "error",
      });
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

    const cartToken = localStorage.getItem("cartToken");
    if (!cartToken) {
      alert("ไม่พบข้อมูลตะกร้าสินค้า");
      return navigate("/");
    }

    const payload: CreateOrder = {
      channel: Channel.Channel_PickUp,
      paymentMethod: paymentMethods.paymentStatus_PromptPay,
      customerPhone: customer.phone.trim(),
      customerName: customer.name.trim(),
      customerNote: customer.note.trim() || undefined,
      cartToken: cartToken,
      guestToken: cartToken,
      userId: user?.userId || undefined,
      promoCode: appliedDiscount > 0 ? promoCode.trim() : undefined,
      estimatedPickUpTime: new Date().toISOString(),
    };

    try {
      const result = await confirmCart(payload).unwrap();
      if (result) {
        setIsOrderPlaced(true);
        if (!user.userId && result.guestToken) saveGuestToken(result.guestToken);

        const currentHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]");
        localStorage.setItem(
          "orderHistory",
          JSON.stringify([
            ...currentHistory,
            {
              id: result.id,
              token: result.guestToken || cartToken,
              timestamp: new Date().toISOString(),
              status: result.orderStatus,
            },
          ]),
        );

        dispatch(clearLocalCart());
        localStorage.removeItem("cartToken");
        window.dispatchEvent(new Event("activeOrderUpdated"));
        navigate(`/order-success/${result.id}`, { replace: true });
      }
    } catch (err: any) {
      alert(err.data?.message || "การสั่งซื้อล้มเหลว กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <Box sx={{ bgcolor: "#f4f7f9", minHeight: "100vh", py: { xs: 2, md: 5 } }}>
      <Container maxWidth="lg">
        {/* Header Section: ปรับให้ Responsive */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
            mb: { xs: 3, md: 4 },
          }}
        >
          <Button
            startIcon={<ChevronLeftIcon />}
            onClick={() => navigate(-1)}
            sx={{ 
                fontWeight: 800, 
                fontSize: { xs: "0.9rem", sm: "1.1rem" },
                px: 0 
            }}
          >
            แก้ไขตะกร้า
          </Button>
          <Typography
            variant="h4"
            fontWeight={900}
            color="#2c3e50"
            sx={{ 
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                lineHeight: 1.2 
            }}
          >
            ยืนยันการสั่งซื้อ
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 3, md: 4, lg: 5 }}>
          {/* ฝั่งซ้าย: ข้อมูลลูกค้าและการรับสินค้า */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={{ xs: 3, md: 4 }}>
              <CustomerForm
                customer={customer}
                errors={errors}
                setCustomer={setCustomer}
              />

              <PickupSection
                pickupType={pickupType}
                setPickupType={setPickupType}
                scheduledTime={scheduledTime}
                setScheduledTime={setScheduledTime}
              />

              <PaymentSection
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                finalTotal={finalTotal}
              />
            </Stack>
          </Grid>

          {/* ฝั่งขวา: สรุปยอดเงิน (Sticky on Desktop) */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box 
                sx={{ 
                    position: { md: "sticky" }, 
                    top: { md: 24 },
                    zIndex: 1 
                }}
            >
              <OrderSummary
                cartItems={cartItems}
                totalAmount={totalAmount}
                appliedDiscount={appliedDiscount}
                finalTotal={finalTotal}
                promoCode={promoCode}
                setPromoCode={setPromoCode}
                setAppliedDiscount={setAppliedDiscount}
                handleApplyPromo={handleApplyPromo}
                isVerifying={isVerifying}
                promoMessage={promoMessage}
                handleConfirmOrder={handleConfirmOrder}
                isConfirming={isConfirming}
                paymentMethod={paymentMethod}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}