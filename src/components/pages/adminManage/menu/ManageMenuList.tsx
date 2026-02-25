/* eslint-disable @typescript-eslint/no-unused-vars */
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
  CircularProgress,
  Alert,
  Tooltip,
  IconButton,
  Chip,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

// Components
import MenuFilterBar from "../MenuFilterBar";
import MobileMenuItem from "./MobileMenuItem";
import ManageMenuItem from "./ManageMenuItem";
import FormMenu from "./FormMenu";
import PaginationBar from "../../../layouts/PaginationBar";

// Types & APIs
import type { MenuItemDto } from "../../../../@types/dto/MenuItem";
import type { CreateMenuItem } from "../../../../@types/createDto/createMenuItem";
import type { UpdateMenuItem } from "../../../../@types/UpdateDto/updateMenuItem";
import type { MenuItemOption } from "../../../../@types/dto/MenuItemOption";
import {
  useCreateMenuItemMutation,
  useDeleteMenuItemMutation,
  useGetMenuItemsQuery,
  useUpdateMenuItemMutation,
} from "../../../../services/menuItemApi";
import { useGetMenuItemOptionsQuery } from "../../../../services/menuItemOptionApi";
import { useGetCategoriesQuery } from "../../../../services/categoriesApi";

type StatusFilter = "all" | "active" | "inactive";

