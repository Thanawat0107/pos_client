import {
  Typography,
  Chip,
  Button,
  Stack,
  Box,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { RefreshCcw, Download } from "lucide-react";
// หมายเหตุ: ต้องติดตั้ง npm install @mui/x-date-pickers dayjs
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Dayjs } from "dayjs";

interface Props {
  onRefresh: () => void;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  viewType: string;
  onDateChange: (start: Dayjs | null, end: Dayjs | null, type: string) => void;
}

const DashboardHeader = ({ 
  onRefresh, 
  startDate, 
  endDate, 
  viewType, 
  onDateChange 
}: Props) => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <Stack
      direction={{ xs: "column", lg: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", lg: "center" }}
      spacing={3}
      sx={{ mb: 4 }}
    >
      {/* 1. ส่วนหัวและสถานะ Live */}
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
          วิเคราะห์ข้อมูลย้อนหลังและสรุปผลการดำเนินงานแบบเจาะลึก
        </Typography>
      </Box>

      {/* 2. ส่วน Filter (หัวใจหลักของการดูข้อมูลย้อนหลัง) */}
      <Stack 
        direction={{ xs: "column", md: "row" }} 
        spacing={2} 
        alignItems="center"
        sx={{ width: { xs: '100%', lg: 'auto' } }}
      >
        {/* เลือกมุมมอง: วัน/เดือน/ปี */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>มุมมอง</InputLabel>
          <Select
            value={viewType}
            label="มุมมอง"
            onChange={(e) => onDateChange(startDate, endDate, e.target.value)}
          >
            <MenuItem value="day">รายวัน</MenuItem>
            <MenuItem value="month">รายเดือน</MenuItem>
            <MenuItem value="year">รายปี</MenuItem>
          </Select>
        </FormControl>

        {/* เลือกช่วงวันที่ */}
        <Stack direction="row" spacing={1} alignItems="center">
          <DatePicker
            label="เริ่มจาก"
            value={startDate}
            onChange={(val) => onDateChange(val, endDate, viewType)}
            slotProps={{ textField: { size: 'small', sx: { width: 150 } } }}
          />
          <Typography color="text.secondary">-</Typography>
          <DatePicker
            label="สิ้นสุด"
            value={endDate}
            onChange={(val) => onDateChange(startDate, val, viewType)}
            slotProps={{ textField: { size: 'small', sx: { width: 150 } } }}
          />
        </Stack>

        {/* ปุ่ม Action */}
        <Stack direction="row" spacing={1}>
          <Tooltip title="รีเฟรชข้อมูล">
            <IconButton 
              onClick={onRefresh}
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              <RefreshCcw size={18} />
            </IconButton>
          </Tooltip>
          
          <Button
            variant="contained"
            startIcon={<Download size={18} />}
            sx={{
              bgcolor: "primary.main",
              fontWeight: "bold",
              px: 3,
              borderRadius: 2,
              boxShadow: 2,
              "&:hover": { bgcolor: "primary.dark", boxShadow: 4 },
            }}
          >
            Export
          </Button>
        </Stack>
      </Stack>
    </Stack>
  </LocalizationProvider>
);

export default DashboardHeader;