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
  Pagination,
  useMediaQuery,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";

import MenuFilterBar from "../MenuFilterBar";
import MobileMenuItem from "./MobileMenuItem";
import { useEffect, useMemo, useState } from "react";
import { useDebounced } from "../../../../hooks/useDebounced";
import { useCreateMenuItemMutation, useDeleteMenuItemMutation, useGetMenuItemsQuery, useUpdateMenuItemMutation } from "../../../../services/menuItemApi";
import type { MenuItemDto } from "../../../../@types/dto/MenuItem";
import type { CreateMenuItem } from "../../../../@types/createDto/createMenuItem";
import type { CreateMenuItemOptionGroup } from "../../../../@types/createDto/CreateMenuItemOptionGroup";
import type { UpdateMenuItem } from "../../../../@types/UpdateDto/updateMenuItem";
import ManageMenuItem from "./ManageMenuItem";
import FormMenu from "./FormMenu";

function parseIdToNumber(id?: string) {
  if (!id) return Number.MAX_SAFE_INTEGER;
  const n = parseInt(String(id), 10);
  return Number.isNaN(n) ? Number.MAX_SAFE_INTEGER : n;
}

/** map จาก DTO ของ API → RowType สำหรับ UI */
function mapApiMenuItemToRow(item: MenuItemDto) {
  return {
    id: String(item.id),
    name: item.name,
    // UI ใช้ชื่อ field ว่า price แต่ backend ใช้ basePrice
    price: item.basePrice,
    // เก็บเป็น string เพื่อให้ใช้เทียบกับ select / filter ได้ง่าย
    categoryId: item.menuCategoryId != null ? String(item.menuCategoryId) : "unknown",
    categoryName: item.menuCategoryName ?? "ไม่ทราบหมวดหมู่",
    // isUsed + ไม่ถูกลบ → แสดงเป็น isActive
    isActive: item.isUsed && !item.isDeleted,
    image: item.imageUrl ?? "",
    description: item.description,
    // ใช้ updatedAt จาก backend ตรง ๆ
    updatedAt: item.updatedAt,
  };
}

/** map จาก Form → DTO create */
function mapFormToCreateDto(form: MenuItemDto): CreateMenuItem {
  return {
    name: form.name,
    description: form.description ?? "",
    basePrice: form.basePrice,
    imageUrl: form.imageUrl ?? "",       // ถ้าใช้ URL ที่มีอยู่เดิม
    menuCategoryId: Number(form.menuCategoryId) || null,
    menuItemOptionGroups:
      (form.menuItemOptionGroups as CreateMenuItemOptionGroup[]) ?? [],
  };
}

/** map จาก Form → DTO update */
function mapFormToUpdateDto(form: MenuItemDto): UpdateMenuItem {
  // TODO: ปรับ field ให้ตรงกับ UpdateMenuItem ของ backend จริง
  return {
    name: form.name,
    description: form.description,
    basePrice: form.basePrice,
    menuCategoryId: Number(form.menuCategoryId) || null,
    imageUrl: form.imageUrl ?? "",
  };
}

