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
  Pagination,
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

import MenuCard from "./MenuCard";
import type { MenuItemDto } from "../../../@types/dto/MenuItem";

// ... (Types และ Imports อื่นๆ เหมือนเดิม) ...

export type CategoryOption = {
  id: number | string;
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

  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<SortKey>("relevance");
  const [page, setPage] = React.useState(1);
  const [selectedCatId, setSelectedCatId] = React.useState<number | string>("ALL");

  const deferredQuery = React.useDeferredValue(query);

  const derivedCategories = React.useMemo(() => {
    if (categories.length > 0) return categories;
    const unique = new Map();
    items.forEach((item) => {
      const cid = item.menuCategoryId;
      const cname = item.menuCategoryName ?? "อื่นๆ";
      if (!unique.has(cid)) {
        unique.set(cid, { id: cid, name: cname });
      }
    });
    return Array.from(unique.values()) as CategoryOption[];
  }, [categories, items]);

  const filtered = React.useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    
    let data = !q
      ? items
      : items.filter((x) =>
          [x.name, x.description ?? ""].some((t) => t.toLowerCase().includes(q))
        );

    if (selectedCatId !== "ALL") {
      data = data.filter((x) => (x as any).categoryId === selectedCatId);
    }

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
    setSelectedCatId("ALL");
    setPage(1);
  };

  return (
    <Box sx={{ pb: 8, bgcolor: "#FAFAFA", minHeight: "80vh" }}>
      
      {/* Header & Filters (เหมือนเดิม) */}
      <Paper
        elevation={0}
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          borderRadius: 0,
          borderBottom: "1px solid",
          borderColor: "divider",
          backdropFilter: "blur(12px)",
          backgroundColor: alpha(theme.palette.background.default, 0.8),
          pt: 2,
          pb: 2,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h5" fontWeight={800} sx={{ color: "text.primary", display: { xs: "none", md: "block" } }}>
                อร่อยเลือกได้ 🍽️
              </Typography>

              <TextField
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ค้นหาเมนูโปรด..."
                size="small"
                fullWidth
                sx={{
                  maxWidth: { md: 500 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 50,
                    bgcolor: "background.paper",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    "& fieldset": { borderColor: "transparent" },
                    "&:hover fieldset": { borderColor: "primary.main" },
                    "&.Mui-focused fieldset": { borderColor: "primary.main" },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <Stack direction="row" spacing={1} alignItems="center" sx={{ width: { xs: "100%", md: "auto" }, justifyContent: "flex-end" }}>
                <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
                  เรียงตาม:
                </Typography>
                <Select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  size="small"
                  variant="standard"
                  disableUnderline
                  sx={{ 
                    fontWeight: 600, 
                    color: "primary.main",
                    ".MuiSelect-select": { py: 0.5 }
                  }}
                >
                  <MenuItem value="relevance">✨ แนะนำ</MenuItem>
                  <MenuItem value="price-asc">💰 ถูกไปแพง</MenuItem>
                  <MenuItem value="price-desc">💎 แพงไปถูก</MenuItem>
                  <MenuItem value="name-asc">🅰️ ชื่อ A-Z</MenuItem>
                </Select>
                
                {(query || selectedCatId !== "ALL") && (
                   <IconButton onClick={handleReset} size="small" color="error" sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}>
                      <RefreshIcon fontSize="small" />
                   </IconButton>
                )}
              </Stack>
            </Stack>

            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                overflowX: "auto",
                pb: 1,
                "::-webkit-scrollbar": { height: 4 },
                "::-webkit-scrollbar-thumb": { bgcolor: "grey.300", borderRadius: 2 },
                mx: { xs: -2, md: 0 },
                px: { xs: 2, md: 0 },
              }}
            >
              <CategoryChip
                label="ทั้งหมด"
                active={selectedCatId === "ALL"}
                onClick={() => setSelectedCatId("ALL")}
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

      {/* Content Grid */}
      <Container maxWidth="xl" sx={{ mt: 3 }}>
        {isLoading ? (
          <Grid container spacing={3}>
            {Array.from({ length: computedPageSize }).map((_, i) => (
              // ✅ FIX: ลบ item และใช้ size={{ ... }} แทน
              <Grid key={i} size={{ xs: 6, sm: 6, md: 4, lg: 3 }}>
                <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 3, mb: 1.5 }} />
                <Skeleton width="80%" />
                <Skeleton width="40%" />
              </Grid>
            ))}
          </Grid>
        ) : paged.length ? (
          <>
            <Typography variant="body2" color="text.secondary" mb={2}>
              พบ {filtered.length} รายการ
            </Typography>

            <Grid container spacing={3}>
              {paged.map((m) => (
                // ✅ FIX: ลบ item และใช้ size={{ ... }} แทน
                <Grid key={m.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <MenuCard
                    menu={m}
                    currency={currency}
                    onAddToCart={onAddToCart}
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      border: "none",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
                      },
                    }}
                  />
                </Grid>
              ))}
            </Grid>

            <Stack direction="row" justifyContent="center" sx={{ mt: 6 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, p) => setPage(p)}
                color="primary"
                size="large"
                shape="rounded"
              />
            </Stack>
          </>
        ) : (
          <EmptyState onReset={handleReset} />
        )}
      </Container>
    </Box>
  );
}

// Sub-components เหมือนเดิม ...
function CategoryChip({ active, label, onClick, icon }: any) {
  return (
    <Chip
      icon={active ? undefined : icon}
      label={label}
      onClick={onClick}
      clickable
      sx={{
        fontWeight: 700,
        px: 1,
        height: 36,
        borderRadius: 50,
        fontSize: "0.875rem",
        transition: "all 0.2s",
        border: active ? "none" : "1px solid",
        borderColor: "divider",
        ...(active && {
          bgcolor: "primary.main",
          color: "white",
          boxShadow: "0 4px 12px rgba(255, 87, 34, 0.4)",
          "&:hover": { bgcolor: "primary.dark" },
          "& .MuiChip-icon": { color: "white" }
        }),
        ...(!active && {
          bgcolor: "white",
          color: "text.secondary",
          "&:hover": { bgcolor: "grey.50", borderColor: "grey.400" },
        }),
      }}
    />
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <Stack alignItems="center" spacing={2} sx={{ py: 8, opacity: 0.8 }}>
      <Box sx={{ fontSize: 60, mb: -2 }}>🍲</Box>
      <Typography variant="h6" fontWeight={700} color="text.secondary">
        ไม่พบเมนูที่คุณค้นหา
      </Typography>
      <Typography variant="body2" color="text.secondary">
        ลองใช้คำค้นหาอื่น หรือเปลี่ยนหมวดหมู่ดูนะ
      </Typography>
      <Button 
        variant="contained" 
        onClick={onReset} 
        sx={{ borderRadius: 50, px: 4, textTransform: "none" }}
      >
        ดูเมนูทั้งหมด
      </Button>
    </Stack>
  );
}