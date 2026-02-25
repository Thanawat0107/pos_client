import React from "react";
import { TableRow, TableCell, Typography, Stack, Box, Tooltip } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PaidIcon from "@mui/icons-material/Paid";
import SoupKitchenIcon from "@mui/icons-material/SoupKitchen";
import RoomServiceIcon from "@mui/icons-material/RoomService";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import type { OrderHeader } from "../../../../../@types/dto/OrderHeader";
import { paymentMethods, Sd } from "../../../../../helpers/SD";
import { formatThaiDate, formatThaiTime } from "../../../../../utility/utils";
import { useConfirmPaymentMutation, useUpdateOrderStatusMutation } from "../../../../../services/orderApi";
import OrderItemInfo from "./OrderItemInfo";
import OrderItemCustomer from "./OrderItemCustomer";
import OrderStatusBadge from "../../../../../utility/OrderStatusBadge";
import OrderItemActions from "./OrderItemActions";

const UPDATE_STATUS = "UPDATE_STATUS";
const CONFIRM_PAYMENT = "CONFIRM_PAYMENT";

// ─────────────────────────────────────────────
// Row Design Tier (5 ระดับความเร่งด่วน)
// ─────────────────────────────────────────────
interface RowDesign {
  accentColor: string;    // สีเส้นซ้าย
  bgColor: string;        // พื้นหลังแถว
  bgHover: string;        // hover
  animationName: string;  // ชื่อ keyframe ("" = ไม่เล่น)
}

const getRowDesign = (status: string): RowDesign => {
  switch (status) {
    case Sd.Status_Pending:
      return { accentColor: "#F59E0B", bgColor: alpha("#F59E0B", 0.07), bgHover: alpha("#F59E0B", 0.13), animationName: "pulse-amber" };
    case Sd.Status_PendingPayment:
      return { accentColor: "#EF4444", bgColor: alpha("#EF4444", 0.07), bgHover: alpha("#EF4444", 0.13), animationName: "pulse-red" };
    case Sd.Status_Preparing:
      return { accentColor: "#9333EA", bgColor: alpha("#9333EA", 0.06), bgHover: alpha("#9333EA", 0.11), animationName: "" };
    case Sd.Status_Ready:
      return { accentColor: "#22C55E", bgColor: alpha("#22C55E", 0.06), bgHover: alpha("#22C55E", 0.11), animationName: "pulse-green" };
    case Sd.Status_Approved:
    case Sd.Status_Paid:
      return { accentColor: "#3B82F6", bgColor: "transparent", bgHover: "#EFF6FF", animationName: "" };
    case Sd.Status_Completed:
      return { accentColor: "#6EE7B7", bgColor: "transparent", bgHover: "#F0FDF4", animationName: "" };
    case Sd.Status_Cancelled:
      return { accentColor: "#D1D5DB", bgColor: "transparent", bgHover: "#F9FAFB", animationName: "" };
    default:
      return { accentColor: "#E5E7EB", bgColor: "transparent", bgHover: "#F9FAFB", animationName: "" };
  }
};

// ─────────────────────────────────────────────
// Time Helpers
// ─────────────────────────────────────────────
const getElapsedMinutes = (dateStr: string): number =>
  Math.floor((Date.now() - new Date(dateStr).getTime()) / 60_000);

