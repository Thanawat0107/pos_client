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
  Chip,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TuneIcon from "@mui/icons-material/Tune";
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
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: { xs: 14, md: 6 } }}>
      <Container maxWidth="xl" disableGutters={!isSmUp} sx={{ px: { xs: 3, md: 6 }, pt: { xs: 3, md: 4 } }}>
        <Stack spacing={{ xs: 2, md: 2.5 }}>

          {/* =========================================
              1. Header & Buttons
             ========================================= */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "flex-end" }}
            spacing={2}
          >
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
                <TuneIcon sx={{ fontSize: { xs: "1.6rem", md: "2rem" }, color: "primary.main" }} />
                <Typography
                  sx={{ fontWeight: 800, fontSize: { xs: "1.6rem", md: "2.2rem" }, letterSpacing: "-0.02em" }}
                >
                  กลุ่มตัวเลือกเมนู
                </Typography>
                <Chip
                  size="small"
                  label={`${rows.length} กลุ่ม`}
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
              <Typography sx={{ color: "text.secondary", fontSize: { xs: "0.875rem", md: "1rem" }, mt: 0.25 }}>
                จัดการตัวเลือกเสริม เช่น ความหวาน, ท็อปปิ้ง — นำไปผูกกับรายการอาหาร
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenForm()}
                disabled={isLoading || isCreating}
                sx={{
                  borderRadius: "50px",
                  px: { xs: 2, md: 3 },
                  py: { xs: 1, md: 1.25 },
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: { xs: "0.85rem", md: "1rem" },
                }}
              >
                เพิ่มกลุ่มตัวเลือก
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

          {/* =========================================
              2. Filter Section
             ========================================= */}
          <Paper elevation={0} sx={{ bgcolor: "background.paper", borderRadius: 3, border: "1px solid", borderColor: "divider", px: { xs: 2.5, md: 4 }, py: { xs: 2, md: 3 } }}>
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
              sx={{ color: "primary.main", fontWeight: 700, mt: 2, display: "flex", alignItems: "center", gap: 1, fontSize: { xs: "1.1rem", md: "1.2rem" } }}
            >
              <Box component="span" sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "primary.main", display: "inline-block", mr: 0.75 }} />
              รายการที่พบทั้งหมด: {totalCount} รายการ
            </Typography>
          </Paper>

          {/* =========================================
              3. Content
             ========================================= */}
          <Box>
            {isLoading ? (
              <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: 256, gap: 2 }}>
                <CircularProgress size={60} thickness={4} color="primary" />
                <Typography variant="h6" sx={{ color: "text.secondary", fontWeight: 700, fontSize: "1.25rem" }}>
                  กำลังโหลดข้อมูล...
                </Typography>
              </Box>
            ) : isSmUp ? (
              <Paper elevation={0} sx={{ bgcolor: "background.paper", borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
                <TableContainer>
                  <Table sx={{ minWidth: 800 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, color: "text.secondary", bgcolor: "action.hover", fontSize: "1.1rem", py: 2.5, pl: 4, width: 80 }}>ลำดับ</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "text.secondary", bgcolor: "action.hover", fontSize: "1.1rem", py: 2.5 }}>ชื่อกลุ่มตัวเลือก</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: "text.secondary", bgcolor: "action.hover", fontSize: "1.1rem", py: 2.5 }}>รูปแบบ</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: "text.secondary", bgcolor: "action.hover", fontSize: "1.1rem", py: 2.5 }}>บังคับเลือก</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: "text.secondary", bgcolor: "action.hover", fontSize: "1.1rem", py: 2.5 }}>ตัวเลือกย่อย</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: "text.secondary", bgcolor: "action.hover", fontSize: "1.1rem", py: 2.5 }}>สถานะ</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: "text.secondary", bgcolor: "action.hover", fontSize: "1.1rem", py: 2.5, pr: 4 }}>จัดการ</TableCell>
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
                <Box sx={{ px: 3, py: 2.5, bgcolor: "background.default", borderTop: "1px solid", borderColor: "divider" }}>
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
                  <Box key={r.id} sx={{ bgcolor: "background.paper", borderRadius: 3, p: 1, boxShadow: 1, border: "1px solid", borderColor: "divider" }}>
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
            <Paper elevation={16} sx={{ borderRadius: "30px", px: 1, py: 1, border: "1px solid", borderColor: "divider", bgcolor: alpha(theme.palette.background.paper, 0.95), backdropFilter: "blur(12px)" }}>
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
    <Box sx={{ textAlign: "center", py: 8 }}>
      <Typography variant="h6" sx={{ color: "text.secondary", fontWeight: 700 }}>
        ไม่พบรายการที่ค้นหา
      </Typography>
      <Typography sx={{ color: "text.disabled", fontSize: "0.875rem", mt: 1 }}>
        ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองใหม่
      </Typography>
    </Box>
  );
}