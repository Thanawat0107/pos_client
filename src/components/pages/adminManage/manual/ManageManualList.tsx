/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Chip,
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
import { useTheme, alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import MenuBookIcon from "@mui/icons-material/MenuBook";
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
                <MenuBookIcon sx={{ fontSize: { xs: "1.6rem", md: "2rem" }, color: "primary.main" }} />
                <Typography
                  sx={{ fontWeight: 800, fontSize: { xs: "1.6rem", md: "2.2rem" }, letterSpacing: "-0.02em" }}
                >
                  จัดการคู่มือ & จุดบริการ
                </Typography>
                <Chip
                  size="small"
                  label={`${filteredSorted.length} รายการ`}
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
                สร้างและแก้ไขคู่มือการทำงานสำหรับพนักงาน หรือจุดบริการสำหรับลูกค้า
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
                เพิ่มคู่มือใหม่
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
            <ManualFilterBar
              q={filters.q}
              role={filters.role}
              status={filters.status}
              onSearch={(v) => handleFilterChange("q", v)}
              onRoleChange={(v) => handleFilterChange("role", v)}
              onStatusChange={(v) => handleFilterChange("status", v)}
            />
            <Typography
              sx={{ color: "primary.main", fontWeight: 700, mt: 2, display: "flex", alignItems: "center", gap: 1, fontSize: { xs: "1.1rem", md: "1.2rem" } }}
            >
              <Box component="span" sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "primary.main", display: "inline-block", mr: 0.75 }} />
              รายการที่พบทั้งหมด: {filteredSorted.length} รายการ
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
            ) : isError ? (
              <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper", p: 4, textAlign: "center" }}>
                <Typography color="error" fontWeight={700} mb={1}>ไม่สามารถโหลดข้อมูลคู่มือได้</Typography>
                <Button variant="outlined" color="error" onClick={() => refetch()}>ลองใหม่</Button>
              </Paper>
            ) : isSmUp ? (
              <Paper elevation={0} sx={{ bgcolor: "background.paper", borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
                <TableContainer>
                  <Table sx={{ minWidth: 800 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontSize: "1.05rem", fontWeight: 700, color: "text.secondary", bgcolor: "action.hover", py: 2.5, pl: 4, width: 80 }}>ลำดับ</TableCell>
                        <TableCell sx={{ fontSize: "1.05rem", fontWeight: 700, color: "text.secondary", bgcolor: "action.hover", py: 2.5, width: 90 }}>รูปภาพ</TableCell>
                        <TableCell sx={{ fontSize: "1.05rem", fontWeight: 700, color: "text.secondary", bgcolor: "action.hover", py: 2.5 }}>หัวข้อ / สถานที่</TableCell>
                        <TableCell sx={{ fontSize: "1.05rem", fontWeight: 700, color: "text.secondary", bgcolor: "action.hover", py: 2.5 }}>รายละเอียด</TableCell>
                        <TableCell align="center" sx={{ fontSize: "1.05rem", fontWeight: 700, color: "text.secondary", bgcolor: "action.hover", py: 2.5, width: 140 }}>กลุ่มเป้าหมาย</TableCell>
                        <TableCell align="center" sx={{ fontSize: "1.05rem", fontWeight: 700, color: "text.secondary", bgcolor: "action.hover", py: 2.5, width: 120 }}>สถานะ</TableCell>
                        <TableCell align="center" sx={{ fontSize: "1.05rem", fontWeight: 700, color: "text.secondary", bgcolor: "action.hover", py: 2.5, width: 150 }}>อัปเดตล่าสุด</TableCell>
                        <TableCell align="right" sx={{ fontSize: "1.05rem", fontWeight: 700, color: "text.secondary", bgcolor: "action.hover", py: 2.5, pr: 4, width: 110 }}>จัดการ</TableCell>
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
                <Box sx={{ px: 3, py: 2.5, bgcolor: "background.default", borderTop: "1px solid", borderColor: "divider" }}>
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
                  <Box key={r.id} sx={{ bgcolor: "background.paper", borderRadius: 3, p: 1, boxShadow: 1, border: "1px solid", borderColor: "divider" }}>
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
            <Paper elevation={16} sx={{ borderRadius: "30px", px: 1, py: 1, border: "1px solid", borderColor: "divider", bgcolor: alpha(theme.palette.background.paper, 0.95), backdropFilter: "blur(12px)" }}>
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