const formatElapsed = (mins: number): string => {
  if (mins < 1) return "เพิ่งมา";
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h} ชม. ${m} น.` : `${h} ชั่วโมงที่แล้ว`;
};

// ─────────────────────────────────────────────
// Action Config
// ─────────────────────────────────────────────
const getNextActionConfig = (row: OrderHeader) => {
  const { orderStatus, paidAt } = row;

  switch (orderStatus) {
    case Sd.Status_Pending:
      return { label: "รับออเดอร์", actionType: UPDATE_STATUS, nextStatus: Sd.Status_Approved, color: "warning" as const, icon: <CheckCircleIcon />, canCancel: true };
    case Sd.Status_PendingPayment:
      return { label: "ยืนยันชำระเงิน", actionType: CONFIRM_PAYMENT, nextStatus: Sd.Status_Paid, color: "error" as const, icon: <PaidIcon />, canCancel: true };
    case Sd.Status_Approved:
    case Sd.Status_Paid:
      return { label: "เริ่มปรุงอาหาร", actionType: UPDATE_STATUS, nextStatus: Sd.Status_Preparing, color: "info" as const, icon: <SoupKitchenIcon />, canCancel: false };
    case Sd.Status_Preparing:
      return { label: "ปรุงเสร็จแล้ว", actionType: UPDATE_STATUS, nextStatus: Sd.Status_Ready, color: "secondary" as const, icon: <RoomServiceIcon />, canCancel: false };
    case Sd.Status_Ready:
      if (!paidAt) return { label: "รับเงินสด / จบงาน", actionType: CONFIRM_PAYMENT, nextStatus: Sd.Status_Paid, color: "success" as const, icon: <PaidIcon />, canCancel: false };
      return { label: "จบงาน / รับของ", actionType: UPDATE_STATUS, nextStatus: Sd.Status_Completed, color: "success" as const, icon: <CheckCircleIcon />, canCancel: false };
    default:
      return null;
  }
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
type Props = {
  row: OrderHeader;
  index: number;
  onView: () => void;
};

export default function ManageOrderItem({ row, index, onView }: Props) {
  const theme = useTheme();
  const actionInfo = getNextActionConfig(row);
  const totalItems = row.orderDetails.reduce((acc, item) => acc + item.quantity, 0);

  const design      = getRowDesign(row.orderStatus);
  const createdMins = getElapsedMinutes(row.createdAt);
  const isNew       = createdMins < 10;

  // เวลาปรุงอาหาร (วัดจาก preparingAt ถ้ามี ไม่งั้นใช้ createdAt)
  const cookingMins =
    row.orderStatus === Sd.Status_Preparing
      ? getElapsedMinutes(row.preparingAt ?? row.createdAt)
      : null;

  // เตือนถ้าปรุงนานเกิน 20 นาที
  const isCookingLong = cookingMins !== null && cookingMins >= 20;

  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
  const [confirmPayment, { isLoading: isPaying }] = useConfirmPaymentMutation();
  const isLoading = isUpdating || isPaying;

  const handleActionClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!actionInfo) return;
    try {
      if (actionInfo.actionType === CONFIRM_PAYMENT) {
        await confirmPayment({ id: row.id, paymentMethod: row.paymentMethod || paymentMethods.paymentStatus_Cash }).unwrap();
      } else {
        await updateStatus({ id: row.id, newStatus: actionInfo.nextStatus! }).unwrap();
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

  return (
    <>
      <style>{`
        @keyframes pulse-amber {
          0%,100% { background-color: #FFFBEB; }
          50%      { background-color: #FDE68A; }
        }
        @keyframes pulse-red {
          0%,100% { background-color: #FFF1F2; }
          50%      { background-color: #FECDD3; }
        }
        @keyframes pulse-green {
          0%,100% { background-color: #F0FDF4; }
          50%      { background-color: #BBF7D0; }
        }
      `}</style>
      <TableRow
        onClick={onView}
        sx={{
          cursor: "pointer",
          bgcolor: design.bgColor,
          animation: design.animationName ? `${design.animationName} 2.5s ease-in-out infinite` : "none",
          "&:hover": { bgcolor: design.bgHover, animationPlayState: "paused" },
          "&:last-child td, &:last-child th": { border: 0 },
        }}
      >
        {/* ── # + Accent border ── */}
        <OrderItemInfo
          index={index}
          orderCode={row.orderCode}
          pickUpCode={row.pickUpCode}
          channel={row.channel}
          accentColor={design.accentColor}
          isNew={isNew}
        />

        {/* ── ลูกค้า + ยอด ── */}
        <OrderItemCustomer
          name={row.customerName}
          phone={row.customerPhone}
          total={row.total}
          totalItems={totalItems}
        />

        {/* ── สถานะ ── */}
        <TableCell sx={{ minWidth: 100 }}>
          <OrderStatusBadge status={row.orderStatus} />
        </TableCell>

        {/* ── เวลาสั่งซื้อ + elapsed ── */}
        <TableCell sx={{ minWidth: 150, py: 2.5 }}>
          <Stack spacing={0.6}>
            {/* เวลา */}
            <Stack direction="row" spacing={0.75} alignItems="center">
              <AccessTimeIcon sx={{ fontSize: 17, color: "text.disabled" }} />
              <Typography sx={{ fontSize: "1.05rem", fontWeight: 800, lineHeight: 1, color: "#1E293B" }}>
                {formatThaiTime(row.createdAt)} น.
              </Typography>
            </Stack>

            {/* วัน + elapsed */}
            <Typography sx={{ fontSize: "0.8rem", color: "text.disabled", fontWeight: 500 }}>
              {formatThaiDate(row.createdAt, { day: "numeric", month: "short" })}
              {" · "}
              <Box component="span" sx={{ color: createdMins < 15 ? "success.main" : "text.disabled", fontWeight: createdMins < 15 ? 700 : 500 }}>
                {formatElapsed(createdMins)}
              </Box>
            </Typography>

            {/* ป้ายเวลาปรุง */}
            {cookingMins !== null && (
              <Tooltip title={isCookingLong ? "ปรุงนานกว่าปกติ! ตรวจสอบสถานะ" : "เวลาที่ใช้ปรุง"}>
                <Stack
                  direction="row"
                  spacing={0.6}
                  alignItems="center"
                  sx={{
                    px: 1,
                    py: 0.35,
                    borderRadius: "8px",
                    display: "inline-flex",
                    bgcolor: isCookingLong ? alpha(theme.palette.error.main, 0.1) : alpha("#9333EA", 0.08),
                    border: `1.5px solid ${isCookingLong ? alpha(theme.palette.error.main, 0.35) : alpha("#9333EA", 0.3)}`,
                    width: "fit-content",
                    cursor: "help",
                    boxShadow: isCookingLong ? "0 0 8px #FECDD388" : "none",
                    animation: isCookingLong ? "pulse 1.5s infinite" : "none",
                  }}
                >
                  {isCookingLong ? (
                    <WhatshotIcon sx={{ fontSize: "0.9rem", color: "error.main" }} />
                  ) : (
                    <SoupKitchenIcon sx={{ fontSize: "0.9rem", color: "#7E22CE" }} />
                  )}
                  <Typography
                    sx={{
                      fontSize: "0.78rem",
                      fontWeight: 800,
                      color: isCookingLong ? "error.main" : "#7E22CE",
                      lineHeight: 1,
                    }}
                  >
                    {isCookingLong ? `ปรุง ${cookingMins} นาที ⚠` : `ปรุง ${cookingMins} นาที`}
                  </Typography>
                </Stack>
              </Tooltip>
            )}
          </Stack>
        </TableCell>

        {/* ── ปุ่มจัดการ ── */}
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

