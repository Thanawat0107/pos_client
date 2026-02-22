import {
  Stack,
  Box,
  Typography,
  Chip,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
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
      alignItems={{ xs: "flex-start", sm: "flex-end" }}
      spacing={2}
    >
      {/* Title block */}
      <Box>
        <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.6rem", md: "2.2rem" },
              letterSpacing: "-0.02em",
            }}
            className="text-gray-900"
          >
            จัดการรายการคำสั่งซื้อ
          </Typography>

          {pendingCount > 0 && (
            <Chip
              icon={<NotificationsActiveIcon sx={{ fontSize: "1rem !important" }} />}
              label={`รออนุมัติ ${pendingCount} รายการ`}
              color="warning"
              size="small"
              sx={{ fontWeight: 700, animation: "pulse 2s infinite", borderRadius: "50px" }}
            />
          )}
        </Stack>

        <Typography
          className="text-gray-500"
          sx={{ fontSize: { xs: "0.875rem", md: "1rem" }, mt: 0.25 }}
        >
          รายการออเดอร์ทั้งหมดในระบบ
        </Typography>
      </Box>

      {/* Action buttons */}
      <Stack direction="row" spacing={1} alignItems="center">
        <Tooltip title="รีเฟรชข้อมูล">
          <span>
            <IconButton
              onClick={onRefresh}
              disabled={isFetching}
              className="bg-white border border-gray-200 hover:bg-gray-50 shadow-sm"
              sx={{ p: 1, borderRadius: "50%" }}
            >
              {isFetching ? (
                <CircularProgress size={20} sx={{ color: "#D32F2F" }} />
              ) : (
                <RefreshIcon sx={{ fontSize: "1.4rem", color: "text.secondary" }} />
              )}
            </IconButton>
          </span>
        </Tooltip>

        <Button
          variant="outlined"
          startIcon={
            isFetching ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <RefreshIcon />
            )
          }
          onClick={onRefresh}
          disabled={isFetching}
          className="bg-white hover:bg-red-50 whitespace-nowrap"
          sx={{
            borderRadius: "50px",
            px: { xs: 2, md: 3 },
            py: { xs: 1, md: 1.25 },
            fontSize: { xs: "0.85rem", md: "1rem" },
            fontWeight: 700,
            borderColor: "#E63946",
            borderWidth: "1.5px",
            color: "#D32F2F",
            textTransform: "none",
            display: { xs: "none", sm: "inline-flex" },
            "&:hover": { borderColor: "#D32F2F", borderWidth: "1.5px" },
          }}
        >
          รีเฟรชข้อมูล
        </Button>
      </Stack>
    </Stack>
  );
}
