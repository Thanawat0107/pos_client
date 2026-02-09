import { TableCell, Typography, Stack, Chip } from "@mui/material";

type Props = {
  index: number;
  orderCode: string;
  pickUpCode?: string;
  channel?: string;
};

export default function OrderItemInfo({
  index,
  orderCode,
  pickUpCode,
  channel,
}: Props) {
  return (
    <>
      <TableCell align="center" sx={{ width: 50 }}>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {index}
        </Typography>
      </TableCell>

      <TableCell sx={{ minWidth: 140 }}>
        <Stack spacing={0.5}>
          <Typography
            variant="subtitle2"
            fontWeight={800}
            sx={{
              color: "#D32F2F",
              fontFamily: "monospace",
              letterSpacing: 0.5,
            }}
          >
            {orderCode}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={pickUpCode || "-"}
              size="small"
              sx={{
                fontWeight: 900,
                borderRadius: "6px",
                height: 24,
                fontSize: "0.75rem",
                bgcolor: "#FF5722",
                color: "white",
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              sx={{ textTransform: "uppercase" }}
            >
              {channel}
            </Typography>
          </Stack>
        </Stack>
      </TableCell>
    </>
  );
}
