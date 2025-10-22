/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Avatar,
  Tooltip,
  Switch,
  Pagination,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import FormMenu, { type MenuItemEntity, type MenuCategory } from "./FormMenu";

type Row = MenuItemEntity & {
  categoryName?: string;
  updatedAt?: string;
};

function formatCurrencyTHB(n: number) {
  return n.toLocaleString("th-TH", { style: "currency", currency: "THB" });
}

const CATEGORIES: MenuCategory[] = [
  { id: "main", name: "อาหารจานหลัก" },
  { id: "noodle", name: "ก๋วยเตี๋ยว" },
  { id: "drink", name: "เครื่องดื่ม" },
  { id: "dessert", name: "ของหวาน" },
];

const MOCK: Row[] = [
  {
    id: "1",
    name: "ก๋วยเตี๋ยวหมูน้ำตก",
    price: 55,
    categoryId: "noodle",
    categoryName: "ก๋วยเตี๋ยว",
    isActive: true,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop",
    updatedAt: "2025-10-20 14:11",
  },
  {
    id: "2",
    name: "ชาดำเย็น",
    price: 25,
    categoryId: "drink",
    categoryName: "เครื่องดื่ม",
    isActive: true,
    image: "https://images.unsplash.com/photo-1517705008128-361805f42e86?q=80&w=800&auto=format&fit=crop",
    updatedAt: "2025-10-20 13:45",
  },
  {
    id: "3",
    name: "ข้าวกระเพราไก่ไข่ดาว",
    price: 60,
    categoryId: "main",
    categoryName: "อาหารจานหลัก",
    isActive: false,
    image: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?q=80&w=800&auto=format&fit=crop",
    updatedAt: "2025-10-18 19:10",
  },
];

export default function ManageMenuList() {
  // ในโปรดักชัน: โหลดจาก API แล้วเก็บใน state/query
  const [rows, setRows] = React.useState<Row[]>(MOCK);
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState<string>("all");
  const [status, setStatus] = React.useState<"all" | "active" | "inactive">("all");

  // drawer form
  const [openForm, setOpenForm] = React.useState(false);
  const [editing, setEditing] = React.useState<Row | null>(null);

  // pagination (mock)
  const [page, setPage] = React.useState(1);
  const pageSize = 8;
  const handlePage = (_: any, p: number) => setPage(p);

  const filtered = rows.filter((r) => {
    const byQ =
      !q ||
      r.name.toLowerCase().includes(q.toLowerCase()) ||
      r.description?.toLowerCase().includes(q.toLowerCase());
    const byCat = cat === "all" || r.categoryId === cat;
    const byStatus =
      status === "all" || (status === "active" ? r.isActive : !r.isActive);
    return byQ && byCat && byStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  const refresh = () => {
    // TODO: fetch API
    console.log("refresh list");
  };

  const handleCreate = () => {
    setEditing(null);
    setOpenForm(true);
  };
  const handleEdit = (r: Row) => {
    setEditing(r);
    setOpenForm(true);
  };
  const handleDelete = (id: string) => {
    if (!confirm("ยืนยันลบเมนูนี้?")) return;
    setRows((xs) => xs.filter((x) => x.id !== id));
  };
  const handleToggleActive = (id: string, next: boolean) => {
    setRows((xs) => xs.map((x) => (x.id === id ? { ...x, isActive: next } : x)));
  };

  const handleSubmit = async (data: MenuItemEntity) => {
    // TODO: call API (POST/PUT)
    if (data.id) {
      setRows((xs) =>
        xs.map((x) => (x.id === data.id ? {
          ...x,
          ...data,
          categoryName: CATEGORIES.find(c => c.id === data.categoryId)?.name,
          updatedAt: new Date().toLocaleString("th-TH"),
        } : x))
      );
    } else {
      const newRow: Row = {
        ...data,
        id: crypto.randomUUID(),
        categoryName: CATEGORIES.find(c => c.id === data.categoryId)?.name,
        updatedAt: new Date().toLocaleString("th-TH"),
      };
      setRows((xs) => [newRow, ...xs]);
    }
  };

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={800}>จัดการเมนู</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={refresh}>รีเฟรช</Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
              เพิ่มเมนู
            </Button>
          </Stack>
        </Stack>

        {/* Toolbar ฟิลเตอร์ */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2 }}>
          <TextField
            placeholder="ค้นหาชื่อเมนู / คำอธิบาย"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><SearchIcon /></InputAdornment>
              ),
            }}
          />

          <FormControl sx={{ minWidth: 180 }}>
            <Select value={cat} onChange={(e) => setCat(String(e.target.value))} displayEmpty>
              <MenuItem value="all">หมวดหมู่ทั้งหมด</MenuItem>
              {CATEGORIES.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 160 }}>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              displayEmpty
            >
              <MenuItem value="all">สถานะทั้งหมด</MenuItem>
              <MenuItem value="active">พร้อมขาย</MenuItem>
              <MenuItem value="inactive">ปิดขาย</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Table */}
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
          <TableContainer>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell width={72}>รูป</TableCell>
                  <TableCell>ชื่อเมนู</TableCell>
                  <TableCell width={160} align="right">ราคา</TableCell>
                  <TableCell width={180}>หมวดหมู่</TableCell>
                  <TableCell width={120}>สถานะ</TableCell>
                  <TableCell width={180}>อัปเดตล่าสุด</TableCell>
                  <TableCell width={120} align="right">การทำงาน</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pageRows.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>
                      <Avatar
                        variant="rounded"
                        src={r.image}
                        alt={r.name}
                        sx={{ width: 48, height: 48, borderRadius: 1, bgcolor: "grey.100" }}
                      />
                    </TableCell>

                    <TableCell>
                      <Stack spacing={0.3}>
                        <Typography fontWeight={700}>{r.name}</Typography>
                        {r.description && (
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {r.description}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>

                    <TableCell align="right">
                      <Typography fontWeight={700}>{formatCurrencyTHB(r.price)}</Typography>
                    </TableCell>

                    <TableCell>
                      <Chip size="small" label={r.categoryName ?? r.categoryId} variant="outlined" />
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Switch
                          checked={r.isActive}
                          onChange={(_, v) => handleToggleActive(r.id!, v)}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {r.isActive ? "พร้อมขาย" : "ปิดขาย"}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{r.updatedAt}</Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Tooltip title="แก้ไข">
                        <IconButton onClick={() => handleEdit(r)} size="small">
                          <EditOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="ลบ">
                        <IconButton onClick={() => handleDelete(r.id!)} size="small" color="error">
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}

                {pageRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Box sx={{ py: 6, textAlign: "center" }}>
                        <Typography color="text.secondary">ไม่พบรายการตรงกับเงื่อนไข</Typography>
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
              onChange={handlePage}
              color="primary"
              siblingCount={0}
              boundaryCount={1}
            />
          </Stack>
        </Paper>
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
