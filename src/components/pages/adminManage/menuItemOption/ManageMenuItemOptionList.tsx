/* eslint-disable @typescript-eslint/no-unused-vars */
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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import ManageMenuItemOptionItem from "./ManageMenuItemOptionItem";
import MobileMenuItemOption from "./MobileMenuItemOption";
import type {
  MenuItemOption,
} from "../../../../@types/dto/MenuItemOption";
import { useEffect, useMemo, useState } from "react";
import PaginationBar from "../../../layouts/PaginationBar";
import { useDebounced } from "../../../../hooks/useDebounced";
import {
  useCreateMenuItemOptionMutation,
  useDeleteMenuItemOptionMutation,
  useGetMenuItemOptionsQuery,
  useUpdateMenuItemOptionMutation,
} from "../../../../services/menuItemOptionApi";
import type { CreateMenuItemOption } from "../../../../@types/createDto/CreateMenuItemOption";
import type { UpdateMenuItemOption } from "../../../../@types/UpdateDto/UpdateMenuItemOption";
import FormMenuItemOption from "./FromMenuItemOption";
import MenuItemOptionFilterBar from "../MenuItemOptionFilterBar";
import { Link } from "react-router-dom";

export default function ManageMenuItemOptionList() {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

  const [q, setQ] = useState("");
  const dq = useDebounced(q, 300);
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<MenuItemOption | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(isSmUp ? 8 : 6);

  const { data, isLoading, isFetching, refetch } = useGetMenuItemOptionsQuery({
    pageNumber: 1,
    pageSize: 50,
  });
  const [createOption, { isLoading: isCreating }] = useCreateMenuItemOptionMutation();
  const [updateOption, { isLoading: isUpdating }] = useUpdateMenuItemOptionMutation();
  const [deleteOption, { isLoading: isDeleting }] = useDeleteMenuItemOptionMutation();

  const rows: MenuItemOption[] = data?.result ?? [];

 // เพิ่ม state
const [required, setRequired] = useState<"all" | "required" | "optional">("all");
const [multiple, setMultiple] = useState<"all" | "multiple" | "single">("all");

// อัปเดต useEffect ให้ reset page เมื่อ filter เปลี่ยน
useEffect(() => {
  setPage(1);
}, [dq, status, required, multiple, pageSize]);

// อัปเดต filtered logic
const filtered = useMemo(() => {
  const search = dq.trim(). toLowerCase();

  return rows.filter((r) => {
    const byQ =
      ! search ||
      r.name.toLowerCase().includes(search) ||
      (r.MenuItemName ??  "").toLowerCase().includes(search);

    const byStatus =
      status === "all" || (status === "active" ?  r.isUsed : !r.isUsed);

    const byRequired =
      required === "all" ||
      (required === "required" ?  r.isRequired : !r. isRequired);

    const byMultiple =
      multiple === "all" ||
      (multiple === "multiple" ? r.isMultiple : !r.isMultiple);

    return byQ && byStatus && byRequired && byMultiple;
  });
}, [rows, dq, status, required, multiple]);

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

  const refresh = () => {
    refetch();
  };

  const handleCreate = () => {
    setEditing(null);
    setOpenForm(true);
  };

  const handleEdit = (r: MenuItemOption) => {
    setEditing(r);
    setOpenForm(true);
  };

  const handleDelete = async (id: number) => {
    if (! confirm("ยืนยันลบตัวเลือกนี้? ")) return;
    try {
      await deleteOption(id). unwrap();
      // TODO: toast "ลบสำเร็จ"
    } catch (err) {
      console.error("delete failed", err);
    }
  };

  const handleToggleActive = async (id: number, next: boolean) => {
    const target = rows.find((r) => r.id === id);
    if (! target) return;

    try {
      await updateOption({
        id,
        data: {
          id,
          name: target.name,
          isRequired: target.isRequired,
          isMultiple: target.isMultiple,
          isUsed: next,
          menuItemOptionDetail: target.menuOptionDetails. map((d) => ({
            id: d.id,
            name: d.name,
            extraPrice: d.extraPrice,
            isUsed: d.isUsed,
          })),
        },
      }).unwrap();
    } catch (err) {
      console.error("toggle failed", err);
    }
  };

  const handleSubmit = async (
    formData: CreateMenuItemOption | UpdateMenuItemOption
  ) => {
    try {
      const isUpdate = "id" in formData && formData.id;

      await (isUpdate
        ? updateOption({
            id: formData.id!,
            data: formData as UpdateMenuItemOption,
          })
        : createOption(formData as CreateMenuItemOption)
      ).unwrap();

      setOpenForm(false);
      setEditing(null);
    } catch (err) {
      console.error("save failed", err);
    }
  };

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
            จัดการตัวเลือกเมนู
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
              onClick={refresh}
              disabled={isLoading}
            >
              รีเฟรช
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
              disabled={isCreating || isUpdating || isDeleting}
            >
              เพิ่มตัวเลือก
            </Button>
          </Stack>
        </Stack>
        {/* อัปเดต FilterBar component */}
        <MenuItemOptionFilterBar
          q={q}
          status={status}
          required={required}
          multiple={multiple}
          onSearch={setQ}
          onStatusChange={setStatus}
          onRequiredChange={setRequired}
          onMultipleChange={setMultiple}
        />
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ mb: 1 }}
          flexWrap="wrap"
        >
          <Typography variant="body2" color="text.secondary">
            พบ {filtered.length} รายการ
          </Typography>
          {status !== "all" && (
            <Chip
              size="small"
              variant="outlined"
              label={status === "active" ? "พร้อมใช้" : "ปิดใช้งาน"}
              onDelete={() => setStatus("all")}
            />
          )}
          {required !== "all" && (
            <Chip
              size="small"
              variant="outlined"
              label={required === "required" ? "บังคับเลือก" : "ไม่บังคับ"}
              onDelete={() => setRequired("all")}
            />
          )}
          {multiple !== "all" && (
            <Chip
              size="small"
              variant="outlined"
              label={
                multiple === "multiple"
                  ? "เลือกได้หลายรายการ"
                  : "เลือกได้ 1 รายการ"
              }
              onDelete={() => setMultiple("all")}
            />
          )}
          {dq && (
            <Chip
              size="small"
              variant="outlined"
              label={`ค้นหา: "${dq}"`}
              onDelete={() => setQ("")}
            />
          )}
        </Stack>
        {/* Desktop / Mobile */}
        {isSmUp ? (
          <Paper
            variant="outlined"
            sx={{ borderRadius: 2, overflow: "hidden" }}
          >
            <TableContainer>
              <Table size="medium" sx={{ tableLayout: "fixed" }}>
                <TableHead>
                  <TableRow>
                    <TableCell
                      width="10%"
                      align="center"
                      sx={{ fontWeight: 700 }}
                    >
                      ลำดับ
                    </TableCell>
                    <TableCell
                      width="25%"
                      align="center"
                      sx={{ fontWeight: 700 }}
                    >
                      ชื่อกลุ่ม
                    </TableCell>
                    <TableCell
                      width="15%"
                      align="center"
                      sx={{ fontWeight: 700 }}
                    >
                      จำนวนตัวเลือก
                    </TableCell>
                    <TableCell
                      width="20%"
                      align="center"
                      sx={{ fontWeight: 700 }}
                    >
                      เมนูที่ใช้งาน
                    </TableCell>
                    <TableCell
                      width="15%"
                      align="center"
                      sx={{ fontWeight: 700 }}
                    >
                      สถานะ
                    </TableCell>
                    <TableCell
                      width="15%"
                      align="center"
                      sx={{ fontWeight: 700 }}
                    >
                      การทำงาน
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {pageRows.map((r, i) => (
                    <ManageMenuItemOptionItem
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
                      <TableCell colSpan={6}>
                        <Box sx={{ py: 6, textAlign: "center" }}>
                          <Typography color="text.secondary">
                            ไม่พบตัวเลือกเมนู
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ px: 2, py: 1.5 }}>
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
              />
            </Box>
          </Paper>
        ) : (
          <>
            <Stack spacing={1.25}>
              {pageRows.length === 0 ? (
                <Paper
                  variant="outlined"
                  sx={{ p: 4, borderRadius: 2, textAlign: "center" }}
                >
                  <Typography color="text.secondary">
                    ไม่พบตัวเลือกเมนู
                  </Typography>
                </Paper>
              ) : (
                pageRows.map((r, i) => (
                  <MobileMenuItemOption
                    key={r.id}
                    row={r}
                    index={start + i + 1}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                  />
                ))
              )}
            </Stack>

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
            />
          </>
        )}
      </Container>

      {/* Drawer Form */}
      <FormMenuItemOption
        open={openForm}
        onClose={() => setOpenForm(false)}
        initial={editing ?? undefined}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
      />
    </Box>
  );
}