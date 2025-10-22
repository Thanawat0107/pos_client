import * as React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { keyframes, useTheme } from "@mui/material/styles";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CartItem, { type CartLine } from "./CartItem";

export default function Cart() {
  // mock data (เชื่อม API ได้เลย)
  const [lines, setLines] = React.useState<CartLine[]>([
    {
      id: "1",
      name: "Apple AirPods",
      price: 95,
      qty: 1,
      image:
        "https://images.unsplash.com/photo-1518446060624-3c3101a6c29b?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: "2",
      name: "Smart Watch",
      price: 129,
      qty: 1,
      image:
        "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?q=80&w=1200&auto=format&fit=crop",
    },
  ]);

  const currency = "THB";
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const handleQty = (id: string, qty: number) =>
    setLines((xs) => xs.map((x) => (x.id === id ? { ...x, qty } : x)));

  const handleRemove = (id: string) =>
    setLines((xs) => xs.filter((x) => x.id !== id));

  const subtotal = React.useMemo(
    () => lines.reduce((s, x) => s + x.price * x.qty, 0),
    [lines]
  );
  const shipping = subtotal > 0 ? 30 : 0; // ตัวอย่าง flat rate
  const discount = 0; // ต่อโปรฯ ทีหลังได้
  const total = subtotal + shipping - discount;

  const formatMoney = (n: number) =>
    n.toLocaleString(undefined, { style: "currency", currency });

  // กันเนื้อหาโดน mobile bar บัง
  const bottomInset = !isMdUp && lines.length > 0 ? 72 : 0;

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100dvh",
        pb: { xs: `${bottomInset}px`, md: 6 }, // เผื่อพื้นที่ให้ MobileBar
        pt: { xs: 2, md: 6 },
      }}
    >
      <Container maxWidth="xl">
        {/* หัวข้อ: เล็กลงบน xs, หนาขึ้น md+ */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: { xs: 2, md: 3 } }}
        >
          <Typography variant={isMdUp ? "h5" : "h6"} fontWeight={800}>
            ตะกร้าสินค้า
          </Typography>

          {/* ใส่ปุ่มล้างตะกร้าบนมือถือแบบซ่อนในเมนู/ไอคอนเล็ก ๆ ก็ได้ ถ้าต้องการ */}
          {lines.length > 0 && !isMdUp ? (
            <IconButton
              aria-label="clear-cart"
              onClick={() => setLines([])}
              size="small"
            >
              <CloseRoundedIcon fontSize="small" />
              ลบทั้งหมด
            </IconButton>
          ) : null}
        </Stack>

        {/* layout: มือถือเป็นคอลัมน์, md ขึ้นไปค่อยแยกซ้าย/ขวา */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 1.5, md: 3 }}
          alignItems="stretch"
        >
          {/* รายการสินค้า */}
          <Stack flex={1} spacing={{ xs: 1.25, md: 2 }}>
            {lines.length === 0 ? (
              <Card variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 2 }}>
                <Typography
                  variant="body2"
                  textAlign="center"
                  color="text.secondary"
                >
                  ตะกร้ายังว่างเปล่า เริ่มช้อปกันเลย!
                </Typography>
              </Card>
            ) : (
              lines.map((it) => (
                <CartItem
                  key={it.id}
                  item={it}
                  onQtyChange={handleQty}
                  onRemove={handleRemove}
                  currency={currency}
                />
              ))
            )}

            {/* โค้ดส่วนลด (โชว์บนมือถือในลิสต์ เพื่อไม่ต้องเลื่อนขึ้นลง) */}
            <TextField
              size="small"
              placeholder="โค้ดส่วนลด"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocalOfferOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{
                display: { xs: "block", md: "none" },
                mt: 0.5,
              }}
            />
          </Stack>

          {/* สรุปราคา (ซ่อนบน xs, โชว์แบบ sticky เฉพาะจอใหญ่) */}
          <Card
            variant="outlined"
            sx={{
              display: { xs: "none", md: "block" },
              position: { md: "sticky" },
              top: { md: 24 },
              borderRadius: 2,
              width: { md: 360 },
              alignSelf: "flex-start",
              flexShrink: 0,
            }}
          >
            <CardContent>
              <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
                สรุปคำสั่งซื้อ
              </Typography>

              <Stack spacing={1.25}>
                <Row label="ยอดรวม">{formatMoney(subtotal)}</Row>
                <Row label="ค่าจัดส่ง">{formatMoney(shipping)}</Row>
                <Row label="ส่วนลด">-{formatMoney(discount)}</Row>

                <Divider sx={{ my: 1 }} />

                <Row strong label="ยอดชำระทั้งหมด">
                  {formatMoney(total)}
                </Row>

                <TextField
                  size="small"
                  placeholder="โค้ดส่วนลด"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocalOfferOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  size="large"
                  variant="contained"
                  disabled={lines.length === 0}
                  sx={{ borderRadius: 2, mt: 1 }}
                  onClick={() => alert("ไปหน้า Checkout")}
                  fullWidth
                >
                  ดำเนินการชำระเงิน
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>

      {/* Mobile bottom checkout bar */}
      {!isMdUp && lines.length > 0 ? (
        <MobileCheckoutBar
          totalLabel="ยอดชำระทั้งหมด"
          amount={formatMoney(total)}
          onCheckout={() => alert("ไปหน้า Checkout")}
        />
      ) : null}
    </Box>
  );
}

function Row({
  label,
  children,
  strong,
}: {
  label: string;
  children: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography color="text.secondary" variant="body2">
        {label}
      </Typography>
      <Typography fontWeight={strong ? 800 : 700}>{children}</Typography>
    </Stack>
  );
}

const slideUp = keyframes`
  from {
    transform: translateY(24px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export function MobileCheckoutBar({
  totalLabel,
  amount,
  onCheckout,
}: {
  totalLabel: string;
  amount: string;
  onCheckout: () => void;
}) {
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  return (
    <Box
      sx={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: "background.paper",
        borderTop: "1px solid",
        borderColor: "divider",
        py: 3,
        px: 2,
        paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)",
        boxShadow: (t) => t.shadows[5],
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        zIndex: (t) => t.zIndex.appBar,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        // 🔥 slide-up on mount
        animation: reduceMotion ? "none" : `${slideUp} 320ms cubic-bezier(.2,.8,.2,1) both`,
        willChange: "transform, opacity",
      }}
    >
      <Container maxWidth="lg" disableGutters>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Stack sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary">
              {totalLabel}
            </Typography>
            <Typography variant="subtitle1" fontWeight={800} noWrap>
              {amount}
            </Typography>
          </Stack>
          <Button
            onClick={onCheckout}
            variant="contained"
            size="large"
            sx={{
              borderRadius: 2,
              px: 2.5,
              flexShrink: 0,
              minWidth: 160,
              boxShadow: (t) => t.shadows[3],
              // pop-in เล็ก ๆ ให้ปุ่ม
              animation: reduceMotion ? "none" : `${slideUp} 380ms 60ms cubic-bezier(.2,.8,.2,1) both`,
            }}
          >
            ชำระเงิน
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}