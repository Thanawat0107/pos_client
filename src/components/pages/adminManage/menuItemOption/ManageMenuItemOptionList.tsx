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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import ManageMenuItemOptionItem from "./ManageMenuItemOptionItem";
import MobileMenuItemOption from "./MobileMenuItemOption";
import type { MenuItemOption } from "../../../../@types/dto/MenuItemOption";
import { useEffect, useMemo, useState } from "react";
import PaginationBar from "../../../layouts/PaginationBar";
import { useDebounced } from "../../../../hooks/useDebounced";
import {
  useCreateMenuItemOptionMutation,
  useDeleteMenuItemOptionMutation,
  useGetMenuItemOptionsQuery,
  useUpdateMenuItemOptionMutation,
} from "../../../../services/menuItemOptionApi";
import type { CreateMenuItemOption } from "../../../../@types/createDto/CreateMenuItemOption";
import type { UpdateMenuItemOption } from "../../../../@types/UpdateDto/UpdateMenuItemOption";
import FormMenuItemOption from "./FromMenuItemOption";
import MenuItemOptionFilterBar from "../MenuItemOptionFilterBar";
import { Link } from "react-router-dom";

export default function ManageMenuItemOptionList() {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

  // 1. รวม Filter State ไว้ก้อนเดียวกัน เพื่อความสะอาด
  const [filters, setFilters] = useState({
    q: "",
    status: "all" as "all" | "active" | "inactive",
    required: "all" as "all" | "required" | "optional",
    multiple: "all" as "all" | "multiple" | "single",
  });

  const dq = useDebounced(filters.q, 300);

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(isSmUp ? 8 : 6);

  // Form State
  const [formState, setFormState] = useState<{
    open: boolean;
    data: MenuItemOption | null;
  }>({
    open: false,
    data: null,
  });

  // API Call: แนะนำให้ดึงมาทั้งหมดถ้าจะ Filter หน้าบ้าน (pageSize เยอะๆ)
  const { data, isLoading, refetch } = useGetMenuItemOptionsQuery({
    pageNumber: 1,
    pageSize: 100,
  });
  const [createOption, { isLoading: isCreating }] = useCreateMenuItemOptionMutation();
  const [updateOption, { isLoading: isUpdating }] = useUpdateMenuItemOptionMutation();
  const [deleteOption, { isLoading: isDeleting }] = useDeleteMenuItemOptionMutation();

  const rows: MenuItemOption[] = data?.result ?? [];

  // Reset page เมื่อ Filter เปลี่ยน
  useEffect(() => {
    setPage(1);
  }, [dq, filters.status, filters.required, filters.multiple, pageSize]);

  // 2. Logic การกรองที่สั้นและอ่านง่ายขึ้น
  const filtered = useMemo(() => {
    const search = dq.trim().toLowerCase();

    return rows.filter((r) => {
      // Helper check function
      const matchesSearch =
        !search ||
        r.name.toLowerCase().includes(search) ||
        (r.MenuItemName ?? "").toLowerCase().includes(search);
      const matchesStatus =
        filters.status === "all" || (filters.status === "active") === r.isUsed;
      const matchesRequired =
        filters.required === "all" ||
        (filters.required === "required") === r.isRequired;
      const matchesMultiple =
        filters.multiple === "all" ||
        (filters.multiple === "multiple") === r.isMultiple;

      return (
        matchesSearch && matchesStatus && matchesRequired && matchesMultiple
      );
    });
  }, [rows, dq, filters]);

  // Pagination Logic
  const totalCount = filtered.length;
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Handlers
  const handleOpenForm = (r: MenuItemOption | null = null) =>
    setFormState({ open: true, data: r });
  const handleCloseForm = () => setFormState({ open: false, data: null });

  const handleDelete = async (id: number) => {
    if (confirm("ยืนยันลบตัวเลือกนี้?")) {
      await deleteOption(id)
        .unwrap()
        .catch((err) => console.error("delete failed", err));
    }
  };

  // 3. ปรับ Toggle ให้สั้นลง (ใช้ Spread Operator)
  const handleToggleActive = async (id: number, next: boolean) => {
    const target = rows.find((r) => r.id === id);
    if (!target) return;

    try {
      // ใช้ ...target เพื่อ copy ข้อมูลเดิม แล้วทับด้วยค่าใหม่
      // หมายเหตุ: เช็คว่า Backend รับ field ที่เกินมาได้ไหม ถ้าไม่ได้ค่อย map กรองออก
      await updateOption({
        id,
        data: { ...target, isUsed: next },
      }).unwrap();
    } catch (err) {
      console.error("toggle failed", err);
    }
  };

  const handleSubmit = async (
    formData: CreateMenuItemOption | UpdateMenuItemOption
  ) => {
    try {
      const isUpdate = "id" in formData && !!formData.id;
      const action = isUpdate
        ? updateOption({
            id: formData.id!,
            data: formData as UpdateMenuItemOption,
          })
        : createOption(formData as CreateMenuItemOption);

      await action.unwrap();
      handleCloseForm();
    } catch (err) {
      console.error("save failed", err);
    }
  };

  // 1. เพิ่มฟังก์ชันนี้ไว้ใน Component ก่อน return เพื่อลดการเขียน setFilters ซ้ำๆ
  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
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
            จัดการตัวเลือกเมนู
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              component={Link}
              to="/manage-menuItem"
            >
              ย้อนกลับ
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => refetch()} // หรือใช้ฟังก์ชัน refresh เดิม
              disabled={isLoading}
            >
              รีเฟรช
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenForm()} // แก้เป็น handleOpenForm
              disabled={isCreating || isUpdating || isDeleting}
            >
              เพิ่มตัวเลือก
            </Button>
          </Stack>
        </Stack>

        {/* FilterBar: ดึงค่าจาก filters object และใช้ handler กลาง */}
        <MenuItemOptionFilterBar
          q={filters.q}
          status={filters.status}
          required={filters.required}
          multiple={filters.multiple}
          onSearch={(v) => handleFilterChange("q", v)}
          onStatusChange={(v) => handleFilterChange("status", v)}
          onRequiredChange={(v) => handleFilterChange("required", v)}
          onMultipleChange={(v) => handleFilterChange("multiple", v)}
        />

        {/* Active Filters Chips */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ mb: 1 }}
          flexWrap="wrap"
        >
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

          {filters.required !== "all" && (
            <Chip
              size="small"
              variant="outlined"
              label={
                filters.required === "required" ? "บังคับเลือก" : "ไม่บังคับ"
              }
              onDelete={() => handleFilterChange("required", "all")}
            />
          )}

          {filters.multiple !== "all" && (
            <Chip
              size="small"
              variant="outlined"
              label={
                filters.multiple === "multiple"
                  ? "เลือกได้หลายรายการ"
                  : "เลือกได้ 1 รายการ"
              }
              onDelete={() => handleFilterChange("multiple", "all")}
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

        {/* Table Section (Desktop) */}
        {isSmUp ? (
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
                    <TableCell
                      width="25%"
                      align="center"
                      sx={{ fontWeight: 700 }}
                    >
                      ชื่อกลุ่ม
                    </TableCell>
                    <TableCell
                      width="15%"
                      align="center"
                      sx={{ fontWeight: 700 }}
                    >
                      จำนวนตัวเลือก
                    </TableCell>
                    <TableCell
                      width="20%"
                      align="center"
                      sx={{ fontWeight: 700 }}
                    >
                      เมนูที่ใช้งาน
                    </TableCell>
                    <TableCell
                      width="15%"
                      align="center"
                      sx={{ fontWeight: 700 }}
                    >
                      สถานะ
                    </TableCell>
                    <TableCell
                      width="15%"
                      align="center"
                      sx={{ fontWeight: 700 }}
                    >
                      การทำงาน
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {pageRows.map((r, i) => (
                    <ManageMenuItemOptionItem
                      key={r.id}
                      row={r}
                      index={(page - 1) * pageSize + i + 1} // คำนวณ index แบบใหม่
                      onEdit={() => handleOpenForm(r)} // ส่ง row เข้าไปใน handleOpenForm
                      onDelete={handleDelete}
                      onToggleActive={handleToggleActive}
                    />
                  ))}

                  {pageRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Box sx={{ py: 6, textAlign: "center" }}>
                          <Typography color="text.secondary">
                            ไม่พบตัวเลือกเมนู
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
                  setPage(1); // Reset ไปหน้า 1 เสมอเมื่อเปลี่ยน size
                }}
                showSummary
                showPageSizeSelect
              />
            </Box>
          </Paper>
        ) : (
          /* Mobile View */
          <>
            <Stack spacing={1.25}>
              {pageRows.length === 0 ? (
                <Paper
                  variant="outlined"
                  sx={{ p: 4, borderRadius: 2, textAlign: "center" }}
                >
                  <Typography color="text.secondary">
                    ไม่พบตัวเลือกเมนู
                  </Typography>
                </Paper>
              ) : (
                pageRows.map((r, i) => (
                  <MobileMenuItemOption
                    key={r.id}
                    row={r}
                    index={(page - 1) * pageSize + i + 1}
                    onEdit={() => handleOpenForm(r)} // แก้เป็น handleOpenForm
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

      {/* Drawer Form: ใช้ formState แทน openForm/editing */}
      <FormMenuItemOption
        open={formState.open}
        onClose={handleCloseForm} // ใช้ handler ปิดฟอร์ม
        initial={formState.data ?? undefined} // ส่ง data ไป (ถ้ามี)
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
      />
    </Box>
  );
}
