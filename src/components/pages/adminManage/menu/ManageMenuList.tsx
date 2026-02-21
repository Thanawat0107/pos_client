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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
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
      <Box className="flex flex-col justify-center items-center min-h-[400px] gap-4">
        <CircularProgress size={60} thickness={4} sx={{ color: "#D32F2F" }} />
        <Typography variant="h6" className="text-gray-600 font-bold text-xl">
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
    <Box className="min-h-screen bg-[#F5F6F8] pb-28 md:pb-12 font-sans">
      <Container
        maxWidth="xl"
        disableGutters={!isSmUp}
        className="px-6 md:px-12 pt-6 md:pt-8"
      >
        {/* ใช้ Stack สร้างระยะห่าง (Gap) ระหว่าง Section ให้ขาดออกจากกันอย่างชัดเจน */}
        <Stack spacing={{ xs: 2, md: 2.5 }}>
          {/* =========================================
              1. Header & Buttons Section 
             ========================================= */}
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-end"
              className="mb-3"
            >
              <Box>
                <Typography
                  className="text-gray-900"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "1.6rem", md: "2.2rem" },
                    letterSpacing: "-0.02em",
                  }}
                >
                  จัดการเมนูอาหาร
                </Typography>
                <Typography
                  className="text-gray-500"
                  sx={{ fontSize: { xs: "0.875rem", md: "1rem" }, mt: 0.25 }}
                >
                  ตรวจสอบ เพิ่ม แก้ไข หรือปิดการขายรายการอาหาร
                </Typography>
              </Box>
            </Stack>

            {/* กลุ่มปุ่มกด - ทรง Pill สีแดงตามแบบ */}
            <Stack
              direction="row"
              spacing={1.5}
              className="overflow-x-auto pb-1 no-scrollbar"
              alignItems="center"
              sx={{ flexWrap: "nowrap" }}
            >
              <Button
                variant="contained"
                startIcon={<AddIcon sx={{ fontSize: { xs: "1.25rem !important", md: "1.75rem !important" } }} />}
                onClick={() => handleOpenForm()}
                className="bg-[#E63946] hover:bg-[#D32F2F] shadow-md hover:shadow-lg whitespace-nowrap"
                sx={{
                  borderRadius: "50px",
                  px: { xs: 2, md: 4 },
                  py: { xs: 1, md: 1.5 },
                  fontSize: { xs: "0.9rem", md: "1.25rem" },
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                เพิ่มเมนูใหม่
              </Button>
              <Button
                component={Link}
                to="/manage-menuItemOption"
                variant="outlined"
                className="bg-white border-[#E63946] text-[#E63946] hover:bg-red-50 shadow-sm whitespace-nowrap"
                sx={{
                  borderRadius: "50px",
                  px: { xs: 2, md: 3 },
                  py: { xs: 1, md: 1.25 },
                  fontSize: { xs: "0.85rem", md: "1.15rem" },
                  fontWeight: 600,
                  borderWidth: "1.5px",
                  flexShrink: 0,
                  "&:hover": { borderWidth: "1.5px" },
                }}
              >
                จัดการตัวเลือกเพิ่มเติม
              </Button>
              <Button
                component={Link}
                to="/manage-recipe"
                variant="outlined"
                className="bg-white border-[#E63946] text-[#E63946] hover:bg-red-50 shadow-sm whitespace-nowrap"
                sx={{
                  borderRadius: "50px",
                  px: { xs: 2, md: 3 },
                  py: { xs: 1, md: 1.25 },
                  fontSize: { xs: "0.85rem", md: "1.15rem" },
                  fontWeight: 600,
                  borderWidth: "1.5px",
                  flexShrink: 0,
                  "&:hover": { borderWidth: "1.5px" },
                }}
              >
                สูตรอาหาร
              </Button>

              {/* ปุ่มรีเฟรช */}
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
              2. Filter Section (แยกใส่กล่องสีขาวชัดเจน)
             ========================================= */}
          <Paper
            elevation={0}
            className="bg-white rounded-[24px] shadow-sm border border-gray-200"
            sx={{ px: { xs: 2.5, md: 4 }, py: { xs: 2, md: 3 } }}
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
            {/* ตัวหนังสือ "รายการที่พบทั้งหมด" สีแดงตามภาพ */}
            <Typography
              className="text-[#E63946] font-bold mt-4 flex items-center gap-2"
              sx={{ fontSize: { xs: "1.1rem", md: "1.2rem" }, fontWeight: 700 }}
            >
              <span className="h-2 w-2 rounded-full bg-[#E63946]"></span>
              รายการที่พบทั้งหมด: {filteredSorted.length} รายการ
            </Typography>
          </Paper>

          {/* =========================================
              3. Content Box (ตาราง / รายการมือถือ)
             ========================================= */}
          <Box>
            {isSmUp ? (
              // Desktop Table Box
              <Paper
                elevation={0}
                className="border border-gray-200 rounded-[24px] overflow-hidden bg-white shadow-sm"
              >
                <TableContainer>
                  <Table sx={{ minWidth: 900 }}>
                    <TableHead className="bg-[#F8FAFC]">
                      <TableRow>
                        <TableCell
                          className="font-bold text-gray-700"
                          sx={{ fontSize: "1.1rem", py: 2.5, pl: 4 }}
                        >
                          ลำดับ
                        </TableCell>
                        <TableCell
                          className="font-bold text-gray-700"
                          sx={{ fontSize: "1.1rem", py: 2.5 }}
                        >
                          รูปภาพ
                        </TableCell>
                        <TableCell
                          className="font-bold text-gray-700"
                          sx={{ fontSize: "1.1rem", py: 2.5 }}
                        >
                          ชื่อเมนู / รายละเอียด
                        </TableCell>
                        <TableCell
                          align="right"
                          className="font-bold text-gray-700"
                          sx={{ fontSize: "1.1rem", py: 2.5 }}
                        >
                          ราคา
                        </TableCell>
                        <TableCell
                          className="font-bold text-gray-700"
                          sx={{ fontSize: "1.1rem", py: 2.5 }}
                        >
                          หมวดหมู่
                        </TableCell>
                        <TableCell
                          className="font-bold text-gray-700"
                          sx={{ fontSize: "1.1rem", py: 2.5 }}
                        >
                          สถานะการขาย
                        </TableCell>
                        <TableCell
                          align="right"
                          className="font-bold text-gray-700"
                          sx={{ fontSize: "1.1rem", py: 2.5, pr: 4 }}
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
                <Box className="px-6 py-5 bg-gray-50/50 border-t border-gray-100">
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
                      className="bg-white rounded-[24px] p-2 shadow-sm border border-gray-200"
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
                  <Box className="text-center py-16 bg-white rounded-[24px] border border-gray-200 shadow-sm">
                    <RestaurantMenuIcon className="text-gray-300 text-7xl mb-4" />
                    <Typography
                      variant="h6"
                      className="text-gray-500 font-bold"
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
          <Box className="fixed bottom-6 left-4 right-4 z-[1200]">
            <Paper
              elevation={16}
              className="rounded-[30px] px-2 py-2 border border-gray-200 bg-white/95 backdrop-blur-md shadow-2xl"
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