export default function ManageMenuList() {
   const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

  // ---- state เหมือน ManageCategoryList ----
  const [q, setQ] = useState("");
  const dq = useDebounced(q, 300);
  const [cat, setCat] = useState<string>("all");
  const [status, setStatus] =
    useState<"all" | "active" | "inactive">("all");

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<MenuItemDto | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(isSmUp ? 8 : 6);

  // ---- RTK Query ----
  const { data, isLoading, isFetching, refetch } = useGetMenuItemsQuery({
    pageNumber: 1,
    pageSize: 1000,
  });

  const [createMenuItem, { isLoading: isCreating }] =
    useCreateMenuItemMutation();
  const [updateMenuItem, { isLoading: isUpdating }] =
    useUpdateMenuItemMutation();
  const [deleteMenuItem, { isLoading: isDeleting }] =
    useDeleteMenuItemMutation();

  // map API → rows สำหรับ UI
  const rows: MenuItemDto[] = useMemo(
    () => (data?.result ?? []).map(mapApiMenuItemToRow),
    [data]
  );

  // reset page เวลา filter/search/pageSize เปลี่ยน
  useEffect(() => {
    setPage(1);
  }, [dq, cat, status, pageSize]);

  // เปลี่ยน pageSize ตาม breakpoint
  useEffect(() => {
    setPageSize(isSmUp ? 8 : 6);
    setPage(1);
  }, [isSmUp]);

  // ---- filter + sort ----
  const filtered = useMemo(() => {
    const search = dq.trim().toLowerCase();

    return rows.filter((r) => {
      const byQ =
        !search ||
        r.name.toLowerCase().includes(search) ||
        (r.description ?? "").toLowerCase().includes(search);

      const byCat = cat === "all" || r.menuCategoryId === cat;

      const byStatus =
        status === "all" || (status === "active" ? r.isUsed : !r.isUsed);

      return byQ && byCat && byStatus;
    });
  }, [rows, dq, cat, status]);

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  // ---- actions ----
  const refresh = () => {
    refetch();
  };

  const handleCreate = () => {
    setEditing(null);
    setOpenForm(true);
  };

  const handleEdit = (r: MenuItemDto) => {
    setEditing(r);
    setOpenForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("ยืนยันลบเมนูนี้?")) return;
    try {
      await deleteMenuItem(Number(id)).unwrap();
      // RTK จะ auto refetch ตาม invalidatesTags
      // TODO: ใส่ Swal/Toast "ลบสำเร็จ"
    } catch (err) {
      console.error("delete menu failed", err);
      alert("ลบเมนูไม่สำเร็จ");
    }
  };

  const handleToggleActive = async (id: number, next: boolean) => {
    const target = rows.find((r) => r.id === id);
    if (!target) return;

    try {
      const formLike: MenuItemDto = {
        id: target.id,
        name: target.name,
        description: target.description,
        basePrice: target.basePrice,
        menuCategoryId: target.menuCategoryId,
        imageUrl: target.imageUrl ?? "",
        isUsed: next,
        isDeleted: !next,
        createdAt: target.createdAt,
        updatedAt: target.updatedAt,
        menuItemOptionGroups: target.menuItemOptionGroups,
      };

      await updateMenuItem({
        id: Number(id),
        data: mapFormToUpdateDto(formLike),
      }).unwrap();
      // TODO: ใส่ toast ถ้าอยากแจ้งเบา ๆ
    } catch (err) {
      console.error("toggle active failed", err);
      alert("เปลี่ยนสถานะเมนูไม่สำเร็จ");
    }
  };

  const handleSubmit = async (formData: MenuItemDto) => {
    try {
      if (formData.id) {
        await updateMenuItem({
          id: Number(formData.id),
          data: mapFormToUpdateDto(formData),
        }).unwrap();
      } else {
        await createMenuItem(mapFormToCreateDto(formData)).unwrap();
      }

      setOpenForm(false);
      setEditing(null);
      // TODO: Swal/Toast "บันทึกสำเร็จ"
    } catch (err) {
      console.error("save menu failed", err);
      alert("บันทึกเมนูไม่สำเร็จ");
    }
  };

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <Container maxWidth="xl">
        {/* Sticky tools (Header + Filter + Summary) */}
        <Box
          sx={{
            position: { xs: "sticky", md: "static" },
            top: { xs: 56, sm: 64 }, // ปรับให้เท่าความสูง navbar ของโปรเจกต์
            zIndex: (t) => t.zIndex.appBar,
            bgcolor: "background.default",
            pb: 1,
          }}
        >
          {/* Header */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Typography variant={isSmUp ? "h5" : "h6"} fontWeight={800}>
              จัดการเมนู
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={refresh}
              >
                รีเฟรช
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreate}
              >
                เพิ่มเมนู
              </Button>
            </Stack>
          </Stack>

          {/* Filter bar */}
          <MenuFilterBar
            q={q}
            cat={cat}
            status={status}
            categories={CATEGORIES}
            onSearch={setQ}
            onCategoryChange={setCat}
            onStatusChange={setStatus}
          />

          {/* Summary chips */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              พบ {filteredSorted.length} รายการ
            </Typography>
            {cat !== "all" && (
              <Chip
                size="small"
                variant="outlined"
                label={`หมวด: ${cat}`}
                onDelete={() => setCat("all")}
              />
            )}
            {status !== "all" && (
              <Chip
                size="small"
                variant="outlined"
                label={status === "active" ? "พร้อมขาย" : "ปิดขาย"}
                onDelete={() => setStatus("all")}
              />
            )}
            {q && (
              <Chip
                size="small"
                variant="outlined"
                label={`ค้นหา: “${q}”`}
                onDelete={() => setQ("")}
              />
            )}
          </Stack>
        </Box>

        {/* Content */}
        {isSmUp ? (
          // ---- Desktop: Table ----
          <Paper
            variant="outlined"
            sx={{ borderRadius: 2, overflow: "hidden" }}
          >
            <TableContainer>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell width={84} align="center">
                      ลำดับแสดง
                    </TableCell>
                    <TableCell width={100}>รูป</TableCell>
                    <TableCell>ชื่อเมนู</TableCell>
                    <TableCell width={140} align="right">
                      ราคา
                    </TableCell>
                    <TableCell width={160}>หมวดหมู่</TableCell>
                    <TableCell width={140}>สถานะ</TableCell>
                    <TableCell width={180}>อัปเดตล่าสุด</TableCell>
                    <TableCell width={120} align="right">
                      การทำงาน
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {pageRows.map((r, i) => (
                    <ManageMenuItem
                      key={r.id}
                      menuItem={r}
                      index={start + i + 1}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleActive={handleToggleActive}
                    />
                  ))}

                  {pageRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <Box sx={{ py: 6, textAlign: "center" }}>
                          <Typography color="text.secondary">
                            ไม่พบรายการตรงกับเงื่อนไข
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Stack alignItems="center" sx={{ p: 1.5 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, p) => setPage(p)}
                color="primary"
                siblingCount={0}
                boundaryCount={1}
              />
            </Stack>
          </Paper>
        ) : (
          // ---- Mobile: Card list ----
          <Stack spacing={1.25}>
            {pageRows.length === 0 ? (
              <Paper
                variant="outlined"
                sx={{ p: 4, borderRadius: 2, textAlign: "center" }}
              >
                <Typography color="text.secondary">
                  ไม่พบรายการตรงกับเงื่อนไข
                </Typography>
              </Paper>
            ) : (
              pageRows.map((r, i) => (
                <MobileMenuItem
                  key={r.id}
                  menuItem={r}
                  index={start + i + 1}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                />
              ))
            )}

            {/* Sticky pagination (mobile) */}
            <Stack
              alignItems="center"
              sx={{
                pt: 1,
                position: "sticky",
                bottom: 8,
                bgcolor: "background.default",
              }}
            >
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, p) => setPage(p)}
                color="primary"
                siblingCount={0}
                boundaryCount={1}
                size="small"
              />
            </Stack>
          </Stack>
        )}
      </Container>

      {/* Drawer Form */}
      <FormMenu
        open={openForm}
        onClose={() => setOpenForm(false)}
        initial={editing ?? undefined}
        categories={CATEGORIES}
        onSubmit={handleSubmit}
      />
    </Box>
  );
}
