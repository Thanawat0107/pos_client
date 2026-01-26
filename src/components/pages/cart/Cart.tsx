/* eslint-disable @typescript-eslint/no-unused-vars */
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
  CircularProgress,
  Alert,
} from "@mui/material";
import { keyframes, useTheme } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CartItem from "./CartItem";
import { storage } from "../../../helpers/storageHelper";
import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} from "../../../services/shoppingCartApi";
import { useAppDispatch, useAppSelector } from "../../../hooks/useAppHookState";
import { clearLocalCart, removeItemLocal, updateItemLocal } from "../../../stores/slices/shoppingSlice";
import { useNavigate } from "react-router-dom";

const slideUp = keyframes`
  from { transform: translateY(24px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

export default function Cart() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const currency = "THB";
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // ✅ 1. ดึงข้อมูลจาก Redux Store
  const { cartItems, totalAmount } = useAppSelector((state) => state.shoppingCart);
  const cartToken = localStorage.getItem("cartToken");

  // ✅ 2. API Query สำหรับ Sync ข้อมูล
  const { isLoading, isError, refetch } = useGetCartQuery(cartToken, {
    skip: !cartToken,
  });

  // API Mutations
  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeCartItem] = useRemoveCartItemMutation();
  const [clearCart] = useClearCartMutation();

  // ✅ 3. Handlers
  const handleQty = async (cartItemId: number, qty: number, note?: string | null) => {
    if (!cartToken) return;
    dispatch(updateItemLocal({ id: cartItemId, qty, note: note || undefined }));
    try {
      await updateCartItem({ cartItemId, quantity: qty, note: note || undefined, cartToken }).unwrap();
    } catch (error) {
      refetch();
    }
  };

  const handleRemove = async (cartItemId: number) => {
    if (!cartToken) return;
    dispatch(removeItemLocal(cartItemId));
    try {
      await removeCartItem({ id: cartItemId, cartToken }).unwrap();
    } catch (error) {
      refetch();
    }
  };

  const handleClear = async () => {
    if (!cartToken) return;
    if (window.confirm("คุณต้องการลบสินค้าทั้งหมดใช่หรือไม่?")) {
      dispatch(clearLocalCart());
      try {
        await clearCart(cartToken).unwrap();
        await storage.remove("cartToken");
      } catch (error) {
        refetch();
      }
    }
  };

  const goToCheckout = () => {
    if (cartItems.length === 0) return;
    navigate("/checkout");
  };

  const formatMoney = (n: number) =>
    n.toLocaleString(undefined, { style: "currency", currency });

  const bottomInset = !isMdUp && cartItems.length > 0 ? 100 : 24;

  if (isLoading && cartItems.length === 0) {
    return (
      <Box sx={{ minHeight: "100dvh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 4, textAlign: "center", mt: 10 }}>
        <Alert severity="error" sx={{ mb: 2 }}>ไม่สามารถโหลดข้อมูลตะกร้าได้</Alert>
        <Button variant="outlined" onClick={() => refetch()}>ลองใหม่อีกครั้ง</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100dvh", pb: { xs: `${bottomInset}px`, md: 6 }, pt: { xs: 2, md: 6 } }}>
      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: { xs: 2, md: 3 } }}>
          <Typography variant={isMdUp ? "h5" : "h6"} fontWeight={800}>
            ตะกร้าสินค้า {cartItems.length > 0 && `(${cartItems.length})`}
          </Typography>
          {cartItems.length > 0 && !isMdUp && (
            <IconButton onClick={handleClear} size="small" color="error">
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 1.5, md: 3 }} alignItems="stretch">
          <Stack flex={1} spacing={{ xs: 1.25, md: 2 }}>
            {cartItems.length === 0 ? (
              <Card variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 2 }}>
                <Typography variant="body2" textAlign="center" color="text.secondary">
                  ตะกร้ายังว่างเปล่า เริ่มช้อปกันเลย!
                </Typography>
              </Card>
            ) : (
              cartItems.map((it) => (
                <CartItem key={it.id} item={it} onQtyChange={handleQty} onRemove={handleRemove} currency={currency} />
              ))
            )}
          </Stack>

          {cartItems.length > 0 && (
            <Card
              variant="outlined"
              sx={{
                display: { xs: "none", md: "block" },
                position: { md: "sticky" },
                top: { md: 88 },
                borderRadius: 2,
                width: { md: 360 },
                alignSelf: "flex-start",
              }}
            >
              <CardContent>
                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>สรุปคำสั่งซื้อ</Typography>
                <Stack spacing={1.25}>
                  <Row label="ยอดรวมทั้งหมด">{formatMoney(totalAmount)}</Row>
                  <Divider sx={{ my: 1 }} />
                  <Row strong label="ยอดชำระสุทธิ">{formatMoney(totalAmount)}</Row>
                  
                  <Button
                    size="large"
                    variant="contained"
                    sx={{ borderRadius: 2, mt: 2, fontWeight: 700 }}
                    onClick={goToCheckout}
                    fullWidth
                  >
                    ไปที่หน้าชำระเงิน
                  </Button>
                  
                  <Button size="small" color="error" sx={{ mt: 1 }} onClick={handleClear}>ล้างตะกร้า</Button>
                </Stack>
              </CardContent>
            </Card>
          )}
        </Stack>
      </Container>

      {!isMdUp && cartItems.length > 0 && (
        <MobileCheckoutBar amount={formatMoney(totalAmount)} onCheckout={goToCheckout} />
      )}
    </Box>
  );
}

// --- Sub Components ---

function Row({ label, children, strong }: { label: string; children: React.ReactNode; strong?: boolean }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography color="text.secondary" variant="body2">{label}</Typography>
      <Typography fontWeight={strong ? 800 : 700}>{children}</Typography>
    </Stack>
  );
}

export function MobileCheckoutBar({ amount, onCheckout }: { amount: string; onCheckout: () => void }) {
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  return (
    <Box
      sx={{
        position: "fixed", left: 0, right: 0, bottom: 0,
        bgcolor: "background.paper", borderTop: "1px solid", borderColor: "divider",
        py: 2, px: 2, paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)",
        boxShadow: (t) => t.shadows[8], borderTopLeftRadius: 16, borderTopRightRadius: 16,
        zIndex: (t) => t.zIndex.appBar, backdropFilter: "blur(8px)",
        animation: reduceMotion ? "none" : `${slideUp} 320ms cubic-bezier(.2,.8,.2,1) both`,
      }}
    >
      <Container maxWidth="lg" disableGutters>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Stack sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary">ยอดชำระสุทธิ</Typography>
            <Typography variant="h6" fontWeight={800} color="primary" noWrap>{amount}</Typography>
          </Stack>
          <Button
            onClick={onCheckout}
            variant="contained"
            size="large"
            sx={{ borderRadius: 2, px: 3, flexShrink: 0, minWidth: 140, fontWeight: 700 }}
          >
            ไปหน้าชำระเงิน
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}