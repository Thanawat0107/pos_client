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
import type { MenuCategory } from "./menu/FormMenu";

type Props = {
  q: string;
  cat: string;
  status: "all" | "active" | "inactive";
  categories: MenuCategory[];
  onSearch: (val: string) => void;
  onCategoryChange: (val: string) => void;
  onStatusChange: (val: "all" | "active" | "inactive") => void;
};

export default function MenuFilterBar({
  q,
  cat,
  status,
  categories,
  onSearch,
  onCategoryChange,
  onStatusChange,
}: Props) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md")); // มือถือ < md

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
        placeholder="ค้นหาชื่อเมนู / คำอธิบาย"
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

      {/* หมวดหมู่ */}
      <FormControl fullWidth sx={{ minWidth: isMdUp ? 180 : "100%" }}>
        <Select
          size={isMdUp ? "medium" : "small"}
          value={cat}
          onChange={(e) => onCategoryChange(String(e.target.value))}
          displayEmpty
          sx={{
            fontSize: isMdUp ? 14 : 13,
          }}
        >
          <MenuItem value="all">หมวดหมู่ทั้งหมด</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* สถานะ */}
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
          <MenuItem value="active">พร้อมขาย</MenuItem>
          <MenuItem value="inactive">ปิดขาย</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
}
