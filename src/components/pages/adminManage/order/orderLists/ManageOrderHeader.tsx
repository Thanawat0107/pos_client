import {
  Stack,
  Box,
  Typography,
  Chip,
  Button,
  CircularProgress,
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import RefreshIcon from "@mui/icons-material/Refresh";

type Props = {
  pendingCount: number;
  isFetching: boolean;
  onRefresh: () => void;
};

export default function ManageOrderHeader({
  pendingCount,
  isFetching,
  onRefresh,
}: Props) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems="center"
      spacing={2}
      mb={3}
    >
      <Box>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h5" fontWeight={800} sx={{ color: "#2b3445" }}>
            จัดการรายการคำสั่งซื้อ
          </Typography>
          {pendingCount > 0 && (
            <Chip
              icon={<NotificationsActiveIcon />}
              label={`รออนุมัติ ${pendingCount} รายการ`}
              color="warning"
              size="small"
              sx={{ fontWeight: "bold", animation: "pulse 2s infinite" }}
            />
          )}
        </Stack>
        <Typography variant="body2" color="text.secondary">
          รายการออเดอร์ทั้งหมดในระบบ
        </Typography>
      </Box>
      <Button
        startIcon={
          isFetching ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <RefreshIcon />
          )
        }
        onClick={onRefresh}
        variant="outlined"
        disabled={isFetching}
        sx={{
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 700,
          borderColor: "#ef5350",
          color: "#d32f2f",
          "&:hover": { borderColor: "#d32f2f", bgcolor: "#ffebee" },
        }}
      >
        รีเฟรชข้อมูล
      </Button>
    </Stack>
  );
}
