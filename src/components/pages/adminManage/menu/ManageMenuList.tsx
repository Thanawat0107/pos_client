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
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import MenuFilterBar from "../MenuFilterBar";
import MobileMenuItem from "./MobileMenuItem";
import ManageMenuItem from "./ManageMenuItem";
import FormMenu from "./FormMenu";
import PaginationBar from "../../../layouts/PaginationBar";
import type { MenuItemDto } from "../../../../@types/dto/MenuItem";
import type { CreateMenuItem } from "../../../../@types/createDto/createMenuItem";
import type { UpdateMenuItem } from "../../../../@types/UpdateDto/updateMenuItem";
import type { MenuItemOption } from "../../../../@types/dto/MenuItemOption";
import {
  useCreateMenuItemMutation,
  useDeleteMenuItemMutation,
  useGetMenuItemsQuery,
  useUpdateMenuItemMutation,
} from "../../../../services/menuItemApi";
import { useGetMenuItemOptionsQuery } from "../../../../services/menuItemOptionApi";
import { useGetCategoriesQuery } from "../../../../services/categoriesApi";

type StatusFilter = "all" | "active" | "inactive";

export default function ManageMenuList() {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

  const [filters, setFilters] = useState({
    q: "",
    cat: "all",
    status: "all" as StatusFilter,
  });

  const [formState, setFormState] = useState<{
    open: boolean;
    data: MenuItemDto | null;
  }>({
    open: false,
    data: null,
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: menuData,
    isLoading,
    isError,
    refetch,
  } = useGetMenuItemsQuery({
    pageNumber: 1,
    pageSize: 1000,
  });

  const { data: optionData } = useGetMenuItemOptionsQuery({
    pageNumber: 1,
    pageSize: 1000,
  });
  const optionList: MenuItemOption[] = optionData?.result ?? [];

  const { data: categoryData } = useGetCategoriesQuery({
    pageNumber: 1,
    pageSize: 1000,
  });
  
  const categories = categoryData?.result ?? [];

  const [createMenuItem, { isLoading: isCreating }] = useCreateMenuItemMutation();
  const [updateMenuItem, { isLoading: isUpdating }] = useUpdateMenuItemMutation();
  const [deleteMenuItem, { isLoading: isDeleting }] = useDeleteMenuItemMutation();

  const rows: MenuItemDto[] = menuData?.result ?? [];

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const filteredSorted = useMemo(() => {
    const { q, cat, status } = filters;
    const searchLower = q.trim().toLowerCase();

    return rows
      .filter((r) => {
        const matchesQ =
          !q ||
          r.name.toLowerCase().includes(searchLower) ||
          r.description?.toLowerCase().includes(searchLower);
        const matchesCat = cat === "all" || String(r.menuCategoryId) === cat;

        const isActive = r.isUsed && !r.isDeleted;
        const matchesStatus =
          status === "all" || (status === "active" ? isActive : !isActive);

        return matchesQ && matchesCat && matchesStatus;
      })
      .sort((a, b) => a.id - b.id);
  }, [rows, filters]);

  const pageRows = filteredSorted.slice((page - 1) * pageSize, page * pageSize);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleOpenForm = (item: MenuItemDto | null = null) => {
    setFormState({ open: true, data: item });
  };

  const handleCloseForm = () => {
    setFormState({ open: false, data: null });
  };

  const handleDelete = async (id: number) => {
    if (confirm("ยืนยันลบเมนูนี้?")) {
      await deleteMenuItem(id)
        .unwrap()
        .catch((err) => console.error(err));
    }
  };

  const handleToggleActive = async (id: number, next: boolean) => {
    const item = rows.find((r) => r.id === id);
    if (!item) return;

    try {
      await updateMenuItem({
        id,
        data: { ...item, isUsed: next } as UpdateMenuItem,
      }).unwrap();
    } catch (error) {
      console.error("Toggle failed:", error);
      alert("เปลี่ยนสถานะไม่สำเร็จ");
    }
  };

  const handleSubmit = async (
    data: CreateMenuItem | UpdateMenuItem,
    id?: number
  ) => {
    try {
      if (id) {
        await updateMenuItem({
          id,
          data: data as UpdateMenuItem,
        }).unwrap();
      } else {
        await createMenuItem(data as CreateMenuItem).unwrap();
      }
      handleCloseForm();
    } catch (error) {
      console.error("Submit failed:", error);
      alert("บันทึกข้อมูลไม่สำเร็จ");
    }
  };

  const isBusy = isCreating || isUpdating || isDeleting;

  if (isLoading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  if (isError)
    return (
      <Box p={3}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              ลองใหม่
            </Button>
          }
        >
          ไม่สามารถโหลดข้อมูลเมนูได้
        </Alert>
      </Box>
    );

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <Container maxWidth="xl">
        {/* Sticky Header & Filter */}
        <Box
          sx={{
            position: { xs: "sticky", md: "static" },
            top: { xs: 56, sm: 64 },
            zIndex: (t) => t.zIndex.appBar,
            bgcolor: "background.default",
            pb: 1,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Typography variant={isSmUp ? "h5" : "h6"} fontWeight={800}>
              จัดการเมนูอาหาร
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
                onClick={() => handleOpenForm()}
                disabled={isBusy}
              >
                เพิ่มเมนู
              </Button>
              <Button
                component={Link}
                to="/manage-menuItemOptionList"
                variant="contained"
                startIcon={<AddIcon />}
              >
                ตัวเลือกเพิ่มเติม
              </Button>
            </Stack>
          </Stack>

          <MenuFilterBar
            q={filters.q}
            cat={filters.cat}
            status={filters.status}
            categories={categories}
            onSearch={(v) => handleFilterChange("q", v)}
            onCategoryChange={(v) => handleFilterChange("cat", v)}
            onStatusChange={(v) => handleFilterChange("status", v)}
          />

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              พบ {filteredSorted.length} รายการ
            </Typography>
            {filters.cat !== "all" && (
              <Chip
                size="small"
                variant="outlined"
                label={`หมวด: ${
                  categories.find((c) => String(c.id) === filters.cat)?.name ??
                  filters.cat
                }`}
                onDelete={() => handleFilterChange("cat", "all")}
              />
            )}
            {filters.status !== "all" && (
              <Chip
                size="small"
                variant="outlined"
                label={filters.status === "active" ? "พร้อมขาย" : "ปิดขาย"}
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
        </Box>

        {/* Content Table / List */}
        {isSmUp ? (
          <Paper
            variant="outlined"
            sx={{ borderRadius: 2, overflow: "hidden" }}
          >
            <TableContainer>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell width={84} align="center">
                      ลำดับแสดง
                    </TableCell>
                    <TableCell width={100}>รูป</TableCell>
                    <TableCell>ชื่อเมนู</TableCell>
                    <TableCell width={140} align="right">
                      ราคา
                    </TableCell>
                    <TableCell width={160}>หมวดหมู่</TableCell>
                    <TableCell width={140}>สถานะ</TableCell>
                    <TableCell width={180}>อัปเดตล่าสุด</TableCell>
                    <TableCell width={120} align="right">
                      การทำงาน
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pageRows.map((r, i) => (
                    <ManageMenuItem
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
                      <TableCell colSpan={8}>
                        <Box sx={{ py: 6, textAlign: "center" }}>
                          <Typography color="text.secondary">
                            {isLoading
                              ? "กำลังโหลด..."
                              : "ไม่พบรายการตรงกับเงื่อนไข"}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* 🟢 Desktop PaginationBar */}
            <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
              <PaginationBar
                page={page}
                pageSize={pageSize}
                totalCount={filteredSorted.length}
                onPageChange={setPage}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={[5, 10, 20, 50]}
              />
            </Box>
          </Paper>
        ) : (
          <Stack spacing={1.25}>
            {pageRows.length === 0 ? (
              <Paper
                variant="outlined"
                sx={{ p: 4, borderRadius: 2, textAlign: "center" }}
              >
                <Typography color="text.secondary">
                  {isLoading ? "กำลังโหลด..." : "ไม่พบรายการตรงกับเงื่อนไข"}
                </Typography>
              </Paper>
            ) : (
              pageRows.map((r, i) => (
                <MobileMenuItem
                  key={r.id}
                  row={r}
                  index={(page - 1) * pageSize + i + 1}
                  onEdit={() => handleOpenForm(r)}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                />
              ))
            )}
            
            {/* 🟢 Mobile PaginationBar */}
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
                totalCount={filteredSorted.length}
                onPageChange={setPage}
                onPageSizeChange={handlePageSizeChange}
                showPageSizeSelect={false} // ซ่อนเลือกขนาดหน้าบนมือถือ
                showSummary={false} // ซ่อนสรุปยอดบนมือถือ
                sx={{ mt: 0 }}
              />
            </Stack>
          </Stack>
        )}
      </Container>

      {/* Drawer Form */}
      <FormMenu
        open={formState.open}
        onClose={handleCloseForm}
        initial={formState.data ?? undefined}
        categories={categories}
        optionList={optionList}
        onSubmit={handleSubmit}
      />
    </Box>
  );
}