/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Card,
  Box,
  Typography,
  Stack,
  Avatar,
  Chip,
  Button,
  Tooltip,
  IconButton,
  Divider,
} from "@mui/material";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { Sd } from "../../../../../helpers/SD";

const getItemStatusInfo = (status: string) => {
  switch (status) {
    case Sd.KDS_Waiting:
      return {
        label: "รอคิว",
        color: "inherit",
        bg: "#f5f5f5",
        text: "#757575",
      };
    case Sd.KDS_Cooking:
      return {
        label: "กำลังปรุง",
        color: "warning",
        bg: "#fff3e0",
        text: "#e65100",
      };
    case Sd.KDS_Done:
      return {
        label: "เสร็จแล้ว",
        color: "success",
        bg: "#e8f5e9",
        text: "#2e7d32",
      };
    case Sd.KDS_Cancelled:
      return {
        label: "ยกเลิก",
        color: "error",
        bg: "#ffebee",
        text: "#c62828",
      };
    default:
      return {
        label: "รอคิว",
        color: "inherit",
        bg: "#f5f5f5",
        text: "#757575",
      };
  }
};

type Props = {
  order: any;
  onOpenStatusMenu: (e: React.MouseEvent<HTMLElement>, id: number) => void;
  onCancelItem: (id: number, name: string) => void;
};

export default function OrderItemsList({
  order,
  onOpenStatusMenu,
  onCancelItem,
}: Props) {
  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e0e0e0" }}>
      {/* Header */}
      <Box sx={{ p: 2, bgcolor: "#fafafa", borderBottom: "1px solid #eee" }}>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <RestaurantMenuIcon color="action" /> รายการอาหาร (
          {order.orderDetails.length})
        </Typography>
      </Box>

      {/* Items List */}
      <Box sx={{ p: 2 }}>
        {order.orderDetails.map((item: any) => {
          const statusInfo = getItemStatusInfo(item.kitchenStatus);

          // ✅ Logic: สามารถยกเลิกได้ไหม?
          // (ต้องไม่ถูกยกเลิกไปก่อนหน้า, สถานะครัวไม่ใช่ Done, และออเดอร์ยังไม่จบ)
          const canCancelThisItem =
            !item.isCancelled &&
            item.kitchenStatus !== Sd.KDS_Done &&
            ![
              Sd.Status_Completed,
              Sd.Status_Cancelled,
              Sd.Status_Ready,
            ].includes(order.orderStatus);

          return (
            <Box
              key={item.id}
              sx={{
                mb: 2,
                pb: 2,
                borderBottom: "1px dashed #eee",
                "&:last-child": { borderBottom: 0, pb: 0, mb: 0 },
                opacity: item.isCancelled ? 0.6 : 1, // ปรับ opacity ให้น้อยลงนิดหน่อยเพื่อความชัดเจน
              }}
            >
              <Stack direction="row" spacing={2}>
                <Avatar
                  variant="rounded"
                  src={item.menuItemImage}
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: "#eee",
                    border: "1px solid #eee",
                  }}
                >
                  <RestaurantMenuIcon color="disabled" />
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Box>
                      <Typography
                        variant="body1"
                        fontWeight={700}
                        sx={{
                          color: item.isCancelled ? "text.disabled" : "#333",
                          textDecoration: item.isCancelled
                            ? "line-through"
                            : "none",
                        }}
                      >
                        {item.menuItemName}
                      </Typography>

                      {/* รายการ Option เสริม */}
                      {item.orderDetailOptions?.map((opt: any) => (
                        <Typography
                          key={opt.id}
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ pl: 1 }}
                        >
                          • {opt.optionValueName}
                        </Typography>
                      ))}
                    </Box>
                    <Typography variant="body1" fontWeight={700}>
                      ฿{item.totalPrice.toLocaleString()}
                    </Typography>
                  </Stack>

                  {/* Action Buttons สำหรับรายการที่ยังไม่ถูกยกเลิก */}
                  {!item.isCancelled && (
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      mt={1.5}
                    >
                      <Chip
                        label={`x ${item.quantity}`}
                        size="small"
                        sx={{ borderRadius: 1, fontWeight: 700, height: 20 }}
                      />

                      {/* ปุ่มเปลี่ยนสถานะรายจาน */}
                      <Button
                        size="small"
                        variant="contained"
                        onClick={(e) => onOpenStatusMenu(e, item.id)}
                        endIcon={<KeyboardArrowDownIcon />}
                        disableElevation
                        sx={{
                          borderRadius: 1.5,
                          textTransform: "none",
                          fontSize: "0.7rem",
                          px: 1.5,
                          py: 0.2,
                          bgcolor: statusInfo.bg,
                          color: statusInfo.text,
                          fontWeight: 800,
                          "&:hover": {
                            bgcolor: statusInfo.bg,
                            filter: "brightness(0.9)",
                          },
                        }}
                      >
                        {statusInfo.label}
                      </Button>

                      {/* ✅ ปุ่มยกเลิกรายจาน พร้อมเช็คเงื่อนไขความปลอดภัย */}
                      {canCancelThisItem && (
                        <Tooltip title="ยกเลิกเมนูนี้">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              onCancelItem(item.id, item.menuItemName)
                            }
                            sx={{
                              border: "1px solid",
                              borderColor: "error.light",
                              p: 0.3,
                            }}
                          >
                            <DeleteForeverIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  )}
                </Box>
              </Stack>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ p: 3, bgcolor: "#fffbfb", borderTop: "2px dashed #eee" }}>
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              รวมค่าอาหาร
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              ฿{order.subTotal.toLocaleString()}
            </Typography>
          </Stack>
          {order.discount > 0 && (
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ color: "error.main" }}
            >
              <Typography variant="body2">ส่วนลด</Typography>
              <Typography variant="body2" fontWeight={600}>
                -฿{order.discount.toLocaleString()}
              </Typography>
            </Stack>
          )}
          <Divider sx={{ my: 1 }} />
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight={700} color="text.primary">
              ยอดสุทธิ
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ color: "#D32F2F" }}>
              ฿{order.total.toLocaleString()}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
}
