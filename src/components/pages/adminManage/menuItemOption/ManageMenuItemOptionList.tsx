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
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

// --- Components & Layouts ---
import ManageMenuItemOptionItem from "./ManageMenuItemOptionItem";
import MobileMenuItemOption from "./MobileMenuItemOption";
import FormMenuItemOption from "./FromMenuItemOption"; // ตรวจสอบชื่อไฟล์ From หรือ Form
import MenuItemOptionFilterBar from "../MenuItemOptionFilterBar";
import PaginationBar from "../../../layouts/PaginationBar";

// --- Hooks & Services ---
import { useDebounced } from "../../../../hooks/useDebounced";
import {
  useCreateMenuItemOptionMutation,
  useDeleteMenuItemOptionMutation,
  useGetMenuItemOptionsQuery,
  useUpdateMenuItemOptionMutation,
} from "../../../../services/menuItemOptionApi";

// --- Types ---
import type { MenuItemOption } from "../../../../@types/dto/MenuItemOption";
import type { CreateMenuItemOption } from "../../../../@types/createDto/CreateMenuItemOption";
import type { UpdateMenuItemOption } from "../../../../@types/UpdateDto/UpdateMenuItemOption";
import type { UpdateMenuOptionDetails } from "../../../../@types/UpdateDto/UpdateMenuOptionDetails";

