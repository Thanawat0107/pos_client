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
  Alert,
  Chip,
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

  const rows: Manual[] = manualData?.result ?? [];

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
      // ส่งข้อมูลครบถ้วนตามความต้องการของ Backend
      await updateManual({
        id,
        data: { ...item, isUsed: next } as UpdateManual,
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
          ไม่สามารถโหลดข้อมูลคู่มือได้
        </Alert>
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
          <Box>
            <Typography
              variant={isSmUp ? "h5" : "h6"}
              fontWeight={800}
              color="primary"
            >
              จัดการคู่มือ & จุดบริการ
            </Typography>
            <Typography variant="caption" color="text.secondary">
              สร้างและแก้ไขคู่มือการทำงานสำหรับพนักงาน หรือจุดบริการสำหรับลูกค้า
            </Typography>
          </Box>
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
              เพิ่มคู่มือใหม่
            </Button>
          </Stack>
        </Stack>

        {/* Filter Bar */}
        <ManualFilterBar
          q={filters.q}
          role={filters.role}
          status={filters.status}
          onSearch={(v) => handleFilterChange("q", v)}
          onRoleChange={(v) => handleFilterChange("role", v)}
          onStatusChange={(v) => handleFilterChange("status", v)}
        />

        {/* Filter Chips */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}
        >
          <Typography variant="body2" color="text.secondary" fontWeight="bold">
            ทั้งหมด {filteredSorted.length} รายการ
          </Typography>
          {filters.role !== "all" && (
            <Chip
              size="small"
              label={`กลุ่มเป้าหมาย: ${filters.role}`}
              onDelete={() => handleFilterChange("role", "all")}
              color="primary"
              variant="outlined"
            />
          )}
          {filters.status !== "all" && (
            <Chip
              size="small"
              label={`สถานะ: ${filters.status === "active" ? "ใช้งาน" : "ปิด"}`}
              onDelete={() => handleFilterChange("status", "all")}
              color="primary"
              variant="outlined"
            />
          )}
          {filters.q && (
            <Chip
              size="small"
              label={`คำค้น: "${filters.q}"`}
              onDelete={() => handleFilterChange("q", "")}
              color="primary"
              variant="outlined"
            />
          )}
        </Stack>

        {/* Table Content */}
        {isSmUp ? (
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              border: "1px solid #eee",
            }}
          >
            <TableContainer>
              <Table size="medium">
                <TableHead sx={{ bgcolor: "#f8f9fa" }}>
                  <TableRow>
                    <TableCell
                      width={60}
                      align="center"
                      sx={{ fontWeight: "bold" }}
                    >
                      #
                    </TableCell>
                    <TableCell width={100} sx={{ fontWeight: "bold" }}>
                      ไฟล์
                    </TableCell>
                    {/* [แก้ไข] เพิ่ม Header หัวข้อและสถานที่ */}
                    <TableCell sx={{ fontWeight: "bold" }}>
                      หัวข้อ / สถานที่
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      รายละเอียด
                    </TableCell>
                    <TableCell width={130} sx={{ fontWeight: "bold" }}>
                      กลุ่มเป้าหมาย
                    </TableCell>
                    <TableCell width={120} sx={{ fontWeight: "bold" }}>
                      สถานะ
                    </TableCell>
                    <TableCell width={150} sx={{ fontWeight: "bold" }}>
                      อัปเดตล่าสุด
                    </TableCell>
                    <TableCell
                      width={110}
                      align="right"
                      sx={{ fontWeight: "bold" }}
                    >
                      จัดการ
                    </TableCell>
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
                  {pageRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <Box sx={{ py: 10, textAlign: "center" }}>
                          <Typography color="text.secondary">
                            ไม่พบข้อมูลคู่มือที่คุณค้นหา
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box
              sx={{
                p: 2,
                borderTop: "1px solid",
                borderColor: "divider",
                bgcolor: "#fcfcfc",
              }}
            >
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
          /* Mobile View */
          <Stack spacing={1.5}>
            {pageRows.length === 0 ? (
              <Paper
                sx={{ p: 6, textAlign: "center", borderRadius: 3 }}
                variant="outlined"
              >
                <Typography color="text.secondary">ไม่พบข้อมูล</Typography>
              </Paper>
            ) : (
              pageRows.map((r, i) => (
                <MobileManualItem
                  key={r.id}
                  row={r}
                  index={(page - 1) * pageSize + i + 1}
                  onEdit={() => handleOpenForm(r)}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                />
              ))
            )}

            <Stack alignItems="center" sx={{ pt: 2, pb: 4 }}>
              <PaginationBar
                page={page}
                pageSize={pageSize}
                totalCount={filteredSorted.length}
                onPageChange={setPage}
                onPageSizeChange={handlePageSizeChange}
                showPageSizeSelect={false}
                showSummary={false}
              />
            </Stack>
          </Stack>
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
