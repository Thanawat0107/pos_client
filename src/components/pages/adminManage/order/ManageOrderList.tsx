/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import OrderFilterBar from "../OrderFilterBar";
import ManageOrderItem from "./ManageOrderItem";

export type OrderStatus =
  | "PENDING"
  | "COOKING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";
export type PayStatus = "UNPAID" | "PAID" | "REFUNDED";
export type Channel = "DINE_IN" | "TAKEAWAY" | "DELIVERY";

export type OrderRow = {
  id: string;
  code: string;
  customerName?: string;
  phone?: string;
  channel: Channel;
  itemsCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentStatus: PayStatus;
  status: OrderStatus;
  orderedAt: string;
  updatedAt: string;
};

function nowTH() {
  return new Date().toLocaleString("th-TH");
}
function fmtTHB(n: number) {
  return n.toLocaleString("th-TH", { style: "currency", currency: "THB" });
}

// debounce เบา ๆ
function useDebounced<T>(value: T, delay = 300) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

const MOCK: OrderRow[] = [
  {
    id: "o1",
    code: "POS-000123",
    customerName: "คุณเอ",
    phone: "080-000-1111",
    channel: "DINE_IN",
    itemsCount: 3,
    subtotal: 180,
    discount: 10,
    shipping: 0,
    total: 170,
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
    subtotal: 120,
    discount: 0,
    shipping: 20,
    total: 140,
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
    subtotal: 55,
    discount: 0,
    shipping: 0,
    total: 55,
    paymentStatus: "PAID",
    status: "COMPLETED",
    orderedAt: nowTH(),
    updatedAt: nowTH(),
  },
];

