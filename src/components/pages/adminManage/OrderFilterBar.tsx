/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Stack,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export type OrderStatus = "PENDING" | "COOKING" | "READY" | "COMPLETED" | "CANCELLED";
export type PayStatus = "UNPAID" | "PAID" | "REFUNDED";
export type Channel = "DINE_IN" | "TAKEAWAY" | "DELIVERY";

type Props = {
  q: string;
  status: "all" | OrderStatus;
  pay: "all" | PayStatus;
  channel: "all" | Channel;
  onSearch: (val: string) => void;
  onStatusChange: (val: "all" | OrderStatus) => void;
  onPayChange: (val: "all" | PayStatus) => void;
  onChannelChange: (val: "all" | Channel) => void;
};

export default function OrderFilterBar({
  q, status, pay, channel,
  onSearch, onStatusChange, onPayChange, onChannelChange,
}: Props) {
  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2 }}>
      <TextField
        placeholder="ค้นหา: โค้ด, ชื่อลูกค้า, เบอร์"
        value={q}
        onChange={(e) => onSearch(e.target.value)}
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <FormControl sx={{ minWidth: 180 }}>
        <Select value={status} onChange={(e) => onStatusChange(e.target.value as any)} displayEmpty>
          <MenuItem value="all">สถานะออเดอร์ทั้งหมด</MenuItem>
          <MenuItem value="PENDING">รอรับออเดอร์</MenuItem>
          <MenuItem value="COOKING">กำลังทำ</MenuItem>
          <MenuItem value="READY">เสร็จแล้ว</MenuItem>
          <MenuItem value="COMPLETED">เสิร์ฟแล้ว</MenuItem>
          <MenuItem value="CANCELLED">ยกเลิก</MenuItem>
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 160 }}>
        <Select value={pay} onChange={(e) => onPayChange(e.target.value as any)} displayEmpty>
          <MenuItem value="all">การชำระทั้งหมด</MenuItem>
          <MenuItem value="UNPAID">ยังไม่จ่าย</MenuItem>
          <MenuItem value="PAID">จ่ายแล้ว</MenuItem>
          <MenuItem value="REFUNDED">คืนเงิน</MenuItem>
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 160 }}>
        <Select value={channel} onChange={(e) => onChannelChange(e.target.value as any)} displayEmpty>
          <MenuItem value="all">ช่องทางทั้งหมด</MenuItem>
          <MenuItem value="DINE_IN">ทานที่ร้าน</MenuItem>
          <MenuItem value="TAKEAWAY">สั่งกลับบ้าน</MenuItem>
          <MenuItem value="DELIVERY">เดลิเวอรี่</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
}
