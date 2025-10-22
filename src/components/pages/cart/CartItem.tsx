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
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

  const sub = item.price * item.qty;

  const dec = () => onQtyChange?.(item.id, Math.max(1, item.qty - 1));
  const inc = () => onQtyChange?.(item.id, item.qty + 1);

  const money = (n: number) =>
    n.toLocaleString(undefined, { style: "currency", currency });

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        p: { xs: 1, sm: 2 },
      }}
    >
      <Stack direction="row" spacing={{ xs: 1.25, sm: 2 }}>
        {/* รูป: ย่อ/ขยายตาม breakpoint */}
        <Box
          component="img"
          src={
            item.image ||
            "https://via.placeholder.com/96x96.png?text=Item"
          }
          alt={item.name}
          loading="lazy"
          decoding="async"
          sx={{
            width: { xs: 72, sm: 96 },
            height: { xs: 72, sm: 96 },
            objectFit: "cover",
            borderRadius: 2,
            bgcolor: "grey.100",
            flexShrink: 0,
          }}
        />

        {/* เนื้อหา */}
        <CardContent
          sx={{
            p: 0,
            flexGrow: 1,
            minWidth: 0,
          }}
        >
          <Stack
            direction="row"
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={1}
          >
            <Stack spacing={0.5} minWidth={0}>
              <Typography
                fontWeight={700}
                variant={isSmUp ? "body1" : "body2"}
                noWrap={!isSmUp} // มือถือให้ตัดบรรทัดน้อยลง
              >
                {item.name}
              </Typography>

              {item.optionsText && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: { xs: "none", sm: "block" } }}
                >
                  {item.optionsText}
                </Typography>
              )}
              {item.note && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: { xs: "none", sm: "block" } }}
                >
                  Note: {item.note}
                </Typography>
              )}
            </Stack>

            {/* ราคา subtotal ต่อบรรทัด */}
            <Typography fontWeight={800} variant={isSmUp ? "body1" : "body2"}>
              {money(sub)}
            </Typography>
          </Stack>

          <Divider sx={{ my: { xs: 1, sm: 1.25 } }} />

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={1}
          >
            {/* ตัวควบคุมจำนวน: ปรับขนาดให้ tap ง่าย */}
            <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 1.25 }}>
              <IconButton
                aria-label="decrease"
                onClick={dec}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
                }}
              >
                <RemoveIcon fontSize={isSmUp ? "small" : "inherit"} />
              </IconButton>

              <Typography
                textAlign="center"
                fontWeight={800}
                sx={{ minWidth: { xs: 28, sm: 32 } }}
              >
                {item.qty}
              </Typography>

              <IconButton
                aria-label="increase"
                onClick={inc}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
                }}
              >
                <AddIcon fontSize={isSmUp ? "small" : "inherit"} />
              </IconButton>
            </Stack>

            <Tooltip title="ลบออกจากตะกร้า">
              <IconButton
                color="error"
                onClick={() => onRemove?.(item.id)}
                sx={{
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
                }}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </CardContent>
      </Stack>
    </Card>
  );
}
