/* eslint-disable @typescript-eslint/no-explicit-any */
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
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useEffect, useMemo, useState } from "react";
import ManageManualItem from "./ManageManualItem";
import MobileManualItem from "./MobileManualItem";
import FormManual from "./FormManual";
import PaginationBar from "../../../layouts/PaginationBar";
import {
  useGetManualsQuery,
  useCreateManualMutation,
  useUpdateManualMutation,
  useDeleteManualMutation,
} from "../../../../services/manualApi";
import type { Manual } from "../../../../@types/dto/Manual";
import type { CreateManual } from "../../../../@types/createDto/CreateManual";
import type { UpdateManual } from "../../../../@types/UpdateDto/UpdateManual";
import ManualFilterBar from "../ManualFilterBar";

type StatusFilter = "all" | "active" | "inactive";

export default function ManageManualList() {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

  const [filters, setFilters] = useState({
    q: "",
    role: "all",
    status: "all" as StatusFilter,
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formState, setFormState] = useState<{
    open: boolean;
    data: Manual | null;
  }>({
    open: false,
    data: null,
  });

  // เรียกข้อมูลทั้งหมด (ใช้ pageSize เยอะๆ เพื่อมา Filter Client-side ตามโครงเดิม)
  const {
    data: manualData,
    isLoading,
    isError,
    refetch,
  } = useGetManualsQuery({
    pageNumber: 1,
    pageSize: 1000,
  });

  const [createManual, { isLoading: isCreating }] = useCreateManualMutation();
  const [updateManual, { isLoading: isUpdating }] = useUpdateManualMutation();
  const [deleteManual, { isLoading: isDeleting }] = useDeleteManualMutation();

  const rows: Manual[] = useMemo(() => manualData?.result ?? [], [manualData]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // --- ปรับปรุง Logic การกรองข้อมูล ---
  const filteredSorted = useMemo(() => {
    const { q, role, status } = filters;
    const searchLower = q.trim().toLowerCase();

    return rows
      .filter((r) => {
        // [แก้ไข] ให้ค้นหาครอบคลุม Title และ Location ด้วย
        const matchesQ =
          !q ||
          r.title?.toLowerCase().includes(searchLower) || // เพิ่มใหม่
          r.content?.toLowerCase().includes(searchLower) ||
          r.category.toLowerCase().includes(searchLower) ||
          r.location?.toLowerCase().includes(searchLower); // เพิ่มใหม่

        const matchesRole = role === "all" || r.targetRole === role;

        const isActive = r.isUsed;
        const matchesStatus =
          status === "all" || (status === "active" ? isActive : !isActive);

        return matchesQ && matchesRole && matchesStatus;
      })
      .sort((a, b) => b.id - a.id);
  }, [rows, filters]);

  const pageRows = filteredSorted.slice((page - 1) * pageSize, page * pageSize);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const handleOpenForm = (item: Manual | null = null) => {
    setFormState({ open: true, data: item });
  };

  const handleCloseForm = () => {
    setFormState({ open: false, data: null });
  };

  const handleDelete = async (id: number) => {
    if (confirm("ยืนยันลบข้อมูลนี้? ข้อมูลจะถูกลบแบบ Soft Delete")) {
      await deleteManual(id)
        .unwrap()
        .catch((err) => console.error(err));
    }
  };

  const handleToggleActive = async (id: number, next: boolean) => {
    const item = rows.find((r) => r.id === id);
    if (!item) return;

    try {
      // แมป images → keepImages ให้ตรงกับ UpdateManual interface
      await updateManual({
        id,
        data: {
          title: item.title,
          content: item.content,
          location: item.location,
          category: item.category,
          targetRole: item.targetRole,
          isUsed: next,
          keepImages: item.images,
        },
      }).unwrap();
    } catch (error) {
      console.error("Toggle failed:", error);
      alert("เปลี่ยนสถานะไม่สำเร็จ");
    }
  };

  const handleSubmit = async (
    data: CreateManual | UpdateManual,
    id?: number,
  ) => {
    try {
      if (id) {
        await updateManual({
          id,
          data: data as UpdateManual,
        }).unwrap();
      } else {
        await createManual(data as CreateManual).unwrap();
      }
      handleCloseForm();
    } catch (error) {
      console.error("Submit failed:", error);
      alert("บันทึกข้อมูลไม่สำเร็จ");
    }
  };

  const isBusy = isCreating || isUpdating || isDeleting;

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
                  จัดการคู่มือ & จุดบริการ
                </Typography>
                <Typography className="text-gray-500" sx={{ fontSize: { xs: "0.875rem", md: "1rem" }, mt: 0.25 }}>
                  สร้างและแก้ไขคู่มือการทำงานสำหรับพนักงาน หรือจุดบริการสำหรับลูกค้า
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center" className="overflow-x-auto pb-1 no-scrollbar" sx={{ flexWrap: "nowrap" }}>
              <Button
                variant="contained"
                startIcon={<AddIcon sx={{ fontSize: { xs: "1.25rem !important", md: "1.75rem !important" } }} />}
                onClick={() => handleOpenForm()}
                disabled={isBusy}
                className="bg-[#E63946] hover:bg-[#D32F2F] shadow-md hover:shadow-lg whitespace-nowrap"
                sx={{ borderRadius: "50px", px: { xs: 2, md: 4 }, py: { xs: 1, md: 1.5 }, fontSize: { xs: "0.9rem", md: "1.25rem" }, fontWeight: 700, flexShrink: 0 }}
              >
                เพิ่มคู่มือใหม่
              </Button>

              <Tooltip title="รีเฟรชข้อมูล">
                <IconButton
                  onClick={() => refetch()}
                  disabled={isLoading}
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
          <Paper elevation={0} className="bg-white rounded-3xl shadow-sm border border-gray-200" sx={{ px: { xs: 2.5, md: 4 }, py: { xs: 2, md: 3 } }}>
            <ManualFilterBar
              q={filters.q}
              role={filters.role}
              status={filters.status}
              onSearch={(v) => handleFilterChange("q", v)}
              onRoleChange={(v) => handleFilterChange("role", v)}
              onStatusChange={(v) => handleFilterChange("status", v)}
            />
            <Typography
              className="text-[#E63946] font-bold mt-4 flex items-center gap-2"
              sx={{ fontSize: { xs: "1.1rem", md: "1.2rem" }, fontWeight: 700 }}
            >
              <span className="h-2 w-2 rounded-full bg-[#E63946]" />
              รายการที่พบทั้งหมด: {filteredSorted.length} รายการ
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
            ) : isError ? (
              <Paper elevation={0} className="rounded-3xl border border-gray-200 bg-white p-8 text-center">
                <Typography color="error" fontWeight={700} mb={1}>ไม่สามารถโหลดข้อมูลคู่มือได้</Typography>
                <Button variant="outlined" color="error" onClick={() => refetch()}>ลองใหม่</Button>
              </Paper>
            ) : isSmUp ? (
              <Paper elevation={0} className="border border-gray-200 rounded-3xl overflow-hidden bg-white shadow-sm">
                <TableContainer>
                  <Table sx={{ minWidth: 800 }}>
                    <TableHead className="bg-[#F8FAFC]">
                      <TableRow>
                        <TableCell className="font-bold text-gray-700" sx={{ fontSize: "1.1rem", py: 2.5, pl: 4, width: 80 }}>ลำดับ</TableCell>
                        <TableCell className="font-bold text-gray-700" sx={{ fontSize: "1.1rem", py: 2.5, width: 90 }}>ไฟล์</TableCell>
                        <TableCell className="font-bold text-gray-700" sx={{ fontSize: "1.1rem", py: 2.5 }}>หัวข้อ / สถานที่</TableCell>
                        <TableCell className="font-bold text-gray-700" sx={{ fontSize: "1.1rem", py: 2.5 }}>รายละเอียด</TableCell>
                        <TableCell align="center" className="font-bold text-gray-700" sx={{ fontSize: "1.1rem", py: 2.5, width: 140 }}>กลุ่มเป้าหมาย</TableCell>
                        <TableCell align="center" className="font-bold text-gray-700" sx={{ fontSize: "1.1rem", py: 2.5, width: 120 }}>สถานะ</TableCell>
                        <TableCell align="center" className="font-bold text-gray-700" sx={{ fontSize: "1.1rem", py: 2.5, width: 150 }}>อัปเดตล่าสุด</TableCell>
                        <TableCell align="right" className="font-bold text-gray-700" sx={{ fontSize: "1.1rem", py: 2.5, pr: 4, width: 110 }}>จัดการ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pageRows.map((r, i) => (
                        <ManageManualItem
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
                {pageRows.length === 0 && <ManualEmptyState />}
                <Box className="px-6 py-5 bg-gray-50/50 border-t border-gray-100">
                  <PaginationBar
                    page={page}
                    pageSize={pageSize}
                    totalCount={filteredSorted.length}
                    onPageChange={setPage}
                    onPageSizeChange={handlePageSizeChange}
                    showSummary
                    showPageSizeSelect
                  />
                </Box>
              </Paper>
            ) : (
              <Stack spacing={2}>
                {pageRows.length > 0 ? pageRows.map((r, i) => (
                  <Box key={r.id} className="bg-white rounded-3xl p-2 shadow-sm border border-gray-200">
                    <MobileManualItem
                      row={r}
                      index={(page - 1) * pageSize + i + 1}
                      onEdit={() => handleOpenForm(r)}
                      onDelete={handleDelete}
                      onToggleActive={handleToggleActive}
                    />
                  </Box>
                )) : <ManualEmptyState />}
              </Stack>
            )}
          </Box>

        </Stack>

        {/* Mobile Pagination — fixed ด้านล่าง */}
        {!isSmUp && pageRows.length > 0 && (
          <Box className="fixed bottom-6 left-4 right-4 z-1200">
            <Paper elevation={16} className="rounded-[30px] px-2 py-2 border border-gray-200 bg-white/95 backdrop-blur-md shadow-2xl">
              <PaginationBar
                page={page}
                pageSize={pageSize}
                totalCount={filteredSorted.length}
                onPageChange={setPage}
                showPageSizeSelect={false}
                showSummary
              />
            </Paper>
          </Box>
        )}

        {/* Modal Form */}
        <FormManual
          open={formState.open}
          onClose={handleCloseForm}
          initial={formState.data ?? undefined}
          onSubmit={handleSubmit}
        />
      </Container>
    </Box>
  );
}

function ManualEmptyState() {
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
