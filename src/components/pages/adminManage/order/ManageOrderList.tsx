 import { useState, useMemo, useEffect } from "react";
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
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ManageOrderItem from "./ManageOrderItem";
import OrderDetailDrawer from "./OrderDetailDrawer";
import OrderFilterBar from "../OrderFilterBar";
import { useGetOrderAllQuery } from "../../../../services/orderApi";
import { Sd } from "../../../../helpers/SD"; 
import type { OrderHeader } from "../../../../@types/dto/OrderHeader";

export default function ManageOrderList() {
  // State Filter
  const [filters, setFilters] = useState({
    q: "",
    status: "all",
    pay: "all",
    channel: "all",
  });
  
    // ✅ เปลี่ยนเป็นเก็บ Order object โดยตรง
  const [selectedOrder, setSelectedOrder] = useState<OrderHeader | null>(null);

  // API Call
  const { data, isLoading, isError, refetch, isFetching } = useGetOrderAllQuery(
    {
      pageNumber: 1,
      pageSize: 10,
    },
  );

  const rows = data?.results ?? [];

  useEffect(() => {
    if (!selectedOrder) return;
    const updatedOrder = rows.find((r) => r.id === selectedOrder.id);
    console.log("🔄 Order updated:", updatedOrder?.orderStatus); // Debug
    if (updatedOrder) setSelectedOrder(updatedOrder);
  }, [rows, selectedOrder]);

  // Filter Logic (Client Side)
  const filteredRows = useMemo(() => {
    return rows
      .filter((r) => {
        const searchLower = filters.q.toLowerCase();

        // 1. Search Text
        const matchesQ =
          !filters.q ||
          r.orderCode.toLowerCase().includes(searchLower) ||
          (r.customerName &&
            r.customerName.toLowerCase().includes(searchLower)) ||
          r.customerPhone.includes(filters.q);

        // 2. Status
        const matchesStatus =
          filters.status === "all" || r.orderStatus === filters.status;

        // 3. Channel
        const matchesChannel =
          filters.channel === "all" || r.channel === filters.channel;

        // 4. Pay Status (✅ ปรับมาใช้ Sd เพื่อความชัวร์)
        const matchesPay =
          filters.pay === "all" ||
          (filters.pay === "UNPAID" &&
            r.orderStatus === Sd.Status_PendingPayment) ||
          (filters.pay === "PAID" &&
            r.orderStatus !== Sd.Status_PendingPayment &&
            r.orderStatus !== Sd.Status_Cancelled);

        return matchesQ && matchesStatus && matchesChannel && matchesPay;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [rows, filters]);

  // --- UI ---
  if (isError) {
    return <Container sx={{ mt: 4 }}><Alert severity="error">โหลดข้อมูลไม่สำเร็จ</Alert></Container>;
  }

  return (
    <Box sx={{ py: 3, bgcolor: "#f4f6f8", minHeight: "100vh" }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          mb={3}
        >
          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: "#2b3445" }}>
              จัดการรายการคำสั่งซื้อ
            </Typography>
            <Typography variant="body2" color="text.secondary">
              รายการออเดอร์ทั้งหมดในระบบ
            </Typography>
          </Box>
          
          {/* ✅ ปรับปุ่มรีเฟรชให้สวยเหมือนในรูป (ขอบแดง ตัวหนังสือแดง) */}
          <Button
            startIcon={isFetching ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
            onClick={() => refetch()}
            variant="outlined"
            // ลบ color="error" ออก แล้ว custom เองเพื่อให้สีตรงเป๊ะ
            disabled={isFetching}
            sx={{ 
                borderRadius: 2, 
                textTransform: "none", 
                fontWeight: 700,
                borderColor: '#ef5350', // แดงอ่อนๆ หน่อย
                color: '#d32f2f',       // แดงเข้ม
                '&:hover': {
                    borderColor: '#d32f2f',
                    bgcolor: '#ffebee'
                }
            }}
          >
            รีเฟรชข้อมูล
          </Button>
        </Stack>

        {/* Content Card */}
        <Card
          elevation={0}
          sx={{ borderRadius: 3, border: "1px solid #e0e0e0", mb: 4 }}
        >
          <CardContent sx={{ p: 3 }}>
            
            <Box sx={{ mb: 3 }}>
              <OrderFilterBar
                q={filters.q}
                status={filters.status}
                pay={filters.pay}
                channel={filters.channel}
                onSearch={(v) => setFilters((prev) => ({ ...prev, q: v }))}
                onStatusChange={(v) => setFilters((prev) => ({ ...prev, status: v }))}
                onPayChange={(v) => setFilters((prev) => ({ ...prev, pay: v }))}
                onChannelChange={(v) => setFilters((prev) => ({ ...prev, channel: v }))}
              />
            </Box>

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                พบข้อมูล <Box component="span" sx={{ color: "primary.main" }}>{filteredRows.length}</Box> รายการ
              </Typography>
            </Stack>

            {/* Table */}
            <TableContainer sx={{ border: "1px solid #f0f0f0", borderRadius: 2 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {/* ✅ Header Style สวยๆ */}
                    <TableCell align="center" sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#637381", width: 60 }}>#</TableCell>
                    <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#637381" }}>เลขออเดอร์ / รหัสรับ</TableCell>
                    <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#637381" }}>ลูกค้า</TableCell>
                    <TableCell align="right" sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#637381" }}>ยอดรวมสุทธิ</TableCell>
                    <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#637381", pl: 3 }}>สถานะ</TableCell>
                    <TableCell sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#637381" }}>เวลาสั่งซื้อ</TableCell>
                    <TableCell align="right" sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#637381" }}>จัดการ</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 10 }}><CircularProgress /></TableCell></TableRow>
                  ) : filteredRows.length === 0 ? (
                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 8 }}><Typography color="text.secondary">ไม่พบรายการ</Typography></TableCell></TableRow>
                  ) : (
                    filteredRows.map((row, i) => (
                      <ManageOrderItem
                        key={row.id}
                        row={row}
                        index={i + 1}
                        onView={(data) => setSelectedOrder(data)}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Container>

      {/* Drawer */}
      <OrderDetailDrawer
        open={Boolean(selectedOrder)}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </Box>
  );
}