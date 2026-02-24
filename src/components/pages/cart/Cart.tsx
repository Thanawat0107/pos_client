/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Box, Button, Card, CardContent, Container, Divider, IconButton,
  Stack, Typography, useMediaQuery, CircularProgress, Paper
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import DeleteSweepRoundedIcon from "@mui/icons-material/DeleteSweepRounded";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import CartItem from "./CartItem";
import { useGetCartQuery, useClearCartMutation } from "../../../services/shoppingCartApi";
import { useAppDispatch, useAppSelector } from "../../../hooks/useAppHookState";
import { clearLocalCart } from "../../../stores/slices/shoppingSlice";
import { useNavigate } from "react-router-dom";
import { storage } from "../../../helpers/storageHelper";

export default function Cart() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cartItems, totalAmount } = useAppSelector((state) => state.shoppingCart);
  const cartToken = localStorage.getItem("cartToken");

  const { isLoading, refetch } = useGetCartQuery(cartToken, { skip: !cartToken });
  const [clearCart] = useClearCartMutation();

  const handleClear = async () => {
    if (window.confirm("คุณต้องการลบสินค้าทั้งหมดออกจากตะกร้าใช่หรือไม่?")) {
      dispatch(clearLocalCart());
      if (cartToken) {
        try {
          await clearCart(cartToken).unwrap();
          await storage.remove("cartToken");
        } catch (e) { refetch(); }
      }
    }
  };

  if (isLoading && cartItems.length === 0) {
    return (
      <Box sx={{ minHeight: "80vh", display: "flex", flexDirection: 'column', justifyContent: "center", alignItems: "center", gap: 2 }}>
        <CircularProgress size={60} thickness={4} color="primary" />
        <Typography variant="h6" color="text.secondary">กำลังเตรียมรายการอาหารของคุณ...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: "#F8F9FA",
        minHeight: "100vh",
        pb: 10,
        pt: { xs: 2, md: 5 },
      }}
    >
      <Container maxWidth="lg">
        {/* Header Section */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 4 }}
        >
          <Button
            startIcon={<ArrowBackIosNewRoundedIcon />}
            onClick={() => navigate(-1)}
            sx={{ color: "text.primary", fontWeight: 700 }}
          >
            เลือกเมนูเพิ่ม
          </Button>
          <Typography
            variant={isMdUp ? "h4" : "h5"}
            fontWeight={900}
            sx={{ letterSpacing: "-0.5px" }}
          >
            ตะกร้าของฉัน{" "}
            <span style={{ color: theme.palette.primary.main }}>
              ({cartItems.length})
            </span>
          </Typography>
          {cartItems.length > 0 && (
            <IconButton
              onClick={handleClear}
              color="error"
              sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
            >
              <DeleteSweepRoundedIcon />
            </IconButton>
          )}
        </Stack>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={4}
          alignItems="flex-start"
        >
          {/* List of Items */}
          <Stack flex={1} spacing={2.5} sx={{ width: "100%" }}>
            {cartItems.length === 0 ? (
              <Paper
                variant="outlined"
                sx={{
                  p: 8,
                  textAlign: "center",
                  borderRadius: 4,
                  bgcolor: "transparent",
                  borderStyle: "dashed",
                }}
              >
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  ตะกร้ายังว่างเปล่า
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  หิวแล้วหรือยัง? เลือกเมนูที่ถูกใจใส่ตะกร้าได้เลย
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate("/")}
                  sx={{ px: 4, borderRadius: 10 }}
                >
                  ไปที่หน้าเมนู
                </Button>
              </Paper>
            ) : (
              cartItems.map((it) => <CartItem key={it.id} item={it} />)
            )}
          </Stack>

          {/* Order Summary (Desktop) */}
          {cartItems.length > 0 && (
            <Card
              sx={{
                // 👇 เพิ่มบรรทัดนี้ครับ: ซ่อนในมือถือ (none) และแสดงในคอมพิวเตอร์ (block)
                display: { xs: "none", md: "block" },

                width: { md: 380 },
                borderRadius: 5,
                boxShadow: "0px 20px 40px rgba(0,0,0,0.05)",
                position: "sticky",
                top: 100,
                border: "none",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>
                  สรุปคำสั่งซื้อ
                </Typography>
                <Stack spacing={2}>
                  <SummaryRow label="ราคาอาหารทั้งหมด" value={totalAmount} />
                  <SummaryRow label="ค่าบริการ (Service Charge)" value={0} />
                  <Divider sx={{ my: 1, borderStyle: "dashed" }} />
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="h5" fontWeight={900}>
                      ยอดรวมสุทธิ
                    </Typography>
                    <Typography variant="h5" fontWeight={900} color="primary">
                      ฿{totalAmount.toLocaleString()}
                    </Typography>
                  </Stack>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={() => navigate("/checkout")}
                    sx={{
                      py: 2,
                      mt: 2,
                      borderRadius: 4,
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                    }}
                  >
                    ไปที่การชำระเงิน
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )}
        </Stack>
      </Container>

      {/* Mobile Floating Bar */}
      {!isMdUp && cartItems.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            p: 3,
            pb: "calc(env(safe-area-inset-bottom) + 24px)", // รองรับขอบล่าง iPhone
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            zIndex: 1000,
            // 👇 เอฟเฟกต์หรูแบบกระจกโปร่งแสง
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: "blur(12px)",
            borderTop: "1px solid",
            borderColor: alpha(theme.palette.divider, 0.1),
            boxShadow: "0 -10px 30px rgba(0,0,0,0.08)",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={700}
              >
                รวมทั้งสิ้น
              </Typography>
              <Typography variant="h5" fontWeight={900} color="primary">
                ฿{totalAmount.toLocaleString()}
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/checkout")}
              sx={{
                px: 5,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 800,
                fontSize: "1rem",
              }}
            >
              สั่งเลย
            </Button>
          </Stack>
        </Paper>
      )}
    </Box>
  );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography color="text.secondary" fontWeight={500}>{label}</Typography>
      <Typography fontWeight={700}>฿{value.toLocaleString()}</Typography>
    </Stack>
  );
}