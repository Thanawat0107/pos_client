/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Typography,
  Button,
  Stack,
  Box,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  ListItemIcon,
  ListItemText,
  Menu,
} from "@mui/material";
import {
  RefreshCcw,
  Download,
  Calendar as CalendarIcon,
  ChevronDown,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/th";
import { alpha } from "@mui/material/styles";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { PremiumReport } from "../../../../utility/reports/PremiumReport";
import { exportToExcel } from "../../../../utility/reports/excelExport";
import { useState } from "react";

dayjs.locale("th");

interface Props {
  onRefresh: () => void;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  viewType: string;
  onDateChange: (start: Dayjs | null, end: Dayjs | null, type: string) => void;
  data: any; // เพิ่ม
  detailedData: any; // เพิ่ม
}

const DashboardHeader = ({
  onRefresh,
  startDate,
  endDate,
  viewType,
  onDateChange,
  data,
  detailedData,
}: Props) => {
  // --- ส่วนของ Logic เมนู ---
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
      <Stack
        direction={{ xs: "column", xl: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", xl: "center" }}
        spacing={4}
      >
        {/* 1. ส่วนหัวเรื่องและสถานะ Live เปล่งแสง */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 1 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                color: "#0f172a",
                letterSpacing: "-0.04em",
                fontSize: { xs: "2rem", md: "2.75rem" },
              }}
            >
              ภาพรวมการวิเคราะห์
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 2.5,
                py: 1,
                bgcolor: "#fff1f2",
                borderRadius: "20px",
                border: "1px solid #ffe4e6",
                boxShadow: `0 0 15px ${alpha("#f43f5e", 0.1)}`,
              }}
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.6)]"></span>
              </span>
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 900,
                  color: "#e11d48",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                ถ่ายทอดสด
              </Typography>
            </Box>
          </Stack>

          <Typography
            variant="h6"
            sx={{
              color: "text.secondary",
              fontWeight: 500,
              opacity: 0.7,
              maxWidth: "600px",
              lineHeight: 1.5,
            }}
          >
            ระบบวิเคราะห์สถิติอัจฉริยะและตรวจสอบประสิทธิภาพการดำเนินงาน
          </Typography>
        </Box>

        {/* 2. แผงควบคุม (ตัวกรองและการดำเนินการ) */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          alignItems="center"
          sx={{ width: { xs: "100%", xl: "auto" } }}
        >
          {/* กลุ่มตัวกรองวันที่สไตล์พรีเมียม */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems="center"
            sx={{
              p: 1.5,
              bgcolor: "#f8fafc",
              borderRadius: "24px",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
            }}
          >
            {/* เลือกประเภทมุมมอง */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={viewType}
                onChange={(e) =>
                  onDateChange(startDate, endDate, e.target.value)
                }
                IconComponent={ChevronDown}
                sx={{
                  bgcolor: "white",
                  borderRadius: "16px",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  color: "#334155",
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "1px solid #e2e8f0",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#cbd5e1",
                  },
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  "& .MuiSelect-select": { py: 1.5, px: 2.5 },
                }}
              >
                <MenuItem value="day" sx={{ fontWeight: 700, py: 1.5 }}>
                  มุมมองรายวัน
                </MenuItem>
                <MenuItem value="month" sx={{ fontWeight: 700, py: 1.5 }}>
                  มุมมองรายเดือน
                </MenuItem>
                <MenuItem value="year" sx={{ fontWeight: 700, py: 1.5 }}>
                  มุมมองรายปี
                </MenuItem>
              </Select>
            </FormControl>

            {/* เลือกช่วงวันที่ */}
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              sx={{
                bgcolor: "white",
                px: 2,
                py: 0.5,
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
              }}
            >
              <DatePicker
                label="จากวันที่"
                value={startDate}
                onChange={(val) => onDateChange(val, endDate, viewType)}
                slots={{ openPickerIcon: CalendarIcon }}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      width: 155,
                      "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                      "& .MuiInputBase-input": {
                        fontWeight: 800,
                        color: "#1e293b",
                        fontSize: "0.95rem",
                      },
                      "& .MuiInputLabel-root": {
                        fontWeight: 700,
                        color: "#94a3b8",
                        mt: -0.5,
                      },
                    },
                  },
                }}
              />
              <Typography sx={{ color: "#cbd5e1", fontWeight: 900, px: 1 }}>
                –
              </Typography>
              <DatePicker
                label="ถึงวันที่"
                value={endDate}
                onChange={(val) => onDateChange(startDate, val, viewType)}
                slots={{ openPickerIcon: CalendarIcon }}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      width: 155,
                      "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                      "& .MuiInputBase-input": {
                        fontWeight: 800,
                        color: "#1e293b",
                        fontSize: "0.95rem",
                      },
                      "& .MuiInputLabel-root": {
                        fontWeight: 700,
                        color: "#94a3b8",
                        mt: -0.5,
                      },
                    },
                  },
                }}
              />
            </Stack>
          </Stack>

          {/* กลุ่มปุ่มรีเฟรชและส่งออกรายงาน */}
          <Stack direction="row" spacing={2.5}>
            <Tooltip title="อัปเดตข้อมูลล่าสุด">
              <IconButton
                onClick={onRefresh}
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: "white",
                  border: "2px solid",
                  borderColor: "#f1f5f9",
                  color: "#64748b",
                  borderRadius: "20px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                  transition:
                    "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  "&:hover": {
                    bgcolor: "#f8fafc",
                    transform: "rotate(180deg)",
                    color: "primary.main",
                    borderColor: "primary.light",
                  },
                }}
              >
                <RefreshCcw size={26} />
              </IconButton>
            </Tooltip>

            {/* --- ปุ่มหลักสำหรับส่งออก --- */}
            <Button
              variant="contained"
              disableElevation
              onClick={handleOpenMenu} // เปิดเมนูเมื่อคลิก
              startIcon={<Download size={22} />}
              endIcon={<ChevronDown size={18} />} // เพิ่มไอคอนลูกศรชี้ลง
              disabled={!data}
              sx={{
                bgcolor: "#0f172a",
                color: "white",
                fontWeight: 900,
                fontSize: "1.05rem",
                px: 4,
                borderRadius: "20px",
                height: 60,
                textTransform: "none",
                boxShadow: "0 15px 30px -8px rgba(15, 23, 42, 0.35)",
                "&:hover": { bgcolor: "#000" },
              }}
            >
              ส่งออกรายงาน
            </Button>

            {/* --- ป๊อปอัพเมนู (Dropdown) --- */}
            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleCloseMenu}
              onClick={handleCloseMenu}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  borderRadius: "20px",
                  boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)",
                  border: "1px solid #e2e8f0",
                  minWidth: 220,
                  p: 1,
                },
              }}
            >
              {/* รายการ Export Excel */}
              <MenuItem
                onClick={() =>
                  exportToExcel(data, detailedData, { startDate, endDate })
                }
                sx={{ borderRadius: "12px", py: 1.5 }}
              >
                <ListItemIcon>
                  <FileSpreadsheet size={20} color="#10b981" />
                </ListItemIcon>
                <ListItemText
                  primary="ดาวน์โหลดเป็น Excel"
                  primaryTypographyProps={{
                    fontWeight: 700,
                    fontSize: "0.95rem",
                  }}
                />
              </MenuItem>

              {/* รายการ Export PDF (ครอบด้วย PDFDownloadLink) */}
              <PDFDownloadLink
                document={
                  <PremiumReport
                    data={data}
                    detailedData={detailedData}
                    filters={{ startDate, endDate }}
                  />
                }
                fileName={`Revenue_Report_${dayjs().format("DDMMYYYY_HHmm")}.pdf`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {({ loading }) => (
                  <MenuItem
                    disabled={loading}
                    sx={{ borderRadius: "12px", py: 1.5 }}
                  >
                    <ListItemIcon>
                      <FileText size={20} color="#e11d48" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        loading ? "กำลังเตรียม PDF..." : "ดาวน์โหลดเป็น PDF"
                      }
                      primaryTypographyProps={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                      }}
                    />
                  </MenuItem>
                )}
              </PDFDownloadLink>
            </Menu>
          </Stack>
        </Stack>
      </Stack>
    </LocalizationProvider>
  );
};

export default DashboardHeader;
