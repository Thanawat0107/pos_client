import { alpha } from "@mui/material/styles";
import {
  Paper,
  Box,
  Stack,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Button,
  Divider,
} from "@mui/material";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import PrintIcon from "@mui/icons-material/Print";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { getItemStatusConfig } from "../../utility/OrderHelpers";
import { Sd } from "../../helpers/SD";
import { getImage } from "../../helpers/imageHelper";
import type { OrderHeader } from "../../@types/dto/OrderHeader";
import OrderReceiptPDF from "../../components/pages/adminManage/order/orderDetails/OrderReceiptPDF";

interface OrderDetailOption {
  optionGroupName: string;
  optionValueName: string;
  extraPrice: number;
  quantity: number;
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
  order: OrderHeader;
  orderDetails: OrderDetail[];
  subTotal: number;
  discount: number;
  total: number;
  appliedPromoCode?: string;
  canCancel: boolean;
  onCancelItem: (itemId: number, itemName: string) => void;
}

export default function OrderMenuList({
  order,
  orderDetails,
  subTotal,
  discount,
  total,
  // appliedPromoCode,
  canCancel,
  onCancelItem,
}: Props) {
  // const isAllCancelled =
  //   orderDetails?.length > 0 && orderDetails.every((item) => item.isCancelled);

  return (
    <Paper
      sx={{
        p: 0,
        borderRadius: 1,
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        mb: 3,
        position: "relative",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderBottomColor: "divider",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography
            variant="h6"
            fontWeight={800}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              fontSize: { xs: "1.1rem", sm: "1.25rem" },
            }}
          >
            <LocalDiningIcon color="primary" /> รายการอาหาร
            <Chip
              label={`${orderDetails?.length || 0}`}
              size="small"
              sx={{ fontWeight: 700, bgcolor: "action.hover", fontSize: "0.9rem" }}
            />
          </Typography>

          <PDFDownloadLink
            document={<OrderReceiptPDF order={order} />}
            fileName={`Receipt_${order.orderCode}.pdf`}
            style={{ textDecoration: "none" }}
          >
            {({ loading }) => (
              <IconButton
                className="no-print"
                disabled={loading}
                sx={{ bgcolor: "action.hover", p: 1 }}
              >
                <PrintIcon fontSize="small" />
              </IconButton>
            )}
          </PDFDownloadLink>
        </Stack>
      </Box>

      {/* Items List */}
      <Stack spacing={0} sx={{ p: { xs: 1.5, sm: 2 } }}>
        {orderDetails?.map((item, index) => {
          const itemStatus = getItemStatusConfig(item.kitchenStatus);
          const isItemCancelable =
            item.kitchenStatus === Sd.KDS_Waiting ||
            item.kitchenStatus === Sd.KDS_None;
          const showCancelButton =
            canCancel && !item.isCancelled && isItemCancelable;
          const opacity = item.isCancelled ? 0.45 : 1;

          return (
            <Box key={index} sx={{ opacity, transition: "opacity 0.3s" }}>
              {/* Row: image + content (full width on mobile) */}
              <Box sx={{ display: "flex", gap: 1.5, py: 2, alignItems: "flex-start" }}>
                {/* รูปภาพอาหาร */}
                <Avatar
                  src={getImage(item.menuItemImage, "https://placehold.co/85x85?text=Food")}
                  variant="rounded"
                  sx={{
                    width: { xs: 64, sm: 80 },
                    height: { xs: 64, sm: 80 },
                    flexShrink: 0,
                    bgcolor: "background.default",
                    borderWidth: item.isCancelled ? 2 : 1,
                    borderStyle: "solid",
                    borderColor: "divider",
                  }}
                >
                  <RestaurantIcon color="disabled" sx={{ fontSize: 28 }} />
                </Avatar>

                {/* รายละเอียดอาหาร */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {/* ชื่อ + status chip อยู่แถวเดียวกัน */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={800}
                      lineHeight={1.3}
                      sx={{
                        fontSize: { xs: "1rem", sm: "1.1rem" },
                        textDecoration: item.isCancelled ? "line-through" : "none",
                        wordBreak: "break-word",
                      }}
                    >
                      {item.quantity}x {item.menuItemName}
                    </Typography>

                    {/* Status chip — ขวามือชื่ออาหาร */}
                    <Chip
                      label={item.isCancelled ? "ยกเลิกแล้ว" : itemStatus.label}
                      size="small"
                      sx={{
                        flexShrink: 0,
                        fontWeight: 800,
                        fontSize: "0.7rem",
                        bgcolor: (theme) => item.isCancelled ? alpha(theme.palette.error.main, 0.1) : "transparent",
                        border: (theme) => `1.5px solid ${item.isCancelled ? theme.palette.error.light : itemStatus.border}`,
                        color: item.isCancelled ? "error.main" : itemStatus.text,
                      }}
                    />
                  </Box>

                  {/* Options chips — เรียงแนวนอน มีพื้นที่เต็ม */}
                  {item.orderDetailOptions?.length > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: "5px",
                        mt: 0.75,
                        mb: 0.75,
                      }}
                    >
                      {item.orderDetailOptions.map((o, i) => {
                        const labelText = [
                          o.quantity > 1 ? `${o.quantity}x` : "",
                          o.optionValueName,
                          o.extraPrice > 0
                            ? `(+${(o.extraPrice * o.quantity).toLocaleString()})`
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ");
                        return (
                          <Chip
                            key={i}
                            label={labelText}
                            size="small"
                            sx={{
                              height: "24px",
                              bgcolor: (theme) =>
                                item.isCancelled
                                  ? theme.palette.action.hover
                                  : alpha(theme.palette.success.main, 0.1),
                              color: item.isCancelled ? "text.disabled" : "success.main",
                              border: "1px solid",
                              borderColor: item.isCancelled ? "divider" : "success.light",
                              "& .MuiChip-label": {
                                px: 1,
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                              },
                            }}
                          />
                        );
                      })}
                    </Box>
                  )}

                  {/* ราคา + ปุ่มยกเลิกอยู่แถวเดียวกัน */}
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.5 }}>
                    <Typography
                      variant="h6"
                      fontWeight={800}
                      color={item.isCancelled ? "text.disabled" : "primary.main"}
                      sx={{ fontSize: { xs: "1.05rem", sm: "1.15rem" } }}
                    >
                      ฿{item.totalPrice.toLocaleString()}
                    </Typography>

                    {showCancelButton && (
                      <Button
                        className="no-print"
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => onCancelItem(item.id, item.menuItemName)}
                        sx={{
                          fontSize: "0.75rem",
                          py: 0.5,
                          px: 1.5,
                          borderRadius: 1,
                          fontWeight: 800,
                        }}
                      >
                        ยกเลิก
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
              {index < orderDetails.length - 1 && (
                <Divider sx={{ borderStyle: "dashed", my: 1, opacity: 0.6 }} />
              )}
            </Box>
          );
        })}
      </Stack>

      {/* Summary Section - ปรับยอดสุทธิให้ "ตะโกน" ออกมา */}
      <Box
        sx={{
          p: { xs: 2.5, sm: 3 },
          bgcolor: "background.default",
          borderTop: "3px dashed",
          borderTopColor: "divider",
        }}
      >
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body1" color="text.secondary" fontWeight={500}>
              ยอดรวมสินค้า
            </Typography>
            <Typography variant="body1" fontWeight={700}>
              ฿{subTotal?.toLocaleString()}
            </Typography>
          </Stack>
          {discount > 0 && (
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="body1"
                color="error.main"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  fontWeight: 600,
                }}
              >
                <LocalOfferIcon sx={{ fontSize: 18 }} /> ส่วนลด
              </Typography>
              <Typography variant="h6" fontWeight={800} color="error.main">
                -฿{discount.toLocaleString()}
              </Typography>
            </Stack>
          )}
          <Divider sx={{ my: 1.5, borderColor: "rgba(0,0,0,0.05)" }} />
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{ fontSize: { xs: "1.1rem", sm: "1.2rem" } }}
            >
              ยอดสุทธิ
            </Typography>
            <Typography
              variant="h3"
              fontWeight={1000}
              color="primary.main"
              sx={{ fontSize: { xs: "2.5rem", sm: "3rem" }, letterSpacing: -1 }}
            >
              ฿{total.toLocaleString()}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
}
