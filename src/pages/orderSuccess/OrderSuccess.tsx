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
} from "@mui/material";
import CallIcon from "@mui/icons-material/Call";
import CancelIcon from "@mui/icons-material/Cancel";
import HomeIcon from "@mui/icons-material/Home";
import { useParams, useNavigate } from "react-router-dom";

import {
  useGetOrderByIdQuery,
  useCancelOrderMutation,
} from "../../services/orderApi";
import { Sd } from "../../helpers/SD";
import { useAppSelector } from "../../hooks/useAppHookState";
import { SD_Roles } from "../../@types/Enum";
import OrderStatusCard from "./OrderStatusCard";
import OrderTimeline from "./OrderTimeline";
import OrderMenuList from "./OrderMenuList";
import CancelDialog from "./CancelDialog";

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

  const {
    data: order,
    isLoading,
    isError,
  } = useGetOrderByIdQuery(
    { id: orderId, guestToken: orderToken },
    { skip: isNaN(orderId) },
  );

  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [targetItem, setTargetItem] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const isFirstLoad = useRef(true);
  const [prevStatus, setPrevStatus] = useState<string>("");

  const canCancelOrder =
    order &&
    (order.orderStatus === Sd.Status_PendingPayment ||
      order.orderStatus === Sd.Status_Pending);

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

  useEffect(() => {
    if (order?.orderStatus) {
      if (
        order.orderStatus === Sd.Status_Ready &&
        !isFirstLoad.current &&
        prevStatus !== Sd.Status_Ready
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
      alert(err.data?.message || "ไม่สามารถยกเลิกรายการนี้ได้");
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
          {order.orderStatus === Sd.Status_Cancelled && (
            <Alert
              severity="error"
              variant="filled"
              icon={<CallIcon fontSize="inherit" />}
              sx={{ borderRadius: 3, fontWeight: 600 }}
            >
              ออเดอร์นี้ถูกยกเลิกแล้ว
            </Alert>
          )}

          {/* ส่วนแสดงสถานะ */}
          <OrderStatusCard
            orderStatus={order.orderStatus}
            pickUpCode={order.pickUpCode}
            paymentMethod={order.paymentMethod}
          />

          {/* Timeline */}
          <OrderTimeline
            orderStatus={order.orderStatus}
            estimatedPickUpTime={order.estimatedPickUpTime ?? null}
          />

          {/* รายการอาหาร */}
          <OrderMenuList
            orderDetails={order.orderDetails}
            subTotal={order.subTotal}
            discount={order.discount}
            total={order.total}
            appliedPromoCode={order.appliedPromoCode}
            onCancelItem={handleOpenCancelItem}
            canCancel={canCancelOrder ?? false}
          />

          <Stack spacing={2}>
            {canCancelOrder && (
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={handleOpenCancelOrder}
                sx={{
                  borderRadius: 3,
                  borderWidth: 2,
                  py: 1.5,
                  fontWeight: 700,
                }}
              >
                ยกเลิกออเดอร์
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
              กลับหน้าหลัก / สั่งเพิ่ม
            </Button>
          </Stack>

          <Typography
            variant="caption"
            display="block"
            textAlign="center"
            color="text.secondary"
            sx={{ mt: 2, opacity: 0.7 }}
          >
            Order ID: #{order.id} •{" "}
            {new Date(order.createdAt).toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
            })}
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
      </Container>
    </Box>
  );
}