/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Box, Button, Container, Divider, IconButton,
  Stack, Typography, useMediaQuery, CircularProgress, Fade, Chip,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import DeleteSweepRoundedIcon from "@mui/icons-material/DeleteSweepRounded";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import CartItem from "./CartItem";
import { useGetCartQuery, useClearCartMutation } from "../../../services/shoppingCartApi";
import { useAppDispatch, useAppSelector } from "../../../hooks/useAppHookState";
import { clearLocalCart } from "../../../stores/slices/shoppingSlice";
import { useNavigate } from "react-router-dom";
import { storage } from "../../../helpers/storageHelper";
import { ROOT_PATH } from "../../../helpers/SD";

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
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
        <CircularProgress size={48} thickness={4} color="primary" />
        <Typography color="text.secondary" fontWeight={600}>กำลังโหลดรายการ...</Typography>
      </Box>
    );
  }

  return (
    <Fade in>
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", pb: { xs: 18, md: 8 }, pt: { xs: 3, md: 5 } }}>
        <Container maxWidth="lg">

          {/* ── Header ── */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: { xs: 3, md: 4 } }}>
            <Button
              startIcon={<ArrowBackIosNewRoundedIcon sx={{ fontSize: "0.85rem !important" }} />}
              onClick={() => navigate(-1)}
              sx={{ color: "text.secondary", fontWeight: 700, fontSize: "0.85rem", textTransform: "none", px: 2, py: 0.875, borderRadius: 1.5, bgcolor: alpha(theme.palette.text.primary, 0.05), "&:hover": { bgcolor: alpha(theme.palette.text.primary, 0.09) } }}
            >
              เมนูอาหาร
            </Button>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <Typography variant={isMdUp ? "h4" : "h5"} fontWeight={900} sx={{ letterSpacing: "-0.5px" }}>
                ตะกร้าของฉัน
              </Typography>
              {cartItems.length > 0 && (
                <Box sx={{ bgcolor: "primary.main", color: "#fff", borderRadius: 2, px: 1.25, py: 0.25, minWidth: 28, textAlign: "center" }}>
                  <Typography variant="caption" fontWeight={900}>{cartItems.length}</Typography>
                </Box>
              )}
            </Box>

            {cartItems.length > 0 ? (
              <IconButton onClick={handleClear} sx={{ color: "text.disabled", borderRadius: 1.5, "&:hover": { color: "error.main", bgcolor: alpha(theme.palette.error.main, 0.08) }, transition: "all 0.2s" }}>
                <DeleteSweepRoundedIcon />
              </IconButton>
            ) : (
              <Box sx={{ width: 40 }} />
            )}
          </Box>

          {/* ── Body ── */}
          <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="flex-start">

            {/* ── Item List ── */}
            <Stack flex={1} spacing={1.5} sx={{ width: "100%" }}>
              {cartItems.length === 0 ? (
                <Box sx={{ py: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, bgcolor: "background.paper", borderRadius: 3, border: `2px dashed ${alpha(theme.palette.text.primary, 0.1)}` }}>
                  <Box sx={{ width: 80, height: 80, borderRadius: "50%", bgcolor: alpha(theme.palette.primary.main, 0.08), display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ShoppingBagOutlinedIcon sx={{ fontSize: 38, color: "primary.main", opacity: 0.55 }} />
                  </Box>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h6" fontWeight={800} gutterBottom>ตะกร้ายังว่างเปล่า</Typography>
                    <Typography color="text.secondary" variant="body2">หิวแล้วหรือยัง? เลือกเมนูที่ถูกใจได้เลย</Typography>
                  </Box>
                  <Button variant="contained" onClick={() => navigate(ROOT_PATH)} sx={{ px: 4, py: 1.25, borderRadius: 2, fontWeight: 800, textTransform: "none" }}>
                    ไปที่หน้าเมนู
                  </Button>
                </Box>
              ) : (
                cartItems.map((it) => <CartItem key={it.id} item={it} />)
              )}
            </Stack>

            {/* ── Order Summary Card (Desktop) ── */}
            {cartItems.length > 0 && (
              <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", width: 360, flexShrink: 0, position: "sticky", top: 96, gap: 2 }}>

                {/* Main summary card */}
                <Box sx={{ borderRadius: 2, overflow: "hidden", bgcolor: "background.paper", boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.1)}` }}>

                  {/* ── Items summary strip ── */}
                  <Box sx={{ px: 3, pt: 2.5, pb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                      <ReceiptLongRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                      <Typography fontWeight={800} sx={{ fontSize: "0.875rem", color: "text.secondary", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                        รายการ ({cartItems.length})
                      </Typography>
                    </Box>

                    <Stack spacing={1.25}>
                      {cartItems.map((it) => (
                        <Box key={it.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "primary.main", flexShrink: 0 }} />
                            <Typography variant="body2" fontWeight={600} sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {it.menuItemName}
                              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.75 }}>×{it.quantity}</Typography>
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight={700} sx={{ flexShrink: 0 }}>
                            ฿{(it.price * it.quantity).toLocaleString()}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>

                  <Divider sx={{ borderStyle: "dashed", borderColor: alpha(theme.palette.text.primary, 0.08) }} />

                  {/* ── Price breakdown + CTA ── */}
                  <Box sx={{ px: 3, py: 2.5 }}>
                    <Stack spacing={1} sx={{ mb: 2 }}>
                      <SummaryRow label="ราคาอาหาร" value={totalAmount} />
                      <SummaryRow label="ค่าบริการ" value={0} />
                    </Stack>

                    {/* Total — hero number */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: 2,
                        mb: 2.5,
                        px: 2,
                        py: 1.5,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.06),
                      }}
                    >
                      <Typography fontWeight={900} sx={{ fontSize: "1rem" }}>ยอดรวมสุทธิ</Typography>
                      <Typography fontWeight={900} color="primary" sx={{ fontSize: "1.6rem", lineHeight: 1 }}>
                        ฿{totalAmount.toLocaleString()}
                      </Typography>
                    </Box>

                    {/* CTA Button */}
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={() => navigate("/checkout")}
                      endIcon={<ArrowForwardRoundedIcon />}
                      sx={{
                        py: 1.75,
                        borderRadius: 2,
                        fontSize: "1.05rem",
                        fontWeight: 900,
                        textTransform: "none",
                        letterSpacing: "0.02em",
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        boxShadow: `0 8px 28px ${alpha(theme.palette.primary.main, 0.45)}`,
                        "&:hover": {
                          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                          boxShadow: `0 12px 36px ${alpha(theme.palette.primary.main, 0.55)}`,
                          transform: "translateY(-1px)",
                        },
                        transition: "all 0.25s",
                      }}
                    >
                      ดำเนินการต่อ
                    </Button>

                    {/* Trust badges */}
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <LockOutlinedIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                        <Typography variant="caption" color="text.disabled" fontWeight={600}>ปลอดภัย</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <QrCode2RoundedIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                        <Typography variant="caption" color="text.disabled" fontWeight={600}>ชำระผ่าน QR</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </Stack>
        </Container>

        {/* ── Mobile Bottom Bar ── */}
        {!isMdUp && cartItems.length > 0 && (
          <Box
            sx={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
              bgcolor: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: "blur(24px)",
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.07)}`,
              borderRadius: "12px 12px 0 0",
              boxShadow: "0 -8px 32px rgba(0,0,0,0.12)",
              pb: "env(safe-area-inset-bottom)",
            }}
          >
            {/* Mini items strip */}
            <Stack
              direction="row"
              spacing={1}
              sx={{
                px: 2.5,
                pt: 1.5,
                pb: 1,
                overflowX: "auto",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              {cartItems.map((it) => (
                <Chip
                  key={it.id}
                  label={`${it.menuItemName} ×${it.quantity}`}
                  size="small"
                  sx={{ fontWeight: 700, fontSize: "0.72rem", bgcolor: alpha(theme.palette.primary.main, 0.08), color: "text.primary", height: 24 }}
                />
              ))}
            </Stack>

            <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.06), mx: 2.5 }} />

            {/* Total + CTA */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.5, pt: 1.25, pb: 2.25 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" sx={{ lineHeight: 1.2 }}>
                  รวมทั้งสิ้น
                </Typography>
                <Typography fontWeight={900} color="primary" sx={{ fontSize: "1.5rem", lineHeight: 1.2 }}>
                  ฿{totalAmount.toLocaleString()}
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => navigate("/checkout")}
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{
                  px: 3.5,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 900,
                  fontSize: "1rem",
                  textTransform: "none",
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                }}
              >
                สั่งเลย
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Fade>
  );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Typography color="text.secondary" fontWeight={500} variant="body2">{label}</Typography>
      <Typography fontWeight={700} variant="body2">฿{value.toLocaleString()}</Typography>
    </Box>
  );
}
