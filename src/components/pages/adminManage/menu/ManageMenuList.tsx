/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
import ManageMenuItem from "./ManageMenuItem";
import FormMenu from "./FormMenu";
import { useCallback, useMemo, useState } from "react";
import type { MenuItemDto } from "../../../../@types/dto/MenuItem";
import type { MenuCategory } from "../../../../@types/dto/MenuCategory";
import type { CreateMenuItem } from "../../../../@types/createDto/createMenuItem";
import {
  useCreateMenuItemMutation,
  useDeleteMenuItemMutation,
  useGetMenuItemsQuery,
  useUpdateMenuItemMutation,
} from "../../../../services/menuItemApi";
import type { UpdateMenuItem } from "../../../../@types/UpdateDto/updateMenuItem";

type StatusFilter = "all" | "active" | "inactive";

function isActiveMenu(item: MenuItemDto): boolean {
  return item.isUsed && !item.isDeleted;
}

export default function ManageMenuList() {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<MenuItemDto | null>(null);

  const [page, setPage] = useState(1);
  const pageSize = isSmUp ? 8 : 6;

  const {
    data: menuData,
    isLoading,
    isError,
    refetch,
  } = useGetMenuItemsQuery({
    pageNumber: 1,
    pageSize: 100,
  });

  const rows: MenuItemDto[] = menuData?.result ?? [];

  const [createMenuItem, { isLoading: isCreating }] =
    useCreateMenuItemMutation();
  const [updateMenuItem, { isLoading: isUpdating }] =
    useUpdateMenuItemMutation();
  const [deleteMenuItem, { isLoading: isDeleting }] =
    useDeleteMenuItemMutation();

  const categories: MenuCategory[] = useMemo(() => {
    const map = new Map<number, MenuCategory>();

    rows.forEach((r) => {
      if (r.menuCategoryId && r.menuCategoryName) {
        map.set(r.menuCategoryId, {
          id: r.menuCategoryId,
          name: r.menuCategoryName,
        } as MenuCategory);
      }
    });

    return Array.from(map.values()).sort((a, b) => a.id - b.id);
  }, [rows]);

  const handleChangeQ = useCallback((value: string) => {
    setQ(value);
    setPage(1);
  }, []);

  const handleChangeCat = useCallback((value: string) => {
    setCat(value);
    setPage(1);
  }, []);

  const handleChangeStatus = useCallback((value: StatusFilter) => {
    setStatus(value);
    setPage(1);
  }, []);

  const filteredSorted = useMemo(() => {
    const list = rows.filter((r) => {
      const byQ =
        !q ||
        r.name.toLowerCase().includes(q.toLowerCase()) ||
        r.description?.toLowerCase().includes(q.toLowerCase());

      const byCat =
        cat === "all" ||
        (r.menuCategoryId != null && String(r.menuCategoryId) === cat);

      const active = isActiveMenu(r);
      const byStatus =
        status === "all" || (status === "active" ? active : !active);

      return byQ && byCat && byStatus;
    });

    return list.sort((a, b) => a.id - b.id);
  }, [rows, q, cat, status]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageRows = filteredSorted.slice(start, start + pageSize);

  const handleChangePage = useCallback(
    (_: React.ChangeEvent<unknown>, value: number) => {
      setPage(value);
    },
    []
  );

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleCreate = useCallback(() => {
    setEditing(null);
    setOpenForm(true);
  }, []);

  const handleEdit = useCallback((item: MenuItemDto) => {
    setEditing(item);
    setOpenForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setOpenForm(false);
    setEditing(null);
  }, []);

  const handleDelete = useCallback(
    async (id: number) => {
      if (!confirm("ยืนยันลบเมนูนี้?")) return;
      try {
        await deleteMenuItem(id).unwrap();
        // invalidatesTags(["Menu"]) จะ refetch ให้เอง
      } catch (error) {
        console.error("Failed to delete menu item:", error);
      }
    },
    [deleteMenuItem]
  );

  const handleToggleActive = useCallback(
    async (id: number, next: boolean) => {
      const currentItem = menuData?.result.find((item) => item.id === id);
      if (!currentItem) return;

      try {
        await updateMenuItem({
          id,
          data: {
            ...currentItem,
            isUsed: next,
            imageFile: undefined,
          },
        }).unwrap();
      } catch (error) {
        console.error("Failed to toggle:", error);
      }
    },
    [menuData, updateMenuItem]
  );

  // onSubmit จาก FormMenu
  const handleSubmit = useCallback(
    async (data: CreateMenuItem, id?: number) => {
      try {
        if (id) {
          // NOTE: ถ้า UpdateMenuItem ต่างจาก CreateMenuItem มาก ๆ
          // แนะนำให้ทำ map ให้เนียนทีหลัง ตอนนี้ cast ข้าม ๆ ไปก่อน
          await updateMenuItem({
            id,
            data: data as unknown as UpdateMenuItem,
          }).unwrap();
        } else {
          await createMenuItem(data).unwrap();
        }

        setOpenForm(false);
        setEditing(null);
      } catch (error) {
        console.error("Failed to submit menu item:", error);
      }
    },
    [createMenuItem, updateMenuItem]
  );

  const isBusy = isCreating || isUpdating || isDeleting;

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <Container maxWidth="xl">
        {/* Sticky tools (Header + Filter + Summary) */}
        <Box
          sx={{
            position: { xs: "sticky", md: "static" },
            top: { xs: 56, sm: 64 },
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
              จัดการเมนูอาหาร
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={isLoading}
              >
                รีเฟรช
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreate}
                disabled={isBusy}
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
            categories={categories}
            onSearch={handleChangeQ}
            onCategoryChange={handleChangeCat}
            onStatusChange={handleChangeStatus}
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
                label={`หมวด: ${
                  categories.find((c) => String(c.id) === cat)?.name ?? cat
                }`}
                onDelete={() => handleChangeCat("all")}
              />
            )}
            {status !== "all" && (
              <Chip
                size="small"
                variant="outlined"
                label={status === "active" ? "พร้อมขาย" : "ปิดขาย"}
                onDelete={() => handleChangeStatus("all")}
              />
            )}
            {q && (
              <Chip
                size="small"
                variant="outlined"
                label={`ค้นหา: "${q}"`}
                onDelete={() => handleChangeQ("")}
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
                      row={r}
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
                            {isLoading
                              ? "กำลังโหลด..."
                              : "ไม่พบรายการตรงกับเงื่อนไข"}
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
                onChange={handleChangePage}
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
                  {isLoading ? "กำลังโหลด..." : "ไม่พบรายการตรงกับเงื่อนไข"}
                </Typography>
              </Paper>
            ) : (
              pageRows.map((r, i) => (
                <MobileMenuItem
                  key={r.id}
                  row={r}
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
                onChange={handleChangePage}
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
        onClose={handleCloseForm}
        initial={editing ?? undefined}
        categories={categories}
        onSubmit={handleSubmit}
      />
    </Box>
  );
}
