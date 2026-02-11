import {
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  Grid,
} from "@mui/material";
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PaidIcon from "@mui/icons-material/Paid";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import TakeoutDiningIcon from "@mui/icons-material/TakeoutDining";
import { Sd } from "../../../../../helpers/SD";

type Props = {
  status: string;
  paidAt?: string | null;
  isLoading: boolean;
  onStatusChange: (status: string) => void;
  onPaymentConfirm: () => void;
  onCancel: () => void;
};

export default function OrderActionBoard({
  status,
  paidAt,
  isLoading,
  onStatusChange,
  onPaymentConfirm,
  onCancel,
}: Props) {
  if (status === Sd.Status_Cancelled) return null;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid #D32F2F40`,
        bgcolor: "#fffbfb",
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography
            variant="subtitle2"
            fontWeight={800}
            color="error"
            sx={{ textTransform: "uppercase", letterSpacing: 1 }}
          >
            Action Required
          </Typography>
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={() => window.print()}
            startIcon={<LocalPrintshopIcon />}
          >
            พิมพ์ใบเสร็จ
          </Button>
        </Stack>

        <Grid container spacing={2}>
          {status === Sd.Status_Pending && (
            <Grid size={{ xs: 12 }}>
              <Button
                fullWidth
                variant="contained"
                color="warning"
                size="large"
                onClick={() => onStatusChange(Sd.Status_Approved)}
                disabled={isLoading}
                startIcon={<CheckCircleIcon />}
                sx={{ py: 1.5, borderRadius: 2 }}
              >
                รับออเดอร์ (Accept Order)
              </Button>
            </Grid>
          )}
          {status === Sd.Status_PendingPayment && (
            <Grid size={{ xs: 12 }}>
              <Button
                fullWidth
                variant="contained"
                color="error"
                size="large"
                onClick={onPaymentConfirm}
                disabled={isLoading}
                startIcon={<PaidIcon />}
                sx={{ py: 1.5, borderRadius: 2 }}
              >
                ยืนยันการชำระเงิน (Confirm Payment)
              </Button>
            </Grid>
          )}
          {(status === Sd.Status_Paid || status === Sd.Status_Approved) && (
            <Grid size={{ xs: 12 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => onStatusChange(Sd.Status_Preparing)}
                disabled={isLoading}
                startIcon={<PlayArrowIcon />}
                sx={{ bgcolor: "#1976d2", py: 1.5, borderRadius: 2 }}
              >
                เริ่มปรุงอาหาร (Start Cooking)
              </Button>
            </Grid>
          )}
          {status === Sd.Status_Preparing && (
            <Grid size={{ xs: 12 }}>
              <Button
                fullWidth
                variant="contained"
                color="success"
                size="large"
                onClick={() => onStatusChange(Sd.Status_Ready)}
                disabled={isLoading}
                startIcon={<CheckCircleIcon />}
                sx={{ py: 1.5, borderRadius: 2 }}
              >
                ปรุงเสร็จแล้ว (Kitchen Done)
              </Button>
            </Grid>
          )}
          {status === Sd.Status_Ready && (
            <Grid size={{ xs: 12 }}>
              {!paidAt ? (
                <Button
                  fullWidth
                  variant="contained"
                  color="info"
                  size="large"
                  onClick={onPaymentConfirm}
                  disabled={isLoading}
                  startIcon={<PaidIcon />}
                  sx={{ py: 1.5, borderRadius: 2 }}
                >
                  รับเงินสด (Receive Cash)
                </Button>
              ) : (
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  size="large"
                  onClick={() => onStatusChange(Sd.Status_Completed)}
                  disabled={isLoading}
                  startIcon={<TakeoutDiningIcon />}
                  sx={{ py: 1.5, borderRadius: 2 }}
                >
                  ส่งมอบเรียบร้อย (Complete)
                </Button>
              )}
            </Grid>
          )}
          {![
            Sd.Status_Completed,
            Sd.Status_Cancelled,
            Sd.Status_Closed,
          ].includes(status) && (
            <Grid size={{ xs: 12 }}>
              <Button
                fullWidth
                size="small"
                color="error"
                variant="text"
                onClick={onCancel}
              >
                ยกเลิกออเดอร์นี้ (Cancel Order)
              </Button>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}
