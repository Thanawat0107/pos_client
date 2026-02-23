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
import CategoryIcon from "@mui/icons-material/Category";
import { Link } from "react-router-dom";
import ManageCategoryItem from "./ManageCategoryItem";
import FormCategory from "./FormCategory";
import CategoryFilterBar from "../CategoryFilterBar";
import MobileCategoryItem from "./MobileCategoryItem";
import type { MenuCategory } from "../../../../@types/dto/MenuCategory";
import { useEffect, useMemo, useState } from "react";
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from "../../../../services/categoriesApi";
import PaginationBar from "../../../layouts/PaginationBar";
import { useDebounced } from "../../../../hooks/useDebounced";
import type { CreateMenuCategory } from "../../../../@types/createDto/CreateMenuCategory";
import type { UpdateMenuCategory } from "../../../../@types/UpdateDto/updateMenuCategory";

export default function ManageCategoryList() {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

  // 1. รวม State เป็นกลุ่ม
  const [filters, setFilters] = useState({
    q: "",
    status: "all" as "all" | "active" | "inactive",
  });
  const dq = useDebounced(filters.q, 300);

  const [formState, setFormState] = useState<{
    open: boolean;
    data: MenuCategory | null;
  }>({
    open: false,
    data: null,
  });

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(isSmUp ? 8 : 6);

  // 2. API Hooks (ดึงมาเยอะๆ เพื่อ Filter หน้าบ้าน)
  const { data, isLoading, refetch } = useGetCategoriesQuery({
    pageNumber: 1,
    pageSize: 1000,
  });

  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();

  const rows: MenuCategory[] = data?.result ?? [];

  // 3. Reset page อัตโนมัติเมื่อ Filter เปลี่ยน
  useEffect(() => {
    setPage(1);
  }, [dq, filters.status, pageSize]);

  // 4. Logic Filter ที่สั้นลง
  const filtered = useMemo(() => {
    const search = dq.trim().toLowerCase();
    return rows.filter((r) => {
      const matchQ =
        !search ||
        r.name.toLowerCase().includes(search);
      const matchStatus =
        filters.status === "all" || (filters.status === "active") === r.isUsed;
      return matchQ && matchStatus;
    });
  }, [rows, dq, filters.status]);

  // Pagination Logic
  const totalCount = filtered.length;
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  // 5. Handlers
  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleOpenForm = (data: MenuCategory | null = null) =>
    setFormState({ open: true, data });
  const handleCloseForm = () => setFormState({ open: false, data: null });

  const handleDelete = async (id: number) => {
    if (confirm("ยืนยันลบหมวดหมู่นี้?")) {
      await deleteCategory(id)
        .unwrap()
        .catch((err) => console.error("delete failed", err));
    }
  };

  const handleToggleActive = async (id: number, next: boolean) => {
    const target = rows.find((r) => r.id === id);
    if (!target) return;
    try {
      await updateCategory({ id, data: { ...target, isUsed: next } }).unwrap();
    } catch (err) {
      console.error("toggle failed", err);
    }
  };

  const handleSubmit = async (
    data: CreateMenuCategory | UpdateMenuCategory, id?: number
  ) => {
    try {
      if (id) {
        await updateCategory({
          id,
          data: data as UpdateMenuCategory,
        }).unwrap();
      } else {
        await createCategory(data as CreateMenuCategory).unwrap();
      }
      handleCloseForm();
    } catch (err) {
      console.error("save failed", err);
    }
  };

  const isBusy = isCreating || isUpdating || isDeleting;

  if (isLoading)
    return (
      <Box className="flex flex-col justify-center items-center min-h-100 gap-4">
        <CircularProgress size={60} thickness={4} sx={{ color: "#D32F2F" }} />
        <Typography variant="h6" className="text-gray-600 font-bold">
          กำลังโหลดข้อมูล...
        </Typography>
      </Box>
    );

  return (
    <Box className="min-h-screen bg-[#F5F6F8] pb-28 md:pb-12 font-sans">
      <Container maxWidth="xl" disableGutters={!isSmUp} className="px-6 md:px-12 pt-6 md:pt-8">
        <Stack spacing={{ xs: 2, md: 2.5 }}>

          {/* =========================================
              1. Header
             ========================================= */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "flex-end" }}
            spacing={2}
          >
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
                <CategoryIcon sx={{ fontSize: { xs: "1.6rem", md: "2rem" }, color: "#D32F2F" }} />
                <Typography
                  sx={{ fontWeight: 800, fontSize: { xs: "1.6rem", md: "2.2rem" }, letterSpacing: "-0.02em" }}
                  className="text-gray-900"
                >
                  จัดการหมวดหมู่
                </Typography>
                <Chip
                  size="small"
                  label={`${rows.length} หมวด`}
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
                จัดการหมวดหมู่สำหรับเมนูอาหารทั้งหมดในระบบ
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
                เพิ่มหมวดหมู่
              </Button>
              <Button
                component={Link}
                to="/manage-menuItem"
                variant="outlined"
                startIcon={<ArrowBackIcon />}
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
                    <RefreshIcon sx={{ fontSize: "1.4rem", color: "text.secondary" }} />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Stack>

          {/* =========================================
              2. Filter Card
             ========================================= */}
          <Paper
            elevation={0}
            className="bg-white rounded-3xl shadow-sm border border-gray-200"
            sx={{ px: { xs: 2.5, md: 4 }, py: { xs: 2, md: 3 } }}
          >
            <CategoryFilterBar
              q={filters.q}
              status={filters.status}
              onSearch={(v) => handleFilterChange("q", v)}
              onStatusChange={(v) => handleFilterChange("status", v)}
            />
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }} flexWrap="wrap">
              <Typography
                className="text-[#E63946] font-bold"
                sx={{ fontSize: { xs: "0.95rem", md: "1.1rem" }, fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}
              >
                <Box component="span" sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#E63946", display: "inline-block", mr: 0.75 }} />
                รายการที่พบทั้งหมด: {filtered.length} รายการ
              </Typography>
              {filters.status !== "all" && (
                <Chip
                  size="small"
                  label={filters.status === "active" ? "พร้อมใช้" : "ปิดใช้งาน"}
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

          {/* =========================================
              3. Content
             ========================================= */}
          <Box>
            {isSmUp ? (
              // Desktop View
              <Paper
                elevation={0}
                className="border border-gray-200 rounded-3xl overflow-hidden bg-white shadow-sm"
              >
                <TableContainer>
                  <Table sx={{ minWidth: 600 }}>
                    <TableHead className="bg-[#F8FAFC]">
                      <TableRow>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: 800, color: "#475569", fontSize: "1.05rem", bgcolor: "#F8FAFC", py: 2.5, pl: 4, width: 80 }}
                        >
                          ลำดับ
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: 800, color: "#475569", fontSize: "1.05rem", bgcolor: "#F8FAFC", py: 2.5 }}
                        >
                          ชื่อหมวดหมู่
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: 800, color: "#475569", fontSize: "1.05rem", bgcolor: "#F8FAFC", py: 2.5, width: 200 }}
                        >
                          สถานะ
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: 800, color: "#475569", fontSize: "1.05rem", bgcolor: "#F8FAFC", py: 2.5, pr: 4, width: 120 }}
                        >
                          จัดการ
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {pageRows.map((r, i) => (
                        <ManageCategoryItem
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
                          <TableCell colSpan={4} align="center" sx={{ py: 14 }}>
                            <Stack spacing={2} alignItems="center">
                              <Typography color="text.secondary" variant="h6" fontWeight={700}>
                                ไม่พบหมวดหมู่
                              </Typography>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box className="px-6 py-5 bg-gray-50/50 border-t border-gray-100">
                  <PaginationBar
                    page={page}
                    pageSize={pageSize}
                    totalCount={totalCount}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                    showSummary
                    showPageSizeSelect
                    pageSizeOptions={[5, 10, 20, 50]}
                  />
                </Box>
              </Paper>
            ) : (
              // Mobile View
              <Stack spacing={2}>
                {pageRows.length === 0 ? (
                  <Box className="text-center py-16 bg-white rounded-3xl border border-gray-200 shadow-sm">
                    <Typography variant="h6" className="text-gray-500 font-bold">
                      ไม่พบหมวดหมู่
                    </Typography>
                  </Box>
                ) : (
                  pageRows.map((r, i) => (
                    <MobileCategoryItem
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
            )}
          </Box>
        </Stack>

        {/* Mobile Pagination */}
        {!isSmUp && pageRows.length > 0 && (
          <Box className="fixed bottom-6 left-4 right-4 z-1200">
            <Paper elevation={16} className="rounded-[30px] px-2 py-2 border border-gray-200 bg-white/95 backdrop-blur-md shadow-2xl">
              <PaginationBar
                page={page}
                pageSize={pageSize}
                totalCount={totalCount}
                onPageChange={setPage}
                showPageSizeSelect={false}
                showSummary
              />
            </Paper>
          </Box>
        )}
      </Container>

      {/* Drawer Form: ใช้ formState */}
      <FormCategory
        open={formState.open}
        onClose={handleCloseForm}
        initial={formState.data ?? undefined}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
      />
    </Box>
  );
}
