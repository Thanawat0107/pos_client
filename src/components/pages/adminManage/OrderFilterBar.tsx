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
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Stack
      direction={isMdUp ? "row" : "column"}
      spacing={1.25}
      sx={{ mb: 2, width: "100%" }}
    >
      <TextField
        size={isMdUp ? "medium" : "small"}
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
        sx={{ "& input": { fontSize: isMdUp ? 14 : 13 } }}
      />

      <FormControl fullWidth sx={{ minWidth: isMdUp ? 180 : "100%" }}>
        <Select
          size={isMdUp ? "medium" : "small"}
          value={status}
          onChange={(e) => onStatusChange(e.target.value as any)}
          displayEmpty
          sx={{ fontSize: isMdUp ? 14 : 13 }}
        >
          <MenuItem value="all">สถานะออเดอร์ทั้งหมด</MenuItem>
          <MenuItem value="PENDING">รอรับออเดอร์</MenuItem>
          <MenuItem value="COOKING">กำลังทำ</MenuItem>
          <MenuItem value="READY">เสร็จแล้ว</MenuItem>
          <MenuItem value="COMPLETED">เสิร์ฟแล้ว</MenuItem>
          <MenuItem value="CANCELLED">ยกเลิก</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ minWidth: isMdUp ? 160 : "100%" }}>
        <Select
          size={isMdUp ? "medium" : "small"}
          value={pay}
          onChange={(e) => onPayChange(e.target.value as any)}
          displayEmpty
          sx={{ fontSize: isMdUp ? 14 : 13 }}
        >
          <MenuItem value="all">การชำระทั้งหมด</MenuItem>
          <MenuItem value="UNPAID">ยังไม่จ่าย</MenuItem>
          <MenuItem value="PAID">จ่ายแล้ว</MenuItem>
          <MenuItem value="REFUNDED">คืนเงิน</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ minWidth: isMdUp ? 160 : "100%" }}>
        <Select
          size={isMdUp ? "medium" : "small"}
          value={channel}
          onChange={(e) => onChannelChange(e.target.value as any)}
          displayEmpty
          sx={{ fontSize: isMdUp ? 14 : 13 }}
        >
          <MenuItem value="all">ช่องทางทั้งหมด</MenuItem>
          <MenuItem value="DINE_IN">ทานที่ร้าน</MenuItem>
          <MenuItem value="TAKEAWAY">สั่งกลับบ้าน</MenuItem>
          <MenuItem value="DELIVERY">เดลิเวอรี่</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
}
