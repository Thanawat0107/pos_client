/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, IconButton, Typography, alpha, useTheme } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { useAppDispatch } from "../../../hooks/useAppHookState";
import { updateItemLocal, removeItemLocal } from "../../../stores/slices/shoppingSlice";
import { useUpdateCartItemMutation, useRemoveCartItemMutation } from "../../../services/shoppingCartApi";
import { getImage } from "../../../helpers/imageHelper";

export default function CartItem({ item }: { item: any }) {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const cartToken = localStorage.getItem("cartToken");
  const [updateCart] = useUpdateCartItemMutation();
  const [removeCart] = useRemoveCartItemMutation();

  const handleQty = (newQty: number) => {
    if (newQty < 1) return;
    dispatch(updateItemLocal({ id: item.id, qty: newQty }));
    if (cartToken) updateCart({ cartItemId: item.id, quantity: newQty, cartToken });
  };

  const handleRemove = () => {
    dispatch(removeItemLocal(item.id));
    if (cartToken) removeCart({ id: item.id, cartToken });
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        p: 2,
        borderRadius: 2,
        bgcolor: "background.paper",
        border: `1px solid ${alpha(theme.palette.divider, 0.07)}`,
        boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
        transition: "box-shadow 0.2s, border-color 0.2s",
        "&:hover": {
          boxShadow: "0 6px 24px rgba(0,0,0,0.09)",
          borderColor: alpha(theme.palette.primary.main, 0.2),
        },
      }}
    >
      {/* ── Image ── */}
      <Box sx={{ position: "relative", flexShrink: 0 }}>
        <Box
          component="img"
          src={getImage(item.menuItemImage, "https://placehold.co/150x150?text=Food")}
          sx={{
            width: { xs: 80, sm: 96 },
            height: { xs: 80, sm: 96 },
            borderRadius: 2,
            display: "block",
          }}
        />
      </Box>

      {/* ── Content ── */}
      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        {/* Name + Price row */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
          <Typography
            fontWeight={800}
            sx={{
              fontSize: { xs: "0.9rem", sm: "1rem" },
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
              minWidth: 0,
            }}
          >
            {item.menuItemName}
          </Typography>
          <Typography
            fontWeight={900}
            color="primary"
            sx={{ fontSize: { xs: "1rem", sm: "1.1rem" }, flexShrink: 0, whiteSpace: "nowrap" }}
          >
            ฿{(item.price * item.quantity).toLocaleString()}
          </Typography>
        </Box>

        {/* Option chips */}
        {item.options?.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.75 }}>
            {item.options.map((o: any) => (
              <Typography
                key={o.id}
                variant="caption"
                sx={{
                  px: 1.25,
                  py: 0.25,
                  borderRadius: 6,
                  fontWeight: 600,
                  bgcolor: alpha(theme.palette.text.primary, 0.06),
                  color: "text.secondary",
                  whiteSpace: "nowrap",
                }}
              >
                {o.optionValueName}
              </Typography>
            ))}
          </Box>
        )}

        {item.note && (
          <Typography variant="caption" sx={{ color: "warning.main", fontWeight: 600, mt: 0.5, display: "block" }}>
            📝 {item.note}
          </Typography>
        )}

        {/* Qty controls + delete */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1.25 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              borderRadius: 2,
              border: `1.5px solid ${alpha(theme.palette.primary.main, 0.18)}`,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              px: 0.5,
            }}
          >
            <IconButton
              size="small"
              onClick={() => handleQty(item.quantity - 1)}
              disabled={item.quantity <= 1}
              sx={{ color: "primary.main", width: 28, height: 28, "&:disabled": { opacity: 0.3 } }}
            >
              <RemoveRoundedIcon sx={{ fontSize: 15 }} />
            </IconButton>
            <Typography sx={{ minWidth: 20, textAlign: "center", fontWeight: 900, fontSize: "0.9rem", color: "primary.main" }}>
              {item.quantity}
            </Typography>
            <IconButton
              size="small"
              onClick={() => handleQty(item.quantity + 1)}
              sx={{ color: "primary.main", width: 28, height: 28 }}
            >
              <AddRoundedIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Box>

          <IconButton
            size="small"
            onClick={handleRemove}
            sx={{
              color: "text.disabled",
              width: 30,
              height: 30,
              "&:hover": { color: "error.main", bgcolor: alpha(theme.palette.error.main, 0.08) },
              transition: "color 0.2s, background 0.2s",
            }}
          >
            <DeleteOutlineRoundedIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
