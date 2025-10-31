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

import FormMenu, { type MenuItemEntity, type MenuCategory } from "./FormMenu";
import ManageMenuItem, { type Row as RowType } from "./ManageMenuItem";
import MenuFilterBar from "../MenuFilterBar";
import MobileMenuItem from "./MobileMenuItem";

/** ---- mock ---- */
const CATEGORIES: MenuCategory[] = [
  { id: "main", name: "อาหารจานหลัก" },
  { id: "noodle", name: "ก๋วยเตี๋ยว" },
  { id: "drink", name: "เครื่องดื่ม" },
  { id: "dessert", name: "ของหวาน" },
];

const MOCK: RowType[] = [
  {
    id: "1",
    name: "ก๋วยเตี๋ยวหมูน้ำตก",
    price: 55,
    categoryId: "noodle",
    categoryName: "ก๋วยเตี๋ยว",
    isActive: true,
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop",
    updatedAt: "2025-10-20 14:11",
  },
  {
    id: "10",
    name: "ชาดำเย็น",
    price: 25,
    categoryId: "drink",
    categoryName: "เครื่องดื่ม",
    isActive: true,
    image:
      "https://images.unsplash.com/photo-1517705008128-361805f42e86?q=80&w=800&auto=format&fit=crop",
    updatedAt: "2025-10-20 13:45",
  },
  {
    id: "3",
    name: "ข้าวกระเพราไก่ไข่ดาว",
    price: 60,
    categoryId: "main",
    categoryName: "อาหารจานหลัก",
    isActive: false,
    image:
      "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?q=80&w=800&auto=format&fit=crop",
    updatedAt: "2025-10-18 19:10",
  },
];

function parseIdToNumber(id?: string) {
  if (!id) return Number.MAX_SAFE_INTEGER;
  const n = parseInt(String(id), 10);
  return Number.isNaN(n) ? Number.MAX_SAFE_INTEGER : n;
}

export default function ManageMenuList() {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

  const [rows, setRows] = React.useState<RowType[]>(MOCK);
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState<string>("all");
  const [status, setStatus] = React.useState<"all" | "active" | "inactive">("all");

  // drawer form
  const [openForm, setOpenForm] = React.useState(false);
  const [editing, setEditing] = React.useState<RowType | null>(null);

  // pagination
  const [page, setPage] = React.useState(1);
  const pageSize = isSmUp ? 8 : 6;

  // reset page when filters/search change
  React.useEffect(() => {
    setPage(1);
  }, [q, cat, status]);

  // filter + sort by numeric id asc
  const filteredSorted = React.useMemo(() => {
    const list = rows.filter((r) => {
      const byQ =
        !q ||
        r.name.toLowerCase().includes(q.toLowerCase()) ||
        r.description?.toLowerCase().includes(q.toLowerCase());
      const byCat = cat === "all" || r.categoryId === cat;
      const byStatus = status === "all" || (status === "active" ? r.isActive : !r.isActive);
      return byQ && byCat && byStatus;
    });
    return list.sort((a, b) => parseIdToNumber(a.id) - parseIdToNumber(b.id));
  }, [rows, q, cat, status]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageRows = filteredSorted.slice(start, start + pageSize);

  // actions
  const refresh = React.useCallback(() => {
    // TODO: fetch API
    console.log("refresh list");
  }, []);

  const handleCreate = React.useCallback(() => {
    setEditing(null);
    setOpenForm(true);
  }, []);

  const handleEdit = React.useCallback((r: RowType) => {
    setEditing(r);
    setOpenForm(true);
  }, []);

  const handleDelete = React.useCallback((id: string) => {
    if (!confirm("ยืนยันลบเมนูนี้?")) return;
    setRows((xs) => xs.filter((x) => x.id !== id));
  }, []);

  const handleToggleActive = React.useCallback((id: string, next: boolean) => {
    setRows((xs) => xs.map((x) => (x.id === id ? { ...x, isActive: next } : x)));
  }, []);

  const handleSubmit = React.useCallback(async (data: MenuItemEntity) => {
    // TODO: call API (POST/PUT)
    if (data.id) {
      setRows((xs) =>
        xs.map((x) =>
          x.id === data.id
            ? {
                ...x,
                ...data,
                categoryName: CATEGORIES.find((c) => c.id === data.categoryId)?.name,
                updatedAt: new Date().toLocaleString("th-TH"),
              }
            : x
        )
      );
    } else {
      const newRow: RowType = {
        ...data,
        id: crypto.randomUUID(),
        categoryName: CATEGORIES.find((c) => c.id === data.categoryId)?.name,
        updatedAt: new Date().toLocaleString("th-TH"),
      };
      setRows((xs) => [newRow, ...xs]);
    }
  }, []);

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
                      row={r}
                      orderNo={start + i + 1}
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
                  row={r}
                  orderNo={start + i + 1}
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
