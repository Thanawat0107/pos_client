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

  const filteredSorted = useMemo(() => {
    const { q, role, status } = filters;
    const searchLower = q.trim().toLowerCase();

    return rows
      .filter((r) => {
        const matchesQ =
          !q ||
          r.content.toLowerCase().includes(searchLower) ||
          r.category.toLowerCase().includes(searchLower);

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
    if (confirm("ยืนยันลบข้อมูลนี้?")) {
      await deleteManual(id)
        .unwrap()
        .catch((err) => console.error(err));
    }
  };

  const handleToggleActive = async (id: number, next: boolean) => {
    const item = rows.find((r) => r.id === id);
    if (!item) return;

    try {
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
    id?: number
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
          ไม่สามารถโหลดข้อมูล Manual ได้
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
          <Typography variant={isSmUp ? "h5" : "h6"} fontWeight={800}>
            จัดการคู่มือ (Manuals)
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
              เพิ่มคู่มือ
            </Button>
          </Stack>
        </Stack>

        {/* 3. Filter Bar */}
        <ManualFilterBar
          q={filters.q}
          role={filters.role}
          status={filters.status}
          onSearch={(v) => handleFilterChange("q", v)}
          onRoleChange={(v) => handleFilterChange("role", v)}
          onStatusChange={(v) => handleFilterChange("status", v)}
        />

        {/* 4. Chips แสดงสถานะการกรอง (เหมือน MenuList) */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            พบ {filteredSorted.length} รายการ
          </Typography>
          {filters.role !== "all" && (
            <Chip
              size="small"
              variant="outlined"
              label={`Role: ${filters.role}`}
              onDelete={() => handleFilterChange("role", "all")}
            />
          )}
          {filters.status !== "all" && (
            <Chip
              size="small"
              variant="outlined"
              label={`Status: ${filters.status === "active" ? "ใช้งาน" : "ปิด"}`}
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
                    <TableCell width={60} align="center">#</TableCell>
                    <TableCell width={100}>ไฟล์</TableCell>
                    <TableCell>รายละเอียด</TableCell>
                    <TableCell width={140}>สิทธิ์เข้าถึง</TableCell>
                    <TableCell width={140}>สถานะ</TableCell>
                    <TableCell width={180}>อัปเดตล่าสุด</TableCell>
                    <TableCell width={120} align="right">การทำงาน</TableCell>
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
                      <TableCell colSpan={7}>
                        <Box sx={{ py: 6, textAlign: "center" }}>
                          <Typography color="text.secondary">
                            {isLoading ? "กำลังโหลด..." : "ไม่พบข้อมูลตามเงื่อนไข"}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

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
              <Paper sx={{ p: 4, textAlign: "center" }} variant="outlined">
                <Typography color="text.secondary">
                  {isLoading ? "กำลังโหลด..." : "ไม่พบข้อมูลตามเงื่อนไข"}
                </Typography>
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