/* eslint-disable @typescript-eslint/no-unused-vars */
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
  Pagination,
  useMediaQuery,
  Chip,
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

function useDebounced<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function ManageCategoryList() {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

  const [q, setQ] = useState("");
  const dq = useDebounced(q, 300);
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<MenuCategory | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(isSmUp ? 8 : 6);

  const { data, isLoading, isFetching, refetch } = useGetCategoriesQuery({
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

  useEffect(() => {
    setPage(1);
  }, [dq, status, pageSize]);

  useEffect(() => {
    setPageSize(isSmUp ? 8 : 6);
    setPage(1);
  }, [isSmUp]);

  const filtered = useMemo(() => {
    const search = dq.trim().toLowerCase();

    return rows.filter((r) => {
      const byQ =
        !search ||
        r.name.toLowerCase().includes(search) ||
        (r.slug ?? "").toLowerCase().includes(search);

      const byStatus =
        status === "all" || (status === "active" ? r.isUsed : !r.isUsed);

      return byQ && byStatus;
    });
  }, [rows, dq, status]);

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const refresh = () => {
    refetch();
  };

  const handleCreate = () => {
    setEditing(null);
    setOpenForm(true);
  };

  const handleEdit = (r: MenuCategory) => {
    setEditing(r);
    setOpenForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("ยืนยันลบหมวดหมู่นี้?")) return;
    try {
      await deleteCategory(id).unwrap();
      // TODO: แทรก Swal/Toast แสดงว่า “ลบสำเร็จ”
    } catch (err) {
      console.error("delete category failed", err);
      // TODO: Swal.fire("ลบไม่สำเร็จ", "ลองใหม่อีกครั้ง", "error");
    }
  };

  const handleToggleActive = async (id: number, next: boolean) => {
    const target = rows.find((r) => r.id === id);
    if (!target) return;

    try {
      await updateCategory({
        id,
        data: {
          id,
          name: target.name,
          slug: target.slug,
          isUsed: next,
        },
      }).unwrap();
      // TODO: จะใส่ toast เบา ๆ ก็ได้
    } catch (err) {
      console.error("toggle active failed", err);
      // TODO: แจ้ง error + อาจจะ revert toggle ถ้าอยากทำให้เนียน
    }
  };

  const handleSubmit = async (formData: MenuCategory) => {
    try {
      if (formData.id) {
        await updateCategory({
          id: formData.id,
          data: {
            id: formData.id,
            name: formData.name,
            slug: formData.slug,
            isUsed: formData.isUsed,
          },
        }).unwrap();
      } else {
        await createCategory({
          name: formData.name,
          slug: formData.slug,
        }).unwrap();
      }

      setOpenForm(false);
      setEditing(null);
      // TODO: แสดง Swal/Toast ว่า "บันทึกสำเร็จ"
    } catch (err) {
      console.error("save category failed", err);
      // TODO: Swal.fire("บันทึกไม่สำเร็จ", "ลองใหม่อีกครั้ง", "error");
    }
  };

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
              onClick={refresh}
              disabled={isLoading}
            >
              รีเฟรช
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
              disabled={isCreating || isUpdating || isDeleting}
            >
              เพิ่มหมวดหมู่
            </Button>
          </Stack>
        </Stack>

        {/* Filter bar */}
        <CategoryFilterBar
          q={q}
          status={status}
          onSearch={setQ}
          onStatusChange={setStatus}
        />

        {/* Summary line: count + chips */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            พบ {filtered.length} รายการ
          </Typography>
          {status !== "all" && (
            <Chip
              size="small"
              variant="outlined"
              label={status === "active" ? "พร้อมใช้" : "ปิดใช้งาน"}
              onDelete={() => setStatus("all")}
            />
          )}
          {dq && (
            <Chip
              size="small"
              variant="outlined"
              label={`ค้นหา: "${dq}"`}
              onDelete={() => setQ("")}
            />
          )}
        </Stack>

        {/* Desktop / Mobile */}
        {isSmUp ? (
          <Paper
            variant="outlined"
            sx={{ borderRadius: 2, overflow: "hidden" }}
          >
            <TableContainer>
              <Table
                size="medium"
                sx={{
                  tableLayout: "fixed", // ให้คอลัมน์กว้างคงที่ตาม width
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell
                      width="20%"
                      align="center"
                      sx={{ fontWeight: 700 }}
                    >
                      ลำดับแสดง
                    </TableCell>
                    <TableCell
                      width="20%"
                      align="center"
                      sx={{ fontWeight: 700 }}
                    >
                      ชื่อ / slug
                    </TableCell>
                    <TableCell
                      width="20%"
                      align="center"
                      sx={{ fontWeight: 700 }}
                    >
                      จำนวนเมนู
                    </TableCell>
                    <TableCell
                      width="20%"
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
                      index={start + i + 1}
                      onEdit={handleEdit}
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

            <Box sx={{ px: 2, py: 1.5 }}>
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
              />
            </Box>
          </Paper>
        ) : (
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
                    index={start + i + 1}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                  />
                ))
              )}
            </Stack>

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
            />
          </>
        )}
      </Container>

      {/* Drawer Form */}
      <FormCategory
        open={openForm}
        onClose={() => setOpenForm(false)}
        initial={editing ?? undefined}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
      />
    </Box>
  );
}
