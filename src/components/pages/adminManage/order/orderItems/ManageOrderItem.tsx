import React from "react";
import { TableRow, TableCell, Typography, Stack, Box } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PaidIcon from "@mui/icons-material/Paid";
import SoupKitchenIcon from "@mui/icons-material/SoupKitchen";
import RoomServiceIcon from "@mui/icons-material/RoomService";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { OrderHeader } from "../../../../../@types/dto/OrderHeader";
import { paymentMethods, Sd } from "../../../../../helpers/SD";
import { useConfirmPaymentMutation, useUpdateOrderStatusMutation } from "../../../../../services/orderApi";
import OrderItemInfo from "./OrderItemInfo";
import OrderItemCustomer from "./OrderItemCustomer";
import OrderStatusBadge from "../../../../../utility/OrderStatusBadge";
import OrderItemActions from "./OrderItemActions";

const getNextActionConfig = (row: OrderHeader) => {
  const { orderStatus, paidAt } = row;
  switch (orderStatus) {
    case Sd.Status_Pending:
      return {
        label: "รับออเดอร์",
        actionType: "UPDATE_STATUS",
        nextStatus: Sd.Status_Approved,
        color: "warning" as const,
        icon: <CheckCircleIcon />,
      };
    case Sd.Status_PendingPayment:
      return {
        label: "ยืนยันชำระเงิน",
        actionType: "CONFIRM_PAYMENT",
        nextStatus: Sd.Status_Paid,
        color: "error" as const,
        icon: <PaidIcon />,
      };
    case Sd.Status_Approved:
    case Sd.Status_Paid:
      return {
        label: "เริ่มปรุงอาหาร",
        actionType: "UPDATE_STATUS",
        nextStatus: Sd.Status_Preparing,
        color: "primary" as const,
        icon: <SoupKitchenIcon />,
      };
    case Sd.Status_Preparing:
      return {
        label: "ปรุงเสร็จแล้ว",
        actionType: "UPDATE_STATUS",
        nextStatus: Sd.Status_Ready,
        color: "secondary" as const,
        icon: <RoomServiceIcon />,
      };
    case Sd.Status_Ready:
      if (!paidAt)
        return {
          label: "รับเงินสด",
          actionType: "CONFIRM_PAYMENT",
          nextStatus: Sd.Status_Paid,
          color: "info" as const,
          icon: <PaidIcon />,
        };
      return {
        label: "จบงาน/รับของ",
        actionType: "UPDATE_STATUS",
        nextStatus: Sd.Status_Completed,
        color: "success" as const,
        icon: <CheckCircleIcon />,
      };
    default:
      return null;
  }
};

type Props = {
  row: OrderHeader;
  index: number;
  onView: () => void;
};

export default function ManageOrderItem({ row, index, onView }: Props) {
  const actionInfo = getNextActionConfig(row);
  const totalItems = row.orderDetails.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );
  const isPending = row.orderStatus === Sd.Status_Pending;

  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateOrderStatusMutation();
  const [confirmPayment, { isLoading: isPaying }] = useConfirmPaymentMutation();
  const isLoading = isUpdating || isPaying;

  const handleActionClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!actionInfo) return;
    try {
      if (actionInfo.actionType === "CONFIRM_PAYMENT") {
        const defaultMethod =
          paymentMethods.find((p) => p.value === "cash")?.value || "cash";
        await confirmPayment({
          id: row.id,
          paymentMethod: defaultMethod,
        }).unwrap();
      } else {
        await updateStatus({
          id: row.id,
          newStatus: actionInfo.nextStatus!,
        }).unwrap();
      }
    } catch (err) {
      console.error("Action failed", err);
    }
  };

  const handleCancelClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("ยืนยันการปฏิเสธ/ยกเลิกออเดอร์นี้?")) {
      try {
        await updateStatus({
          id: row.id,
          newStatus: Sd.Status_Cancelled,
        }).unwrap();
      } catch (err) {
        console.error("Cancel failed", err);
      }
    }
  };

  const bgStyle = isPending
    ? {
        bgcolor: "#fff3e0",
        animation: "pulse-bg 2s infinite",
        "&:hover": { bgcolor: "#ffe0b2" },
      }
    : { transition: "0.2s", "&:hover": { bgcolor: "action.hover" } };

  return (
    <>
      <style>{`@keyframes pulse-bg { 0% { background-color: #fff3e0; } 50% { background-color: #ffe0b2; } 100% { background-color: #fff3e0; } }`}</style>
      <TableRow
        hover={!isPending}
        onClick={onView}
        sx={{
          cursor: "pointer",
          "&:last-child td, &:last-child th": { border: 0 },
          ...bgStyle,
        }}
      >
        {/* Component 1: Info */}
        <OrderItemInfo
          index={index}
          orderCode={row.orderCode}
          pickUpCode={row.pickUpCode}
          channel={row.channel}
        />

        {/* Component 2: Customer */}
        <OrderItemCustomer
          name={row.customerName}
          phone={row.customerPhone}
          total={row.total}
          totalItems={totalItems}
        />

        {/* Status Badge (Reuse existing) */}
        <TableCell sx={{ minWidth: 100 }}>
          <OrderStatusBadge status={row.orderStatus} />
        </TableCell>

        {/* Time Column (Small enough to keep here or extract if needed) */}
        <TableCell sx={{ minWidth: 100 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <AccessTimeIcon
              fontSize="inherit"
              sx={{ color: "text.disabled" }}
            />
            <Box>
              <Typography variant="caption" display="block" fontWeight={600}>
                {new Date(row.createdAt).toLocaleTimeString("th-TH", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                น.
              </Typography>
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ fontSize: "10px" }}
              >
                {new Date(row.createdAt).toLocaleDateString("th-TH", {
                  day: "numeric",
                  month: "short",
                })}
              </Typography>
            </Box>
          </Stack>
        </TableCell>

        {/* Component 3: Actions */}
        <OrderItemActions
          actionInfo={actionInfo}
          isLoading={isLoading}
          isPending={isPending}
          onActionClick={handleActionClick}
          onCancelClick={handleCancelClick}
          onViewClick={onView}
        />
      </TableRow>
    </>
  );
}
