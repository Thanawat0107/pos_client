import * as React from "react";
import {
  Box,
  Grid,
  Stack,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Typography,
  Pagination,
  useMediaQuery,
  Skeleton,
  IconButton,
  Button,
  Divider,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import SortIcon from "@mui/icons-material/Sort";
import RefreshIcon from "@mui/icons-material/Refresh";
import MenuCard, { type Menu } from "./MenuCard";
import type { SxProps, Theme } from "@mui/material";

type SortKey = "relevance" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

type Props = {
  items: Menu[];
  onAddToCart?: (m: Menu) => void;
  currency?: string;   // default: "USD"
  pageSize?: number;   // default: ตาม breakpoint
  isLoading?: boolean; // เผื่อโชว์ skeleton
};

export default function MenuList({
  items,
  onAddToCart,
  currency = "USD",
  pageSize,
  isLoading = false,
}: Props) {
  const theme = useTheme();
  const upLg = useMediaQuery(theme.breakpoints.up("lg"));
  const upMd = useMediaQuery(theme.breakpoints.up("md"));
  const upSm = useMediaQuery(theme.breakpoints.up("sm"));

  // pageSize อัตโนมัติ (mobile-first)
  const computedPageSize = React.useMemo(() => {
    if (pageSize) return pageSize;
    // มือถือ 2 คอลัมน์ x 4 แถว = 8, tablet 3x3 = 9, desktop 4x3 = 12
    if (upLg) return 12;
    if (upMd) return 9;
    if (upSm) return 8;
    return 8; // xs (2 คอลัมน์)
  }, [pageSize, upLg, upMd, upSm]);

  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<SortKey>("relevance");
  const [page, setPage] = React.useState(1);

  // React 19: ทำให้ search ลื่นขึ้น
  const deferredQuery = React.useDeferredValue(query);

  // filter + sort
  const filtered = React.useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    let data = !q
      ? items
      : items.filter((x) => [x.name, x.description ?? ""].some((t) => t.toLowerCase().includes(q)));

    switch (sort) {
      case "price-asc":
        data = [...data].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        data = [...data].sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        data = [...data].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        data = [...data].sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "relevance":
      default:
        break;
    }
    return data;
  }, [items, deferredQuery, sort]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / computedPageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = React.useMemo(() => {
    const start = (currentPage - 1) * computedPageSize;
    return filtered.slice(start, start + computedPageSize);
  }, [filtered, currentPage, computedPageSize]);

  // เมื่อ filter/sort เปลี่ยนให้รีเซ็ตหน้า
  React.useEffect(() => {
    setPage(1);
  }, [deferredQuery, sort, computedPageSize]);

  const handleReset = () => {
    setQuery("");
    setSort("relevance");
    setPage(1);
  };

  return (
    <Box sx={{ px: { xs: 1.5, md: 3 }, pt: { xs: 1.5, md: 2 }, pb: { xs: 8, md: 4 }, maxWidth: "xl", mx: "auto" }}>
      {/* Toolbar: Search + Sort (sticky บนมือถือ) */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        sx={{
          position: { xs: "sticky", sm: "static" },
          top: { xs: 56, sm: "auto" }, // กันโดน AppBar
          zIndex: (t) => t.zIndex.appBar - 1,
          backgroundColor: "background.default",
          pb: { xs: 1, sm: 0 },
          mb: 1.5,
          pt: { xs: 0.5, sm: 0 },
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1, minWidth: 220 }}>
          <TextField
            fullWidth
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาเมนู…"
            size="small" // ✅ มือถือกระชับ
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <IconButton aria-label="filters (future)" size="small" sx={{ display: { xs: "inline-flex", sm: "inline-flex" } }}>
            <TuneIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: { xs: 0.5, sm: 0 } }}>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <SortIcon fontSize="small" />
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", sm: "inline" } }}>
              Sort by
            </Typography>
            <Select
              size="small"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              sx={{ minWidth: { xs: 140, sm: 160 } }}
            >
              <MenuItem value="relevance">Relevance</MenuItem>
              <MenuItem value="price-asc">Price: Low → High</MenuItem>
              <MenuItem value="price-desc">Price: High → Low</MenuItem>
              <MenuItem value="name-asc">Name: A → Z</MenuItem>
              <MenuItem value="name-desc">Name: Z → A</MenuItem>
            </Select>
          </Stack>

          <IconButton aria-label="reset" onClick={handleReset} size="small">
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      <Divider sx={{ mb: { xs: 1.5, sm: 2 } }} />

      {/* Content */}
      {isLoading ? (
        <Grid container spacing={{ xs: 1.25, sm: 2 }}>
          {Array.from({ length: computedPageSize }).map((_, i) => (
            <Grid key={i} size={{ xs: 6, sm: 6, md: 4, lg: 3 }}>
              <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2, mb: 1 }} />
              <Skeleton width="70%" />
              <Skeleton width="40%" />
            </Grid>
          ))}
        </Grid>
      ) : paged.length ? (
        <>
          <Grid container spacing={{ xs: 1.25, sm: 2 }}>
            {paged.map((m) => (
              <Grid key={m.id} size={{ xs: 6, sm: 6, md: 4, lg: 3 }}>
                <MenuCard
                  menu={m}
                  currency={currency}
                  onAddToCart={onAddToCart}
                  sx={
                    {
                      // ✅ hover เฉพาะจอใหญ่
                      transition: "transform .15s ease, box-shadow .15s ease",
                      "&:hover": {
                        transform: { md: "translateY(-2px)" },
                        boxShadow: { md: 6 },
                      },
                    } as SxProps<Theme>
                  }
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          <Stack direction="row" justifyContent="center" sx={{ mt: { xs: 2, sm: 3 } }}>
            <Pagination
              color="primary"
              count={totalPages}
              page={currentPage}
              onChange={(_, p) => setPage(p)}
              showFirstButton={upSm}
              showLastButton={upSm}
              size={upSm ? "medium" : "small"}      // ✅ มือถือกะทัดรัด
              siblingCount={upSm ? 1 : 0}           // ✅ มือถือแสดงเลขน้อยลง
              boundaryCount={upSm ? 1 : 0}
            />
          </Stack>
        </>
      ) : (
        <EmptyState onReset={handleReset} />
      )}
    </Box>
  );
}

/** Empty state น่ารัก ๆ เวลาไม่เจอผลลัพธ์ */
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <Stack alignItems="center" spacing={1.25} sx={{ py: { xs: 4, sm: 6 } }}>
      <Typography variant="subtitle1" fontWeight={700}>
        ไม่พบเมนูที่ค้นหา
      </Typography>
      <Typography variant="body2" color="text.secondary">
        ลองเปลี่ยนคำค้นหรือรีเซ็ตตัวกรองดูไหม
      </Typography>
      <Button variant="outlined" onClick={onReset} sx={{ mt: 0.5 }}>
        รีเซ็ตการค้นหา
      </Button>
    </Stack>
  );
}