export default function ManageOrderList() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const [rows, setRows] = React.useState<OrderRow[]>(MOCK);

  // filters
  const [q, setQ] = React.useState("");
  const dq = useDebounced(q, 300);
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

  // refunding guard
  const [refundingId, setRefundingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setPage(1);
  }, [dq, status, pay, channel]);

  // filter + sort (orderedAt desc)
  const filtered = React.useMemo(() => {
    const list = rows.filter((r) => {
      const byQ =
        !dq ||
        r.code.toLowerCase().includes(dq.toLowerCase()) ||
        r.customerName?.toLowerCase().includes(dq.toLowerCase()) ||
        r.phone?.toLowerCase().includes(dq.toLowerCase());
      const byStatus = status === "all" || r.status === status;
      const byPay = pay === "all" || r.paymentStatus === pay;
      const byChannel = channel === "all" || r.channel === channel;
      return byQ && byStatus && byPay && byChannel;
    });
    return list.sort(
      (a, b) =>
        new Date(b.orderedAt || b.updatedAt).getTime() -
        new Date(a.orderedAt || a.updatedAt).getTime()
    );
  }, [rows, dq, status, pay, channel]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize; // << ใช้คำนวณลำดับ
  const pageRows = filtered.slice(start, start + pageSize);

  // actions
  const refresh = () => {
    console.log("refresh orders");
  };

  const handleChangeStatus = (id: string, next: OrderStatus) => {
    setRows((xs) =>
      xs.map((x) =>
        x.id === id ? { ...x, status: next, updatedAt: nowTH() } : x
      )
    );
  };

  const handleViewDetail = (row: OrderRow) => {
    setSelected(row);
    setOpenDetail(true);
  };

  const handlePrint = (id: string) => {
    console.log("print receipt for", id);
    window.print?.();
  };

  const handleRefund = async (id: string) => {
    if (!confirm("ยืนยันคืนเงินออเดอร์นี้?")) return;
    try {
      setRefundingId(id);
      // TODO: await api.refund(id)
      setRows((xs) =>
        xs.map((x) =>
          x.id === id
            ? { ...x, paymentStatus: "REFUNDED", updatedAt: nowTH() }
            : x
        )
      );
    } finally {
      setRefundingId(null);
    }
  };

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <Container maxWidth="xl">
        {/* Sticky tools */}
        <Box
          sx={{
            position: { xs: "sticky", md: "static" },
            top: { xs: 56, sm: 64 },
            zIndex: (t) => t.zIndex.appBar,
            bgcolor: "background.default",
            pb: 1,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Typography variant="h5" fontWeight={800}>
              จัดการออเดอร์
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={refresh}
              >
                รีเฟรช
              </Button>
            </Stack>
          </Stack>

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

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              พบ {filtered.length} รายการ
            </Typography>
            {status !== "all" && (
              <Chip
                size="small"
                variant="outlined"
                label={`สถานะ: ${status}`}
                onDelete={() => setStatus("all")}
              />
            )}
            {pay !== "all" && (
              <Chip
                size="small"
                variant="outlined"
                label={`ชำระ: ${pay}`}
                onDelete={() => setPay("all")}
              />
            )}
            {channel !== "all" && (
              <Chip
                size="small"
                variant="outlined"
                label={`ช่องทาง: ${channel}`}
                onDelete={() => setChannel("all")}
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
        </Box>

        {/* Desktop table / Mobile cards */}
        {isMdUp ? (
          <Paper
            variant="outlined"
            sx={{ borderRadius: 2, overflow: "hidden" }}
          >
            <TableContainer>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell width={84} align="center">
                      ลำดับ
                    </TableCell>{" "}
                    {/* << ใหม่ */}
                    <TableCell width={180}>รหัส/เวลา</TableCell>
                    <TableCell>ลูกค้า</TableCell>
                    <TableCell width={100} align="center">
                      จำนวน
                    </TableCell>
                    <TableCell width={140}>ช่องทาง</TableCell>
                    <TableCell width={160} align="right">
                      ยอดสุทธิ
                    </TableCell>
                    <TableCell width={140}>สถานะออเดอร์</TableCell>
                    <TableCell width={120}>การชำระ</TableCell>
                    <TableCell width={150} align="right">
                      การทำงาน
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pageRows.map((r, i) => (
                    <ManageOrderItem
                      key={r.id}
                      row={r}
                      index={start + i + 1} // << ส่งลำดับให้แถว
                      refundingId={refundingId}
                      onChangeStatus={handleChangeStatus}
                      onViewDetail={handleViewDetail}
                      onPrint={handlePrint}
                      onRefund={handleRefund}
                    />
                  ))}

                  {pageRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9}>
                        <Box sx={{ py: 6, textAlign: "center" }}>
                          <Typography color="text.secondary">
                            ไม่พบออเดอร์
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
                onChange={handlePage}
                color="primary"
                siblingCount={0}
                boundaryCount={1}
              />
            </Stack>
          </Paper>
        ) : (
          <Stack spacing={1.25}>
            {pageRows.map((r, i) => (
              <ManageOrderItem
                key={r.id}
                row={r}
                index={start + i + 1}
                refundingId={refundingId}
                onChangeStatus={handleChangeStatus}
                onViewDetail={handleViewDetail}
                onPrint={handlePrint}
                onRefund={handleRefund}
              />
            ))}

            {pageRows.length === 0 && (
              <Paper
                variant="outlined"
                sx={{ p: 4, borderRadius: 2, textAlign: "center" }}
              >
                <Typography color="text.secondary">ไม่พบออเดอร์</Typography>
              </Paper>
            )}

            <Stack alignItems="center" sx={{ pt: 1 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePage}
                color="primary"
                siblingCount={0}
                boundaryCount={1}
              />
            </Stack>
          </Stack>
        )}
      </Container>

      {/* Drawer รายละเอียดออเดอร์ */}
      <Drawer
        anchor="right"
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        PaperProps={{ sx: { width: { xs: 1, sm: 420 } } }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ p: 2 }}
        >
          <Typography variant="h6" fontWeight={800}>
            รายละเอียดออเดอร์ {selected?.code}
          </Typography>
          <IconButton
            onClick={() => setOpenDetail(false)}
            aria-label="ปิดรายละเอียด"
          >
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider />
        {selected ? (
          <Box sx={{ p: 2 }}>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="ลูกค้า"
                  secondary={selected.customerName ?? "-"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="เบอร์"
                  secondary={selected.phone ?? "-"}
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="ช่องทาง" secondary={selected.channel} />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="จำนวนรายการ"
                  secondary={selected.itemsCount}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="ยอดรวม"
                  secondary={fmtTHB(selected.subtotal)}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="ส่วนลด"
                  secondary={fmtTHB(selected.discount)}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="ค่าจัดส่ง"
                  secondary={fmtTHB(selected.shipping)}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="สุทธิ"
                  secondary={fmtTHB(selected.total)}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="การชำระ"
                  secondary={selected.paymentStatus}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="สถานะออเดอร์"
                  secondary={selected.status}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="อัปเดตล่าสุด"
                  secondary={selected.updatedAt}
                />
              </ListItem>
            </List>
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
