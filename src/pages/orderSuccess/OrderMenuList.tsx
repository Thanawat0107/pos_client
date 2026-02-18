 import {
  Paper,
  Box,
  Stack,
  Typography,
  IconButton,
  Chip,
  Grid, // ใช้ Grid เพื่อการจัดการพื้นที่ที่แม่นยำขึ้น
  Avatar,
  Button,
  Divider,
} from "@mui/material";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import PrintIcon from "@mui/icons-material/Print";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { getItemStatusConfig } from "../../utility/OrderHelpers";
import { Sd } from "../../helpers/SD";

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
  // appliedPromoCode,
  canCancel,
  onCancelItem,
}: Props) {
  // const isAllCancelled =
  //   orderDetails?.length > 0 && orderDetails.every((item) => item.isCancelled);

  const handlePrint = () => {
    // 1. เก็บชื่อ Title เดิมไว้ก่อน (เช่น "My Website")
    const originalTitle = document.title;

    // 2. ตั้งชื่อไฟล์ที่ต้องการ (เบราว์เซอร์จะเติม .pdf ให้เอง)
    // สมมติชื่อไฟล์คือ Receipt_# ตามด้วย ID ออเดอร์
    document.title = `Receipt_Order_#${orderDetails[0]?.id || "New"}`;

    // 3. สั่งพิมพ์
    window.print();

    // 4. เปลี่ยน Title กลับเป็นเหมือนเดิมหลังจากหน้าต่างพิมพ์เปิดขึ้นมาแล้ว
    // ใช้ setTimeout เล็กน้อยเพื่อให้เบราว์เซอร์ดึงชื่อ Title ไปใช้ทัน
    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
  };

  return (
    <Paper
      sx={{
        p: 0,
        borderRadius: 4,
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
          bgcolor: "#fff",
          borderBottom: "1px solid #eee",
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
              sx={{ fontWeight: 700, bgcolor: "#f5f5f5", fontSize: "0.9rem" }}
            />
          </Typography>

          <IconButton
            className="no-print"
            onClick={handlePrint}
            sx={{ bgcolor: "#f5f5f5", p: 1 }}
          >
            <PrintIcon fontSize="small" />
          </IconButton>
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
              <Grid
                container
                spacing={2}
                alignItems="flex-start"
                sx={{ py: 2.5 }}
              >
                {/* รูปภาพอาหาร */}
                <Grid size="auto">
                  <Avatar
                    src={item.menuItemImage}
                    variant="rounded"
                    sx={{
                      width: { xs: 70, sm: 85 },
                      height: { xs: 70, sm: 85 },
                      bgcolor: "#f9f9f9",
                      border: item.isCancelled
                        ? "2px solid #ddd"
                        : "1px solid #eee",
                    }}
                  >
                    <RestaurantIcon color="disabled" sx={{ fontSize: 30 }} />
                  </Avatar>
                </Grid>

                {/* รายละเอียดอาหาร - เพิ่มพื้นที่ให้กางออก */}
                <Grid size="grow" sx={{ minWidth: 0 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={800}
                    lineHeight={1.3}
                    sx={{
                      fontSize: { xs: "1.05rem", sm: "1.1rem" },
                      textDecoration: item.isCancelled
                        ? "line-through"
                        : "none",
                      mb: 0.5,
                      wordBreak: "break-word",
                    }}
                  >
                    {item.quantity}x {item.menuItemName}
                  </Typography>

                  {/* ✅ ปรับแก้ส่วน Options: ให้เรียงแนวนอนซ้ายไปขวา */}
                  {item.orderDetailOptions?.length > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row", // บังคับแนวขวาง
                        flexWrap: "wrap", // ถ้าเต็มหน้าจอให้ตัดขึ้นแถวใหม่
                        gap: 0.6, // ระยะห่างระหว่างตัวเลือก
                        mt: 1,
                        mb: 1,
                      }}
                    >
                      {item.orderDetailOptions.map((o, i) => (
                        <Chip
                          key={i}
                          label={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {o.quantity > 1 && (
                                <Typography
                                  component="span"
                                  variant="caption"
                                  sx={{ fontWeight: 900, mr: 0.3 }}
                                >
                                  {o.quantity}x
                                </Typography>
                              )}
                              {o.optionValueName}
                              {o.extraPrice > 0 && (
                                <Typography
                                  component="span"
                                  variant="caption"
                                  sx={{ ml: 0.4, opacity: 0.8 }}
                                >
                                  (+
                                  {(o.extraPrice * o.quantity).toLocaleString()}
                                  )
                                </Typography>
                              )}
                            </Box>
                          }
                          size="small"
                          sx={{
                            height: "24px",
                            bgcolor: item.isCancelled ? "#eee" : "#F1F8E9",
                            color: item.isCancelled ? "#999" : "#2E7D32",
                            border: "1px solid",
                            borderColor: item.isCancelled ? "#ddd" : "#C8E6C9",
                            "& .MuiChip-label": {
                              px: 1,
                              fontSize: "0.75rem",
                              fontWeight: 600,
                            },
                          }}
                        />
                      ))}
                    </Box>
                  )}

                  <Typography
                    variant="h6"
                    fontWeight={800}
                    color={item.isCancelled ? "text.disabled" : "primary.main"}
                    sx={{ mt: 0.5, fontSize: { xs: "1.05rem", sm: "1.15rem" } }}
                  >
                    ฿{item.totalPrice.toLocaleString()}
                  </Typography>
                </Grid>

                {/* สถานะและการยกเลิก */}
                <Grid size="auto" sx={{ textAlign: "right", minWidth: 80 }}>
                  <Chip
                    label={item.isCancelled ? "ยกเลิกแล้ว" : itemStatus.label}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.7rem",
                      bgcolor: item.isCancelled ? "#ffebee" : "transparent",
                      border: `1.5px solid ${item.isCancelled ? "#ffcdd2" : itemStatus.border}`,
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
                        fontSize: "0.75rem",
                        py: 0.5,
                        width: "100%",
                        mt: 1,
                        borderRadius: 2,
                        fontWeight: 800,
                      }}
                    >
                      ยกเลิก
                    </Button>
                  )}
                </Grid>
              </Grid>
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
          bgcolor: "#F8F9FA",
          borderTop: "3px dashed #eee",
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
