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
  CircularProgress,
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
  isUpdating?: boolean;
};

export default function CartItem({
  item,
  onQtyChange,
  onRemove,
  currency = "THB",
  isUpdating = false,
}: Props) {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

  const unitPrice = item.price;
  const sub = unitPrice * item.quantity;

  const dec = () => {
    if (item.quantity > 1) {
      // ✅ ส่ง item.note ไปได้เลย เพราะแก้ Props แล้ว
      onQtyChange(item.id, item.quantity - 1, item.note);
    } else {
      onRemove(item.id);
    }
  };

  const inc = () => onQtyChange(item.id, item.quantity + 1, item.note);

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
        opacity: isUpdating ? 0.6 : 1,
      }}
    >
      {isUpdating && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1,
          }}
        >
          <CircularProgress size={20} />
        </Box>
      )}

      <Stack direction="row" spacing={{ xs: 1.25, sm: 2 }}>
        <Box
          component="img"
          src={
            item.menuItemImage ||
            "https://via.placeholder.com/96x96.png?text=No+Image"
          }
          alt={item.menuItemName}
          loading="lazy"
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
              <Typography
                fontWeight={700}
                variant={isSmUp ? "body1" : "body2"}
                noWrap={!isSmUp}
              >
                {item.menuItemName}
              </Typography>

              {optionsText && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: { xs: "none", sm: "block" } }}
                >
                  {optionsText}
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
            <Stack
              direction="row"
              alignItems="center"
              spacing={{ xs: 1, sm: 1.25 }}
            >
              <IconButton
                aria-label="decrease"
                onClick={dec}
                disabled={isUpdating}
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
                {item.quantity}
              </Typography>

              <IconButton
                aria-label="increase"
                onClick={inc}
                disabled={isUpdating}
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
                onClick={() => onRemove(item.id)}
                disabled={isUpdating}
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
