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
  onOpenStatusMenu: (e: React.MouseEvent<HTMLElement>, id: number, currentStatus: string) => void;
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
      <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, bgcolor: "#fafafa", borderBottom: "1px solid #eee" }}>
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{ display: "flex", alignItems: "center", gap: 1, color: "#222" }}
        >
          <RestaurantMenuIcon color="action" fontSize="medium" /> รายการอาหาร ({order.orderDetails.length} รายการ)
        </Typography>
      </Box>

      {/* Items List */}
      <Box sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
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
                mb: 2.5,
                pb: 2.5,
                borderBottom: "1px dashed #eee",
                "&:last-child": { borderBottom: 0, pb: 0, mb: 0 },
                opacity: item.isCancelled ? 0.55 : 1,
              }}
            >
              <Stack direction="row" spacing={2}>
                <Avatar
                  variant="rounded"
                  src={item.menuItemImage}
                  sx={{
                    width: { xs: 72, sm: 80 },
                    height: { xs: 72, sm: 80 },
                    bgcolor: "#f0f0f0",
                    border: "1px solid #e0e0e0",
                    flexShrink: 0,
                  }}
                >
                  <RestaurantMenuIcon color="disabled" sx={{ fontSize: 32 }} />
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    gap={1}
                  >
                    <Box flex={1} minWidth={0}>
                      <Typography
                        variant="subtitle1"
                        fontWeight={800}
                        sx={{
                          color: item.isCancelled ? "text.disabled" : "#1a1a1a",
                          textDecoration: item.isCancelled ? "line-through" : "none",
                          fontSize: { xs: "0.95rem", sm: "1.05rem" },
                          lineHeight: 1.3,
                        }}
                      >
                        {item.menuItemName}
                      </Typography>

                      {/* รายการ Option เสริม */}
                      {item.orderDetailOptions?.map((opt: any) => (
                        <Typography
                          key={opt.id}
                          variant="body2"
                          color="text.secondary"
                          display="block"
                          sx={{ pl: 1.5, mt: 0.25, fontSize: "0.82rem" }}
                        >
                          • {opt.optionValueName}
                        </Typography>
                      ))}
                    </Box>
                    <Typography
                      fontWeight={800}
                      sx={{ fontSize: { xs: "1rem", sm: "1.1rem" }, color: "#D32F2F", whiteSpace: "nowrap" }}
                    >
                      ฿{item.totalPrice.toLocaleString()}
                    </Typography>
                  </Stack>

                  {/* Action Buttons สำหรับรายการที่ยังไม่ถูกยกเลิก */}
                  {!item.isCancelled && (
                    <Stack
                      direction="row"
                      alignItems="center"
                      flexWrap="wrap"
                      spacing={1}
                      mt={1.5}
                    >
                      <Chip
                        label={`x ${item.quantity}`}
                        sx={{ borderRadius: 1.5, fontWeight: 800, height: 26, fontSize: "0.85rem" }}
                      />

                      {/* ปุ่มเปลี่ยนสถานะรายจาน */}
                      <Button
                        size="medium"
                        variant="contained"
                        onClick={(e) => onOpenStatusMenu(e, item.id, item.kitchenStatus)}
                        endIcon={<KeyboardArrowDownIcon />}
                        disableElevation
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontSize: "0.82rem",
                          px: 2,
                          py: 0.6,
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

      <Box sx={{ px: { xs: 2, sm: 3 }, py: 2.5, bgcolor: "#fffbfb", borderTop: "2px dashed #eee" }}>
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body1" color="text.secondary" fontWeight={600}>
              รวมค่าอาหาร
            </Typography>
            <Typography variant="body1" fontWeight={700}>
              ฿{order.subTotal.toLocaleString()}
            </Typography>
          </Stack>
          {order.discount > 0 && (
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ color: "error.main" }}>
              <Typography variant="body1" fontWeight={600}>ส่วนลด</Typography>
              <Typography variant="body1" fontWeight={700}>
                -฿{order.discount.toLocaleString()}
              </Typography>
            </Stack>
          )}
          <Divider sx={{ my: 0.5 }} />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={800} color="text.primary">
              ยอดสุทธิ
            </Typography>
            <Typography
              fontWeight={900}
              sx={{ color: "#D32F2F", fontSize: { xs: "1.8rem", sm: "2.2rem" } }}
            >
              ฿{order.total.toLocaleString()}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
}
