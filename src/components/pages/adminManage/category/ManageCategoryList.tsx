import * as React from "react";
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

import type { CategoryRow } from "./ManageCategoryItem";
import type { CategoryEntity } from "./FormCategory";
import ManageCategoryItem from "./ManageCategoryItem";
import FormCategory from "./FormCategory";
import CategoryFilterBar from "../CategoryFilterBar";
import MobileCategoryItem from "./MobileCategoryItem";

/** ---- utils ---- */
function nowTH() {
  return new Date().toLocaleString("th-TH");
}

/** debounce hook (local, เบา ๆ ไม่ต้องแยกไฟล์) */
function useDebounced<T>(value: T, delay = 300) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/** ---- mock data ---- */
const MOCK: CategoryRow[] = [
  { id: "c1", name: "ก๋วยเตี๋ยว", slug: "noodle", description: "", displayOrder: 1, isActive: true, itemsCount: 12, updatedAt: nowTH() },
  { id: "c2", name: "อาหารจานหลัก", slug: "main", description: "", displayOrder: 2, isActive: true, itemsCount: 8, updatedAt: nowTH() },
  { id: "c3", name: "เครื่องดื่ม", slug: "drink", description: "", displayOrder: 3, isActive: true, itemsCount: 15, updatedAt: nowTH() },
  { id: "c4", name: "ของหวาน", slug: "dessert", description: "", displayOrder: 4, isActive: false, itemsCount: 5, updatedAt: nowTH() },
];

export default function ManageCategoryList() {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

  /** state หลัก */
  const [rows, setRows] = React.useState<CategoryRow[]>(MOCK);

  /** filters */
  const [q, setQ] = React.useState("");
  const dq = useDebounced(q, 300);
  const [status, setStatus] = React.useState<"all" | "active" | "inactive">("all");

  /** drawer form */
  const [openForm, setOpenForm] = React.useState(false);
  const [editing, setEditing] = React.useState<CategoryRow | null>(null);

  /** pagination */
  const [page, setPage] = React.useState(1);
  const pageSize = isSmUp ? 8 : 6;

  /** รีเซ็ตหน้าเมื่อฟิลเตอร์เปลี่ยน */
  React.useEffect(() => {
    setPage(1);
  }, [dq, status]);

  /** filter logic (memo) */
  const filtered = React.useMemo(() => {
    return rows.filter((r) => {
      const byQ =
        !dq ||
        r.name.toLowerCase().includes(dq.toLowerCase()) ||
        r.slug.toLowerCase().includes(dq.toLowerCase());
      const byStatus = status === "all" || (status === "active" ? r.isActive : !r.isActive);
      return byQ && byStatus;
    });
  }, [rows, dq, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  /** actions */
  const refresh = () => {
    // TODO: fetch API
    console.log("refresh categories");
  };

  const handleCreate = () => {
    setEditing(null);
    setOpenForm(true);
  };
  const handleEdit = (r: CategoryRow) => {
    setEditing(r);
    setOpenForm(true);
  };
  const handleDelete = (id: string) => {
    if (!confirm("ยืนยันลบหมวดหมู่นี้?")) return;
    setRows((xs) => xs.filter((x) => x.id !== id));
  };
  const handleToggleActive = (id: string, next: boolean) => {
    setRows((xs) =>
      xs.map((x) => (x.id === id ? { ...x, isActive: next, updatedAt: nowTH() } : x))
    );
  };

  const handleSubmit = async (data: CategoryEntity) => {
    // TODO: call API (POST/PUT)
    if (data.id) {
      setRows((xs) =>
        xs.map((x) => (x.id === data.id ? { ...x, ...data, updatedAt: nowTH() } : x))
      );
    } else {
      const newRow: CategoryRow = {
        ...data,
        id: crypto.randomUUID(),
        itemsCount: 0,
        updatedAt: nowTH(),
      };
      setRows((xs) => [newRow, ...xs]);
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
            จัดการหมวดหมู่
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={refresh}>
              รีเฟรช
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
              เพิ่มหมวดหมู่
            </Button>
          </Stack>
        </Stack>

        {/* Filter bar */}
        <CategoryFilterBar
          q={q}
          status={status}
          onSearch={setQ}
          onStatusChange={setStatus}
        />

        {/* Summary line: count + chips */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
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
          {dq && (
            <Chip
              size="small"
              variant="outlined"
              label={`ค้นหา: “${dq}”`}
              onDelete={() => setQ("")}
            />
          )}
        </Stack>

        {/* Desktop / Mobile */}
        {isSmUp ? (
          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
            <TableContainer>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>ชื่อ / slug</TableCell>
                    <TableCell width={120} align="center">
                      จำนวนเมนู
                    </TableCell>
                    <TableCell width={140} align="center">
                      ลำดับแสดง
                    </TableCell>
                    <TableCell width={160}>สถานะ</TableCell>
                    <TableCell width={180}>อัปเดตล่าสุด</TableCell>
                    <TableCell width={120} align="right">
                      การทำงาน
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pageRows.map((r) => (
                    <ManageCategoryItem
                      key={r.id}
                      row={r}
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
                            ไม่พบหมวดหมู่
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
          <>
            <Stack spacing={1.25}>
              {pageRows.length === 0 ? (
                <Paper
                  variant="outlined"
                  sx={{ p: 4, borderRadius: 2, textAlign: "center" }}
                >
                  <Typography color="text.secondary">ไม่พบหมวดหมู่</Typography>
                </Paper>
              ) : (
                pageRows.map((r) => (
                  <MobileCategoryItem
                    key={r.id}
                    row={r}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                  />
                ))
              )}
            </Stack>

            <Stack alignItems="center" sx={{ pt: 1 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, p) => setPage(p)}
                size="small"
                siblingCount={0}
                boundaryCount={1}
              />
            </Stack>
          </>
        )}
      </Container>

      {/* Drawer Form */}
      <FormCategory
        open={openForm}
        onClose={() => setOpenForm(false)}
        initial={editing ?? undefined}
        onSubmit={handleSubmit}
      />
    </Box>
  );
}
