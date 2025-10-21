import {
  Box,
  Card,
  CardContent,
  IconButton,
  Stack,
  Typography,
  Divider,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

export type CartLine = {
  id: string;
  name: string;
  image?: string;
  price: number;        // ราคาต่อชิ้น
  qty: number;
  note?: string;        // เผื่อ future (ไม่จำเป็น)
  optionsText?: string; // “Size L • Extra cheese” เป็นต้น
};

type Props = {
  item: CartLine;
  onQtyChange?: (id: string, qty: number) => void;
  onRemove?: (id: string) => void;
  currency?: string; // default: THB
};

export default function CartItem({
  item,
  onQtyChange,
  onRemove,
  currency = "THB",
}: Props) {
  const sub = item.price * item.qty;

  const dec = () => onQtyChange?.(item.id, Math.max(1, item.qty - 1));
  const inc = () => onQtyChange?.(item.id, item.qty + 1);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        p: { xs: 1.5, sm: 2 },
      }}
    >
      <Stack direction="row" spacing={2}>
        {/* รูป */}
        <Box
          component="img"
          src={
            item.image ||
            "https://via.placeholder.com/96x96.png?text=Item"
          }
          alt={item.name}
          sx={{
            width: 96,
            height: 96,
            objectFit: "cover",
            borderRadius: 2,
            bgcolor: "grey.100",
            flexShrink: 0,
          }}
        />

        {/* เนื้อหา */}
        <CardContent sx={{ p: 0, flexGrow: 1 }}>
          <Stack
            direction="row"
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={1}
          >
            <Stack spacing={0.5}>
              <Typography fontWeight={700}>{item.name}</Typography>
              {item.optionsText && (
                <Typography variant="body2" color="text.secondary">
                  {item.optionsText}
                </Typography>
              )}
              {item.note && (
                <Typography variant="body2" color="text.secondary">
                  Note: {item.note}
                </Typography>
              )}
            </Stack>

            <Typography fontWeight={700}>
              {(sub).toLocaleString(undefined, {
                style: "currency",
                currency,
              })}
            </Typography>
          </Stack>

          <Divider sx={{ my: 1.25 }} />

          <Stack direction="row" alignItems="center" justifyContent="space-between">
            {/* ตัวควบคุมจำนวน */}
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <IconButton
                aria-label="decrease"
                size="small"
                onClick={dec}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
              <Typography minWidth={24} textAlign="center" fontWeight={700}>
                {item.qty}
              </Typography>
              <IconButton
                aria-label="increase"
                size="small"
                onClick={inc}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Tooltip title="ลบออกจากตะกร้า">
              <IconButton color="error" onClick={() => onRemove?.(item.id)}>
                <DeleteOutlineIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </CardContent>
      </Stack>
    </Card>
  );
}
