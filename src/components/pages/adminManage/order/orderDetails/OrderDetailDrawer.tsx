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
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { registerPdfFonts } from "../../../../../hooks/useFont";
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
import OrderReceiptPDF from "./OrderReceiptPDF";

// register Thai font for PDF
registerPdfFonts();

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
  const [selectedItemStatus, setSelectedItemStatus] = useState<string>("");

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
    currentStatus: string,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedItemId(itemId);
    setSelectedItemStatus(currentStatus);
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
          sx: { width: { xs: "100%", sm: "90vw", md: 700 }, bgcolor: BG_COLOR },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            pt: 2.5,
            pb: 2,
            bgcolor: "white",
            borderBottom: "2px solid #f0f0f0",
          }}
        >
          <div className="flex items-start justify-between gap-2">
            {/* Left: order info */}
            <Stack spacing={1.5} flex={1} minWidth={0}>
              {/* Order code row */}
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  sx={{
                    bgcolor: "#ffebee",
                    color: BRAND_COLOR,
                    width: { xs: 44, sm: 52 },
                    height: { xs: 44, sm: 52 },
                    flexShrink: 0,
                  }}
                >
                  <ReceiptLongIcon sx={{ fontSize: { xs: 22, sm: 28 } }} />
                </Avatar>
                <Box minWidth={0}>
                  <Typography
                    variant="h5"
                    fontWeight={900}
                    sx={{
                      color: "#1a1a1a",
                      lineHeight: 1.1,
                      fontSize: { xs: "1.3rem", sm: "1.6rem" },
                      letterSpacing: 0.5,
                    }}
                  >
                    {order.orderCode}
                  </Typography>
                  <Box mt={0.5}>
                    <OrderStatusBadge status={order.orderStatus} />
                  </Box>
                </Box>
              </Stack>

              {/* PickUp code — big & prominent */}
              {order.pickUpCode ? (
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1.5,
                    bgcolor: BRAND_COLOR,
                    borderRadius: 3,
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1.2, sm: 1.5 },
                    boxShadow: "0 4px 16px rgba(211,47,47,0.35)",
                    width: "fit-content",
                  }}
                >
                  <TakeoutDiningIcon
                    sx={{ color: "white", fontSize: { xs: 28, sm: 36 } }}
                  />
                  <Box>
                    <Typography
                      sx={{
                        color: "rgba(255,255,255,0.75)",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        lineHeight: 1,
                      }}
                    >
                      รหัสรับออเดอร์ · PICK UP
                    </Typography>
                    <Typography
                      sx={{
                        color: "white",
                        fontWeight: 900,
                        lineHeight: 1.1,
                        letterSpacing: 4,
                        fontSize: { xs: "2.4rem", sm: "3rem" },
                      }}
                    >
                      {order.pickUpCode}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    bgcolor: "#f5f5f5",
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    width: "fit-content",
                  }}
                >
                  <TakeoutDiningIcon fontSize="small" sx={{ color: "#aaa" }} />
                  <Typography
                    variant="body2"
                    sx={{ color: "#aaa", fontWeight: 600 }}
                  >
                    ไม่มีรหัส Pick Up
                  </Typography>
                </Stack>
              )}
            </Stack>

            {/* Right: actions */}
            <Stack spacing={1} alignItems="flex-end" flexShrink={0}>
              <IconButton
                onClick={onClose}
                sx={{
                  color: "#888",
                  bgcolor: "#f5f5f5",
                  "&:hover": { bgcolor: "#ffe0e0", color: BRAND_COLOR },
                }}
              >
                <CloseIcon />
              </IconButton>

              {/* PDF Download button */}
              <PDFDownloadLink
                document={<OrderReceiptPDF order={order} />}
                fileName={`receipt-${order.orderCode}.pdf`}
                style={{ textDecoration: "none" }}
              >
                {({ loading }) => (
                  <IconButton
                    disabled={loading}
                    title="ดาวน์โหลดใบเสร็จ PDF"
                    sx={{
                      color: loading ? "#bbb" : "#2e7d32",
                      bgcolor: "#f5f5f5",
                      borderRadius: 2,
                      "&:hover": { bgcolor: "#e8f5e9", color: "#1b5e20" },
                    }}
                  >
                    <LocalPrintshopIcon />
                  </IconButton>
                )}
              </PDFDownloadLink>
            </Stack>
          </div>
        </Box>

        {/* Content */}
        <Box sx={{ p: { xs: 2, sm: 3 }, flex: 1, overflowY: "auto" }}>
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
        currentItemStatus={selectedItemStatus}
      />
    </>
  );
}