export default function ManageMenuList() {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  // const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  // --- States ---
  const [filters, setFilters] = useState({
    q: "",
    cat: "all",
    status: "all" as StatusFilter,
  });
  const [formState, setFormState] = useState<{
    open: boolean;
    data: MenuItemDto | null;
  }>({ open: false, data: null });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // --- Data Fetching ---
  const {
    data: menuData,
    isLoading,
    isError,
    refetch,
  } = useGetMenuItemsQuery({ pageNumber: 1, pageSize: 1000 });
  const { data: optionData } = useGetMenuItemOptionsQuery({
    pageNumber: 1,
    pageSize: 1000,
  });
  const { data: categoryData } = useGetCategoriesQuery({
    pageNumber: 1,
    pageSize: 1000,
  });

  const rows: MenuItemDto[] = menuData?.result ?? [];
  const optionList: MenuItemOption[] = optionData?.result ?? [];
  const categories = categoryData?.result ?? [];

  // --- Mutations ---
  const [createMenuItem] =
    useCreateMenuItemMutation();
  const [updateMenuItem] =
    useUpdateMenuItemMutation();
  const [deleteMenuItem] =
    useDeleteMenuItemMutation();
  // const isBusy = isCreating || isUpdating || isDeleting;

  // --- Logic Filtering ---
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const filteredSorted = useMemo(() => {
    const { q, cat, status } = filters;
    const searchLower = q.trim().toLowerCase();
    return rows
      .filter((r) => {
        const matchesQ =
          !q ||
          r.name.toLowerCase().includes(searchLower) ||
          r.description?.toLowerCase().includes(searchLower);
        const matchesCat = cat === "all" || String(r.menuCategoryId) === cat;
        const isActive = r.isUsed && !r.isDeleted;
        const matchesStatus =
          status === "all" || (status === "active" ? isActive : !isActive);
        return matchesQ && matchesCat && matchesStatus;
      })
      .sort((a, b) => b.id - a.id);
  }, [rows, filters]);

  const pageRows = filteredSorted.slice((page - 1) * pageSize, page * pageSize);

  // --- Event Handlers ---
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };
  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  const handleOpenForm = (item: MenuItemDto | null = null) => {
    setFormState({ open: true, data: item });
  };
  const handleCloseForm = () => {
    setFormState({ open: false, data: null });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("คุณมั่นใจหรือไม่ว่าต้องการลบเมนูนี้?")) {
      try {
        await deleteMenuItem(id).unwrap();
      } catch (err) {
        alert("ไม่สามารถลบข้อมูลได้");
      }
    }
  };

  const handleToggleActive = async (id: number, nextStatus: boolean) => {
    const item = rows.find((r) => r.id === id);
    if (!item) return;
    try {
      await updateMenuItem({
        id,
        data: {
          ...item,
          isUsed: nextStatus,
          menuItemOptionGroups: item.menuItemOptionGroups.map((g) => ({
            id: (g as any).id,
            menuItemOptionId: g.menuItemOptionId,
          })),
        } as UpdateMenuItem,
      }).unwrap();
    } catch (error) {
      alert("เปลี่ยนสถานะไม่สำเร็จ");
    }
  };

  const handleSubmit = async (
    data: CreateMenuItem | UpdateMenuItem,
    id?: number,
  ) => {
    try {
      if (id) {
        await updateMenuItem({ id, data: data as UpdateMenuItem }).unwrap();
      } else {
        await createMenuItem(data as CreateMenuItem).unwrap();
      }
      handleCloseForm();
    } catch (error) {
      alert("บันทึกข้อมูลไม่สำเร็จ");
    }
  };

  if (isLoading)
    return (
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: 400, gap: 2 }}>
        <CircularProgress size={60} thickness={4} color="primary" />
        <Typography variant="h6" sx={{ color: "text.secondary", fontWeight: 700, fontSize: "1.25rem" }}>
          กำลังโหลดข้อมูลเมนู...
        </Typography>
      </Box>
    );

  if (isError)
    return (
      <Box p={4} className="max-w-xl mx-auto mt-10">
        <Alert
          severity="error"
          variant="filled"
          action={
            <Button color="inherit" onClick={() => refetch()}>
              ลองใหม่
            </Button>
          }
          className="rounded-2xl text-lg"
        >
          เกิดข้อผิดพลาด ไม่สามารถโหลดข้อมูลได้
        </Alert>
      </Box>
    );

  return (
    // สีพื้นหลังเป็นสีเทาอ่อน เพื่อให้กล่องสีขาวด้านในลอยเด่นขึ้นมา
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: { xs: 14, md: 6 } }}>
      <Container
        maxWidth="xl"
        disableGutters={!isSmUp}
        sx={{ px: { xs: 3, md: 6 }, pt: { xs: 3, md: 4 } }}
      >
        {/* ใช้ Stack สร้างระยะห่าง (Gap) ระหว่าง Section ให้ขาดออกจากกันอย่างชัดเจน */}
        <Stack spacing={{ xs: 2, md: 2.5 }}>
          {/* =========================================
              1. Header & Buttons Section 
             ========================================= */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "flex-end" }}
            spacing={2}
          >
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
                <RestaurantMenuIcon sx={{ fontSize: { xs: "1.6rem", md: "2rem" }, color: "primary.main" }} />
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "1.6rem", md: "2.2rem" },
                    letterSpacing: "-0.02em",
                  }}
                >
                  จัดการเมนูอาหาร
                </Typography>
                <Chip
                  size="small"
                  label={`${rows.length} รายการ`}
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
              <Typography
                sx={{ color: "text.secondary", fontSize: { xs: "0.875rem", md: "1rem" }, mt: 0.25 }}
              >
                ตรวจสอบ เพิ่ม แก้ไข หรือปิดการขายรายการอาหาร
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenForm()}
                sx={{
                  borderRadius: "50px",
                  px: { xs: 2, md: 3 },
                  py: { xs: 1, md: 1.25 },
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: { xs: "0.85rem", md: "1rem" },
                }}
              >
                เพิ่มเมนูใหม่
              </Button>
              <Button
                component={Link}
                to="/manage-menuItemOption"
                variant="outlined"
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
                ตัวเลือกเพิ่มเติม
              </Button>
              <Button
                component={Link}
                to="/manage-recipe"
                variant="outlined"
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
                สูตรอาหาร
              </Button>
              {/* ปุ่มรีเฟรช */}
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
              2. Filter Section (แยกใส่กล่องสีขาวชัดเจน)
             ========================================= */}
          <Paper
            elevation={0}
            sx={{ bgcolor: "background.paper", borderRadius: 3, border: "1px solid", borderColor: "divider", px: { xs: 2.5, md: 4 }, py: { xs: 2, md: 3 } }}
          >
            <MenuFilterBar
              q={filters.q}
              cat={filters.cat}
              status={filters.status}
              categories={categories}
              onSearch={(v: any) => handleFilterChange("q", v)}
              onCategoryChange={(v: any) => handleFilterChange("cat", v)}
              onStatusChange={(v: any) => handleFilterChange("status", v)}
            />
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "primary.main", flexShrink: 0 }} />
              <Typography
                sx={{ color: "primary.main", fontWeight: 700, fontSize: { xs: "1.1rem", md: "1.2rem" } }}
              >
                รายการที่พบทั้งหมด: {filteredSorted.length} รายการ
              </Typography>
            </Stack>
          </Paper>

          {/* =========================================
              3. Content Box (ตาราง / รายการมือถือ)
             ========================================= */}
          <Box>
            {isSmUp ? (
              <Paper
                elevation={0}
                sx={{ bgcolor: "background.paper", borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}
              >
                <TableContainer>
                  <Table sx={{ minWidth: 900 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{ fontWeight: 700, color: "text.secondary", fontSize: "1.1rem", bgcolor: "action.hover", py: 2.5, pl: 4 }}
                        >
                          ลำดับ
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: 700, color: "text.secondary", fontSize: "1.1rem", bgcolor: "action.hover", py: 2.5 }}
                        >
                          รูปภาพ
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: 700, color: "text.secondary", fontSize: "1.1rem", bgcolor: "action.hover", py: 2.5 }}
                        >
                          ชื่อเมนู / รายละเอียด
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: 700, color: "text.secondary", fontSize: "1.1rem", bgcolor: "action.hover", py: 2.5 }}
                        >
                          ราคา
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: 700, color: "text.secondary", fontSize: "1.1rem", bgcolor: "action.hover", py: 2.5 }}
                        >
                          หมวดหมู่
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: 700, color: "text.secondary", fontSize: "1.1rem", bgcolor: "action.hover", py: 2.5 }}
                        >
                          สถานะการขาย
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: 700, color: "text.secondary", fontSize: "1.1rem", bgcolor: "action.hover", py: 2.5, pr: 4 }}
                        >
                          จัดการ
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pageRows.map((r, i) => (
                        <ManageMenuItem
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
                <Box sx={{ px: 3, py: 2.5, bgcolor: "background.default", borderTop: "1px solid", borderColor: "divider" }}>
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
              // Mobile View List
              <Stack spacing={2}>
                {pageRows.length > 0 ? (
                  pageRows.map((r, i) => (
                    <Box
                      key={r.id}
                      sx={{ bgcolor: "background.paper", borderRadius: 3, p: 1, boxShadow: 1, border: "1px solid", borderColor: "divider" }}
                    >
                      <MobileMenuItem
                        row={r}
                        index={(page - 1) * pageSize + i + 1}
                        onEdit={() => handleOpenForm(r)}
                        onDelete={handleDelete}
                        onToggleActive={handleToggleActive}
                      />
                    </Box>
                  ))
                ) : (
                  <Box sx={{ textAlign: "center", py: 8, bgcolor: "background.paper", borderRadius: 3, border: "1px solid", borderColor: "divider", boxShadow: 1 }}>
                    <RestaurantMenuIcon sx={{ fontSize: "4.5rem", color: "text.disabled", mb: 2 }} />
                    <Typography
                      variant="h6"
                      sx={{ color: "text.secondary", fontWeight: 700 }}
                    >
                      ไม่พบเมนูที่คุณค้นหา
                    </Typography>
                  </Box>
                )}
              </Stack>
            )}
          </Box>
        </Stack>

        {/* 4. Floating Mobile Pagination (กล่องโค้งมนด้านล่าง) */}
        {!isSmUp && (
          <Box sx={{ position: "fixed", bottom: 24, left: 16, right: 16, zIndex: 1200 }}>
            <Paper
              elevation={16}
              sx={{ borderRadius: "30px", px: 1, py: 1, border: "1px solid", borderColor: "divider", bgcolor: alpha(theme.palette.background.paper, 0.95), backdropFilter: "blur(12px)" }}
            >
              <PaginationBar
                page={page}
                pageSize={pageSize}
                totalCount={filteredSorted.length}
                onPageChange={setPage}
                showPageSizeSelect={false}
                showSummary={true}
              />
            </Paper>
          </Box>
        )}
      </Container>

      <FormMenu
        open={formState.open}
        onClose={handleCloseForm}
        initial={formState.data ?? undefined}
        categories={categories}
        optionList={optionList}
        onSubmit={handleSubmit}
      />
    </Box>
  );
}