export default function ManageMenuItemOptionList() {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

  // 1. Filter State: รวม State การกรองไว้ที่เดียว
  const [filters, setFilters] = useState({
    q: "",
    status: "all" as "all" | "active" | "inactive",
    required: "all" as "all" | "required" | "optional",
    multiple: "all" as "all" | "multiple" | "single",
  });

  const dq = useDebounced(filters.q, 400);

  // 2. Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(isSmUp ? 10 : 6);

  // 3. Form Drawer State
  const [formState, setFormState] = useState<{
    open: boolean;
    data: MenuItemOption | null;
  }>({
    open: false,
    data: null,
  });

  // 4. API Operations
  const { data, isLoading, refetch } = useGetMenuItemOptionsQuery({
    pageNumber: 1,
    pageSize: 500, // ดึงข้อมูลมาจำนวนมากเพื่อทำ Filter และ Search ฝั่ง Client
  });

  const [createOption, { isLoading: isCreating }] = useCreateMenuItemOptionMutation();
  const [updateOption, { isLoading: isUpdating }] = useUpdateMenuItemOptionMutation();
  const [deleteOption] = useDeleteMenuItemOptionMutation();

  const rows: MenuItemOption[] = data?.result ?? [];

  // Reset หน้าปัจจุบันเมื่อมีการเปลี่ยนเงื่อนไขการกรอง
  useEffect(() => {
    setPage(1);
  }, [dq, filters.status, filters.required, filters.multiple, pageSize]);

  // 5. Search & Filter Logic (Client-side)
  const filteredRows = useMemo(() => {
    const search = dq.trim().toLowerCase();

    return rows.filter((r) => {
      const matchesSearch =
        !search ||
        r.name.toLowerCase().includes(search) ||
        r.menuOptionDetails?.some((d) => d.name.toLowerCase().includes(search));

      const matchesStatus =
        filters.status === "all" || (filters.status === "active" ? r.isUsed : !r.isUsed);

      const matchesRequired =
        filters.required === "all" || (filters.required === "required" ? r.isRequired : !r.isRequired);

      const matchesMultiple =
        filters.multiple === "all" || (filters.multiple === "multiple" ? r.isMultiple : !r.isMultiple);

      return matchesSearch && matchesStatus && matchesRequired && matchesMultiple;
    });
  }, [rows, dq, filters]);

  // Pagination คำนวณแถวที่จะแสดง
  const totalCount = filteredRows.length;
  const pageRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  // --- Handlers ---

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleOpenForm = (r: MenuItemOption | null = null) => {
    setFormState({ open: true, data: r });
  };

  const handleCloseForm = () => {
    setFormState({ open: false, data: null });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("คุณต้องการลบกลุ่มตัวเลือกนี้ใช่หรือไม่? การลบจะมีผลกับเมนูอาหารที่ใช้กลุ่มนี้อยู่")) {
      try {
        await deleteOption(id).unwrap();
      } catch (err) {
        console.error("Delete Error:", err);
      }
    }
  };

  const handleToggleActive = async (id: number, nextStatus: boolean) => {
    const target = rows.find((r) => r.id === id);
    if (!target) return;

    try {
      // สร้าง Payload ตาม UpdateMenuItemOption Interface
      const payload: UpdateMenuItemOption = {
        id: target.id,
        name: target.name,
        isRequired: target.isRequired,
        isMultiple: target.isMultiple,
        isUsed: nextStatus, // เปลี่ยนสถานะที่นี่
        menuOptionDetails: target.menuOptionDetails?.map((d): UpdateMenuOptionDetails => ({
          id: d.id,
          name: d.name,
          extraPrice: d.extraPrice,
          isDefault: d.isDefault,
          isUsed: d.isUsed,
          isDeleted: false,
        })),
      };

      await updateOption({ id, data: payload }).unwrap();
    } catch (err) {
      console.error("Toggle Active Error:", err);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      if (formData.id && formData.id !== 0) {
        // Mode: Update
        await updateOption({
          id: formData.id,
          data: formData as UpdateMenuItemOption,
        }).unwrap();
      } else {
        // Mode: Create
        await createOption(formData as CreateMenuItemOption).unwrap();
      }
      handleCloseForm();
    } catch (err) {
      console.error("Submit Error:", err);
    }
  };

  return (
    <Box className="min-h-screen bg-[#F5F6F8] pb-28 md:pb-12 font-sans">
      <Container maxWidth="xl" disableGutters={!isSmUp} className="px-6 md:px-12 pt-6 md:pt-8">
        <Stack spacing={{ xs: 2, md: 2.5 }}>

          {/* =========================================
              1. Header & Buttons
             ========================================= */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-end" className="mb-3">
              <Box>
                <Typography
                  sx={{ fontWeight: 800, fontSize: { xs: "1.6rem", md: "2.2rem" }, letterSpacing: "-0.02em" }}
                  className="text-gray-900"
                >
                  กลุ่มตัวเลือกเมนู
                </Typography>
                <Typography className="text-gray-500" sx={{ fontSize: { xs: "0.875rem", md: "1rem" }, mt: 0.25 }}>
                  จัดการตัวเลือกเสริม เช่น ความหวาน, ท็อปปิ้ง — นำไปผูกกับรายการอาหาร
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center" className="overflow-x-auto pb-1 no-scrollbar" sx={{ flexWrap: "nowrap" }}>
              <Button
                variant="contained"
                startIcon={<AddIcon sx={{ fontSize: { xs: "1.25rem !important", md: "1.75rem !important" } }} />}
                onClick={() => handleOpenForm()}
                disabled={isLoading || isCreating}
                className="bg-[#E63946] hover:bg-[#D32F2F] shadow-md hover:shadow-lg whitespace-nowrap"
                sx={{ borderRadius: "50px", px: { xs: 2, md: 4 }, py: { xs: 1, md: 1.5 }, fontSize: { xs: "0.9rem", md: "1.25rem" }, fontWeight: 700, flexShrink: 0 }}
              >
                เพิ่มกลุ่มตัวเลือก
              </Button>
              <Button
                component={Link}
                to="/manage-menuItem"
                variant="outlined"
                className="bg-white border-[#E63946] text-[#E63946] hover:bg-red-50 shadow-sm whitespace-nowrap"
                sx={{ borderRadius: "50px", px: { xs: 2, md: 3 }, py: { xs: 1, md: 1.25 }, fontSize: { xs: "0.85rem", md: "1.15rem" }, fontWeight: 600, borderWidth: "1.5px", flexShrink: 0, "&:hover": { borderWidth: "1.5px" } }}
              >
                กลับหน้าเมนูอาหาร
              </Button>

              <Tooltip title="รีเฟรชข้อมูล">
                <IconButton
                  onClick={() => refetch()}
                  className="bg-white border border-gray-200 hover:bg-gray-50 shadow-sm"
                  sx={{ p: 1, borderRadius: "50%", flexShrink: 0 }}
                >
                  <RefreshIcon sx={{ fontSize: "1.4rem", color: "text.secondary" }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          {/* =========================================
              2. Filter Section
             ========================================= */}
          <Paper elevation={0} className="bg-white rounded-[24px] shadow-sm border border-gray-200" sx={{ px: { xs: 2.5, md: 4 }, py: { xs: 2, md: 3 } }}>
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
            <Typography
              className="text-[#E63946] font-bold mt-4 flex items-center gap-2"
              sx={{ fontSize: { xs: "1.1rem", md: "1.2rem" }, fontWeight: 700 }}
            >
              <span className="h-2 w-2 rounded-full bg-[#E63946]" />
              รายการที่พบทั้งหมด: {totalCount} รายการ
            </Typography>
          </Paper>

          {/* =========================================
              3. Content
             ========================================= */}
          <Box>
            {isLoading ? (
              <Box className="flex flex-col justify-center items-center min-h-100 gap-4">
                <CircularProgress size={60} thickness={4} sx={{ color: "#D32F2F" }} />
                <Typography variant="h6" className="text-gray-600 font-bold text-xl">
                  กำลังโหลดข้อมูล...
                </Typography>
              </Box>
            ) : isSmUp ? (
              <Paper elevation={0} className="border border-gray-200 rounded-3xl overflow-hidden bg-white shadow-sm">
                <TableContainer>
                  <Table sx={{ minWidth: 800 }}>
                    <TableHead className="bg-[#F8FAFC]">
                      <TableRow>
                        <TableCell className="font-bold text-gray-700" sx={{ fontSize: "1.1rem", py: 2.5, pl: 4, width: 80 }}>ลำดับ</TableCell>
                        <TableCell className="font-bold text-gray-700" sx={{ fontSize: "1.1rem", py: 2.5 }}>ชื่อกลุ่มตัวเลือก</TableCell>
                        <TableCell align="center" className="font-bold text-gray-700" sx={{ fontSize: "1.1rem", py: 2.5 }}>รูปแบบ</TableCell>
                        <TableCell align="center" className="font-bold text-gray-700" sx={{ fontSize: "1.1rem", py: 2.5 }}>บังคับเลือก</TableCell>
                        <TableCell align="center" className="font-bold text-gray-700" sx={{ fontSize: "1.1rem", py: 2.5 }}>ตัวเลือกย่อย</TableCell>
                        <TableCell align="center" className="font-bold text-gray-700" sx={{ fontSize: "1.1rem", py: 2.5 }}>สถานะ</TableCell>
                        <TableCell align="right" className="font-bold text-gray-700" sx={{ fontSize: "1.1rem", py: 2.5, pr: 4 }}>จัดการ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pageRows.map((r, i) => (
                        <ManageMenuItemOptionItem
                          key={r.id}
                          row={r}
                          index={(page - 1) * pageSize + i + 1}
                          onEdit={() => handleOpenForm(r)}
                          onDelete={handleDelete}
                          onToggleActive={handleToggleActive}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {pageRows.length === 0 && <EmptyState />}
                <Box className="px-6 py-5 bg-gray-50/50 border-t border-gray-100">
                  <PaginationBar
                    page={page}
                    pageSize={pageSize}
                    totalCount={totalCount}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                    showSummary
                    showPageSizeSelect
                  />
                </Box>
              </Paper>
            ) : (
              <Stack spacing={2}>
                {pageRows.length > 0 ? pageRows.map((r, i) => (
                  <Box key={r.id} className="bg-white rounded-3xl p-2 shadow-sm border border-gray-200">
                    <MobileMenuItemOption
                      row={r}
                      index={(page - 1) * pageSize + i + 1}
                      onEdit={() => handleOpenForm(r)}
                      onDelete={handleDelete}
                      onToggleActive={handleToggleActive}
                    />
                  </Box>
                )) : <EmptyState />}
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

      <FormMenuItemOption
        open={formState.open}
        onClose={handleCloseForm}
        initial={formState.data ?? undefined}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
      />
    </Box>
  );
}

function EmptyState() {
  return (
    <Box className="text-center py-16">
      <Typography variant="h6" className="text-gray-500 font-bold">
        ไม่พบรายการที่ค้นหา
      </Typography>
      <Typography className="text-gray-400 text-sm mt-1">
        ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองใหม่
      </Typography>
    </Box>
  );
}