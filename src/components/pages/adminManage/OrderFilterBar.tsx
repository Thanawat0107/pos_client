import {
  Stack,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Box,
} from "@mui/material";
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

const labelSx = {
  fontSize: { xs: "0.875rem", md: "1rem" },
  fontWeight: 700,
  color: "text.secondary",
  ml: 0.5,
  mb: 0.75,
  display: "block",
};

const selectSx = {
  borderRadius: "14px",
  height: { xs: 48, md: 56 },
  fontSize: { xs: "0.9rem", md: "1rem" },
  bgcolor: "background.paper",
  "& fieldset": { borderColor: "divider", borderWidth: "1.5px" },
  "&:hover fieldset": { borderColor: "#E63946 !important" },
  "&.Mui-focused fieldset": { borderColor: "#E63946 !important" },
  "& .MuiSelect-select": { px: 2 },
};

const menuItemSx = { fontSize: { xs: "0.875rem", md: "0.95rem" }, py: 1.1 };

export default function OrderFilterBar({
  q, status, pay, channel,
  onSearch, onStatusChange, onPayChange, onChannelChange,
}: Props) {
  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ xs: "stretch", md: "flex-end" }}>

      {/* ค้นหา */}
      <Box sx={{ flex: { md: 2 } }}>
        <Typography sx={labelSx}>ค้นหาออเดอร์</Typography>
        <TextField
          placeholder="ค้นหา: โค้ด, ชื่อลูกค้า, เบอร์..."
          value={q}
          onChange={(e) => onSearch(e.target.value)}
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "14px",
              bgcolor: "background.paper",
              height: { xs: 48, md: 56 },
              fontSize: { xs: "0.9rem", md: "1rem" },
              px: 1,
              "& fieldset": { borderColor: "divider", borderWidth: "1.5px" },
              "&:hover fieldset": { borderColor: "#E63946" },
              "&.Mui-focused fieldset": { borderColor: "#E63946" },
            },
            "& .MuiOutlinedInput-input": { pl: 1, pr: 2 },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start" sx={{ ml: 0.5 }}>
                  <SearchIcon sx={{ color: "text.disabled", fontSize: { xs: "1.3rem", md: "1.5rem" } }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <Stack direction="row" spacing={{ xs: 1.5, md: 2 }} sx={{ flex: { md: 2.2 } }}>

        {/* สถานะออเดอร์ */}
        <Box sx={{ flex: 1.4 }}>
          <Typography sx={labelSx}>สถานะ</Typography>
          <FormControl fullWidth>
            <Select value={status} onChange={(e) => onStatusChange(e.target.value)} displayEmpty sx={selectSx}>
              <MenuItem value="all" sx={menuItemSx}>ทุกสถานะ</MenuItem>
              <MenuItem value={Sd.Status_Pending} sx={menuItemSx}>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />รออนุมัติ
                </span>
              </MenuItem>
              <MenuItem value={Sd.Status_PendingPayment} sx={menuItemSx}>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />รอชำระเงิน
                </span>
              </MenuItem>
              <MenuItem value={Sd.Status_Approved} sx={menuItemSx}>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />อนุมัติแล้ว
                </span>
              </MenuItem>
              <MenuItem value={Sd.Status_Paid} sx={menuItemSx}>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />ชำระแล้ว
                </span>
              </MenuItem>
              <MenuItem value={Sd.Status_Preparing} sx={menuItemSx}>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />กำลังปรุง
                </span>
              </MenuItem>
              <MenuItem value={Sd.Status_Ready} sx={menuItemSx}>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0" />พร้อมรับ
                </span>
              </MenuItem>
              <MenuItem value={Sd.Status_Completed} sx={menuItemSx}>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-400 shrink-0" />สำเร็จ
                </span>
              </MenuItem>
              <MenuItem value={Sd.Status_Cancelled} sx={menuItemSx}>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-300 shrink-0" />ยกเลิก
                </span>
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* การชำระ */}
        <Box sx={{ flex: 1 }}>
          <Typography sx={labelSx}>การชำระ</Typography>
          <FormControl fullWidth>
            <Select value={pay} onChange={(e) => onPayChange(e.target.value)} displayEmpty sx={selectSx}>
              <MenuItem value="all" sx={menuItemSx}>ทั้งหมด</MenuItem>
              <MenuItem value="UNPAID" sx={menuItemSx}>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />ยังไม่จ่าย
                </span>
              </MenuItem>
              <MenuItem value="PAID" sx={menuItemSx}>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />จ่ายแล้ว
                </span>
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* ช่องทาง */}
        <Box sx={{ flex: 1 }}>
          <Typography sx={labelSx}>ช่องทาง</Typography>
          <FormControl fullWidth>
            <Select value={channel} onChange={(e) => onChannelChange(e.target.value)} displayEmpty sx={selectSx}>
              <MenuItem value="all" sx={menuItemSx}>ทั้งหมด</MenuItem>
              <MenuItem value="PickUp" sx={menuItemSx}>รับหน้าร้าน</MenuItem>
              <MenuItem value="DineIn" sx={menuItemSx}>ทานที่ร้าน</MenuItem>
              <MenuItem value="Delivery" sx={menuItemSx}>เดลิเวอรี่</MenuItem>
            </Select>
          </FormControl>
        </Box>

      </Stack>
    </Stack>
  );
}