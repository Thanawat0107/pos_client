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

type StatusType = "all" | "active" | "inactive";
type RequiredType = "all" | "required" | "optional";
type MultipleType = "all" | "multiple" | "single";

type Props = {
  q: string;
  status: StatusType;
  required: RequiredType;
  multiple: MultipleType;
  onSearch: (val: string) => void;
  onStatusChange: (val: StatusType) => void;
  onRequiredChange: (val: RequiredType) => void;
  onMultipleChange: (val: MultipleType) => void;
};

export default function MenuItemOptionFilterBar({
  q,
  status,
  required,
  multiple,
  onSearch,
  onStatusChange,
  onRequiredChange,
  onMultipleChange,
}: Props) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md")); // เดสก์ท็อป

  return (
    <Stack
      direction={isMdUp ? "row" : "column"}
      spacing={1.25}
      sx={{
        mb: 2,
        width: "100%",
      }}
    >
      {/* ค้นหา */}
      <TextField
        size={isMdUp ? "medium" : "small"}
        placeholder="ค้นหาชื่อกลุ่ม / เมนู"
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
        sx={{
          "& input": { fontSize: isMdUp ? 14 : 13 },
        }}
      />

      {/* สถานะ */}
      <FormControl fullWidth sx={{ minWidth: isMdUp ? 160 : "100%" }}>
        <Select
          size={isMdUp ? "medium" : "small"}
          value={status}
          onChange={(e) => onStatusChange(e.target.value as StatusType)}
          displayEmpty
          sx={{
            fontSize: isMdUp ? 14 : 13,
          }}
        >
          <MenuItem value="all">สถานะทั้งหมด</MenuItem>
          <MenuItem value="active">พร้อมใช้</MenuItem>
          <MenuItem value="inactive">ปิดใช้งาน</MenuItem>
        </Select>
      </FormControl>

      {/* ประเภทการเลือก (บังคับ/ไม่บังคับ) */}
      <FormControl fullWidth sx={{ minWidth: isMdUp ?  160 : "100%" }}>
        <Select
          size={isMdUp ? "medium" : "small"}
          value={required}
          onChange={(e) => onRequiredChange(e.target.value as RequiredType)}
          displayEmpty
          sx={{
            fontSize: isMdUp ? 14 : 13,
          }}
        >
          <MenuItem value="all">ทุกประเภท</MenuItem>
          <MenuItem value="required">บังคับเลือก</MenuItem>
          <MenuItem value="optional">ไม่บังคับ</MenuItem>
        </Select>
      </FormControl>

      {/* รูปแบบการเลือก (หลายรายการ/รายการเดียว) */}
      <FormControl fullWidth sx={{ minWidth: isMdUp ? 160 : "100%" }}>
        <Select
          size={isMdUp ? "medium" : "small"}
          value={multiple}
          onChange={(e) => onMultipleChange(e.target.value as MultipleType)}
          displayEmpty
          sx={{
            fontSize: isMdUp ? 14 : 13,
          }}
        >
          <MenuItem value="all">รูปแบบทั้งหมด</MenuItem>
          <MenuItem value="multiple">เลือกได้หลายรายการ</MenuItem>
          <MenuItem value="single">เลือกได้ 1 รายการ</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
}