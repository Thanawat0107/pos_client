import * as React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
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

  const handleQty = (id: string, qty: number) =>
    setLines((xs) => xs.map((x) => (x.id === id ? { ...x, qty } : x)));

  const handleRemove = (id: string) =>
    setLines((xs) => xs.filter((x) => x.id !== id));

  const subtotal = lines.reduce((s, x) => s + x.price * x.qty, 0);
  const shipping = subtotal > 0 ? 30 : 0; // ตัวอย่าง flat rate
  const discount = 0; // ต่อโปรฯ ทีหลังได้
  const total = subtotal + shipping - discount;

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100dvh", py: { xs: 3, md: 6 } }}>
      <Container maxWidth="lg">
        <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>
          ตะกร้าสินค้า
        </Typography>

        {/* layout: ซ้ายรายการ, ขวาสรุป */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="flex-start">
          {/* รายการสินค้า */}
          <Stack flex={1} spacing={2}>
            {lines.length === 0 ? (
              <Card variant="outlined" sx={{ p: 4, borderRadius: 2 }}>
                <Typography textAlign="center" color="text.secondary">
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
          </Stack>

          {/* สรุปราคา */}
          <Card
            variant="outlined"
            sx={{
              position: { md: "sticky" },
              top: { md: 24 },
              borderRadius: 2,
              width: { xs: "100%", md: 360 },
              alignSelf: "stretch",
            }}
          >
            <CardContent>
              <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
                สรุปคำสั่งซื้อ
              </Typography>

              <Stack spacing={1.25}>
                <Row label="ยอดรวม">
                  {subtotal.toLocaleString(undefined, { style: "currency", currency })}
                </Row>
                <Row label="ค่าจัดส่ง">
                  {shipping.toLocaleString(undefined, { style: "currency", currency })}
                </Row>
                <Row label="ส่วนลด">
                  -{discount.toLocaleString(undefined, { style: "currency", currency })}
                </Row>

                <Divider sx={{ my: 1 }} />

                <Row strong label="ยอดชำระทั้งหมด">
                  {total.toLocaleString(undefined, { style: "currency", currency })}
                </Row>

                <TextField size="small" placeholder="โค้ดส่วนลด" fullWidth />

                <Button
                  size="large"
                  variant="contained"
                  disabled={lines.length === 0}
                  sx={{ borderRadius: 2, mt: 1 }}
                  onClick={() => alert("ไปหน้า Checkout")}
                >
                  ดำเนินการชำระเงิน
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
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
      <Typography color="text.secondary">{label}</Typography>
      <Typography fontWeight={strong ? 800 : 700}>{children}</Typography>
    </Stack>
  );
}
