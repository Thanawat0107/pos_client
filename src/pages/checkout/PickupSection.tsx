import { useState, useEffect, useMemo } from "react";
import {
  Paper,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Alert,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  type SelectChangeEvent,
} from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

interface PickupSectionProps {
  pickupType: "asap" | "scheduled";
  setPickupType: (type: "asap" | "scheduled") => void;
  scheduledTime: string;
  setScheduledTime: (time: string) => void;
}

// 🛠️ ตั้งค่าเวลาทำการ (16:30 - 22:00)
const OPEN_HOUR = 16;
const OPEN_MINUTE = 30;
const CLOSE_HOUR = 22;
const CLOSE_MINUTE = 0;
const CLOSED_DAY = 6; // 0=อาทิตย์, 1=จันทร์, ..., 6=เสาร์

export default function PickupSection({
  pickupType,
  setPickupType,
  setScheduledTime,
}: PickupSectionProps) {

  const [selectedDateStr, setSelectedDateStr] = useState("");
  const [selectedTimeStr, setSelectedTimeStr] = useState("");

  // 1. สร้างรายการ "วันที่" (หา 3 วันทำการถัดไป โดยข้ามวันเสาร์)
  const dateOptions = useMemo(() => {
    const options = [];
    const today = new Date();
    let count = 0;
    let daysToAdd = 0;

    // Loop หาให้ครบ 3 ตัวเลือก
    while (count < 3) {
      const d = new Date(today);
      d.setDate(today.getDate() + daysToAdd);
      
      // ถ้าตรงกับวันปิดร้าน (เสาร์) ให้ข้ามไปเลย
      if (d.getDay() === CLOSED_DAY) {
        daysToAdd++;
        continue;
      }

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const value = `${year}-${month}-${day}`;

      let label = "";
      if (daysToAdd === 0) label = "วันนี้";
      else if (daysToAdd === 1) label = "พรุ่งนี้";
      else {
        label = d.toLocaleDateString("th-TH", { weekday: 'short', day: "numeric", month: "short" });
      }

      options.push({ value, label });
      count++;
      daysToAdd++;
    }
    return options;
  }, []);

  // 2. สร้างรายการ "เวลา" (16:30 - 22:00)
  const timeOptions = useMemo(() => {
    if (!selectedDateStr) return [];

    const options: string[] = [];
    const now = new Date();
    
    // เวลาขั้นต่ำที่เลือกได้ (ปัจจุบัน + 30 นาทีเตรียมอาหาร)
    const minTime = new Date(now.getTime() + 30 * 60000); 
    const isToday = selectedDateStr === now.toISOString().split('T')[0];

    // คำนวณเป็นนาที (Minutes from midnight) เพื่อให้จัดการ 16:30 ง่ายขึ้น
    const startMinutes = (OPEN_HOUR * 60) + OPEN_MINUTE; // 16*60 + 30 = 990
    const endMinutes = (CLOSE_HOUR * 60) + CLOSE_MINUTE; // 22*60 = 1320

    for (let m = startMinutes; m <= endMinutes; m += 30) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      
      const timeString = `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;

      // ถ้าเลือก "วันนี้" ต้องเช็คว่าเวลานั้นผ่านไปหรือยัง
      if (isToday) {
        const slotTime = new Date(now);
        slotTime.setHours(h, min, 0, 0);
        
        // ถ้าเวลา Slot น้อยกว่า (ปัจจุบัน+30นาที) ให้ข้ามไป (เลือกไม่ได้แล้ว)
        if (slotTime < minTime) continue;
      }

      options.push(timeString);
    }
    return options;
  }, [selectedDateStr]);

  // Update Parent State
  useEffect(() => {
    if (pickupType === "scheduled") {
        if (selectedDateStr && selectedTimeStr) {
            setScheduledTime(`${selectedDateStr}T${selectedTimeStr}:00`);
        } else {
            setScheduledTime(""); 
        }
    }
  }, [selectedDateStr, selectedTimeStr, pickupType, setScheduledTime]);

  // Default Value Logic
  useEffect(() => {
    // ถ้าเพิ่งกดเลือก scheduled และยังไม่มีวันที่เลือก ให้เลือกวันแรกสุดให้อัตโนมัติ
    if (pickupType === "scheduled" && !selectedDateStr && dateOptions.length > 0) {
        setSelectedDateStr(dateOptions[0].value);
    }
  }, [pickupType, selectedDateStr, dateOptions]);

  return (
    <Paper sx={{ p: 3, borderRadius: 3, mb: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
      <Typography
        variant="h6"
        fontWeight={700}
        gutterBottom
        sx={{ display: "flex", alignItems: "center", gap: 1, color: "#2c3e50" }}
      >
        <StorefrontIcon color="primary" /> การรับสินค้า
      </Typography>

      <RadioGroup
        value={pickupType}
        onChange={(e) => setPickupType(e.target.value as "asap" | "scheduled")}
      >
        {/* === ตัวเลือก 1: ASAP === */}
        <FormControlLabel
          value="asap"
          control={<Radio />}
          label={
            <Box>
              <Typography fontWeight={700} color="#333">
                รับทันที / รอรับหน้าร้าน
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                ประมาณ 15-20 นาที (หลังชำระเงินสำเร็จ)
              </Typography>
            </Box>
          }
          sx={{
            mb: 1, p: 1.5,
            border: pickupType === "asap" ? "2px solid #1976d2" : "1px solid #f0f0f0",
            bgcolor: pickupType === "asap" ? "#f5f9ff" : "transparent",
            borderRadius: 2, width: "100%", ml: 0, alignItems: 'flex-start'
          }}
        />

        {/* === ตัวเลือก 2: Scheduled === */}
        <FormControlLabel
          value="scheduled"
          control={<Radio />}
          label={
            <Typography fontWeight={700} sx={{ mt: 0.5 }} color="#333">
              สั่งล่วงหน้า (ระบุเวลา)
            </Typography>
          }
          sx={{
            p: 1.5,
            border: pickupType === "scheduled" ? "2px solid #1976d2" : "1px solid #f0f0f0",
            bgcolor: pickupType === "scheduled" ? "#f5f9ff" : "transparent",
            borderRadius: 2, width: "100%", ml: 0, alignItems: 'flex-start'
          }}
        />
      </RadioGroup>

      {/* === Select Date/Time === */}
      {pickupType === "scheduled" && (
        <Box sx={{ mt: 2, ml: 1, p: 2, bgcolor: "#fff", border: "1px dashed #ccc", borderRadius: 2 }}>
          
          {/* แสดงเวลาทำการให้ลูกค้าทราบนิดนึง */}
          <Typography variant="caption" sx={{ display: 'block', mb: 2, color: 'text.secondary' }}>
             🕒 ร้านเปิด 16:30 - 22:00 น. (หยุดวันเสาร์)
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{xs: 6}}>
              <FormControl fullWidth size="small">
                <InputLabel>วันที่รับ</InputLabel>
                <Select
                  value={selectedDateStr}
                  label="วันที่รับ"
                  onChange={(e: SelectChangeEvent) => {
                      setSelectedDateStr(e.target.value);
                      setSelectedTimeStr("");
                  }}
                  startAdornment={<CalendarTodayIcon sx={{ mr: 1, color: "text.secondary", fontSize: 20 }} />}
                >
                  {dateOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{xs: 6}}>
              <FormControl fullWidth size="small" disabled={!selectedDateStr}>
                <InputLabel>เวลา</InputLabel>
                <Select
                  value={selectedTimeStr}
                  label="เวลา"
                  onChange={(e: SelectChangeEvent) => setSelectedTimeStr(e.target.value)}
                  startAdornment={<AccessTimeIcon sx={{ mr: 1, color: "text.secondary", fontSize: 20 }} />}
                >
                   {timeOptions.length > 0 ? (
                      timeOptions.map((t) => (
                        <MenuItem key={t} value={t}>
                          {t} น.
                        </MenuItem>
                      ))
                   ) : (
                       <MenuItem disabled value="">
                          {selectedDateStr ? "ร้านปิดแล้ว" : "เลือกรอบ"}
                       </MenuItem>
                   )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {timeOptions.length === 0 && selectedDateStr && (
             <Alert severity="error" sx={{ mt: 2, fontSize: '0.8rem' }}>
                วันนี้ร้านปิดแล้ว หรือเลยเวลาสั่งซื้อ (22:00) กรุณาเลือกวันอื่น
             </Alert>
          )}

          <Alert severity="warning" sx={{ mt: 2, fontSize: '0.8rem', borderRadius: 2 }}>
            <Typography variant="caption" fontWeight={600} display="block">
              ⚠️ ข้อควรระวัง
            </Typography>
            หากยอดเกิน 200 บาท ครัวจะเริ่มทำอาหารเมื่อ <u>ได้รับยอดชำระเงินแล้วเท่านั้น</u>
          </Alert>
        </Box>
      )}
    </Paper>
  );
}