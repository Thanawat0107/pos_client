import {
  Button,
  Container,
  CircularProgress,
  IconButton,
  Typography,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";

interface MenuBottomBarProps {
  quantity: number;
  totalPrice: number;
  isFormValid: boolean;
  isAdding: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
  onAddToCart: () => void;
}

export default function MenuBottomBar({
  quantity,
  totalPrice,
  isFormValid,
  isAdding,
  onIncrease,
  onDecrease,
  onAddToCart,
}: MenuBottomBarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        backgroundColor: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(16px)",
        borderTop: `1px solid ${alpha(theme.palette.text.primary, 0.06)}`,
        borderRadius: isMobile ? "24px 24px 0 0" : 0,
        boxShadow: "0 -8px 32px rgba(0,0,0,0.1)",
      }}
    >
      <Container maxWidth="lg">
        <div
          className={`flex items-center gap-4 ${
            isMobile ? "py-4 px-2" : "py-5"
          }`}
        >
          {/* ตัวเลือกจำนวน */}
          <div
            className="flex items-center gap-1 rounded-2xl px-2 py-1 shrink-0"
            style={{
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              minWidth: 120,
            }}
          >
            <IconButton
              onClick={onDecrease}
              disabled={quantity <= 1}
              sx={{ color: "primary.main", "&:disabled": { opacity: 0.3 } }}
            >
              <RemoveRoundedIcon />
            </IconButton>
            <Typography
              variant="h6"
              fontWeight={900}
              color="primary.main"
              sx={{ minWidth: 32, textAlign: "center" }}
            >
              {quantity}
            </Typography>
            <IconButton onClick={onIncrease} sx={{ color: "primary.main" }}>
              <AddRoundedIcon />
            </IconButton>
          </div>

          {/* ปุ่มใส่ตะกร้า */}
          <Button
            fullWidth
            size="large"
            variant="contained"
            disabled={!isFormValid || isAdding}
            onClick={onAddToCart}
            startIcon={
              isAdding ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <ShoppingBagRoundedIcon />
              )
            }
            sx={{
              py: isMobile ? 1.6 : 2,
              borderRadius: 3,
              fontWeight: 800,
              fontSize: "1rem",
              textTransform: "none",
              boxShadow: isFormValid
                ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.35)}`
                : "none",
              transition: "all 0.2s",
              "&:not(:disabled):hover": { transform: "translateY(-1px)" },
            }}
          >
            {isAdding ? (
              "กำลังเพิ่ม..."
            ) : isFormValid ? (
              <span className="flex items-center gap-2">
                <span>ใส่ตะกร้า</span>
                <span
                  className="px-2.5 py-0.5 rounded-full text-sm font-bold"
                  style={{ backgroundColor: "rgba(255,255,255,0.25)" }}
                >
                  ฿{totalPrice.toLocaleString()}
                </span>
              </span>
            ) : (
              "กรุณาเลือกตัวเลือก"
            )}
          </Button>
        </div>
      </Container>
    </div>
  );
}
