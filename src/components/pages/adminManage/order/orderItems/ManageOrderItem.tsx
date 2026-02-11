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

const UPDATE_STATUS = "UPDATE_STATUS";
const CONFIRM_PAYMENT = "CONFIRM_PAYMENT";

const getNextActionConfig = (row: OrderHeader) => {
  const { orderStatus, paidAt } = row;

  switch (orderStatus) {
    case Sd.Status_Pending: // ออเดอร์เงินสด <= 200 รอพนักงานกดยืนยัน
      return {
        label: "รับออเดอร์",
        actionType: UPDATE_STATUS,
        nextStatus: Sd.Status_Approved,
        color: "warning" as const,
        icon: <CheckCircleIcon />,
        canCancel: true, // อนุญาตให้ยกเลิกได้
      };

    case Sd.Status_PendingPayment: // รอโอนเงิน (PromptPay) หรือ ยอดเงินสดสูง
      return {
        label: "ยืนยันชำระเงิน",
        actionType: CONFIRM_PAYMENT,
        nextStatus: Sd.Status_Paid,
        color: "error" as const,
        icon: <PaidIcon />,
        canCancel: true, // อนุญาตให้ยกเลิกได้ (กรณีโอนไม่สำเร็จ/เปลี่ยนใจ)
      };

    case Sd.Status_Approved:
    case Sd.Status_Paid: // ออเดอร์พร้อมทำ
      return {
        label: "เริ่มปรุงอาหาร",
        actionType: UPDATE_STATUS,
        nextStatus: Sd.Status_Preparing,
        color: "info" as const,
        icon: <SoupKitchenIcon />,
        canCancel: false,
      };

    case Sd.Status_Preparing:
      return {
        label: "ปรุงเสร็จแล้ว",
        actionType: UPDATE_STATUS,
        nextStatus: Sd.Status_Ready,
        color: "secondary" as const,
        icon: <RoomServiceIcon />,
        canCancel: false,
      };

    case Sd.Status_Ready:
      if (!paidAt) {
        // กรณีรับของแล้วค่อยจ่ายเงินสดหน้าร้าน
        return {
          label: "รับเงินสด / จบงาน",
          actionType: CONFIRM_PAYMENT,
          nextStatus: Sd.Status_Paid,
          color: "success" as const,
          icon: <PaidIcon />,
          canCancel: false,
        };
      }
      return {
        label: "จบงาน / รับของ",
        actionType: UPDATE_STATUS,
        nextStatus: Sd.Status_Completed,
        color: "success" as const,
        icon: <CheckCircleIcon />,
        canCancel: false,
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
  const totalItems = row.orderDetails.reduce((acc, item) => acc + item.quantity, 0);
  
  // กำหนดว่าออเดอร์ไหนต้อง "เตือน" เป็นพิเศษ (รอรับออเดอร์ หรือ รอเงินโอน)
  const isUrgent = row.orderStatus === Sd.Status_Pending || row.orderStatus === Sd.Status_PendingPayment;

  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
  const [confirmPayment, { isLoading: isPaying }] = useConfirmPaymentMutation();
  const isLoading = isUpdating || isPaying;

  const handleActionClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!actionInfo) return;

    try {
      if (actionInfo.actionType === CONFIRM_PAYMENT) {
        // ✅ ปรับแก้: ใช้ PaymentMethod เดิมที่มากับ Order ไม่ล็อคเป็น Cash อย่างเดียว
        await confirmPayment({
          id: row.id,
          paymentMethod: row.paymentMethod || paymentMethods.paymentStatus_Cash,
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
        await updateStatus({ id: row.id, newStatus: Sd.Status_Cancelled }).unwrap();
      } catch (err) {
        console.error("Cancel failed", err);
      }
    }
  };

  // Pulse effect เฉพาะออเดอร์ที่พนักงานต้อง Action ทันที
  const bgStyle = isUrgent
    ? {
        bgcolor: row.orderStatus === Sd.Status_Pending ? "#fff3e0" : "#fce4ec",
        animation: "pulse-bg 2s infinite",
        "&:hover": { bgcolor: row.orderStatus === Sd.Status_Pending ? "#ffe0b2" : "#f8bbd0" },
      }
    : { transition: "0.2s", "&:hover": { bgcolor: "action.hover" } };

  return (
    <>
      <style>{`
        @keyframes pulse-bg { 
          0% { opacity: 1; } 
          50% { opacity: 0.8; } 
          100% { opacity: 1; } 
        }
      `}</style>
      <TableRow
        hover={!isUrgent}
        onClick={onView}
        sx={{ cursor: "pointer", "&:last-child td, &:last-child th": { border: 0 }, ...bgStyle }}
      >
        <OrderItemInfo
          index={index}
          orderCode={row.orderCode}
          pickUpCode={row.pickUpCode}
          channel={row.channel}
        />

        <OrderItemCustomer
          name={row.customerName}
          phone={row.customerPhone}
          total={row.total}
          totalItems={totalItems}
        />

        <TableCell sx={{ minWidth: 100 }}>
          <OrderStatusBadge status={row.orderStatus} />
        </TableCell>

        <TableCell sx={{ minWidth: 100 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <AccessTimeIcon fontSize="inherit" sx={{ color: "text.disabled" }} />
            <Box>
              <Typography variant="caption" display="block" fontWeight={600}>
                {new Date(row.createdAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: "10px" }}>
                {new Date(row.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
              </Typography>
            </Box>
          </Stack>
        </TableCell>

        <OrderItemActions
          actionInfo={actionInfo}
          isLoading={isLoading}
          isPending={false}
          canCancel={actionInfo?.canCancel ?? false}
          onActionClick={handleActionClick}
          onCancelClick={handleCancelClick}
          onViewClick={onView}
        />
      </TableRow>
    </>
  );
}
