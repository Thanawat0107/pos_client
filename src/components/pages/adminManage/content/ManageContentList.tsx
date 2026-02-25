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
import { useTheme, alpha } from "@mui/material/styles";
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
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: { xs: 14, md: 6 } }}>
      <Container maxWidth="xl" disableGutters={!isSmUp} sx={{ px: { xs: 3, md: 6 }, pt: { xs: 3, md: 4 } }}>
        <Stack spacing={{ xs: 2, md: 2.5 }}>

        {/* Header Section */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "flex-end" }}
          spacing={2}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
              <Typography
                sx={{ fontWeight: 800, fontSize: { xs: "1.6rem", md: "2.2rem" }, letterSpacing: "-0.02em" }}
              >
                จัดการข่าวสารและโปรโมชั่น
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
              จัดการเนื้อหาข่าวสาร โปรโมชั่น และกิจกรรมของร้าน
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
              เพิ่มรายการ
            </Button>
            <Box
              component="span"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                borderRadius: "50px",
                px: { xs: 2, md: 3 },
                py: { xs: 1, md: 1.25 },
                fontWeight: 700,
                fontSize: { xs: "0.85rem", md: "1rem" },
                border: "1.5px solid",
                borderColor: "primary.main",
                color: "primary.main",
                cursor: "pointer",
                bgcolor: "background.paper",
                "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.05) },
                gap: 0.75,
              }}
              onClick={() => window.history.back()}
            >
              ← ย้อนกลับ
            </Box>
            <Stack
              component="span"
              sx={{
                p: 1,
                borderRadius: "50%",
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                cursor: "pointer",
                alignItems: "center",
                justifyContent: "center",
                "&:hover": { bgcolor: "action.hover" },
              }}
              onClick={() => refetch()}
            >
              {isLoading ? (
                <CircularProgress size={20} color="primary" />
              ) : (
                <RefreshIcon sx={{ fontSize: "1.4rem", color: "text.secondary", display: "block" }} />
              )}
            </Stack>
          </Stack>
        </Stack>

        {/* Filter Bar */}
        <Paper elevation={0} sx={{ bgcolor: "background.paper", borderRadius: 3, border: "1px solid", borderColor: "divider", px: { xs: 2.5, md: 4 }, py: { xs: 2, md: 3 } }}>
          <ContentFilterBar
            q={filters.q}
            type={filters.type}
            status={filters.status}
            onSearch={(v) => handleFilterChange("q", v)}
            onTypeChange={(v) => handleFilterChange("type", v)}
            onStatusChange={(v) => handleFilterChange("status", v)}
          />
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2, flexWrap: "wrap", gap: 1 }}>
            <Typography
              sx={{ color: "primary.main", fontWeight: 700, display: "flex", alignItems: "center", gap: 1, fontSize: { xs: "1.1rem", md: "1.2rem" } }}
            >
              <Box component="span" sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "primary.main", display: "inline-block", mr: 0.75 }} />
              รายการที่พบทั้งหมด: {filteredSorted.length} รายการ
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
        </Paper>

        {/* Data Display - Desktop Table */}
        <Box>
          {isSmUp ? (
            <Paper elevation={0} sx={{ bgcolor: "background.paper", borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
              <TableContainer>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: "text.secondary", bgcolor: "action.hover", fontSize: "1.1rem", py: 2.5, pl: 4, width: 80 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "text.secondary", bgcolor: "action.hover", fontSize: "1.1rem", py: 2.5 }}>รูป</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "text.secondary", bgcolor: "action.hover", fontSize: "1.1rem", py: 2.5 }}>หัวข้อ / รายละเอียด</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "text.secondary", bgcolor: "action.hover", fontSize: "1.1rem", py: 2.5 }}>การใช้งาน (สิทธิ์)</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "text.secondary", bgcolor: "action.hover", fontSize: "1.1rem", py: 2.5 }}>ประเภท</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "text.secondary", bgcolor: "action.hover", fontSize: "1.1rem", py: 2.5 }}>ระยะเวลา</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "text.secondary", bgcolor: "action.hover", fontSize: "1.1rem", py: 2.5 }}>สถานะ</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "text.secondary", bgcolor: "action.hover", fontSize: "1.1rem", py: 2.5, pr: 4 }}>จัดการ</TableCell>
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
                  </TableBody>
                </Table>
              </TableContainer>
              {pageRows.length === 0 && (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <Typography variant="h6" sx={{ color: "text.secondary", fontWeight: 700 }}>ไม่พบข้อมูลที่ตรงตามเงื่อนไข</Typography>
                  <Typography sx={{ color: "text.disabled", fontSize: "0.875rem", mt: 1 }}>ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองใหม่</Typography>
                </Box>
              )}
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
            /* Data Display - Mobile List */
            <Stack spacing={2}>
              {pageRows.length > 0 ? pageRows.map((r) => (
                <Box key={r.id} sx={{ bgcolor: "background.paper", borderRadius: 3, p: 1, boxShadow: 1, border: "1px solid", borderColor: "divider" }}>
                  <MobileContentItem
                    row={r}
                    onEdit={() => handleOpenForm(r)}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                  />
                </Box>
              )) : (
                <Box textAlign="center" py={5}>
                  <Typography color="text.secondary">ไม่พบข้อมูล</Typography>
                </Box>
              )}
            </Stack>
          )}
        </Box>

        </Stack>

        {/* Mobile Pagination */}
        {!isSmUp && pageRows.length > 0 && (
          <Box sx={{ position: "fixed", bottom: 24, left: 16, right: 16, zIndex: 1200 }}>
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
      </Container>

      {/* Side Drawer Form */}
      <FormContent
        open={formState.open}
        onClose={handleCloseForm}
        initial={formState.data ?? undefined}
        onSubmit={handleSubmit}
      />
    </Box>
  );
}