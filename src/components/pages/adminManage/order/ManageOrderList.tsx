/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import {
  Box, Container, Typography, Stack, Button,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  Paper, Pagination, Divider, Drawer, IconButton, List, ListItem, ListItemText
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import OrderFilterBar from "../OrderFilterBar";
import ManageOrderItem from "./ManageOrderItem";

export type OrderStatus = "PENDING" | "COOKING" | "READY" | "COMPLETED" | "CANCELLED";
export type PayStatus = "UNPAID" | "PAID" | "REFUNDED";
export type Channel = "DINE_IN" | "TAKEAWAY" | "DELIVERY";

export type OrderRow = {
  id: string;
  code: string;              // รหัสออเดอร์ เช่น POS-000123
  customerName?: string;
  phone?: string;
  channel: Channel;
  itemsCount: number;
  subtotal: number;
  discount: number;
  shipping: number;          // ค่าจัดส่ง (เดลิเวอรี่)
  total: number;             // สรุปสุทธิจ่าย
  paymentStatus: PayStatus;
  status: OrderStatus;
  orderedAt: string;
  updatedAt: string;
  // สามารถมี field เพิ่ม เช่น tableNo, riderName ฯลฯ
};

function nowTH() { return new Date().toLocaleString("th-TH"); }
function fmtTHB(n: number) { return n.toLocaleString("th-TH", { style: "currency", currency: "THB" }); }

const MOCK: OrderRow[] = [
  {
    id: "o1",
    code: "POS-000123",
    customerName: "คุณเอ",
    phone: "080-000-1111",
    channel: "DINE_IN",
    itemsCount: 3,
    subtotal: 180, discount: 10, shipping: 0, total: 170,
    paymentStatus: "PAID",
    status: "READY",
    orderedAt: nowTH(),
    updatedAt: nowTH(),
  },
  {
    id: "o2",
    code: "POS-000124",
    customerName: "คุณบี",
    phone: "081-222-3333",
    channel: "DELIVERY",
    itemsCount: 2,
    subtotal: 120, discount: 0, shipping: 20, total: 140,
    paymentStatus: "UNPAID",
    status: "COOKING",
    orderedAt: nowTH(),
    updatedAt: nowTH(),
  },
  {
    id: "o3",
    code: "POS-000125",
    channel: "TAKEAWAY",
    itemsCount: 1,
    subtotal: 55, discount: 0, shipping: 0, total: 55,
    paymentStatus: "PAID",
    status: "COMPLETED",
    orderedAt: nowTH(),
    updatedAt: nowTH(),
  },
];

export default function ManageOrderList() {
  // state หลัก
  const [rows, setRows] = React.useState<OrderRow[]>(MOCK);

  // filters
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<"all" | OrderStatus>("all");
  const [pay, setPay] = React.useState<"all" | PayStatus>("all");
  const [channel, setChannel] = React.useState<"all" | Channel>("all");

  // pagination
  const [page, setPage] = React.useState(1);
  const pageSize = 10;
  const handlePage = (_: any, p: number) => setPage(p);

  // drawer detail
  const [openDetail, setOpenDetail] = React.useState(false);
  const [selected, setSelected] = React.useState<OrderRow | null>(null);

  // filter logic
  const filtered = rows.filter((r) => {
    const byQ =
      !q ||
      r.code.toLowerCase().includes(q.toLowerCase()) ||
      r.customerName?.toLowerCase().includes(q.toLowerCase()) ||
      r.phone?.toLowerCase().includes(q.toLowerCase());
    const byStatus = status === "all" || r.status === status;
    const byPay = pay === "all" || r.paymentStatus === pay;
    const byChannel = channel === "all" || r.channel === channel;
    return byQ && byStatus && byPay && byChannel;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  // actions
  const refresh = () => {
    // TODO: fetch orders from API
    console.log("refresh orders");
  };

  const handleChangeStatus = (id: string, next: OrderStatus) => {
    setRows((xs) =>
      xs.map((x) => (x.id === id ? { ...x, status: next, updatedAt: nowTH() } : x))
    );
  };

  const handleViewDetail = (row: OrderRow) => {
    setSelected(row);
    setOpenDetail(true);
  };

  const handlePrint = (id: string) => {
    // TODO: open/print receipt
    console.log("print receipt for", id);
    window.print?.();
  };

  const handleRefund = (id: string) => {
    // TODO: call refund API
    setRows((xs) =>
      xs.map((x) =>
        x.id === id ? { ...x, paymentStatus: "REFUNDED", updatedAt: nowTH() } : x
      )
    );
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
          <Typography variant="h5" fontWeight={800}>จัดการออเดอร์</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={refresh}>
              รีเฟรช
            </Button>
          </Stack>
        </Stack>

        {/* Filters */}
        <OrderFilterBar
          q={q}
          status={status}
          pay={pay}
          channel={channel}
          onSearch={setQ}
          onStatusChange={setStatus}
          onPayChange={setPay}
          onChannelChange={setChannel}
        />

        {/* Table */}
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
          <TableContainer>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell width={180}>รหัส/เวลา</TableCell>
                  <TableCell>ลูกค้า</TableCell>
                  <TableCell width={100} align="center">จำนวน</TableCell>
                  <TableCell width={140}>ช่องทาง</TableCell>
                  <TableCell width={160} align="right">ยอดสุทธิ</TableCell>
                  <TableCell width={140}>สถานะออเดอร์</TableCell>
                  <TableCell width={120}>การชำระ</TableCell>
                  <TableCell width={110} align="right">การทำงาน</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pageRows.map((r) => (
                  <ManageOrderItem
                    key={r.id}
                    row={r}
                    onChangeStatus={handleChangeStatus}
                    onViewDetail={handleViewDetail}
                    onPrint={handlePrint}
                    onRefund={handleRefund}
                  />
                ))}

                {pageRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <Box sx={{ py: 6, textAlign: "center" }}>
                        <Typography color="text.secondary">ไม่พบออเดอร์</Typography>
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

      {/* Drawer รายละเอียดออเดอร์ */}
      <Drawer
        anchor="right"
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        PaperProps={{ sx: { width: { xs: 1, sm: 420 } } }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={800}>
            รายละเอียดออเดอร์ {selected?.code}
          </Typography>
          <IconButton onClick={() => setOpenDetail(false)}><CloseIcon /></IconButton>
        </Stack>
        <Divider />

        {selected ? (
          <Box sx={{ p: 2 }}>
            <List dense>
              <ListItem>
                <ListItemText primary="ลูกค้า" secondary={selected.customerName ?? "-"} />
              </ListItem>
              <ListItem>
                <ListItemText primary="เบอร์" secondary={selected.phone ?? "-"} />
              </ListItem>
              <ListItem>
                <ListItemText primary="ช่องทาง" secondary={selected.channel} />
              </ListItem>
              <ListItem>
                <ListItemText primary="จำนวนรายการ" secondary={selected.itemsCount} />
              </ListItem>
              <ListItem>
                <ListItemText primary="ยอดรวม" secondary={fmtTHB(selected.subtotal)} />
              </ListItem>
              <ListItem>
                <ListItemText primary="ส่วนลด" secondary={fmtTHB(selected.discount)} />
              </ListItem>
              <ListItem>
                <ListItemText primary="ค่าจัดส่ง" secondary={fmtTHB(selected.shipping)} />
              </ListItem>
              <ListItem>
                <ListItemText primary="สุทธิ" secondary={fmtTHB(selected.total)} />
              </ListItem>
              <ListItem>
                <ListItemText primary="การชำระ" secondary={selected.paymentStatus} />
              </ListItem>
              <ListItem>
                <ListItemText primary="สถานะออเดอร์" secondary={selected.status} />
              </ListItem>
              <ListItem>
                <ListItemText primary="อัปเดตล่าสุด" secondary={selected.updatedAt} />
              </ListItem>
            </List>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button variant="contained" fullWidth onClick={() => window.print?.()}>พิมพ์</Button>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                disabled={selected.paymentStatus !== "PAID"}
                onClick={() => alert("ทำงานคืนเงิน (ต่อ API ได้)")}
              >
                คืนเงิน
              </Button>
            </Stack>
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            <Typography>ไม่พบข้อมูล</Typography>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}
