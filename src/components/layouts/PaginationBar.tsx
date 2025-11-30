import * as React from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Stack,
  Pagination,
  Typography,
  useMediaQuery,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  type SelectChangeEvent,
} from "@mui/material";

export interface PaginationBarProps {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  align?: "left" | "center" | "right";
  showPageSizeSelect?: boolean;
  showSummary?: boolean;
  sx?: React.ComponentProps<typeof Stack>["sx"];
}

const PaginationBar: React.FC<PaginationBarProps> = ({
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  align = "center",
  showPageSizeSelect = true,
  showSummary = true,
  sx,
}) => {
  const theme = useTheme();
  const upSm = useMediaQuery(theme.breakpoints.up("sm"));

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const safePage = Math.min(page, totalPages);

  const startItem = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(totalCount, safePage * pageSize);

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    const next = Number(event.target.value);
    onPageSizeChange?.(next);
  };

  const justifyContent =
    align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center";

  return (
    <Stack
      direction={upSm ? "row" : "column"}
      spacing={upSm ? 2 : 1}
      alignItems="center"
      justifyContent={justifyContent}
      sx={{ mt: { xs: 2, sm: 3 }, ...sx }}
    >
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent={justifyContent}
        sx={{ width: upSm ? "auto" : "100%" }}
      >
        {showSummary && (
          <Typography variant="body2" color="text.secondary" noWrap>
            {totalCount > 0
              ? `แสดง ${startItem}–${endItem} จาก ${totalCount} รายการ`
              : "ไม่มีรายการ"}
          </Typography>
        )}

        {showPageSizeSelect && onPageSizeChange && (
          <FormControl
            size="small"
            sx={{ minWidth: 110 }}
          >
            <InputLabel id="page-size-label">ต่อหน้า</InputLabel>
            <Select
              labelId="page-size-label"
              value={pageSize}
              label="ต่อหน้า"
              onChange={handlePageSizeChange}
            >
              {pageSizeOptions.map((size) => (
                <MenuItem key={size} value={size}>
                  {size} รายการ
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Stack>

      <Box>
        <Pagination
          color="primary"
          count={totalPages}
          page={safePage}
          onChange={(_, p) => onPageChange(p)}
          showFirstButton={upSm}
          showLastButton={upSm}
          size={upSm ? "medium" : "small"}
          siblingCount={upSm ? 1 : 0}
          boundaryCount={upSm ? 1 : 1}
        />
      </Box>
    </Stack>
  );
};

export default PaginationBar;
