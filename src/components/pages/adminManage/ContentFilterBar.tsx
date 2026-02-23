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

type Props = {
  q: string;
  type: string;
  status: string;
  onSearch: (val: string) => void;
  onTypeChange: (val: string) => void;
  onStatusChange: (val: string) => void;
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
  fontSize: { xs: "0.9rem", md: "1.05rem" },
  bgcolor: "background.paper",
  "& fieldset": { borderColor: "divider", borderWidth: "1.5px" },
  "&:hover fieldset": { borderColor: "#E63946 !important" },
  "&.Mui-focused fieldset": { borderColor: "#E63946 !important" },
  "& .MuiSelect-select": { px: 2 },
};

const menuItemSx = { fontSize: { xs: "0.9rem", md: "1rem" }, py: 1.2 };

export default function ContentFilterBar({
  q,
  type,
  status,
  onSearch,
  onTypeChange,
  onStatusChange,
}: Props) {
  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ xs: "stretch", md: "flex-end" }}>

      {/* ค้นหา */}
      <Box sx={{ flex: { md: 2 } }}>
        <Typography sx={labelSx}>ค้นหาข่าวสาร / โปรโมชั่น</Typography>
        <TextField
          placeholder="พิมพ์ชื่อหัวข้อ / รายละเอียดเพื่อค้นหา..."
          value={q}
          onChange={(e) => onSearch(e.target.value)}
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "14px",
              bgcolor: "background.paper",
              height: { xs: 48, md: 56 },
              fontSize: { xs: "0.9rem", md: "1.05rem" },
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
                  <SearchIcon sx={{ color: "text.disabled", fontSize: { xs: "1.3rem", md: "1.6rem" } }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <Stack direction="row" spacing={{ xs: 1.5, md: 2.5 }} sx={{ flex: { md: 1.8 } }}>
        {/* สถานะ */}
        <Box sx={{ flex: 1 }}>
          <Typography sx={labelSx}>สถานะ</Typography>
          <FormControl fullWidth>
            <Select value={status} onChange={(e) => onStatusChange(e.target.value)} displayEmpty sx={selectSx}>
              <MenuItem value="all" sx={menuItemSx}>ทุกสถานะ</MenuItem>
              <MenuItem value="active" sx={menuItemSx}>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                  เปิดใช้งาน
                </span>
              </MenuItem>
              <MenuItem value="inactive" sx={menuItemSx}>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                  ปิดใช้งาน
                </span>
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* ประเภท */}
        <Box sx={{ flex: 1 }}>
          <Typography sx={labelSx}>ประเภท</Typography>
          <FormControl fullWidth>
            <Select value={type} onChange={(e) => onTypeChange(e.target.value)} displayEmpty sx={selectSx}>
              <MenuItem value="all" sx={menuItemSx}>ทุกประเภท</MenuItem>
              <MenuItem value="News" sx={menuItemSx}>ข่าวสาร</MenuItem>
              <MenuItem value="Promotion" sx={menuItemSx}>โปรโมชั่น</MenuItem>
              <MenuItem value="Event" sx={menuItemSx}>กิจกรรม</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Stack>

    </Stack>
  );
}