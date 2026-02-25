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
import { useTheme, alpha } from "@mui/material/styles";
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
  const theme = useTheme();
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
          sx={{ color: "text.secondary", fontSize: { xs: "0.875rem", md: "1rem" }, mt: 0.25 }}
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
              sx={{
                p: 1,
                borderRadius: "50%",
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              {isFetching ? (
                <CircularProgress size={20} color="primary" />
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
          sx={{
            borderRadius: "50px",
            px: { xs: 2, md: 3 },
            py: { xs: 1, md: 1.25 },
            fontSize: { xs: "0.85rem", md: "1rem" },
            fontWeight: 700,
            borderWidth: "1.5px",
            textTransform: "none",
            display: { xs: "none", sm: "inline-flex" },
            whiteSpace: "nowrap",
            "&:hover": { borderWidth: "1.5px", bgcolor: alpha(theme.palette.primary.main, 0.05) },
          }}
        >
          รีเฟรชข้อมูล
        </Button>
      </Stack>
    </Stack>
  );
}
