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
import { ROLES } from "../../../helpers/SD";

type Props = {
  q: string;
  role: string;
  status: "all" | "active" | "inactive";
  onSearch: (val: string) => void;
  onRoleChange: (val: string) => void;
  onStatusChange: (val: "all" | "active" | "inactive") => void;
};

export default function ManualFilterBar({
  q,
  role,
  status,
  onSearch,
  onRoleChange,
  onStatusChange,
}: Props) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Stack
      direction={isMdUp ? "row" : "column"}
      spacing={1.25}
      sx={{
        mb: 2,
        width: "100%",
      }}
    >
      {/* 1. ช่องค้นหา */}
      <TextField
        size={isMdUp ? "medium" : "small"}
        placeholder="ค้นหา (เนื้อหา / หมวดหมู่)"
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

      {/* 2. ตัวกรอง Role (แทน Category) */}
      <FormControl fullWidth sx={{ minWidth: isMdUp ? 180 : "100%" }}>
        <Select
          size={isMdUp ? "medium" : "small"}
          value={role}
          onChange={(e) => onRoleChange(e.target.value)}
          displayEmpty
          sx={{
            fontSize: isMdUp ? 14 : 13,
          }}
        >
          <MenuItem value="all">บทบาททั้งหมด</MenuItem>
          {ROLES.map((r) => (
            <MenuItem key={r.value} value={r.value}>
              {r.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* 3. ตัวกรอง Status */}
      <FormControl fullWidth sx={{ minWidth: isMdUp ? 160 : "100%" }}>
        <Select
          size={isMdUp ? "medium" : "small"}
          value={status}
          onChange={(e) => onStatusChange(e.target.value as any)}
          displayEmpty
          sx={{
            fontSize: isMdUp ? 14 : 13,
          }}
        >
          <MenuItem value="all">สถานะทั้งหมด</MenuItem>
          <MenuItem value="active">ใช้งาน (Active)</MenuItem>
          <MenuItem value="inactive">ปิดการใช้งาน</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
}