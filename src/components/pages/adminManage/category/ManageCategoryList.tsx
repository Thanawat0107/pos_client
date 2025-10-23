/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import {
  Box, Container, Typography, Stack, Button, TextField, InputAdornment,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  Paper, Pagination, FormControl, Select, MenuItem
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import type { CategoryRow } from "./ManageCategoryItem";
import type { CategoryEntity } from "./FormCategory";
import ManageCategoryItem from "./ManageCategoryItem";
import FormCategory from "./FormCategory";

function nowTH() {
  return new Date().toLocaleString("th-TH");
}

const MOCK: CategoryRow[] = [
  { id: "c1", name: "ก๋วยเตี๋ยว", slug: "noodle", description: "", displayOrder: 1, isActive: true,  itemsCount: 12, updatedAt: nowTH() },
  { id: "c2", name: "อาหารจานหลัก", slug: "main", description: "", displayOrder: 2, isActive: true,  itemsCount: 8,  updatedAt: nowTH() },
  { id: "c3", name: "เครื่องดื่ม", slug: "drink", description: "", displayOrder: 3, isActive: true,  itemsCount: 15, updatedAt: nowTH() },
  { id: "c4", name: "ของหวาน", slug: "dessert", description: "", displayOrder: 4, isActive: false, itemsCount: 5,  updatedAt: nowTH() },
];

export default function ManageCategoryList() {
  const [rows, setRows] = React.useState<CategoryRow[]>(MOCK);

  // filters
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<"all" | "active" | "inactive">("all");

  // drawer form
  const [openForm, setOpenForm] = React.useState(false);
  const [editing, setEditing] = React.useState<CategoryRow | null>(null);

  // pagination (mock)
  const [page, setPage] = React.useState(1);
  const pageSize = 8;
  const handlePage = (_: any, p: number) => setPage(p);

  const filtered = rows.filter((r) => {
    const byQ = !q || r.name.toLowerCase().includes(q.toLowerCase()) || r.slug.toLowerCase().includes(q.toLowerCase());
    const byStatus = status === "all" || (status === "active" ? r.isActive : !r.isActive);
    return byQ && byStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  const refresh = () => {
    // TODO: fetch API categories
    console.log("refresh categories");
  };

  const handleCreate = () => { setEditing(null); setOpenForm(true); };
  const handleEdit = (r: CategoryRow) => { setEditing(r); setOpenForm(true); };
  const handleDelete = (id: string) => {
    if (!confirm("ยืนยันลบหมวดหมู่นี้?")) return;
    setRows((xs) => xs.filter((x) => x.id !== id));
  };
  const handleToggleActive = (id: string, next: boolean) => {
    setRows((xs) => xs.map((x) => (x.id === id ? { ...x, isActive: next, updatedAt: nowTH() } : x)));
  };

  const handleSubmit = async (data: CategoryEntity) => {
    // TODO: call API (POST/PUT)
    if (data.id) {
      setRows((xs) => xs.map((x) => (x.id === data.id ? { ...x, ...data, updatedAt: nowTH() } : x)));
    } else {
      const newRow: CategoryRow = { ...data, id: crypto.randomUUID(), itemsCount: 0, updatedAt: nowTH() };
      setRows((xs) => [newRow, ...xs]);
    }
  };

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={800}>จัดการหมวดหมู่</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={refresh}>รีเฟรช</Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>เพิ่มหมวดหมู่</Button>
          </Stack>
        </Stack>

        {/* Filter Bar */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2 }}>
          <TextField
            placeholder="ค้นหาชื่อ / slug"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
            }}
          />
          <FormControl sx={{ minWidth: 160 }}>
            <Select value={status} onChange={(e) => setStatus(e.target.value as any)} displayEmpty>
              <MenuItem value="all">สถานะทั้งหมด</MenuItem>
              <MenuItem value="active">พร้อมใช้</MenuItem>
              <MenuItem value="inactive">ปิดใช้งาน</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Table */}
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
          <TableContainer>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell>ชื่อ / slug</TableCell>
                  <TableCell width={120} align="center">จำนวนเมนู</TableCell>
                  <TableCell width={140} align="center">ลำดับแสดง</TableCell>
                  <TableCell width={160}>สถานะ</TableCell>
                  <TableCell width={180}>อัปเดตล่าสุด</TableCell>
                  <TableCell width={120} align="right">การทำงาน</TableCell>
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
                        <Typography color="text.secondary">ไม่พบหมวดหมู่</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack alignItems="center" sx={{ p: 1.5 }}>
            <Pagination count={totalPages} page={page} onChange={handlePage} color="primary" siblingCount={0} boundaryCount={1} />
          </Stack>
        </Paper>
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
