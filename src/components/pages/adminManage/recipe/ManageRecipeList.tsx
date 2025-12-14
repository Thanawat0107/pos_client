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
  Chip,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useDebounced } from "../../../../hooks/useDebounced";

// Components
import ManageRecipeItem from "./ManageRecipeItem";
import FormRecipe from "./FormRecipe";
import MobileRecipeItem from "./MobileRecipeItem";
import RecipeFilterBar from "../RecipeFilterBar";
import PaginationBar from "../../../layouts/PaginationBar";

// Types
import type { Recipe } from "../../../../@types/dto/Recipe";
import type { CreateRecipe } from "../../../../@types/createDto/CreateRecipe";
import type { UpdateRecipe } from "../../../../@types/UpdateDto/UpdateRecipe";

// API Hooks
import {
  useCreateRecipeMutation,
  useDeleteRecipeMutation,
  useGetRecipesQuery,
  useUpdateRecipeMutation,
} from "../../../../services/recipesApi";
import { useGetMenuItemsQuery } from "../../../../services/menuItemApi";
// 1. เพิ่ม Hook สำหรับดึง Menu Items (Path สมมติ)
export default function ManageRecipeList() {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

  // 1. State
  const [filters, setFilters] = useState({
    q: "",
    status: "all" as "all" | "active" | "inactive",
  });
  const dq = useDebounced(filters.q, 300);

  const [formState, setFormState] = useState<{
    open: boolean;
    data: Recipe | null;
  }>({
    open: false,
    data: null,
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(isSmUp ? 8 : 6);

  // 2. API Hooks
  const { data, isLoading, refetch } = useGetRecipesQuery({
    pageNumber: 1,
    pageSize: 1000, 
  });

  // 2.1 ดึงข้อมูล Menu เพื่อเอาไปใช้ใน Select/Autocomplete
  const { data: menuData } = useGetMenuItemsQuery({
    pageNumber: 1,
    pageSize: 1000, // ดึงมาทั้งหมดเพื่อให้เลือกได้ครบ
  });
  const menuList = menuData?.result ?? [];

  const [createRecipe, { isLoading: isCreating }] = useCreateRecipeMutation();
  const [updateRecipe, { isLoading: isUpdating }] = useUpdateRecipeMutation();
  const [deleteRecipe, { isLoading: isDeleting }] = useDeleteRecipeMutation();

  const rows: Recipe[] = data?.result ?? [];

  // 3. Reset Page
  useEffect(() => {
    setPage(1);
  }, [dq, filters.status, pageSize]);

  // 4. Filter Logic
  const filtered = useMemo(() => {
    const search = dq.trim().toLowerCase();
    return rows.filter((r) => {
      const name = r.menuItemName || "";
      const matchQ =
        !search ||
        name.toLowerCase().includes(search) ||
        r.instructions.toLowerCase().includes(search);
      const matchStatus =
        filters.status === "all" || (filters.status === "active") === r.isUsed;
      return matchQ && matchStatus;
    });
  }, [rows, dq, filters.status]);

  const totalCount = filtered.length;
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  // 5. Handlers
  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleOpenForm = (data: Recipe | null = null) =>
    setFormState({ open: true, data });
  const handleCloseForm = () => setFormState({ open: false, data: null });

  const handleDelete = async (id: number) => {
    if (confirm("ยืนยันลบสูตรอาหารนี้?")) {
      await deleteRecipe(id)
        .unwrap()
        .catch((err: any) => console.error("delete failed", err));
    }
  };

  const handleToggleActive = async (id: number, next: boolean) => {
    const target = rows.find((r) => r.id === id);
    if (!target) return;
    try {
      await updateRecipe({ id, data: { isUsed: next } }).unwrap();
    } catch (err) {
      console.error("toggle failed", err);
    }
  };

  const handleSubmit = async (
    data: CreateRecipe | UpdateRecipe
  ) => {
    try {
      if (formState.data?.id) {
         await updateRecipe({
            id: formState.data.id,
            data: data as UpdateRecipe
         }).unwrap();
      } else {
         await createRecipe(data as CreateRecipe).unwrap();
      }
      handleCloseForm();
    } catch (err) {
      console.error("save failed", err);
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
            จัดการสูตรอาหาร (Recipes)
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              component={Link}
              to="/manage-menuItem"
            >
              ย้อนกลับ
            </Button>
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
              เพิ่มสูตร
            </Button>
          </Stack>
        </Stack>

        {/* Filter Bar */}
        <RecipeFilterBar
          q={filters.q}
          status={filters.status}
          onSearch={(v) => handleFilterChange("q", v)}
          onStatusChange={(v) => handleFilterChange("status", v)}
        />

        {/* Summary */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            พบ {filtered.length} รายการ
          </Typography>
          {filters.status !== "all" && (
            <Chip
              size="small"
              variant="outlined"
              label={filters.status === "active" ? "ใช้งาน" : "ปิด"}
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

        {/* Content */}
        {isSmUp ? (
          <Paper
            variant="outlined"
            sx={{ borderRadius: 2, overflow: "hidden" }}
          >
            <TableContainer>
              <Table size="medium" sx={{ tableLayout: "fixed" }}>
                <TableHead>
                  <TableRow>
                    <TableCell width="5%" align="center" sx={{ fontWeight: 700 }}>
                      #
                    </TableCell>
                    <TableCell width="25%" sx={{ fontWeight: 700 }}>
                      เมนู
                    </TableCell>
                    <TableCell width="35%" sx={{ fontWeight: 700 }}>
                      วิธีทำ (ย่อ)
                    </TableCell>
                    <TableCell width="15%" align="center" sx={{ fontWeight: 700 }}>
                      สถานะ
                    </TableCell>
                    <TableCell width="20%" align="center" sx={{ fontWeight: 700 }}>
                      จัดการ
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {pageRows.map((r, i) => (
                    <ManageRecipeItem
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
                      <TableCell colSpan={5}>
                        <Box sx={{ py: 6, textAlign: "center" }}>
                          <Typography color="text.secondary">
                            ไม่พบข้อมูลสูตรอาหาร
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
                totalCount={totalCount}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
                showSummary
                showPageSizeSelect
                pageSizeOptions={[5, 10, 20]}
              />
            </Box>
          </Paper>
        ) : (
          // Mobile View
          <>
            <Stack spacing={1.5}>
              {pageRows.length === 0 ? (
                <Paper
                  sx={{ p: 4, textAlign: "center", bgcolor: "transparent" }}
                >
                  <Typography color="text.secondary">ไม่พบข้อมูล</Typography>
                </Paper>
              ) : (
                pageRows.map((r, i) => (
                  <MobileRecipeItem
                    key={r.id}
                    row={r}
                    index={(page - 1) * pageSize + i + 1}
                    onEdit={() => handleOpenForm(r)}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                  />
                ))
              )}
            </Stack>

            <Stack
              alignItems="center"
              sx={{
                pt: 1,
                position: "sticky",
                bottom: 0,
                bgcolor: "background.default",
                pb: "calc(env(safe-area-inset-bottom) + 8px)",
                borderTop: "1px solid",
                borderColor: "divider",
                mt: 2,
              }}
            >
              <PaginationBar
                page={page}
                pageSize={pageSize}
                totalCount={totalCount}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                showPageSizeSelect={false}
                showSummary={false}
                sx={{ mt: 0 }}
              />
            </Stack>
          </>
        )}
      </Container>

      {/* Drawer */}
      <FormRecipe
        open={formState.open}
        onClose={handleCloseForm}
        initial={formState.data ?? undefined}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
        // 3. ส่งรายการเมนูไปให้ Form
        menuOptions={menuList} 
      />
    </Box>
  );
}