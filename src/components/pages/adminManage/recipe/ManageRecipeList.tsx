/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box,
  Container,
  Typography,
  Stack,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  useMediaQuery,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useDebounced } from "../../../../hooks/useDebounced";

// Components
import ManageRecipeItem from "./ManageRecipeItem";
import FormRecipe from "./FormRecipe";
import MobileRecipeItem from "./MobileRecipeItem";
import RecipeFilterBar from "../RecipeFilterBar";
import PaginationBar from "../../../layouts/PaginationBar";

// Types
import type { Recipe } from "../../../../@types/dto/Recipe";
import type { CreateRecipe } from "../../../../@types/createDto/CreateRecipe";
import type { UpdateRecipe } from "../../../../@types/UpdateDto/UpdateRecipe";

// API Hooks
import {
  useCreateRecipeMutation,
  useDeleteRecipeMutation,
  useGetRecipesQuery,
  useUpdateRecipeMutation,
} from "../../../../services/recipesApi";
import { useGetMenuItemsQuery } from "../../../../services/menuItemApi";

const headCellSx = {
  fontWeight: 800,
  color: "text.secondary",
  fontSize: "1.05rem",
  bgcolor: "action.hover",
  py: 2.5,
  letterSpacing: "0.01em",
};

export default function ManageRecipeList() {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

  // 1. State
  const [filters, setFilters] = useState({
    q: "",
    status: "all" as "all" | "active" | "inactive",
  });
  const dq = useDebounced(filters.q, 300);

  const [formState, setFormState] = useState<{
    open: boolean;
    data: Recipe | null;
  }>({
    open: false,
    data: null,
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(isSmUp ? 8 : 6);

  // 2. API Hooks
  const { data, isLoading, refetch } = useGetRecipesQuery({
    pageNumber: 1,
    pageSize: 1000, 
  });

  // ดึงข้อมูล MenuItem ทั้งหมดสำหรับ Autocomplete ในฟอร์ม
  const { data: menuData } = useGetMenuItemsQuery({
    pageNumber: 1,
    pageSize: 1000,
  });
  const menuList = menuData?.result ?? [];

  const [createRecipe, { isLoading: isCreating }] = useCreateRecipeMutation();
  const [updateRecipe, { isLoading: isUpdating }] = useUpdateRecipeMutation();
  const [deleteRecipe, { isLoading: isDeleting }] = useDeleteRecipeMutation();

  const rows: Recipe[] = data?.result ?? [];

  // 3. Reset Page
  useEffect(() => {
    setPage(1);
  }, [dq, filters.status, pageSize]);

  // 4. Filter Logic
  const filtered = useMemo(() => {
    const search = dq.trim().toLowerCase();
    return rows.filter((r) => {
      const name = r.menuItemName || "";
      const matchQ =
        !search ||
        name.toLowerCase().includes(search) ||
        r.instructions.toLowerCase().includes(search);
      const matchStatus =
        filters.status === "all" || (filters.status === "active") === r.isUsed;
      return matchQ && matchStatus;
    });
  }, [rows, dq, filters.status]);

  const totalCount = filtered.length;
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  // 5. Handlers
  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleOpenForm = (data: Recipe | null = null) =>
    setFormState({ open: true, data });
  const handleCloseForm = () => setFormState({ open: false, data: null });

  const handleDelete = async (id: number) => {
    if (confirm("ยืนยันลบสูตรอาหารนี้?")) {
      await deleteRecipe(id)
        .unwrap()
        .catch((err: any) => console.error("delete failed", err));
    }
  };

  const handleToggleActive = async (id: number, next: boolean) => {
    const target = rows.find((r) => r.id === id);
    if (!target) return;
    try {
      await updateRecipe({ id, data: { isUsed: next } }).unwrap();
    } catch (err) {
      console.error("toggle failed", err);
    }
  };

  const handleSubmit = async (
    data: CreateRecipe | UpdateRecipe
  ) => {
    try {
      if (formState.data?.id) {
         await updateRecipe({
            id: formState.data.id,
            data: data as UpdateRecipe
         }).unwrap();
      } else {
         await createRecipe(data as CreateRecipe).unwrap();
      }
      handleCloseForm();
    } catch (err) {
      console.error("save failed", err);
    }
  };

  const isBusy = isCreating || isUpdating || isDeleting;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 6 }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 }, pt: { xs: 3, md: 4 } }}>
        <Stack spacing={2.5}>

          {/* ── 1. Header ── */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "flex-end" }}
            spacing={2}
          >
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
                <MenuBookIcon sx={{ fontSize: { xs: "1.6rem", md: "2rem" }, color: "primary.main" }} />
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "1.6rem", md: "2.2rem" },
                    letterSpacing: "-0.02em",
                  }}
                >
                  จัดการสูตรอาหาร
                </Typography>
                <Chip
                  size="small"
                  label={`${rows.length} สูตร`}
                  sx={{
                    fontWeight: 700,
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    color: "error.dark",
                    border: "1.5px solid",
                    borderColor: alpha(theme.palette.error.main, 0.3),
                    borderRadius: "50px",
                  }}
                />
              </Stack>
              <Typography
                sx={{ color: "text.secondary", fontSize: { xs: "0.875rem", md: "1rem" }, mt: 0.25 }}
              >
                รายการสูตรอาหารและวิธีปรุงทั้งหมดในระบบ
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenForm()}
                disabled={isBusy}
                sx={{
                  borderRadius: "50px",
                  px: { xs: 2, md: 3 },
                  py: { xs: 1, md: 1.25 },
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: { xs: "0.85rem", md: "1rem" },
                }}
              >
                เพิ่มสูตร
              </Button>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                component={Link}
                to="/manage-menuItem"
                sx={{
                  borderRadius: "50px",
                  px: { xs: 2, md: 3 },
                  py: { xs: 1, md: 1.25 },
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: { xs: "0.85rem", md: "1rem" },
                  borderWidth: "1.5px",
                  "&:hover": { borderWidth: "1.5px", bgcolor: alpha(theme.palette.primary.main, 0.05) },
                }}
              >
                ย้อนกลับ
              </Button>
              <Tooltip title="รีเฟรชข้อมูล">
                <span>
                  <IconButton
                    onClick={() => refetch()}
                    disabled={isLoading}
                    sx={{
                      p: 1,
                      borderRadius: "50%",
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={20} color="primary" />
                    ) : (
                      <RefreshIcon sx={{ fontSize: "1.4rem", color: "text.secondary" }} />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Stack>

          {/* ── 2. Filter Card ── */}
          <Paper
            elevation={0}
            sx={{ bgcolor: "background.paper", borderRadius: 3, border: "1px solid", borderColor: "divider", px: { xs: 2.5, md: 4 }, py: { xs: 2, md: 3 } }}
          >
            <RecipeFilterBar
              q={filters.q}
              status={filters.status}
              onSearch={(v) => handleFilterChange("q", v)}
              onStatusChange={(v) => handleFilterChange("status", v)}
            />
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }} flexWrap="wrap">
              <Typography
                sx={{ color: "primary.main", fontWeight: 700, fontSize: { xs: "0.95rem", md: "1.1rem" }, display: "flex", alignItems: "center", gap: 1 }}
              >
                <Box
                  component="span"
                  sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "primary.main", display: "inline-block", mr: 0.75 }}
                />
                รายการที่พบทั้งหมด: {filtered.length} รายการ
              </Typography>
              {filters.status !== "all" && (
                <Chip
                  size="small"
                  label={filters.status === "active" ? "ใช้งาน" : "ปิดใช้งาน"}
                  onDelete={() => handleFilterChange("status", "all")}
                  sx={{ fontWeight: 600 }}
                />
              )}
              {filters.q && (
                <Chip
                  size="small"
                  label={`ค้นหา: "${filters.q}"`}
                  onDelete={() => handleFilterChange("q", "")}
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Stack>
          </Paper>

          {/* ── 3. Content Card ── */}
          {isLoading ? (
            <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: 256, gap: 2 }}>
              <CircularProgress size={56} thickness={4} color="primary" />
              <Typography variant="h6" sx={{ color: "text.secondary", fontWeight: 600 }}>
                กำลังโหลดข้อมูล...
              </Typography>
            </Box>
          ) : isSmUp ? (
            <Paper
              elevation={0}
              sx={{ bgcolor: "background.paper", borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}
            >
              <TableContainer>
                <Table sx={{ minWidth: 700 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" sx={{ ...headCellSx, width: 60, pl: 3 }}>#</TableCell>
                      <TableCell sx={headCellSx}>เมนูอาหาร</TableCell>
                      <TableCell sx={headCellSx}>วิธีทำ (ย่อ)</TableCell>
                      <TableCell align="center" sx={{ ...headCellSx, width: 140 }}>สถานะ</TableCell>
                      <TableCell align="right" sx={{ ...headCellSx, pr: 3, width: 160 }}>จัดการ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pageRows.map((r, i) => (
                      <ManageRecipeItem
                        key={r.id}
                        row={r}
                        index={(page - 1) * pageSize + i + 1}
                        onEdit={() => handleOpenForm(r)}
                        onDelete={handleDelete}
                        onToggleActive={handleToggleActive}
                      />
                    ))}
                    {pageRows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 14 }}>
                          <Stack spacing={2} alignItems="center">
                            <Typography color="text.secondary" variant="h6" fontWeight={700}>
                              ไม่พบข้อมูลสูตรอาหาร
                            </Typography>
                            <Button
                              variant="text"
                              onClick={() => {
                                handleFilterChange("q", "");
                                handleFilterChange("status", "all");
                              }}
                              sx={{ fontWeight: 700, color: "primary.main", textDecoration: "underline", textTransform: "none" }}
                            >
                              ล้างตัวกรองทั้งหมด
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
                <PaginationBar
                  page={page}
                  pageSize={pageSize}
                  totalCount={totalCount}
                  onPageChange={setPage}
                  onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                  showSummary
                  showPageSizeSelect
                  pageSizeOptions={[5, 10, 20]}
                />
              </Box>
            </Paper>
          ) : (
            // ── Mobile View ──
            <>
              <Stack spacing={1.5}>
                {pageRows.length === 0 ? (
                  <Paper elevation={0} sx={{ p: 4, textAlign: "center", bgcolor: "transparent" }}>
                    <Typography color="text.secondary">ไม่พบข้อมูล</Typography>
                  </Paper>
                ) : (
                  pageRows.map((r, i) => (
                    <MobileRecipeItem
                      key={r.id}
                      row={r}
                      index={(page - 1) * pageSize + i + 1}
                      onEdit={() => handleOpenForm(r)}
                      onDelete={handleDelete}
                      onToggleActive={handleToggleActive}
                    />
                  ))
                )}
              </Stack>
              <Stack
                alignItems="center"
                sx={{
                  pt: 1,
                  position: "sticky",
                  bottom: 0,
                  bgcolor: "background.default",
                  pb: "calc(env(safe-area-inset-bottom) + 8px)",
                  borderTop: "1px solid",
                  borderColor: "divider",
                  mt: 2,
                }}
              >
                <PaginationBar
                  page={page}
                  pageSize={pageSize}
                  totalCount={totalCount}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                  showPageSizeSelect={false}
                  showSummary={false}
                  sx={{ mt: 0 }}
                />
              </Stack>
            </>
          )}
        </Stack>
      </Container>

      {/* Form Drawer */}
      <FormRecipe
        open={formState.open}
        onClose={handleCloseForm}
        initial={formState.data ?? undefined}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
        menuOptions={menuList}
      />

      {/* Pulse animation */}
      <style>{`@keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.8; transform:scale(1.05); } }`}</style>
    </Box>
  );
}