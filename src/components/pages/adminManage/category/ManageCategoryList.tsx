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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
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
        r.name.toLowerCase().includes(search) ||
        (r.slug ?? "").toLowerCase().includes(search);
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
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Typography variant={isSmUp ? "h5" : "h6"} fontWeight={800}>
            จัดการหมวดหมู่
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => refetch()}
              disabled={isLoading}
            >
              รีเฟรช
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenForm()} // เปิด Form แบบ Create
              disabled={isBusy}
            >
              เพิ่มหมวดหมู่
            </Button>
          </Stack>
        </Stack>

        {/* Filter bar: เชื่อมกับ filters state */}
        <CategoryFilterBar
          q={filters.q}
          status={filters.status}
          onSearch={(v) => handleFilterChange("q", v)}
          onStatusChange={(v) => handleFilterChange("status", v)}
        />

        {/* Summary line: count + chips */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            พบ {filtered.length} รายการ
          </Typography>

          {filters.status !== "all" && (
            <Chip
              size="small"
              variant="outlined"
              label={filters.status === "active" ? "พร้อมใช้" : "ปิดใช้งาน"}
              onDelete={() => handleFilterChange("status", "all")}
            />
          )}

          {filters.q && (
            <Chip
              size="small"
              variant="outlined"
              label={`ค้นหา: "${filters.q}"`}
              onDelete={() => handleFilterChange("q", "")}
            />
          )}
        </Stack>

        {/* Desktop / Mobile Content */}
        {isSmUp ? (
          // ---- Desktop View ----
          <Paper
            variant="outlined"
            sx={{ borderRadius: 2, overflow: "hidden" }}
          >
            <TableContainer>
              <Table size="medium" sx={{ tableLayout: "fixed" }}>
                <TableHead>
                  <TableRow>
                    <TableCell
                      width="10%"
                      align="center"
                      sx={{ fontWeight: 700 }}
                    >
                      ลำดับ
                    </TableCell>
                    <TableCell width="30%" sx={{ fontWeight: 700 }}>
                      ชื่อหมวดหมู่
                    </TableCell>
                    <TableCell width="25%" sx={{ fontWeight: 700 }}>
                      Slug
                    </TableCell>
                    <TableCell
                      width="15%"
                      align="center"
                      sx={{ fontWeight: 700 }}
                    >
                      สถานะ
                    </TableCell>
                    <TableCell
                      width="20%"
                      align="center"
                      sx={{ fontWeight: 700 }}
                    >
                      การทำงาน
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {pageRows.map((r, i) => (
                    <ManageCategoryItem
                      key={r.id}
                      row={r}
                      index={(page - 1) * pageSize + i + 1}
                      onEdit={() => handleOpenForm(r)} // ส่งข้อมูลเพื่อ Edit
                      onDelete={handleDelete}
                      onToggleActive={handleToggleActive}
                    />
                  ))}

                  {pageRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Box sx={{ py: 6, textAlign: "center" }}>
                          <Typography color="text.secondary">
                            ไม่พบหมวดหมู่
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination Desktop */}
            <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
              <PaginationBar
                page={page}
                pageSize={pageSize}
                totalCount={totalCount}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
                showSummary
                showPageSizeSelect
                pageSizeOptions={[5, 10, 20, 50]}
              />
            </Box>
          </Paper>
        ) : (
          // ---- Mobile View ----
          <>
            <Stack spacing={1.25}>
              {pageRows.length === 0 ? (
                <Paper
                  variant="outlined"
                  sx={{ p: 4, borderRadius: 2, textAlign: "center" }}
                >
                  <Typography color="text.secondary">ไม่พบหมวดหมู่</Typography>
                </Paper>
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

            {/* Pagination Mobile (Sticky Bottom) */}
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
