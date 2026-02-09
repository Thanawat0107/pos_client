import { TableCell, Stack, Typography } from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import ShoppingBasketOutlinedIcon from "@mui/icons-material/ShoppingBasketOutlined";

type Props = {
  name?: string;
  phone?: string;
  total: number;
  totalItems: number;
};

export default function OrderItemCustomer({
  name,
  phone,
  total,
  totalItems,
}: Props) {
  return (
    <>
      <TableCell sx={{ minWidth: 160 }}>
        <Stack spacing={0.5}>
          <Typography variant="body2" fontWeight={700}>
            {name || "ลูกค้าทั่วไป"}
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <PhoneIcon sx={{ fontSize: 14, color: "text.disabled" }} />
            <Typography variant="caption" color="text.secondary">
              {phone || "-"}
            </Typography>
          </Stack>
        </Stack>
      </TableCell>

      <TableCell align="right" sx={{ minWidth: 100 }}>
        <Stack alignItems="flex-end">
          <Typography variant="body2" fontWeight={800}>
            ฿{total.toLocaleString()}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <ShoppingBasketOutlinedIcon sx={{ fontSize: 12 }} /> {totalItems}{" "}
            รายการ
          </Typography>
        </Stack>
      </TableCell>
    </>
  );
}
