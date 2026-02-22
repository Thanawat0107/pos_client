/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  Grid,
  CircularProgress,
} from "@mui/material";
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
  // ✅ 1. ถ้าจบงานหรือยกเลิกแล้ว ไม่ต้องโชว์แผง Action
  if (
    [Sd.Status_Cancelled, Sd.Status_Completed, Sd.Status_Closed].includes(
      status,
    )
  )
    return null;

  // ฟังก์ชันช่วยสร้างปุ่มที่มี Loading Spinner
  const ActionButton = ({ onClick, color, label, icon, bgcolor }: any) => (
    <Button
      fullWidth
      variant="contained"
      color={color}
      size="large"
      onClick={onClick}
      disabled={isLoading}
      startIcon={
        isLoading ? <CircularProgress size={20} color="inherit" /> : icon
      }
      sx={{ py: 1.5, borderRadius: 2, bgcolor: bgcolor, fontWeight: 700 }}
    >
      {isLoading ? "กำลังดำเนินการ..." : label}
    </Button>
  );

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
        <Stack direction="row" alignItems="center" mb={2}>
          <Typography
            variant="subtitle2"
            fontWeight={800}
            color="error"
            sx={{ textTransform: "uppercase", letterSpacing: 1 }}
          >
            Action Required
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          {/* สถานะ: รอร้านยืนยัน (สำหรับเงินสด <= 200) */}
          {status === Sd.Status_Pending && (
            <Grid size={{ xs: 12 }}>
              <ActionButton
                color="warning"
                label="รับออเดอร์ (Accept Order)"
                icon={<CheckCircleIcon />}
                onClick={() => onStatusChange(Sd.Status_Approved)}
              />
            </Grid>
          )}

          {/* สถานะ: รอโอนเงิน */}
          {status === Sd.Status_PendingPayment && (
            <Grid size={{ xs: 12 }}>
              <ActionButton
                color="error"
                label="ยืนยันชำระเงิน (Confirm Payment)"
                icon={<PaidIcon />}
                onClick={onPaymentConfirm}
              />
            </Grid>
          )}

          {/* สถานะ: จ่ายแล้ว หรือ อนุมัติแล้ว -> เตรียมเข้าครัว */}
          {(status === Sd.Status_Paid || status === Sd.Status_Approved) && (
            <Grid size={{ xs: 12 }}>
              <ActionButton
                bgcolor="#1976d2"
                label="เริ่มปรุงอาหาร (Start Cooking)"
                icon={<PlayArrowIcon />}
                onClick={() => onStatusChange(Sd.Status_Preparing)}
              />
            </Grid>
          )}

          {/* สถานะ: กำลังปรุง -> เสร็จ */}
          {status === Sd.Status_Preparing && (
            <Grid size={{ xs: 12 }}>
              <ActionButton
                color="success"
                label="ปรุงเสร็จแล้ว (Kitchen Done)"
                icon={<CheckCircleIcon />}
                onClick={() => onStatusChange(Sd.Status_Ready)}
              />
            </Grid>
          )}

          {/* สถานะ: พร้อมเสิร์ฟ -> ตรวจสอบการจ่ายเงินก่อนจบงาน */}
          {status === Sd.Status_Ready && (
            <Grid size={{ xs: 12 }}>
              {!paidAt ? (
                <ActionButton
                  color="info"
                  label="รับเงินสด (Receive Cash)"
                  icon={<PaidIcon />}
                  onClick={onPaymentConfirm}
                />
              ) : (
                <ActionButton
                  color="success"
                  label="ส่งมอบเรียบร้อย (Complete)"
                  icon={<TakeoutDiningIcon />}
                  onClick={() => onStatusChange(Sd.Status_Completed)}
                />
              )}
            </Grid>
          )}

          {/* ปุ่มยกเลิกสำหรับสถานะที่ยังไม่จบงาน */}
          <Grid size={{ xs: 12 }}>
            <Button
              fullWidth
              size="small"
              color="error"
              variant="text"
              onClick={onCancel}
              disabled={isLoading}
              sx={{ mt: 1 }}
            >
              ยกเลิกออเดอร์นี้ (Cancel Order)
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
