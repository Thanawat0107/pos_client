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
import { Sd } from "../../../helpers/SD";

type Props = {
  q: string;
  status: string;
  pay: string;
  channel: string;
  onSearch: (val: string) => void;
  onStatusChange: (val: string) => void;
  onPayChange: (val: string) => void;
  onChannelChange: (val: string) => void;
};

export default function OrderFilterBar({
  q, status, pay, channel,
  onSearch, onStatusChange, onPayChange, onChannelChange,
}: Props) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  // สไตล์สำหรับ Input ให้ดูขาวสะอาดและมีขอบมนๆ
  const inputStyle = {
    bgcolor: 'white',
    borderRadius: 2,
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#e0e0e0', // ขอบสีจางๆ
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#bdbdbd',
    },
  };

  return (
    <Stack
      direction={isMdUp ? "row" : "column"}
      spacing={2}
      sx={{ mb: 0, width: "100%" }}
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
              <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
        sx={{ 
            ...inputStyle,
            flexGrow: 1 // ให้ช่องค้นหายืดกินพื้นที่ที่เหลือ
        }}
      />

      {/* 2. กรองสถานะออเดอร์ (ใช้ค่าจาก Sd) */}
      <FormControl sx={{ minWidth: isMdUp ? 200 : "100%" }} size="small">
        <Select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          displayEmpty
          sx={inputStyle}
        >
          <MenuItem value="all">สถานะ: ทั้งหมด</MenuItem>
          <MenuItem value={Sd.Status_PendingPayment}>รอชำระเงิน</MenuItem>
          <MenuItem value={Sd.Status_Paid}>รอคิว/จ่ายแล้ว</MenuItem>
          <MenuItem value={Sd.Status_Preparing}>กำลังปรุง</MenuItem>
          <MenuItem value={Sd.Status_Ready}>พร้อมรับ</MenuItem>
          <MenuItem value={Sd.Status_Completed}>สำเร็จ</MenuItem>
          <MenuItem value={Sd.Status_Cancelled}>ยกเลิก</MenuItem>
        </Select>
      </FormControl>

      {/* 3. กรองสถานะการชำระ */}
      <FormControl sx={{ minWidth: isMdUp ? 180 : "100%" }} size="small">
        <Select
          value={pay}
          onChange={(e) => onPayChange(e.target.value)}
          displayEmpty
          sx={inputStyle}
        >
          <MenuItem value="all">การชำระ: ทั้งหมด</MenuItem>
          <MenuItem value="UNPAID">ยังไม่จ่าย</MenuItem>
          <MenuItem value="PAID">จ่ายแล้ว</MenuItem>
        </Select>
      </FormControl>

      {/* 4. กรองช่องทาง */}
      <FormControl sx={{ minWidth: isMdUp ? 180 : "100%" }} size="small">
        <Select
          value={channel}
          onChange={(e) => onChannelChange(e.target.value)}
          displayEmpty
          sx={inputStyle}
        >
          <MenuItem value="all">ช่องทาง: ทั้งหมด</MenuItem>
          <MenuItem value="PickUp">รับที่ร้าน</MenuItem>
          <MenuItem value="DineIn">ทานที่ร้าน</MenuItem>
          <MenuItem value="Delivery">เดลิเวอรี่</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
}