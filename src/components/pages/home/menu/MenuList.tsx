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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import SortIcon from "@mui/icons-material/Sort";
import RefreshIcon from "@mui/icons-material/Refresh";
import MenuCard, { type Menu } from "./MenuCard";
import type { SxProps, Theme } from '@mui/material';

type SortKey =
  | "relevance"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc";

type Props = {
  items: Menu[];
  onAddToCart?: (m: Menu) => void;
  currency?: string; // default: "USD"
  pageSize?: number; // default: ตาม breakpoint
  isLoading?: boolean; // เผื่อโชว์ skeleton
};

export default function MenuList({
  items,
  onAddToCart,
  currency = "USD",
  pageSize,
  isLoading = false,
}: Props) {
  // pageSize อัตโนมัติแบบ responsive (แค่ default — override ได้ผ่าน props)
  const upLg = useMediaQuery("(min-width:1200px)");
  const upMd = useMediaQuery("(min-width:900px)");
  const upSm = useMediaQuery("(min-width:600px)");
  const computedPageSize = React.useMemo(() => {
    if (pageSize) return pageSize;
    // กะคร่าว ๆ ให้แถวละ 4/3/2/1
    if (upLg) return 12; // 3 แถว x 4 คอลัมน์
    if (upMd) return 9; // 3 แถว x 3 คอลัมน์
    if (upSm) return 8; // 4 แถว x 2 คอลัมน์
    return 6; // 6 ใบสำหรับมือถือ
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
      : items.filter((x) =>
          [x.name, x.description ?? ""].some((t) => t.toLowerCase().includes(q))
        );

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
        // ไม่ทำอะไร — ถ้ามี ranking จริงค่อยใส่ทีหลัง
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
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1280, mx: "auto" }}>
      {/* Toolbar: Search + Sort + Extra */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Stack
          direction="row"
          spacing={1.25}
          alignItems="center"
          sx={{ flex: 1, minWidth: 260 }}
        >
          <TextField
            fullWidth
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาเมนู…"
            size="medium"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <IconButton aria-label="filters (future)">
            <TuneIcon />
          </IconButton>
        </Stack>

        <Stack direction="row" spacing={1.25} alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <SortIcon fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              Sort by
            </Typography>
            <Select
              size="small"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="relevance">Relevance</MenuItem>
              <MenuItem value="price-asc">Price: Low → High</MenuItem>
              <MenuItem value="price-desc">Price: High → Low</MenuItem>
              <MenuItem value="name-asc">Name: A → Z</MenuItem>
              <MenuItem value="name-desc">Name: Z → A</MenuItem>
            </Select>
          </Stack>

          <IconButton aria-label="reset" onClick={handleReset}>
            <RefreshIcon />
          </IconButton>
        </Stack>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {/* Content */}
      {isLoading ? (
        <Grid container spacing={2}>
          {Array.from({ length: computedPageSize }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Skeleton
                variant="rectangular"
                height={200}
                sx={{ borderRadius: 2, mb: 1.5 }}
              />
              <Skeleton width="60%" />
              <Skeleton width="40%" />
            </Grid>
          ))}
        </Grid>
      ) : paged.length ? (
        <>
          <Grid container spacing={2}>
            {paged.map((m) => (
              <Grid key={m.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <MenuCard
                  menu={m}
                  currency={currency}
                  onAddToCart={onAddToCart}
                  sx={
                    {
                      transition: "transform .15s ease, box-shadow .15s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: 6,
                      },
                    } as SxProps<Theme>
                  }
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
            <Pagination
              color="primary"
              count={totalPages}
              page={currentPage}
              onChange={(_, p) => setPage(p)}
              showFirstButton
              showLastButton
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
    <Stack alignItems="center" spacing={1.5} sx={{ py: 6 }}>
      <Typography variant="h6" fontWeight={700}>
        ไม่พบเมนูที่ค้นหา
      </Typography>
      <Typography variant="body2" color="text.secondary">
        ลองเปลี่ยนคำค้นหรือรีเซ็ตตัวกรองดูไหม
      </Typography>
      <Button variant="outlined" onClick={onReset} sx={{ mt: 1 }}>
        รีเซ็ตการค้นหา
      </Button>
    </Stack>
  );
}
