/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  Stack,
  Typography,
  IconButton,
  Avatar,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import TakeoutDiningIcon from "@mui/icons-material/TakeoutDining";
import type { OrderHeader } from "../../../../../@types/dto/OrderHeader";
import {
  useCancelOrderMutation,
  useConfirmPaymentMutation,
  useUpdateKitchenStatusMutation,
  useUpdateOrderMutation,
  useUpdateOrderStatusMutation,
} from "../../../../../services/orderApi";
import type { CancelRequest } from "../../../../../@types/requests/CancelRequest";
import OrderStatusBadge from "../../../../../utility/OrderStatusBadge";
import OrderTimeline from "./OrderTimeline";
import OrderActionBoard from "./OrderActionBoard";
import OrderCustomerInfo from "./OrderCustomerInfo";
import OrderItemsList from "./OrderItemsList";
import OrderModals from "./OrderModals";
import { paymentMethods } from "../../../../../helpers/SD";

const BRAND_COLOR = "#D32F2F";
const BG_COLOR = "#f5f5f5";

type Props = {
  open: boolean;
  onClose: () => void;
  order: OrderHeader | null;
};

export default function OrderDetailDrawer({ open, onClose, order }: Props) {
  // --- API ---
  const [updateStatus, { isLoading: loadingStatus }] =
    useUpdateOrderStatusMutation();
  const [updateOrder, { isLoading: loadingUpdate }] = useUpdateOrderMutation();
  const [cancelOrder, { isLoading: loadingCancel }] = useCancelOrderMutation();
  const [updateKitchen, { isLoading: loadingKitchen }] =
    useUpdateKitchenStatusMutation();
  const [confirmPayment, { isLoading: loadingPayment }] =
    useConfirmPaymentMutation();
  const isLoading =
    loadingStatus ||
    loadingUpdate ||
    loadingCancel ||
    loadingKitchen ||
    loadingPayment;

  // --- State ---
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    customerName: "",
    customerPhone: "",
    note: "",
  });

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [targetItemId, setTargetItemId] = useState<number | null>(null);
  const [targetItemName, setTargetItemName] = useState("");

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  // --- Effects ---
  useEffect(() => {
    if (order) {
      setEditForm({
        customerName: order.customerName || "",
        customerPhone: order.customerPhone || "",
        note: order.customerNote || "",
      });
      setIsEditing(false);
      setCancelDialogOpen(false);
      setCancelReason("");
      setTargetItemId(null);
      setAnchorEl(null);
    }
  }, [order, open]);

  if (!order) return null;

  // --- Logic Handlers ---
  const handleStatusChange = async (nextStatus: string) => {
    try {
      await updateStatus({ id: order.id, newStatus: nextStatus }).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePaymentConfirm = async () => {
    try {
      await confirmPayment({
        id: order.id,
        paymentMethod: order.paymentMethod || paymentMethods.paymentStatus_Cash,
      }).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await updateOrder({
        id: order.id,
        customerName: editForm.customerName,
        customerPhone: editForm.customerPhone,
        customerNote: editForm.note,
      }).unwrap();
      setIsEditing(false);
    } catch (err) {
      alert("บันทึกไม่สำเร็จ");
    }
  };

  // Cancel
  const handleOpenCancelOrder = () => {
    setTargetItemId(null);
    setTargetItemName("");
    setCancelReason("");
    setCancelDialogOpen(true);
  };
  const handleOpenCancelItem = (itemId: number, itemName: string) => {
    setTargetItemId(itemId);
    setTargetItemName(itemName);
    setCancelReason("");
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    try {
      const request: CancelRequest = {
        isAdmin: true,
        orderItemId: targetItemId ?? undefined,
      };
      await cancelOrder({ id: order.id, request }).unwrap();
      setCancelDialogOpen(false);
      if (!targetItemId) onClose();
    } catch (err: any) {
      alert(err.data?.message || "Error");
    }
  };

  // Menu
  const handleOpenStatusMenu = (
    event: React.MouseEvent<HTMLElement>,
    itemId: number,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedItemId(itemId);
  };
  const handleChangeItemStatus = async (newStatus: string) => {
    if (selectedItemId)
      try {
        await updateKitchen({
          detailId: selectedItemId,
          status: newStatus,
        }).unwrap();
      } catch (err) {
        console.error(err);
      }
    setAnchorEl(null);
    setSelectedItemId(null);
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: { width: { xs: "100%", md: 650 }, bgcolor: BG_COLOR },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2.5,
            bgcolor: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #eee",
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: "#ffebee", color: BRAND_COLOR }}>
              <ReceiptLongIcon />
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                fontWeight={800}
                lineHeight={1.2}
                sx={{ color: "#333" }}
              >
                {order.orderCode}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                <OrderStatusBadge status={order.orderStatus} />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    borderLeft: "1px solid #ddd",
                    pl: 1,
                  }}
                >
                  <TakeoutDiningIcon fontSize="inherit" /> PickUp:{" "}
                  <strong>{order.pickUpCode || "-"}</strong>
                </Typography>
              </Stack>
            </Box>
          </Stack>
          <IconButton onClick={onClose} sx={{ color: "#999" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3, flex: 1, overflowY: "auto" }}>
          <Stack spacing={3}>
            <OrderTimeline status={order.orderStatus} />

            <OrderActionBoard
              status={order.orderStatus}
              paidAt={order.paidAt}
              isLoading={isLoading}
              onStatusChange={handleStatusChange}
              onPaymentConfirm={handlePaymentConfirm}
              onCancel={handleOpenCancelOrder}
            />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <OrderCustomerInfo
                  order={order}
                  isEditing={isEditing}
                  editForm={editForm}
                  isLoading={isLoading}
                  setIsEditing={setIsEditing}
                  setEditForm={setEditForm}
                  onSave={handleSaveEdit}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <OrderItemsList
                  order={order}
                  onOpenStatusMenu={handleOpenStatusMenu}
                  onCancelItem={handleOpenCancelItem}
                />
              </Grid>
            </Grid>
          </Stack>
        </Box>
      </Drawer>

      <OrderModals
        cancelDialogOpen={cancelDialogOpen}
        setCancelDialogOpen={setCancelDialogOpen}
        targetItemId={targetItemId}
        targetItemName={targetItemName}
        cancelReason={cancelReason}
        setCancelReason={setCancelReason}
        onConfirmCancel={handleConfirmCancel}
        isLoading={isLoading}
        anchorEl={anchorEl}
        onCloseMenu={() => setAnchorEl(null)}
        onChangeItemStatus={handleChangeItemStatus}
      />
    </>
  );
}
