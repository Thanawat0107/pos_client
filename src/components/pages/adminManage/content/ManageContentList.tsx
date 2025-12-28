/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { useMemo, useState } from "react"; // ลบ useEffect ออกจาก import เพราะไม่ได้ใช้แล้ว

// Components
import ManageContentItem from "./ManageContentItem";
import FormContent from "./FormContent";
import PaginationBar from "../../../layouts/PaginationBar";

// API
import {
  useGetContentsQuery,
  useCreateContentMutation,
  useUpdateContentMutation,
  useDeleteContentMutation,
} from "../../../../services/contentApi";

import type { Content } from "../../../../@types/dto/Content";
import type { CreateContent } from "../../../../@types/createDto/CreateContent";
import type { UpdateContent } from "../../../../@types/UpdateDto/UpdateContent";
import ContentFilterBar from "../ContentFilterBar";
import MobileContentItem from "./MobileContentItem";

// ✅ สร้างตัวแปร Array ว่างไว้นอก Component เพื่อป้องกัน Memory Reference เปลี่ยนทุกครั้งที่ Render
const EMPTY_ARRAY: Content[] = [];

export default function ManageContentList() {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

  const [filters, setFilters] = useState({
    q: "",
    type: "all",
    status: "all",
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formState, setFormState] = useState<{
    open: boolean;
    data: Content | null;
  }>({
    open: false,
    data: null,
  });

  // Call API
  const {
    data: contentData,
    isLoading,
    isError,
    refetch,
  } = useGetContentsQuery({
    pageNumber: 1,
    pageSize: 1000,
  });

  const [createContent, { isLoading: isCreating }] = useCreateContentMutation();
  const [updateContent, { isLoading: isUpdating }] = useUpdateContentMutation();
  const [deleteContent, { isLoading: isDeleting }] = useDeleteContentMutation();

  // ✅ ใช้ EMPTY_ARRAY แทน [] เพื่อประสิทธิภาพที่ดีขึ้น
  const rows: Content[] = contentData?.result ?? EMPTY_ARRAY;

  // Client-side Filtering
  const filteredSorted = useMemo(() => {
    const { q, type, status } = filters;
    const searchLower = q.trim().toLowerCase();

    return rows
      .filter((r) => {
        const matchesQ =
          !q ||
          r.title.toLowerCase().includes(searchLower) ||
          r.description.toLowerCase().includes(searchLower);

        const matchesType = type === "all" || r.contentType === type;

        const isActive = r.isUsed;
        const matchesStatus =
          status === "all" || (status === "active" ? isActive : !isActive);

        return matchesQ && matchesType && matchesStatus;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [rows, filters]);

  const pageRows = filteredSorted.slice((page - 1) * pageSize, page * pageSize);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // ✅ ย้ายคำสั่งรีเซ็ตหน้ามาไว้ตรงนี้แทน ปลอดภัยกว่า
  };

  const handleOpenForm = (item: Content | null = null) => {
    setFormState({ open: true, data: item });
  };

  const handleCloseForm = () => {
    setFormState({ open: false, data: null });
  };

  const handleDelete = async (id: number) => {
    if (confirm("ยืนยันลบรายการนี้?")) {
      await deleteContent(id).unwrap().catch(console.error);
    }
  };

  const handleToggleActive = async (id: number, next: boolean) => {
    const item = rows.find((r) => r.id === id);
    if (!item) return;
    try {
      await updateContent({
        id,
        data: { ...item, isUsed: next } as UpdateContent,
      }).unwrap();
    } catch (error) {
      alert("เปลี่ยนสถานะไม่สำเร็จ");
    }
  };

  const handleSubmit = async (
    data: CreateContent | UpdateContent,
    id?: number
  ) => {
    try {
      if (id) {
        await updateContent({ id, data: data as UpdateContent }).unwrap();
      } else {
        await createContent(data as CreateContent).unwrap();
      }
      handleCloseForm();
    } catch (error) {
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
        <Alert severity="error">ไม่สามารถโหลดข้อมูลได้</Alert>
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
            จัดการข่าวสารและโปรโมชั่น
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
              เพิ่มรายการ
            </Button>
          </Stack>
        </Stack>

        <ContentFilterBar
          q={filters.q}
          type={filters.type}
          status={filters.status}
          onSearch={(v) => handleFilterChange("q", v)}
          onTypeChange={(v) => handleFilterChange("type", v)}
          onStatusChange={(v) => handleFilterChange("status", v)}
        />

        {/* Active Filters Chips */}
        <Stack
          direction="row"
          spacing={1}
          sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}
        >
          <Typography variant="body2" color="text.secondary">
            พบ {filteredSorted.length} รายการ
          </Typography>
          {filters.type !== "all" && (
            <Chip
              label={`Type: ${filters.type}`}
              onDelete={() => handleFilterChange("type", "all")}
              size="small"
            />
          )}
          {filters.status !== "all" && (
            <Chip
              label={`Status: ${filters.status}`}
              onDelete={() => handleFilterChange("status", "all")}
              size="small"
            />
          )}
        </Stack>

        {isSmUp ? (
          <Paper
            variant="outlined"
            sx={{ borderRadius: 2, overflow: "hidden" }}
          >
            <TableContainer>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">#</TableCell>
                    <TableCell>รูป</TableCell>
                    <TableCell>หัวข้อ / รายละเอียด</TableCell>
                    <TableCell>ประเภท</TableCell>
                    <TableCell>ระยะเวลา</TableCell>
                    <TableCell>สถานะ</TableCell>
                    <TableCell align="right">จัดการ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pageRows.map((r, i) => (
                    <ManageContentItem
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
                      <TableCell
                        colSpan={7}
                        align="center"
                        sx={{ py: 4, color: "text.secondary" }}
                      >
                        ไม่พบข้อมูล
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
              />
            </Box>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {pageRows.map((r) => (
              <MobileContentItem
                key={r.id}
                row={r}
                onEdit={() => handleOpenForm(r)}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
              />
            ))}
            <Stack alignItems="center">
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

        <FormContent
          open={formState.open}
          onClose={handleCloseForm}
          initial={formState.data ?? undefined}
          onSubmit={handleSubmit}
        />
      </Container>
    </Box>
  );
}
