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

type Props = {
  q: string;
  status: StatusType;
  onSearch: (val: string) => void;
  onStatusChange: (val: StatusType) => void;
};

export default function CategoryFilterBar({
  q,
  status,
  onSearch,
  onStatusChange,
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
        placeholder="ค้นหาชื่อ / slug"
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
    </Stack>
  );
}