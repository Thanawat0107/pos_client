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
import { useMemo, useState } from "react"; 

// Components
import ManageContentItem from "./ManageContentItem";
import FormContent from "./FormContent";
import PaginationBar from "../../../layouts/PaginationBar";
import ContentFilterBar from "../ContentFilterBar";
import MobileContentItem from "./MobileContentItem";

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

  // Call API - ดึงข้อมูลทั้งหมดมาจัดการฝั่ง Client ตามลอจิกเดิมของคุณ
  const {
    data: contentData,
    isLoading,
    isError,
    refetch,
  } = useGetContentsQuery({
    pageNumber: 1,
    pageSize: 1000, // ดึงมาเยอะๆ เพื่อทำ Client-side filtering/sorting
  });

  const [createContent, { isLoading: isCreating }] = useCreateContentMutation();
  const [updateContent, { isLoading: isUpdating }] = useUpdateContentMutation();
  const [deleteContent, { isLoading: isDeleting }] = useDeleteContentMutation();

  // ✅ ใช้ EMPTY_ARRAY แทน [] เพื่อประสิทธิภาพที่ดีขึ้น
  const rows: Content[] = contentData?.result ?? EMPTY_ARRAY;

  // Client-side Filtering & Sorting
  const filteredSorted = useMemo(() => {
    const { q, type, status } = filters;
    const searchLower = q.trim().toLowerCase();

    return rows
      .filter((r) => {
        // 1. ค้นหาจาก Title หรือ Description
        const matchesQ =
          !q ||
          r.title.toLowerCase().includes(searchLower) ||
          (r.description && r.description.toLowerCase().includes(searchLower));

        // 2. กรองตามประเภท
        const matchesType = type === "all" || r.contentType === type;

        // 3. กรองตามสถานะ (Active / Inactive / Sold Out)
        const isActive = r.isUsed;
        const isSoldOut = r.maxUsageCount ? r.currentUsageCount >= r.maxUsageCount : false;
        
        let matchesStatus = true;
        if (status === "active") matchesStatus = isActive && !isSoldOut;
        if (status === "inactive") matchesStatus = !isActive;
        if (status === "soldout") matchesStatus = isSoldOut;

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
    setPage(1);
  };

  const handleOpenForm = (item: Content | null = null) => {
    setFormState({ open: true, data: item });
  };

  const handleCloseForm = () => {
    setFormState({ open: false, data: null });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("ยืนยันลบรายการนี้?")) {
      await deleteContent(id).unwrap().catch((err) => {
          console.error(err);
          alert("ไม่สามารถลบข้อมูลได้");
      });
    }
  };

  const handleToggleActive = async (id: number, next: boolean) => {
    const item = rows.find((r) => r.id === id);
    if (!item) return;
    try {
      // ใช้เฉพาะฟิลด์ที่ต้องการอัปเดตตาม UpdateContent DTO
      const updateData: UpdateContent = {
        isUsed: next
      };
      await updateContent({
        id,
        data: updateData,
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
    } catch (error: any) {
      console.error(error);
      alert(error?.data?.message || "บันทึกข้อมูลไม่สำเร็จ");
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
        <Alert severity="error">ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง</Alert>
      </Box>
    );

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <Container maxWidth="xl">
        {/* Header Section */}
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

        {/* Filter Bar */}
        <ContentFilterBar
          q={filters.q}
          type={filters.type}
          status={filters.status}
          onSearch={(v) => handleFilterChange("q", v)}
          onTypeChange={(v) => handleFilterChange("type", v)}
          onStatusChange={(v) => handleFilterChange("status", v)}
        />

        {/* Info & Active Filters Chips */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
            พบทั้งหมด {filteredSorted.length} รายการ
          </Typography>
          {filters.type !== "all" && (
            <Chip
              label={`ประเภท: ${filters.type}`}
              onDelete={() => handleFilterChange("type", "all")}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
          {filters.status !== "all" && (
            <Chip
              label={`สถานะ: ${filters.status}`}
              onDelete={() => handleFilterChange("status", "all")}
              size="small"
              color="secondary"
              variant="outlined"
            />
          )}
        </Stack>

        {/* Data Display - Desktop Table */}
        {isSmUp ? (
          <Paper
            variant="outlined"
            sx={{ borderRadius: 2, overflow: "hidden", bgcolor: "background.paper" }}
          >
            <TableContainer>
              <Table size="medium">
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.50" }}>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>#</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>รูป</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>หัวข้อ / รายละเอียด</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>การใช้งาน (สิทธิ์)</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>ประเภท</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>ระยะเวลา</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>สถานะ</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>จัดการ</TableCell>
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
                        colSpan={8}
                        align="center"
                        sx={{ py: 8, color: "text.secondary" }}
                      >
                        <Typography variant="body1">ไม่พบข้อมูลที่ตรงตามเงื่อนไข</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Pagination Desktop */}
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
          /* Data Display - Mobile List */
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
            {pageRows.length === 0 && (
              <Box textAlign="center" py={5}>
                <Typography color="text.secondary">ไม่พบข้อมูล</Typography>
              </Box>
            )}
            
            {/* Pagination Mobile */}
            <Stack alignItems="center" py={2}>
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

        {/* Side Drawer Form */}
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