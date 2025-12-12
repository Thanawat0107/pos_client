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

export default function RecipeFilterBar({
  q,
  status,
  onSearch,
  onStatusChange,
}: Props) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md")); // Desktop breakpoint

  return (
    <Stack
      direction={isMdUp ? "row" : "column"}
      spacing={1.25}
      sx={{
        mb: 2,
        width: "100%",
      }}
    >
      {/* Search Input */}
      <TextField
        size={isMdUp ? "medium" : "small"}
        // ปรับ Placeholder ให้ตรงกับบริบท Recipe
        placeholder="ค้นหาชื่อเมนู / วิธีทำ"
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

      {/* Status Select */}
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
          <MenuItem value="active">ใช้งาน (Active)</MenuItem>
          <MenuItem value="inactive">ปิดใช้งาน (Inactive)</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
}