/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import {
  Box,
  Stack,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Typography,
  useMediaQuery,
  Skeleton,
  IconButton,
  Button,
  useTheme,
  Chip,
  Paper,
  alpha,
  Container,
  Grid,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import SortRoundedIcon from "@mui/icons-material/SortRounded";
import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";

import MenuCard from "./MenuCard";
import PaginationBar from "../../layouts/PaginationBar";
import type { MenuItemDto } from "../../../@types/dto/MenuItem";

// Types
export type CategoryOption = {
  id: number; // ✅ บังคับเป็น number เพื่อให้ตรงกับ Database
  name: string;
};

type SortKey = "relevance" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

type Props = {
  items: MenuItemDto[];
  onAddToCart?: (m: MenuItemDto) => void;
  currency?: string;
  pageSize?: number;
  isLoading?: boolean;
  categories?: CategoryOption[];
};

export default function MenuList({
  items,
  onAddToCart,
  currency = "USD",
  pageSize,
  isLoading = false,
  categories = [],
}: Props) {
  const theme = useTheme();
  const upLg = useMediaQuery(theme.breakpoints.up("lg"));
  const upMd = useMediaQuery(theme.breakpoints.up("md"));

  const computedPageSize = React.useMemo(() => {
    if (pageSize) return pageSize;
    return upLg ? 12 : upMd ? 9 : 8;
  }, [pageSize, upLg, upMd]);

  // State
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<SortKey>("relevance");
  const [page, setPage] = React.useState(1);
  
  // ✅ เปลี่ยน State เป็น number | null (null = All)
  const [selectedCatId, setSelectedCatId] = React.useState<number | null>(null);

  const deferredQuery = React.useDeferredValue(query);

  // Categories Logic
  const derivedCategories = React.useMemo(() => {
    // ถ้ามี categories ส่งมาจาก Parent ให้ใช้เลย
    if (categories.length > 0) return categories;
    
    // ถ้าไม่มี ให้ดึงจากรายการสินค้า (Fallback)
    const unique = new Map();
    items.forEach((item) => {
      const cid = item.menuCategoryId;
      const cname = item.menuCategoryName ?? "อื่นๆ";
      // เช็คว่า cid มีค่าและเป็นตัวเลข
      if (cid != null && !unique.has(cid)) {
        unique.set(cid, { id: cid, name: cname });
      }
    });
    return Array.from(unique.values()) as CategoryOption[];
  }, [categories, items]);

  // Filter Logic (หัวใจสำคัญ ❤️)
  const filtered = React.useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    
    // 1. Filter Text
    let data = !q
      ? items
      : items.filter((x) =>
          [x.name, x.description ?? ""].some((t) => t.toLowerCase().includes(q))
        );

    // 2. Filter Category (แก้ไขใหม่)
    if (selectedCatId !== null) {
      // ✅ ใช้ menuCategoryId และไม่ต้อง cast as any
      data = data.filter((x) => x.menuCategoryId === selectedCatId);
    }

    // 3. Sort
    switch (sort) {
      case "price-asc":
        data = [...data].sort((a, b) => a.basePrice - b.basePrice);
        break;
      case "price-desc":
        data = [...data].sort((a, b) => b.basePrice - a.basePrice);
        break;
      case "name-asc":
        data = [...data].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        data = [...data].sort((a, b) => b.name.localeCompare(a.name));
        break;
    }
    return data;
  }, [items, deferredQuery, sort, selectedCatId]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filtered.length / computedPageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = React.useMemo(() => {
    const start = (currentPage - 1) * computedPageSize;
    return filtered.slice(start, start + computedPageSize);
  }, [filtered, currentPage, computedPageSize]);

  React.useEffect(() => {
    setPage(1);
  }, [deferredQuery, sort, selectedCatId, computedPageSize]);

  const handleReset = () => {
    setQuery("");
    setSort("relevance");
    setSelectedCatId(null); // ✅ Reset เป็น null
    setPage(1);
  };

  const hasActiveFilter = !!query || selectedCatId !== null;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: (t) =>
          t.palette.mode === "dark" ? t.palette.background.default : "#F7F8FA",
      }}
    >
      {/* ─── Hero Banner ─── */}
      <Box
        sx={{
          background: (t) =>
            `linear-gradient(135deg, ${t.palette.primary.dark} 0%, ${t.palette.primary.main} 60%, ${alpha(t.palette.secondary.main, 0.85)} 100%)`,
          py: { xs: 5, md: 7 },
          px: 2,
          textAlign: "center",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* decorative circles */}
        <Box sx={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.06)" }} />
        <Box sx={{ position: "absolute", bottom: -60, left: -30, width: 260, height: 260, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.04)" }} />

        <Stack alignItems="center" spacing={1.5} sx={{ position: "relative", zIndex: 1 }}>
          <Box
            sx={{
              width: 64, height: 64, borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <RestaurantRoundedIcon sx={{ fontSize: 34 }} />
          </Box>
          <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: -0.5 }}>
            เมนูอาหารของเรา
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.85, maxWidth: 480 }}>
            เลือกสรรเมนูโปรดของคุณและเพิ่มลงตะกร้าได้เลย
          </Typography>
          {!isLoading && (
            <Chip
              label={`${items.length} รายการ`}
              size="small"
              icon={<RestaurantMenuIcon style={{ color: "white" }} />}
              sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "white", fontWeight: 700, backdropFilter: "blur(6px)" }}
            />
          )}
        </Stack>
      </Box>

      {/* ─── Sticky Filter Bar ─── */}
      <Paper
        elevation={0}
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          borderBottom: "1px solid",
          borderColor: "divider",
          backdropFilter: "blur(14px)",
          backgroundColor: (t) => alpha(t.palette.background.default, 0.88),
          py: 2,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={1.5}>
            {/* Search + Sort row */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center">
              <TextField
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ค้นหาเมนูที่ชอบ..."
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 50,
                    bgcolor: "background.paper",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "primary.main" }} fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: query ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setQuery("")}>
                        <RefreshIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />

              <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
                <Paper
                  elevation={0}
                  sx={{
                    display: "flex", alignItems: "center", gap: 0.5,
                    border: "1px solid", borderColor: "divider",
                    borderRadius: 50, px: 2.5, py: 1,
                    bgcolor: "background.paper",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  <SortRoundedIcon sx={{ color: "primary.main" }} />
                  <Select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    variant="standard"
                    disableUnderline
                    sx={{ fontWeight: 700, color: "text.primary", fontSize: "1rem", minWidth: 130 }}
                  >
                    <MenuItem value="relevance">แนะนำ</MenuItem>
                    <MenuItem value="price-asc">ราคา: ต่ำ → สูง</MenuItem>
                    <MenuItem value="price-desc">ราคา: สูง → ต่ำ</MenuItem>
                    <MenuItem value="name-asc">ชื่อ: A-Z</MenuItem>
                  </Select>
                </Paper>

                {hasActiveFilter && (
                  <IconButton
                    onClick={handleReset}
                    size="small"
                    sx={{
                      border: "1px solid", borderColor: "error.light",
                      borderRadius: 50, color: "error.main",
                      bgcolor: (t) => alpha(t.palette.error.main, 0.06),
                    }}
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                )}
              </Stack>
            </Stack>

            {/* Category chips row */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ overflowX: "auto", pb: 0.5, "::-webkit-scrollbar": { height: 3 } }}
            >
              <CategoryChip
                label="ทั้งหมด"
                active={selectedCatId === null}
                onClick={() => setSelectedCatId(null)}
                icon={<RestaurantMenuIcon fontSize="small" />}
              />
              {derivedCategories.map((cat) => (
                <CategoryChip
                  key={cat.id}
                  label={cat.name}
                  active={selectedCatId === cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  icon={<LocalDiningIcon fontSize="small" />}
                />
              ))}
            </Stack>
          </Stack>
        </Container>
      </Paper>

      {/* ─── Content ─── */}
      <Container maxWidth="xl" sx={{ pt: 3, pb: 8 }}>
        {isLoading ? (
          <Grid container spacing={2.5}>
            {Array.from({ length: computedPageSize }).map((_, i) => (
              <Grid key={i} size={{ xs: 6, sm: 6, md: 4, lg: 3 }}>
                <Box sx={{ borderRadius: 2, overflow: "hidden", bgcolor: "background.paper", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
                  <Skeleton variant="rectangular" height={200} />
                  <Box sx={{ p: 2 }}>
                    <Skeleton width="70%" height={24} />
                    <Skeleton width="100%" sx={{ mt: 0.5 }} />
                    <Skeleton width="55%" />
                    <Skeleton variant="rounded" height={38} sx={{ mt: 1.5, borderRadius: 1.5 }} />
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : paged.length ? (
          <>
            {/* Result bar */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2.5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  {hasActiveFilter
                    ? `ผลลัพธ์: ${filtered.length} รายการ`
                    : `เมนูทั้งหมด ${filtered.length} รายการ`}
                </Typography>
                {hasActiveFilter && (
                  <Chip
                    label="ล้างตัวกรอง"
                    size="small"
                    onDelete={handleReset}
                    deleteIcon={<RefreshIcon fontSize="small" />}
                    sx={{ fontWeight: 600, bgcolor: (t) => alpha(t.palette.primary.main, 0.08), color: "primary.main" }}
                  />
                )}
              </Stack>
              <Typography variant="caption" color="text.disabled">
                หน้า {currentPage} / {totalPages}
              </Typography>
            </Stack>

            <Grid container spacing={2.5}>
              {paged.map((m) => (
                <Grid key={m.id} size={{ xs: 6, sm: 6, md: 4, lg: 3 }}>
                  <MenuCard
                    menu={m}
                    currency={currency}
                    onAddToCart={onAddToCart}
                    sx={{ height: "100%" }}
                  />
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 6 }}>
              <PaginationBar
                page={currentPage}
                pageSize={computedPageSize}
                totalCount={filtered.length}
                onPageChange={(p) => setPage(p)}
                showPageSizeSelect={false}
                align="center"
              />
            </Box>
          </>
        ) : (
          <EmptyState onReset={handleReset} hasFilter={hasActiveFilter} />
        )}
      </Container>
    </Box>
  );
}

// ... CategoryChip และ EmptyState ยังคงเดิม ...
function CategoryChip({ active, label, onClick, icon }: any) {
  return (
    <Chip
      icon={icon}
      label={label}
      onClick={onClick}
      clickable
      sx={{
        fontWeight: 700,
        px: 1,
        height: 42,
        borderRadius: 50,
        flexShrink: 0,
        fontSize: "0.92rem",
        transition: "all 0.2s ease",
        ...(active
          ? {
              bgcolor: "primary.main",
              color: "white",
              boxShadow: (t: any) => `0 4px 12px ${alpha(t.palette.primary.main, 0.35)}`,
              "& .MuiChip-icon": { color: "white" },
            }
          : {
              bgcolor: "background.paper",
              color: "text.secondary",
              border: "1px solid",
              borderColor: "divider",
              "&:hover": {
                bgcolor: (t: any) => alpha(t.palette.primary.main, 0.07),
                borderColor: "primary.light",
                color: "primary.main",
                "& .MuiChip-icon": { color: "primary.main" },
              },
            }),
      }}
    />
  );
}

function EmptyState({ onReset, hasFilter }: { onReset: () => void; hasFilter?: boolean }) {
  return (
    <Stack alignItems="center" spacing={2.5} sx={{ py: 12 }}>
      <Box
        sx={{
          width: 104, height: 104, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
        }}
      >
        <SearchOffRoundedIcon sx={{ fontSize: 56, color: "primary.main", opacity: 0.65 }} />
      </Box>
      <Stack alignItems="center" spacing={0.5}>
        <Typography variant="h6" fontWeight={700} color="text.secondary">
          {hasFilter ? "ไม่พบเมนูที่ค้นหา" : "ยังไม่มีเมนูในขณะนี้"}
        </Typography>
        <Typography variant="body2" color="text.disabled">
          {hasFilter ? "ลองเปลี่ยนคำค้นหาหรือดูเมนูทั้งหมด" : "กรุณาลองใหม่อีกครั้งภายหลัง"}
        </Typography>
      </Stack>
      {hasFilter && (
        <Button
          variant="contained"
          onClick={onReset}
          startIcon={<RestaurantMenuIcon />}
          sx={{ borderRadius: 50, px: 3 }}
        >
          ดูเมนูทั้งหมด
        </Button>
      )}
    </Stack>
  );
}