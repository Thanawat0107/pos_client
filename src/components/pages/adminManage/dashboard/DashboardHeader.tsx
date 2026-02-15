import {
  Typography,
  Chip,
  Button,
  Stack,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import { RefreshCcw, Download, HelpCircle } from "lucide-react";

interface Props {
  onRefresh: () => void;
}

const DashboardHeader = ({ onRefresh }: Props) => (
  <Stack
    direction={{ xs: "column", md: "row" }}
    justifyContent="space-between"
    alignItems={{ xs: "flex-start", md: "center" }}
    spacing={2}
    sx={{ mb: 2 }}
  >
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
        <Typography variant="h4" fontWeight={800} color="text.primary">
          Analytics Overview
        </Typography>
        <Chip
          label="Live"
          color="error"
          size="small"
          sx={{
            fontWeight: "bold",
            borderRadius: "4px",
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            "@keyframes pulse": {
              "0%, 100%": { opacity: 1 },
              "50%": { opacity: 0.5 },
            },
          }}
        />
      </Stack>
      <Typography variant="body2" color="text.secondary">
        รายงานสรุปผลการดำเนินงานและวิเคราะห์ข้อมูลแบบ Real-time
      </Typography>
    </Box>

    <Stack direction="row" spacing={2}>
      <Tooltip title="ข้อมูลช่วยเหลือ">
        <IconButton>
          <HelpCircle size={20} />
        </IconButton>
      </Tooltip>
      <Button
        variant="outlined"
        startIcon={<RefreshCcw size={18} />}
        onClick={onRefresh}
        sx={{
          color: "text.secondary",
          borderColor: "divider",
          "&:hover": { borderColor: "text.primary", bgcolor: "action.hover" },
        }}
      >
        รีเฟรช
      </Button>
      <Button
        variant="contained"
        startIcon={<Download size={18} />}
        sx={{
          bgcolor: "primary.main",
          boxShadow: 2,
          "&:hover": { bgcolor: "primary.dark", boxShadow: 4 },
        }}
      >
        ส่งออกรายงาน
      </Button>
    </Stack>
  </Stack>
);

export default DashboardHeader;
