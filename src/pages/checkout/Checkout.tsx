/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Box, Container, Grid, Button, Stack } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppHookState";
import { useLazyVerifyPromoQuery } from "../../services/contentApi";
import { useConfirmCartMutation } from "../../services/orderApi";
import type { CreateOrder } from "../../@types/createDto/CreateOrder";
import { clearLocalCart } from "../../stores/slices/shoppingSlice";
import { Channel, paymentMethods } from "../../helpers/SD";
import CustomerForm from "./CustomerForm";
import PickupSection from "./PickupSection";
import PaymentSection from "./PaymentSection";
import OrderSummary from "./OrderSummary";

const saveGuestToken = (newToken: string) => {
  try {
    const existingTokens = localStorage.getItem("guestTokens");
    let tokenList: string[] = existingTokens ? JSON.parse(existingTokens) : [];
    
    if (!tokenList.includes(newToken)) {
      tokenList.push(newToken);
    }
    
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
  const { cartItems, totalAmount } = useAppSelector((state) => state.shoppingCart);

  // Form State
  const [customer, setCustomer] = useState({
    name: user?.userName || "",
    phone: user?.phoneNumber || "",
    note: ""
  });
  const [errors, setErrors] = useState({ name: false, phone: false });

  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState({ text: "", type: "" as "success" | "error" | "" });

  const [paymentMethod, setPaymentMethod] = useState(paymentMethods.paymentStatus_Cash);
  const [pickupType, setPickupType] = useState<"asap" | "scheduled">("asap");
  const [scheduledTime, setScheduledTime] = useState("");

  const [triggerVerify, { isFetching: isVerifying }] = useLazyVerifyPromoQuery();
  const [confirmCart, { isLoading: isConfirming }] = useConfirmCartMutation();

  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  useEffect(() => {
    if (!isOrderPlaced && cartItems.length === 0 && !isConfirming) {
      navigate("/");
    }
  }, [cartItems, navigate, isConfirming, isOrderPlaced]);

  const finalTotal = Math.max(0, totalAmount - appliedDiscount);

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
      channel: Channel.Channel_PickUp,
      paymentMethod: paymentMethod,
      customerPhone: customer.phone.trim(),
      customerName: customer.name.trim() || undefined,
      customerNote: customer.note.trim() || undefined,
      cartToken: cartToken,
      guestToken: cartToken,
      userId: user?.userId || undefined,
      promoCode: appliedDiscount > 0 ? promoCode.trim() : undefined,
      estimatedPickUpTime: finalPickUpTime,
    };

    try {
      const result = await confirmCart(payload).unwrap();

      if (result) {
        setIsOrderPlaced(true);

        if (!user.userId) {
          if (result.guestToken) {
            saveGuestToken(result.guestToken);
          }
        }

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

        dispatch(clearLocalCart());
        localStorage.removeItem("cartToken");
        window.dispatchEvent(new Event("activeOrderUpdated"));

        navigate(`/order-success/${result.id}`, { replace: true });
        // ตรวจสอบค่า String ให้ตรงกับ SD.cs ใน Backend
        // "PendingPayment" คือยอด > 200 ที่ต้องจ่ายเงินก่อน
        // if (result.orderStatus === Sd.Status_PendingPayment) {
        //   // ไปหน้าชำระเงิน (Payment Page) ที่คุณกำลังจะสร้าง
        //   navigate(`/payment/${result.id}`, { replace: true });
        // } else {
        //   // กรณี "Approved" (ยอด <= 200) หรือสถานะอื่นๆ
        //   // ไปหน้าสำเร็จ/ติดตามสถานะ (Success Page)
        //   navigate(`/order-success/${result.id}`, { replace: true });
        // }
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

          {/* Right Side: Order Summary */}
          <Grid size={{ xs: 12, md: 5 }}>
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
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}