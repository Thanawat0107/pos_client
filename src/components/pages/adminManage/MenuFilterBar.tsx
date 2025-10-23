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
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={1.5}
      sx={{ mb: 2 }}
    >
      {/* ค้นหา */}
      <TextField
        placeholder="ค้นหาชื่อเมนู / คำอธิบาย"
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

      {/* หมวดหมู่ */}
      <FormControl sx={{ minWidth: 180 }}>
        <Select
          value={cat}
          onChange={(e) => onCategoryChange(String(e.target.value))}
          displayEmpty
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
      <FormControl sx={{ minWidth: 160 }}>
        <Select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as any)}
          displayEmpty
        >
          <MenuItem value="all">สถานะทั้งหมด</MenuItem>
          <MenuItem value="active">พร้อมขาย</MenuItem>
          <MenuItem value="inactive">ปิดขาย</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
}
