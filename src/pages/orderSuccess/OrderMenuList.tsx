 import {
  Paper,
  Box,
  Stack,
  Typography,
  IconButton,
  Chip,
  Grid,
  Avatar,
  Button,
  Divider,
  Alert,
  GlobalStyles, // ✅ เพิ่มเพื่อจัดการ Print Style ทั่วทั้งหน้า
} from "@mui/material";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import PrintIcon from "@mui/icons-material/Print";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { getItemStatusConfig } from "../../utility/OrderHelpers";
import { Sd } from "../../helpers/SD";

interface OrderDetailOption {
  optionGroupName: string;
  optionValueName: string;
  extraPrice: number;
  quantity: number; // ✅ เพิ่ม Field จำนวนของตัวเลือก
}

interface OrderDetail {
  id: number;
  menuItemId: number;
  menuItemName: string;
  menuItemImage?: string;
  quantity: number;
  totalPrice: number;
  kitchenStatus: string;
  isCancelled: boolean;
  orderDetailOptions: OrderDetailOption[];
}

interface Props {
  orderDetails: OrderDetail[];
  subTotal: number;
  discount: number;
  total: number;
  appliedPromoCode?: string;
  canCancel: boolean;
  onCancelItem: (itemId: number, itemName: string) => void;
}

