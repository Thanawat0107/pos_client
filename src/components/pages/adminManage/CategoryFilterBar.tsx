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

type StatusType = "all" | "active" | "inactive";

type Props = {
  q: string;
  status: StatusType;
  onSearch: (val: string) => void;
  onStatusChange: (val: StatusType) => void;
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

export default function CategoryFilterBar({
  q,
  status,
  onSearch,
  onStatusChange,
}: Props) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={3}
      alignItems={{ xs: "stretch", md: "flex-end" }}
    >
      {/* ค้นหา */}
      <Box sx={{ flex: { md: 2 } }}>
        <Typography variant="caption" sx={labelSx}>
          ค้นหาหมวดหมู่
        </Typography>
        <TextField
          placeholder="พิมพ์ชื่อหมวดหมู่..."
          value={q}
          onChange={(e) => onSearch(e.target.value)}
          fullWidth
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "14px",
              backgroundColor: "background.paper",
              height: { xs: 48, md: 56 },
              fontSize: { xs: "0.9rem", md: "1.05rem" },
              "& fieldset": { borderColor: "divider", borderWidth: "1.5px" },
              "&:hover fieldset": { borderColor: "#E63946" },
              "&.Mui-focused fieldset": { borderColor: "#E63946" },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ ml: 0.5 }}>
                <SearchIcon
                  sx={{
                    color: "text.disabled",
                    fontSize: { xs: "1.3rem", md: "1.6rem" },
                  }}
                />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* สถานะการใช้งาน */}
      <Box sx={{ flex: { md: 1 } }}>
        <Typography variant="caption" sx={labelSx}>
          สถานะการใช้งาน
        </Typography>
        <FormControl fullWidth>
          <Select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as StatusType)}
            displayEmpty
            sx={selectSx}
          >
            <MenuItem value="all" sx={menuItemSx}>
              ทุกสถานะ
            </MenuItem>
            <MenuItem value="active" sx={menuItemSx}>
              พร้อมใช้
            </MenuItem>
            <MenuItem value="inactive" sx={menuItemSx}>
              ปิดใช้งาน
            </MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Stack>
  );
}
