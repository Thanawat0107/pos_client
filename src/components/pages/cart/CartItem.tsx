import {
  Box,
  Card,
  CardContent,
  IconButton,
  Stack,
  Typography,
  Divider,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { CartItemDto } from "../../../@types/dto/CartItemDto";

type Props = {
  item: CartItemDto;
  onQtyChange: (id: number, qty: number, note?: string | null) => void;
  onRemove: (id: number) => void;
  currency?: string;
};

export default function CartItem({
  item,
  onQtyChange,
  onRemove,
  currency = "THB",
}: Props) {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

  // ราคาที่ Frontend คำนวณเบื้องต้น (แต่จริงๆ Redux Store คำนวณมาให้แล้วในยอดรวม)
  const sub = item.price * item.quantity;

  const dec = () => {
    if (item.quantity > 1) {
      onQtyChange(item.id, item.quantity - 1, item.note);
    } else {
      onRemove(item.id);
    }
  };

  const inc = () => {
    // ตรงนี้อาจจะเช็ค Max Stock ได้ถ้ามีข้อมูล
    onQtyChange(item.id, item.quantity + 1, item.note);
  };

  const money = (n: number) =>
    n.toLocaleString(undefined, { style: "currency", currency });

  const optionsText = item.options
    ?.map((o) => `${o.optionGroupName}: ${o.optionValueName}`)
    .join(" • ");

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        p: { xs: 1, sm: 2 },
        position: "relative",
        transition: "opacity 0.2s",
        // เราเอา loading overlay ออกเพื่อให้ดูลื่นไหล
      }}
    >
      <Stack direction="row" spacing={{ xs: 1.25, sm: 2 }}>
        {/* Image */}
        <Box
          component="img"
          src={item.menuItemImage || "https://via.placeholder.com/96x96.png?text=No+Image"}
          alt={item.menuItemName}
          sx={{
            width: { xs: 72, sm: 96 },
            height: { xs: 72, sm: 96 },
            objectFit: "cover",
            borderRadius: 2,
            bgcolor: "grey.100",
            flexShrink: 0,
          }}
        />

        <CardContent sx={{ p: 0, flexGrow: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={1}
          >
            <Stack spacing={0.5} minWidth={0}>
              <Typography fontWeight={700} variant={isSmUp ? "body1" : "body2"} noWrap={!isSmUp}>
                {item.menuItemName}
              </Typography>
              {optionsText && (
                <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
                  {optionsText}
                </Typography>
              )}
              {item.note && (
                <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
                  Note: {item.note}
                </Typography>
              )}
            </Stack>
            <Typography fontWeight={800} variant={isSmUp ? "body1" : "body2"}>
              {money(sub)}
            </Typography>
          </Stack>

          <Divider sx={{ my: { xs: 1, sm: 1.25 } }} />

          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
            <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 1.25 }}>
              <IconButton
                onClick={dec}
                size="small"
                sx={{ border: "1px solid", borderColor: "divider" }}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>

              <Typography textAlign="center" fontWeight={800} sx={{ minWidth: 32 }}>
                {item.quantity}
              </Typography>

              <IconButton
                onClick={inc}
                size="small"
                sx={{ border: "1px solid", borderColor: "divider" }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Tooltip title="ลบออกจากตะกร้า">
              <IconButton color="error" onClick={() => onRemove(item.id)}>
                <DeleteOutlineIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </CardContent>
      </Stack>
    </Card>
  );
}