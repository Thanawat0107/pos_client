/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Stack, Typography, GlobalStyles } from "@mui/material";

interface Props {
  order: any;
}

export default function ThermalReceipt({ order }: Props) {
  if (!order) return null;

  return (
    <>
      {/* จัดการ CSS สำหรับการพิมพ์ที่นี่ที่เดียว */}
      <GlobalStyles
        styles={{
          "@media print": {
            "body *": {
              visibility: "hidden",
              margin: 0,
              padding: 0,
            },
            "#thermal-receipt, #thermal-receipt *": {
              visibility: "visible",
            },
            "#thermal-receipt": {
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              top: 0,
              width: "80mm",
              padding: "5mm",
              color: "#000",
              backgroundColor: "#fff",
            },
            "@page": {
              size: "auto",
              margin: "0mm",
            },
          },
        }}
      />

      {/* โครงสร้างใบเสร็จแบบ 7-11 */}
      <Box
        id="thermal-receipt"
        sx={{
          display: "none",
          displayPrint: "block",
          fontFamily: "'Sarabun', sans-serif",
          lineHeight: 1.2,
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 900, fontSize: "1.2rem", mb: 0.5 }}
          >
            GEMINI CAFE & RESTAURANT
          </Typography>
          <Typography variant="body2">สาขา: สำนักงานใหญ่ (001)</Typography>
          <Typography variant="body2">โทร: 02-123-4567</Typography>
        </Box>

        <Box sx={{ borderBottom: "1px dashed #000", my: 1 }} />

        {/* Info */}
        <Stack spacing={0.5} sx={{ mb: 1 }}>
          <Typography
            variant="caption"
            sx={{ display: "flex", justifyContent: "space-between" }}
          >
            <span>ORDER: #{order.id}</span>
            <span>{new Date(order.createdAt).toLocaleDateString("th-TH")}</span>
          </Typography>
          <Typography
            variant="caption"
            sx={{ display: "flex", justifyContent: "space-between" }}
          >
            <span>CODE: {order.pickUpCode}</span>
            <span>
              {new Date(order.createdAt).toLocaleTimeString("th-TH")} น.
            </span>
          </Typography>
        </Stack>

        <Box sx={{ borderBottom: "1px dashed #000", my: 1 }} />

        {/* Items */}
        <Box sx={{ my: 1 }}>
          {order.orderDetails?.map((item: any, idx: number) => (
            <Box key={idx} sx={{ mb: 1 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Typography variant="body2" sx={{ flex: 1, pr: 1 }}>
                  {item.menuItemName}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ textAlign: "right", minWidth: 60 }}
                >
                  {item.totalPrice.toLocaleString()}
                </Typography>
              </Stack>
              <Typography
                variant="caption"
                sx={{ display: "block", color: "#333", mt: -0.2 }}
              >
                {item.quantity} x{" "}
                {(item.totalPrice / item.quantity).toLocaleString()}
              </Typography>
              {item.orderDetailOptions?.map((opt: any, i: number) => (
                <Typography
                  key={i}
                  variant="caption"
                  sx={{ display: "block", ml: 1, fontStyle: "italic" }}
                >
                  - {opt.optionValueName}
                </Typography>
              ))}
            </Box>
          ))}
        </Box>

        <Box sx={{ borderBottom: "1px dashed #000", my: 1 }} />

        {/* Summary */}
        <Stack spacing={0.5} sx={{ my: 1 }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2">รวมยอดเงิน</Typography>
            <Typography variant="body2">
              {order.subTotal.toLocaleString()}
            </Typography>
          </Stack>
          {order.discount > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">ส่วนลด</Typography>
              <Typography variant="body2">
                -{order.discount.toLocaleString()}
              </Typography>
            </Stack>
          )}
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 900 }}>
              ยอดสุทธิ
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              ฿{order.total.toLocaleString()}
            </Typography>
          </Stack>
        </Stack>

        <Box sx={{ borderBottom: "1px dashed #000", my: 1 }} />

        {/* Footer */}
        <Box sx={{ textAlign: "center", mt: 2, pt: 1 }}>
          <Typography
            variant="caption"
            sx={{ display: "block", fontWeight: 700 }}
          >
            ขอบคุณที่ใช้บริการ
          </Typography>
          <Box
            sx={{
              mt: 1.5,
              height: "30px",
              width: "80%",
              mx: "auto",
              borderLeft: "2px solid #000",
              borderRight: "2px solid #000",
              background:
                "repeating-linear-gradient(90deg, #000, #000 2px, #fff 2px, #fff 4px)",
            }}
          />
          <Typography
            variant="caption"
            sx={{ fontSize: "0.6rem", letterSpacing: 2 }}
          >
            {order.id}
            {order.pickUpCode}
          </Typography>
        </Box>
      </Box>
    </>
  );
}
