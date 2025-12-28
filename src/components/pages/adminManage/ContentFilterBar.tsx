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

type Props = {
  q: string;
  type: string;
  status: string;
  onSearch: (val: string) => void;
  onTypeChange: (val: string) => void;
  onStatusChange: (val: string) => void;
};

export default function ContentFilterBar({
  q,
  type,
  status,
  onSearch,
  onTypeChange,
  onStatusChange,
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
        placeholder="ค้นหาหัวข้อ / รายละเอียด"
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
      />

      <FormControl fullWidth sx={{ minWidth: isMdUp ? 180 : "100%" }}>
        <Select
          size={isMdUp ? "medium" : "small"}
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
          displayEmpty
        >
          <MenuItem value="all">ประเภททั้งหมด</MenuItem>
          <MenuItem value="News">ข่าวสาร (News)</MenuItem>
          <MenuItem value="Promotion">โปรโมชั่น (Promotion)</MenuItem>
          <MenuItem value="Event">กิจกรรม (Event)</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ minWidth: isMdUp ? 160 : "100%" }}>
        <Select
          size={isMdUp ? "medium" : "small"}
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          displayEmpty
        >
          <MenuItem value="all">สถานะทั้งหมด</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
}