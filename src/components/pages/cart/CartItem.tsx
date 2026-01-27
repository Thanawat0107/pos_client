/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Card, IconButton, Stack, Typography, alpha } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { useAppDispatch } from "../../../hooks/useAppHookState";
import { updateItemLocal, removeItemLocal } from "../../../stores/slices/shoppingSlice";
import { useUpdateCartItemMutation, useRemoveCartItemMutation } from "../../../services/shoppingCartApi";

export default function CartItem({ item }: { item: any }) {
  const dispatch = useAppDispatch();
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
    <Card sx={{ 
      p: 2, borderRadius: 4, border: '1px solid #E0E0E0', 
      boxShadow: 'none', transition: '0.3s',
      '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderColor: 'transparent' }
    }}>
      <Stack direction="row" spacing={3}>
        {/* Large Product Image */}
        <Box
          component="img"
          src={item.menuItemImage || "https://via.placeholder.com/150"}
          sx={{ 
            width: { xs: 100, sm: 140 }, 
            height: { xs: 100, sm: 140 }, 
            borderRadius: 3, 
            objectFit: "cover",
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        />

        {/* Content Info */}
        <Stack flex={1} justifyContent="space-between">
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2, mb: 0.5 }}>
                {item.menuItemName}
              </Typography>
              <Typography variant="h6" fontWeight={900} color="primary">
                ฿{(item.price * item.quantity).toLocaleString()}
              </Typography>
            </Stack>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {item.options?.map((o: any) => (
                <span key={o.id} style={{ background: '#F0F2F5', padding: '2px 8px', borderRadius: '4px' }}>
                  {o.optionValueName}
                </span>
              ))}
            </Typography>
            
            {item.note && (
              <Typography variant="caption" sx={{ color: 'orange', fontWeight: 600, mt: 1, display: 'block' }}>
                📝 หมายเหตุ: {item.note}
              </Typography>
            )}
          </Box>

          {/* Action Bar */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
            <Stack direction="row" alignItems="center" sx={{ bgcolor: '#F8F9FA', borderRadius: 3, p: 0.5 }}>
              <IconButton size="small" onClick={() => handleQty(item.quantity - 1)} disabled={item.quantity <= 1}>
                <RemoveRoundedIcon fontSize="small" />
              </IconButton>
              <Typography sx={{ mx: 2, minWidth: 20, textAlign: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                {item.quantity}
              </Typography>
              <IconButton size="small" onClick={() => handleQty(item.quantity + 1)}>
                <AddRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>

            <IconButton color="error" onClick={handleRemove} sx={{ bgcolor: alpha('#FF4842', 0.1) }}>
              <DeleteOutlineRoundedIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}