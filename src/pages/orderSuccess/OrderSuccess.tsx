/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Container,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Typography,
  keyframes,
  Snackbar,
} from "@mui/material";
import CallIcon from "@mui/icons-material/Call";
import CancelIcon from "@mui/icons-material/Cancel";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetOrderByIdQuery,
  useCancelOrderMutation,
} from "../../services/orderApi";

import { paymentMethods, Sd } from "../../helpers/SD";
import { useAppSelector } from "../../hooks/useAppHookState";
import { SD_Roles } from "../../@types/Enum";

import OrderStatusCard from "./OrderStatusCard";
import OrderTimeline from "./OrderTimeline";
import OrderMenuList from "./OrderMenuList";
import CancelDialog from "./CancelDialog";
import OrderPaymentSection from "./OrderPaymentSection";

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export default function OrderSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const orderId = Number(id);

  const userId = useAppSelector((state) => state.auth?.userId);
  const userRole = useAppSelector((state) => state.auth?.role);

  // --- 🛡️ States สำหรับระบบ Smart Verification ---
  const [isVerifying, setIsVerifying] = useState(false);
  const verifyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Guest Token Logic ---
  const guestTokens = useMemo(() => {
    try {
      const saved = localStorage.getItem("guestTokens");
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  }, []);

  const orderToken = useMemo(() => {
    if (userId) return undefined;
    return (
      guestTokens[guestTokens.length - 1] ||
      localStorage.getItem("guestToken") ||
      undefined
    );
  }, [userId, guestTokens]);

  // 1. Fetch Order Data
  const {
    data: order,
    isLoading,
    isError,
    refetch,
  } = useGetOrderByIdQuery(
    { id: orderId, guestToken: orderToken },
    { skip: isNaN(orderId) },
  );

  // 🔥 CORE LOGIC: คำนวณสถานะการแสดงส่วนชำระเงิน (รัดกุมขึ้น)
  const showPaymentSection = useMemo(() => {
    if (!order) return false;

    // สถานะปลายทางที่ไม่ต้องแสดง QR แล้ว
    const terminalStatuses = [
      Sd.Status_Paid,
      Sd.Status_Preparing,
      Sd.Status_Ready,
      Sd.Status_Completed,
      Sd.Status_Cancelled,
    ];
    if (terminalStatuses.includes(order.orderStatus)) return false;

    const isForcedPayment = order.orderStatus === Sd.Status_PendingPayment;
    const isPromptPay =
      order.paymentMethod === paymentMethods.paymentStatus_PromptPay;
    const isPendingButPromptPay =
      order.orderStatus === Sd.Status_Pending && isPromptPay;

    return isForcedPayment || isPendingButPromptPay;
  }, [order]);

  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [targetItem, setTargetItem] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const isFirstLoad = useRef(true);
  const [prevStatus, setPrevStatus] = useState<string>("");

  const canCancelOrder =
    order &&
    (order.orderStatus === Sd.Status_PendingPayment ||
      order.orderStatus === Sd.Status_Pending);

  // --- 📡 Smart Verification: เฝ้าดูการเปลี่ยนสถานะจาก SignalR ---
  useEffect(() => {
    if (!order) return;

    // ตรวจสอบว่าสถานะขยับออกจากช่วง "รอจ่าย" หรือยัง
    const hasStatusAdvanced =
      order.orderStatus !== Sd.Status_PendingPayment &&
      order.orderStatus !== Sd.Status_Pending;

    if (isVerifying && hasStatusAdvanced) {
      setIsVerifying(false);
      if (verifyTimeoutRef.current) clearTimeout(verifyTimeoutRef.current);

      if (order.orderStatus === Sd.Status_Paid) {
        setToastMsg("ระบบยืนยันยอดเงินสำเร็จเรียบร้อย ขอบคุณค่ะ!");
        setToastOpen(true);
      }
    }
  }, [order?.orderStatus, isVerifying]);

  // Cleanup Timer เมื่อ Unmount
  useEffect(() => {
    return () => {
      if (verifyTimeoutRef.current) clearTimeout(verifyTimeoutRef.current);
    };
  }, []);

  // Security Check Effect
  useEffect(() => {
    if (isNaN(orderId)) {
      navigate("/", { replace: true });
      return;
    }
    if (!isLoading && order) {
      const isOwner =
        (userId && order.userId === userId) ||
        (order.guestToken && guestTokens.includes(order.guestToken));
      const isStaff =
        userRole === SD_Roles.Admin || userRole === SD_Roles.Employee;
      if (!isOwner && !isStaff) navigate("/", { replace: true });
    }
  }, [order, isLoading, orderId, userId, guestTokens, userRole, navigate]);

  // Sound & Vibrate Effect (เพิ่มแจ้งเตือนเมื่อโดน Cancel)
  useEffect(() => {
    if (order?.orderStatus) {
      const alertedStatuses = [
        Sd.Status_Ready,
        Sd.Status_Paid,
        Sd.Status_Cancelled,
      ];

      if (
        alertedStatuses.includes(order.orderStatus) &&
        !isFirstLoad.current &&
        prevStatus !== order.orderStatus
      ) {
        new Audio("/assets/sounds/notification.mp3")
          .play()
          .catch(console.error);
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      }
      setPrevStatus(order.orderStatus);
      isFirstLoad.current = false;
    }
  }, [order?.orderStatus, prevStatus]);

  // --- Handlers ---
  const handlePaymentSuccess = () => {
    setToastMsg("อัปโหลดสลิปเรียบร้อย ระบบกำลังตรวจสอบความถูกต้อง...");
    setToastOpen(true);
    setIsVerifying(true);

    // 🛡️ Fallback: หาก SignalR ขัดข้อง 10 วินาทีให้บังคับ Refetch
    verifyTimeoutRef.current = setTimeout(() => {
      setIsVerifying(false);
      refetch();
    }, 10000);
  };

  const handlePaymentError = (msg: string) => {
    setToastMsg(msg);
    setToastOpen(true);
    setIsVerifying(false);
  };

  const handleOpenCancelOrder = () => {
    setTargetItem(null);
    setCancelReason("");
    setConfirmDialogOpen(true);
  };

  const handleOpenCancelItem = (itemId: number, itemName: string) => {
    setTargetItem({ id: itemId, name: itemName });
    setCancelReason("");
    setConfirmDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    try {
      const requestBody: any = { reason: cancelReason };
      if (targetItem) requestBody.orderItemId = targetItem.id;
      await cancelOrder({ id: orderId, request: requestBody }).unwrap();
      setConfirmDialogOpen(false);
    } catch (err: any) {
      setToastMsg(err.data?.message || "ไม่สามารถยกเลิกรายการนี้ได้");
      setToastOpen(true);
    }
  };

  if (isLoading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );

  if (isError || !order)
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h5" color="error">
          ไม่พบข้อมูลออเดอร์
        </Typography>
        <Button onClick={() => navigate("/")} sx={{ mt: 2 }}>
          กลับหน้าหลัก
        </Button>
      </Container>
    );

  return (
    <Box sx={{ bgcolor: "#F5F7FA", minHeight: "100vh", py: { xs: 3, md: 5 } }}>
      <Container maxWidth="sm">
        <Stack spacing={3} sx={{ animation: `${slideUp} 0.5s ease-out` }}>
          {/* แจ้งเตือนเมื่อออเดอร์ถูกยกเลิก */}
          {order.orderStatus === Sd.Status_Cancelled && (
            <Alert
              severity="error"
              variant="filled"
              icon={<CallIcon fontSize="inherit" />}
              sx={{
                borderRadius: 3,
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(211, 47, 47, 0.2)",
              }}
            >
              ออเดอร์นี้ถูกยกเลิกแล้ว กรุณาติดต่อพนักงานหากมีข้อสงสัย
            </Alert>
          )}

          {/* การ์ดสถานะหลัก */}
          <OrderStatusCard
            orderStatus={order.orderStatus}
            pickUpCode={order.pickUpCode}
            paymentMethod={order.paymentMethod}
          />

          {/* 🔥 ส่วนของการชำระเงินและระบบยืนยันอัตโนมัติ */}
          {/* {showPaymentSection && (
            <Box sx={{ position: "relative" }}>
              <OrderPaymentSection
                orderId={orderId}
                totalAmount={order.total}
                onPaymentSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                disabled={isVerifying}
              />

              {isVerifying && (
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: "primary.50",
                    borderRadius: 2,
                    border: "1px dashed",
                    borderColor: "primary.main",
                    color: "primary.main",
                  }}
                >
                  <CircularProgress size={20} thickness={5} />
                  <Typography variant="body2" fontWeight={700}>
                    กำลังรอการยืนยันยอดเงินจากเซิร์ฟเวอร์...
                  </Typography>
                </Stack>
              )}
            </Box>
          )} */}

          {/* Timeline และรายการอาหาร */}
          <OrderTimeline
            orderStatus={order.orderStatus}
            estimatedPickUpTime={order.estimatedPickUpTime ?? null}
          />

          <OrderMenuList
            orderDetails={order.orderDetails}
            subTotal={order.subTotal}
            discount={order.discount}
            total={order.total}
            appliedPromoCode={order.appliedPromoCode}
            onCancelItem={handleOpenCancelItem}
            canCancel={canCancelOrder ?? false}
          />

          {/* ปุ่มคำสั่งต่างๆ */}
          <Stack spacing={2}>
            {canCancelOrder && (
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={handleOpenCancelOrder}
                disabled={isVerifying}
                sx={{
                  borderRadius: 3,
                  borderWidth: 2,
                  py: 1.5,
                  fontWeight: 700,
                  "&:hover": { borderWidth: 2 },
                }}
              >
                ยกเลิกออเดอร์นี้
              </Button>
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<HomeIcon />}
              onClick={() => navigate("/")}
              sx={{
                borderRadius: 3,
                py: 1.8,
                fontWeight: 800,
                fontSize: "1rem",
                background: "linear-gradient(45deg, #FF9800 30%, #FF5722 90%)",
                boxShadow: "0 4px 12px rgba(255, 87, 34, 0.3)",
              }}
            >
              กลับหน้าหลัก / สั่งรายการอื่นเพิ่ม
            </Button>
          </Stack>

          {/* Footer ข้อมูลออเดอร์ */}
          <Typography
            variant="caption"
            display="block"
            textAlign="center"
            color="text.secondary"
            sx={{ mt: 2, opacity: 0.7 }}
          >
            Order ID: #{order.id} • สั่งเมื่อ{" "}
            {new Date(order.createdAt).toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            น.
          </Typography>
        </Stack>

        <CancelDialog
          open={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
          onConfirm={handleConfirmCancel}
          isCancelling={isCancelling}
          targetItem={targetItem}
          reason={cancelReason}
          setReason={setCancelReason}
        />

        <Snackbar
          open={toastOpen}
          autoHideDuration={4000}
          onClose={() => setToastOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setToastOpen(false)}
            severity="info"
            variant="filled"
            sx={{ width: "100%", borderRadius: 2 }}
          >
            {toastMsg}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