export default function OrderMenuList({
  orderDetails,
  subTotal,
  discount,
  total,
  appliedPromoCode,
  canCancel,
  onCancelItem,
}: Props) {
  // ✅ ตรวจสอบว่ารายการทั้งหมดถูกยกเลิกหรือไม่
  const isAllCancelled =
    orderDetails?.length > 0 && orderDetails.every((item) => item.isCancelled);

  return (
    <Paper
      sx={{
        p: 0,
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        mb: 3,
        position: "relative",
      }}
    >
      {/* ✅ 1. Print Styles: ซ่อนสิ่งที่ไม่จำเป็นเวลาพิมพ์ออกกระดาษ */}
      <GlobalStyles
        styles={{
          "@media print": {
            "button, .no-print, .MuiIconButton-root, .MuiAlert-root": {
              display: "none !important",
            },
            body: { backgroundColor: "#fff !important" },
            ".MuiPaper-root": {
              boxShadow: "none !important",
              border: "1px solid #eee",
            },
          },
        }}
      />

      {/* Header */}
      <Box sx={{ p: 2.5, bgcolor: "#fff", borderBottom: "1px solid #eee" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography
            variant="h6"
            fontWeight={800}
            sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
          >
            <LocalDiningIcon color="primary" /> รายการอาหาร
            <Chip
              label={`${orderDetails?.length || 0}`}
              size="small"
              sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}
            />
          </Typography>

          <IconButton
            className="no-print" // ✅ ใส่ class เพื่อซ่อนตอนพิมพ์
            size="small"
            onClick={() => window.print()}
            sx={{ bgcolor: "#f5f5f5" }}
          >
            <PrintIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {/* ✅ 2. Empty/All Cancelled State */}
      {isAllCancelled && (
        <Box sx={{ p: 3, textAlign: "center", bgcolor: "#FFF5F5" }}>
          <ErrorOutlineIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="subtitle1" fontWeight={700} color="error.main">
            รายการอาหารทั้งหมดถูกยกเลิกแล้ว
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ยอดชำระคืนจะดำเนินการตามนโยบายของร้าน
          </Typography>
        </Box>
      )}

      {/* Items List */}
      <Stack spacing={0} sx={{ p: 2 }}>
        {orderDetails?.map((item, index) => {
          const itemStatus = getItemStatusConfig(item.kitchenStatus);
          const isItemCancelable =
            item.kitchenStatus === Sd.KDS_Waiting ||
            item.kitchenStatus === Sd.KDS_None;
          const showCancelButton =
            canCancel && !item.isCancelled && isItemCancelable;
          const opacity = item.isCancelled ? 0.4 : 1;

          return (
            <Box key={index} sx={{ opacity, transition: "opacity 0.3s" }}>
              <Grid container spacing={2} alignItems="center" sx={{ py: 2 }}>
                <Grid>
                  <Avatar
                    src={item.menuItemImage}
                    variant="rounded"
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: "#f5f5f5",
                      border: item.isCancelled ? "2px solid #ddd" : "none",
                    }}
                  >
                    <RestaurantIcon color="disabled" />
                  </Avatar>
                </Grid>

                <Grid size="grow">
                  <Typography
                    variant="subtitle1"
                    fontWeight={800}
                    lineHeight={1.2}
                    sx={{
                      textDecoration: item.isCancelled
                        ? "line-through"
                        : "none",
                    }}
                  >
                    {item.quantity}x {item.menuItemName}
                  </Typography>

                  {/* ✅ 3. ปรับปรุงการแสดง Options (เพิ่ม Quantity และผลรวมราคา) */}
                  {item.orderDetailOptions?.length > 0 && (
                    <Stack
                      direction="row"
                      flexWrap="wrap"
                      gap={0.5}
                      sx={{ mt: 0.8 }}
                    >
                      {item.orderDetailOptions.map((o, i) => (
                        <Chip
                          key={i}
                          label={
                            <>
                              {o.quantity > 1 && (
                                <strong>{o.quantity}x </strong>
                              )}
                              {o.optionValueName}
                              {o.extraPrice > 0 &&
                                ` (+${(o.extraPrice * o.quantity).toLocaleString()})`}
                            </>
                          }
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: "0.72rem",
                            bgcolor: item.isCancelled ? "#eee" : "#E8F5E9",
                            color: item.isCancelled ? "#999" : "#2E7D32",
                            border: "1px solid",
                            borderColor: item.isCancelled ? "#ddd" : "#C8E6C9",
                          }}
                        />
                      ))}
                    </Stack>
                  )}

                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color={item.isCancelled ? "text.disabled" : "primary.main"}
                    sx={{ mt: 0.5 }}
                  >
                    ฿{item.totalPrice.toLocaleString()}
                  </Typography>
                </Grid>

                <Grid sx={{ textAlign: "right", minWidth: 100 }}>
                  <Chip
                    label={item.isCancelled ? "ยกเลิกแล้ว" : itemStatus.label}
                    icon={!item.isCancelled ? itemStatus.icon : undefined}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      bgcolor: item.isCancelled ? "#ffebee" : "transparent",
                      border: `1px solid ${item.isCancelled ? "#ffcdd2" : itemStatus.border}`,
                      color: item.isCancelled ? "#d32f2f" : itemStatus.text,
                    }}
                  />

                  {showCancelButton && (
                    <Button
                      className="no-print"
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => onCancelItem(item.id, item.menuItemName)}
                      sx={{
                        fontSize: "0.7rem",
                        py: 0.3,
                        width: "100%",
                        mt: 1,
                        borderRadius: 2,
                        fontWeight: 700,
                      }}
                    >
                      ยกเลิกจานนี้
                    </Button>
                  )}
                </Grid>
              </Grid>
              {index < orderDetails.length - 1 && (
                <Divider sx={{ borderStyle: "dashed", opacity: 0.5 }} />
              )}
            </Box>
          );
        })}

        {/* Info Alert (ซ่อนเวลาพิมพ์) */}
        {!canCancel && !isAllCancelled && (
          <Alert
            severity="info"
            sx={{ mt: 2, fontSize: "0.85rem", borderRadius: 3 }}
            className="no-print"
          >
            <Typography variant="caption" fontWeight={600}>
              * ร้านกำลังเตรียมอาหารให้คุณแล้ว
              หากต้องการแก้ไขกรุณาติดต่อพนักงานโดยตรง
            </Typography>
          </Alert>
        )}
      </Stack>

      {/* Summary Section */}
      <Box sx={{ p: 2.5, bgcolor: "#FAFAFA", borderTop: "2px dashed #eee" }}>
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">ยอดรวมสินค้า</Typography>
            <Typography fontWeight={600}>
              ฿{subTotal?.toLocaleString()}
            </Typography>
          </Stack>

          {discount > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography
                color="error"
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <LocalOfferIcon fontSize="small" /> ส่วนลด{" "}
                {appliedPromoCode && `(${appliedPromoCode})`}
              </Typography>
              <Typography fontWeight={700} color="error">
                -฿{discount.toLocaleString()}
              </Typography>
            </Stack>
          )}

          <Divider sx={{ my: 1 }} />
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight={800} color="text.secondary">
              ยอดสุทธิ
            </Typography>
            <Typography variant="h4" fontWeight={900} color="primary.main">
              ฿{total.toLocaleString()}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
}
