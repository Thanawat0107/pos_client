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
import { useTheme } from "@mui/material/styles";
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
  color: "#475569",
  fontSize: "1.05rem",
  bgcolor: "#F8FAFC",
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
    <Box className="min-h-screen bg-[#F5F6F8] pb-12 font-sans">
      <Container maxWidth="xl" className="px-4 md:px-8 pt-6 md:pt-8">
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
                <MenuBookIcon sx={{ fontSize: { xs: "1.6rem", md: "2rem" }, color: "#D32F2F" }} />
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "1.6rem", md: "2.2rem" },
                    letterSpacing: "-0.02em",
                  }}
                  className="text-gray-900"
                >
                  จัดการสูตรอาหาร
                </Typography>
                <Chip
                  size="small"
                  label={`${rows.length} สูตร`}
                  sx={{
                    fontWeight: 700,
                    bgcolor: "#FFF1F2",
                    color: "#BE123C",
                    border: "1.5px solid #FECDD3",
                    borderRadius: "50px",
                  }}
                />
              </Stack>
              <Typography
                className="text-gray-500"
                sx={{ fontSize: { xs: "0.875rem", md: "1rem" }, mt: 0.25 }}
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
                  bgcolor: "#D32F2F",
                  "&:hover": { bgcolor: "#B71C1C" },
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
                  borderColor: "#D32F2F",
                  borderWidth: "1.5px",
                  color: "#D32F2F",
                  "&:hover": { borderColor: "#B71C1C", borderWidth: "1.5px", bgcolor: "#FFF1F2" },
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
                      bgcolor: "white",
                      border: "1px solid #E5E7EB",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      "&:hover": { bgcolor: "#F9FAFB" },
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={20} sx={{ color: "#D32F2F" }} />
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
            className="bg-white rounded-3xl shadow-sm border border-gray-200"
            sx={{ px: { xs: 2.5, md: 4 }, py: { xs: 2, md: 3 } }}
          >
            <RecipeFilterBar
              q={filters.q}
              status={filters.status}
              onSearch={(v) => handleFilterChange("q", v)}
              onStatusChange={(v) => handleFilterChange("status", v)}
            />
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }} flexWrap="wrap">
              <Typography
                className="text-[#E63946] font-bold flex items-center gap-2"
                sx={{ fontSize: { xs: "0.95rem", md: "1.1rem" }, fontWeight: 700 }}
              >
                <Box
                  component="span"
                  sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#E63946", display: "inline-block", mr: 0.75 }}
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
            <Box className="flex flex-col justify-center items-center min-h-64 gap-4">
              <CircularProgress size={56} thickness={4} sx={{ color: "#D32F2F" }} />
              <Typography variant="h6" className="text-gray-500 font-semibold">
                กำลังโหลดข้อมูล...
              </Typography>
            </Box>
          ) : isSmUp ? (
            <Paper
              elevation={0}
              className="border border-gray-200 rounded-3xl overflow-hidden bg-white shadow-sm"
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
                              sx={{ fontWeight: 700, color: "#E63946", textDecoration: "underline", textTransform: "none" }}
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