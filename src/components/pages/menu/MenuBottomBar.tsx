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
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: theme.palette.mode === "dark"
          ? `rgba(${theme.palette.background.paper}, 0.97)`
          : "rgba(255,255,255,0.97)",
        backdropFilter: "blur(20px)",
        borderTop: `1px solid ${alpha(theme.palette.text.primary, 0.06)}`,
        borderRadius: isMobile ? "24px 24px 0 0" : 0,
        boxShadow: "0 -8px 40px rgba(0,0,0,0.12)",
      }}
    >
      <Container maxWidth="lg">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: isMobile ? "0.6rem 1.25rem 0.75rem" : "0.75rem 0",
          }}
        >
          {/* ตัวเลือกจำนวน */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              borderRadius: "1rem",
              padding: "0.25rem 0.5rem",
              flexShrink: 0,
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              border: `1.5px solid ${alpha(theme.palette.primary.main, 0.15)}`,
              minWidth: 128,
            }}
          >
            <IconButton
              onClick={onDecrease}
              disabled={quantity <= 1}
              size="small"
              sx={{
                color: "primary.main",
                width: 36,
                height: 36,
                "&:disabled": { opacity: 0.3 },
              }}
            >
              <RemoveRoundedIcon fontSize="small" />
            </IconButton>
            <Typography
              fontWeight={900}
              color="primary.main"
              sx={{ minWidth: 32, textAlign: "center", fontSize: "1.15rem" }}
            >
              {quantity}
            </Typography>
            <IconButton
              onClick={onIncrease}
              size="small"
              sx={{ color: "primary.main", width: 36, height: 36 }}
            >
              <AddRoundedIcon fontSize="small" />
            </IconButton>
          </div>

          {/* ปุ่มใส่ตะกร้า */}
          <Button
            fullWidth
            size="large"
            variant="contained"
            disabled={!isFormValid || isAdding}
            onClick={onAddToCart}
            sx={{
              py: isMobile ? 0.85 : 1.25,
              px: isMobile ? 1.5 : 2,
              borderRadius: "14px",
              fontWeight: 800,
              fontSize: isMobile ? "0.875rem" : "1rem",
              textTransform: "none",
              whiteSpace: "nowrap",
              boxShadow: isFormValid
                ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.40)}`
                : "none",
              transition: "all 0.2s",
              "&:not(:disabled):hover": {
                transform: "translateY(-2px)",
                boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.50)}`,
              },
            }}
          >
            {isAdding ? (
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CircularProgress size={18} color="inherit" />
                <span>กำลังเพิ่ม...</span>
              </span>
            ) : isFormValid ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: "0.75rem" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", whiteSpace: "nowrap" }}>
                  <ShoppingBagRoundedIcon sx={{ fontSize: isMobile ? 18 : 20, flexShrink: 0 }} />
                  <span>ใส่ตะกร้า</span>
                </span>
                <span
                  style={{
                    backgroundColor: "rgba(255,255,255,0.22)",
                    borderRadius: "8px",
                    padding: isMobile ? "0.15rem 0.5rem" : "0.2rem 0.75rem",
                    fontSize: isMobile ? "0.875rem" : "1rem",
                    fontWeight: 900,
                    letterSpacing: "0.01em",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  ฿{totalPrice.toLocaleString()}
                </span>
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ShoppingBagRoundedIcon sx={{ fontSize: 20 }} />
                <span>กรุณาเลือกตัวเลือก</span>
              </span>
            )}
          </Button>
        </div>
      </Container>
    </div>
  );
}
