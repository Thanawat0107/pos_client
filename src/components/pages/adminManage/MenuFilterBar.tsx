/* eslint-disable @typescript-eslint/no-explicit-any */
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

export default function MenuFilterBar({
  q,
  cat,
  status,
  categories,
  onSearch,
  onCategoryChange,
  onStatusChange,
}: any) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={3}
      alignItems={{ xs: "stretch", md: "flex-end" }}
    >
      {/* 1. ช่องค้นหา */}
      <Box sx={{ flex: { md: 2 } }}>
        <Typography
          variant="caption"
          sx={{
            fontSize: { xs: "0.875rem", md: "1rem" },
            fontWeight: 700,
            color: "text.secondary",
            ml: 0.5,
            mb: 0.75,
            display: "block",
          }}
        >
          ค้นหาเมนู
        </Typography>
        <TextField
          placeholder="พิมพ์ชื่อเมนูเพื่อค้นหา..."
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
              px: 1,
              "& fieldset": { borderColor: "divider", borderWidth: "1.5px" },
              "&:hover fieldset": { borderColor: "#E63946" },
              "&.Mui-focused fieldset": { borderColor: "#E63946" },
            },
            "& .MuiOutlinedInput-input": {
              paddingLeft: "8px",
              paddingRight: "16px",
              fontSize: { xs: "0.9rem", md: "1.05rem" },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ ml: 0.5 }}>
                <SearchIcon sx={{ color: "text.disabled", fontSize: { xs: "1.3rem", md: "1.6rem" } }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Stack
        direction="row"
        spacing={{ xs: 1.5, md: 2.5 }}
        sx={{ flex: { md: 1.3 } }}
      >
        {/* 2. หมวดหมู่ */}
        <FormControl fullWidth>
          <Typography
            variant="caption"
            sx={{
              fontSize: { xs: "0.875rem", md: "1rem" },
              fontWeight: 700,
              color: "text.secondary",
              ml: 0.5,
              mb: 0.75,
              display: "block",
            }}
          >
            หมวดหมู่
          </Typography>
          <Select
            value={cat}
            onChange={(e) => onCategoryChange(String(e.target.value))}
            displayEmpty
            sx={{
              borderRadius: "14px",
              backgroundColor: "background.paper",
              height: { xs: 48, md: 56 },
              fontSize: { xs: "0.9rem", md: "1.05rem" },
              "& fieldset": { borderColor: "divider", borderWidth: "1.5px" },
              "&:hover fieldset": { borderColor: "#E63946" },
              "&.Mui-focused fieldset": { borderColor: "#E63946" },
              "& .MuiSelect-select": {
                paddingLeft: { xs: "12px !important", md: "18px !important" },
                paddingRight: { xs: "32px !important", md: "44px !important" },
                fontSize: { xs: "0.9rem", md: "1.05rem" },
              },
              "& .MuiSvgIcon-root": {
                right: { xs: "6px", md: "14px" },
                fontSize: { xs: "1.25rem", md: "1.6rem" },
              },
            }}
          >
            <MenuItem value="all" sx={{ py: 1.25, fontSize: "1.05rem" }}>
              ทั้งหมด
            </MenuItem>
            {categories.map((c: any) => (
              <MenuItem
                key={c.id}
                value={c.id}
                sx={{ py: 1.25, fontSize: "1.05rem" }}
              >
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 3. สถานะการขาย */}
        <FormControl fullWidth>
          <Typography
            variant="caption"
            sx={{
              fontSize: { xs: "0.875rem", md: "1rem" },
              fontWeight: 700,
              color: "text.secondary",
              ml: 0.5,
              mb: 0.75,
              display: "block",
            }}
          >
            สถานะการขาย
          </Typography>
          <Select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as any)}
            displayEmpty
            sx={{
              borderRadius: "14px",
              backgroundColor: "background.paper",
              height: { xs: 48, md: 56 },
              fontSize: { xs: "0.9rem", md: "1.05rem" },
              "& fieldset": { borderColor: "divider", borderWidth: "1.5px" },
              "&:hover fieldset": { borderColor: "#E63946" },
              "&.Mui-focused fieldset": { borderColor: "#E63946" },
              "& .MuiSelect-select": {
                paddingLeft: { xs: "12px !important", md: "18px !important" },
                paddingRight: { xs: "32px !important", md: "44px !important" },
                fontSize: { xs: "0.9rem", md: "1.05rem" },
              },
              "& .MuiSvgIcon-root": {
                right: { xs: "6px", md: "14px" },
                fontSize: { xs: "1.25rem", md: "1.6rem" },
              },
            }}
          >
            <MenuItem value="all" sx={{ py: 1.25, fontSize: "1.05rem" }}>
              ทุกสถานะ
            </MenuItem>
            <MenuItem value="active" sx={{ py: 1.25, fontSize: "1.05rem" }}>
              พร้อมขาย
            </MenuItem>
            <MenuItem value="inactive" sx={{ py: 1.25, fontSize: "1.05rem" }}>
              ปิดขาย
            </MenuItem>
          </Select>
        </FormControl>
      </Stack>
    </Stack>
  );
}
