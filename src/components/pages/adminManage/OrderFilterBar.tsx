/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Stack,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";

// ✅ ปรับสถานะให้ตรงกับที่ใช้ใน OrderHeader DTO และ Drawer Logic
export type OrderStatus = "PendingPayment" | "Paid" | "Preparing" | "Ready" | "Completed" | "Cancelled";
export type PayStatus = "UNPAID" | "PAID" | "REFUNDED";
export type Channel = "PickUp" | "DineIn" | "Delivery"; // ปรับให้ตรงกับ DTO

type Props = {
  q: string;
  status: "all" | OrderStatus;
  pay: "all" | PayStatus;
  channel: "all" | Channel;
  onSearch: (val: string) => void;
  onStatusChange: (val: "all" | any) => void; // ใช้ any เพื่อความยืดหยุ่นในการ Filter
  onPayChange: (val: "all" | any) => void;
  onChannelChange: (val: "all" | any) => void;
};

export default function OrderFilterBar({
  q, status, pay, channel,
  onSearch, onStatusChange, onPayChange, onChannelChange,
}: Props) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Stack
      direction={isMdUp ? "row" : "column"}
      spacing={1.25}
      sx={{ mb: 2, width: "100%" }}
    >
      {/* 1. ค้นหาทั่วไป */}
      <TextField
        size="small"
        placeholder="ค้นหา: โค้ด, ชื่อลูกค้า, เบอร์"
        value={q}
        onChange={(e) => onSearch(e.target.value)}
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{ "& input": { fontSize: 14 } }}
      />

      {/* 2. กรองสถานะออเดอร์ */}
      <FormControl fullWidth sx={{ minWidth: isMdUp ? 160 : "100%" }}>
        <Select
          size="small"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          displayEmpty
          sx={{ fontSize: 14 }}
        >
          <MenuItem value="all">ทุกสถานะออเดอร์</MenuItem>
          <MenuItem value="PendingPayment">รอชำระเงิน</MenuItem>
          <MenuItem value="Paid">จ่ายแล้ว/รอเตรียม</MenuItem>
          <MenuItem value="Preparing">กำลังปรุง</MenuItem>
          <MenuItem value="Ready">พร้อมรับอาหาร</MenuItem>
          <MenuItem value="Completed">สำเร็จ</MenuItem>
          <MenuItem value="Cancelled">ยกเลิก</MenuItem>
        </Select>
      </FormControl>

      {/* 3. กรองสถานะการชำระ (ถ้ามีฟิลด์นี้แยกใน DTO) */}
      <FormControl fullWidth sx={{ minWidth: isMdUp ? 150 : "100%" }}>
        <Select
          size="small"
          value={pay}
          onChange={(e) => onPayChange(e.target.value)}
          displayEmpty
          sx={{ fontSize: 14 }}
        >
          <MenuItem value="all">การชำระทั้งหมด</MenuItem>
          <MenuItem value="UNPAID">ยังไม่จ่าย</MenuItem>
          <MenuItem value="PAID">จ่ายแล้ว</MenuItem>
          <MenuItem value="REFUNDED">คืนเงิน</MenuItem>
        </Select>
      </FormControl>

      {/* 4. กรองช่องทาง */}
      <FormControl fullWidth sx={{ minWidth: isMdUp ? 150 : "100%" }}>
        <Select
          size="small"
          value={channel}
          onChange={(e) => onChannelChange(e.target.value)}
          displayEmpty
          sx={{ fontSize: 14 }}
        >
          <MenuItem value="all">ทุกช่องทาง</MenuItem>
          <MenuItem value="PickUp">รับที่ร้าน (PickUp)</MenuItem>
          <MenuItem value="DineIn">ทานที่ร้าน</MenuItem>
          <MenuItem value="Delivery">เดลิเวอรี่</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
}