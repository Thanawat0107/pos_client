import { useEffect } from "react";
import { alpha } from "@mui/material/styles";
import {
  Paper,
  Typography,
  Radio,
  Box,
  Alert,
  // Grid, // ปิดไว้ก่อนเพราะไม่ได้ใช้
  // Select,
  // MenuItem,
  // FormControl,
  // InputLabel,
} from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
// import AccessTimeIcon from "@mui/icons-material/AccessTime";
// import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

interface PickupSectionProps {
  pickupType: "asap" | "scheduled";
  setPickupType: (type: "asap" | "scheduled") => void;
  scheduledTime: string;
  setScheduledTime: (time: string) => void;
}

// --- 🚩 ปิดค่าคงที่ที่ไม่จำเป็นชั่วคราว ---
// const OPEN_HOUR = 16;
// const OPEN_MINUTE = 30;
// const CLOSE_HOUR = 22;
// const CLOSE_MINUTE = 0;
// const CLOSED_DAY = 6;

export default function PickupSection({
  setPickupType,
  setScheduledTime,
}: PickupSectionProps) {
  // --- 🚩 [COMMENTED] ปิด Logic การเลือกวันและเวลาล่วงหน้า ---
  /*
  const [selectedDateStr, setSelectedDateStr] = useState("");
  const [selectedTimeStr, setSelectedTimeStr] = useState("");

  const dateOptions = useMemo(() => { ... });
  const timeOptions = useMemo(() => { ... });

  useEffect(() => {
    if (pickupType === "scheduled") {
        if (selectedDateStr && selectedTimeStr) {
            setScheduledTime(`${selectedDateStr}T${selectedTimeStr}:00`);
        } else {
            setScheduledTime(""); 
        }
    }
  }, [selectedDateStr, selectedTimeStr, pickupType, setScheduledTime]);
  */

  // ✅ Force "asap" เสมอเมื่อ Component นี้ทำงาน
  useEffect(() => {
    setPickupType("asap");
    setScheduledTime(""); // ล้างค่าเวลาจองถ้ามีค้างอยู่
  }, [setPickupType, setScheduledTime]);

  return (
    <Paper
      sx={{ p: 4, borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
    >
      <Typography
        variant="h5" // ปรับจาก h6 เป็น h5
        fontWeight={800} // เพิ่มความหนา
        gutterBottom
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,

          mb: 3,
        }}
      >
        <StorefrontIcon sx={{ fontSize: 32 }} color="primary" /> การรับสินค้า
      </Typography>

      <Box
        sx={{
          p: 2.5,
          border: "3px solid",
          borderColor: "primary.main",
          bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Radio
          checked
          color="primary"
          sx={{ "& .MuiSvgIcon-root": { fontSize: 32 } }}
        />
        <Box>
          <Typography fontSize="1.3rem" fontWeight={800}>
            รอรับหน้าร้าน
          </Typography>
          <Typography fontSize="1rem" color="text.secondary" fontWeight={500}>
            ใช้เวลาเตรียมประมาณ 15-20 นาที
          </Typography>
        </Box>
      </Box>

      <Alert
        severity="info"
        sx={{
          mt: 3,
          borderRadius: 2,
          "& .MuiAlert-message": { fontSize: "1.05rem", lineHeight: 1.6 }, // ตัวหนังสือใน Alert ใหญ่ขึ้น
        }}
      >
        <Typography variant="subtitle1" fontWeight={800} gutterBottom>
          💡 ข้อมูลการจัดเตรียม
        </Typography>
        ครัวจะเริ่มทำอาหารให้ท่านทันที
        <strong> "หลังจากแจ้งโอนเงินเรียบร้อยแล้ว"</strong>
      </Alert>
    </Paper>
  );
}
