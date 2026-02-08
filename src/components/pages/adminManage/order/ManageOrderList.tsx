/* eslint-disable react-hooks/exhaustive-deps */
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
  Chip, // ✅ เพิ่ม Chip
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'; // ✅ เพิ่ม Icon แจ้งเตือน
import ManageOrderItem from "./ManageOrderItem";
import OrderDetailDrawer from "./OrderDetailDrawer";
import OrderFilterBar from "../OrderFilterBar";
import { useGetOrderAllQuery } from "../../../../services/orderApi";
import { Sd } from "../../../../helpers/SD";

export default function ManageOrderList() {
  // State Filter
  const [filters, setFilters] = useState({
    q: "",
    status: "all",
    pay: "all",
    channel: "all",
  });
  
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // API Call
  const { data, isLoading, isError, refetch, isFetching } = useGetOrderAllQuery(
    {
      pageNumber: 1,
      pageSize: 50, // ✅ แนะนำเพิ่มจำนวนต่อหน้า เพื่อให้เห็นภาพรวมได้ครบ
    },
    {
       // pollingInterval: 15000, // (Optional) ถ้าอยากให้ Auto-refresh ทุก 15 วิ เปิดบรรทัดนี้ได้ครับ
       refetchOnMountOrArgChange: true
    }
  );

  const rows = data?.results ?? [];

  // Logic selectedOrder
  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    return rows.find((r) => r.id === selectedOrderId) ?? null;
  }, [selectedOrderId, rows]);

  // Debug log
  useEffect(() => {
    if (selectedOrder) {
      console.log("🔍 Selected Order State:", {
        id: selectedOrder.id,
        status: selectedOrder.orderStatus,
        details: selectedOrder.orderDetails.length,
      });
    }
  }, [selectedOrder]);

  // ✅ [จุดที่ 1] Filter & Sorting Logic
  const filteredRows = useMemo(() => {
    return rows
      .filter((r) => {
        const searchLower = filters.q.toLowerCase();

        // 1. Search
        const matchesQ =
          !filters.q ||
          r.orderCode.toLowerCase().includes(searchLower) ||
          (r.customerName && r.customerName.toLowerCase().includes(searchLower)) ||
          r.customerPhone.includes(filters.q);

        // 2. Status
        const matchesStatus =
          filters.status === "all" || r.orderStatus === filters.status;

        // 3. Channel
        const matchesChannel =
          filters.channel === "all" || r.channel === filters.channel;

        // 4. Payment (Logic ปรับปรุงใหม่ให้แม่นยำขึ้น)
        let matchesPay = true;
        if (filters.pay === "UNPAID") {
            // เฉพาะที่ติดสถานะ "รอชำระเงิน"
            matchesPay = r.orderStatus === Sd.Status_PendingPayment; 
        } else if (filters.pay === "PAID") {
            // สถานะเหล่านี้ถือว่า "ผ่านเรื่องเงินแล้ว" (เข้าครัวได้)
            const paidStatuses = [
                Sd.Status_Paid, 
                Sd.Status_Approved, // ✅ รวม Approved ด้วย
                Sd.Status_Preparing, 
                Sd.Status_Ready, 
                Sd.Status_Completed
            ];
            matchesPay = paidStatuses.includes(r.orderStatus);
        }

        return matchesQ && matchesStatus && matchesChannel && matchesPay;
      })
      .sort((a, b) => {
        // ✅ [จุดสำคัญ] Sorting Logic: เอา "Pending" (รออนุมัติ) ขึ้นก่อนเสมอ!
        if (a.orderStatus === Sd.Status_Pending && b.orderStatus !== Sd.Status_Pending) return -1;
        if (a.orderStatus !== Sd.Status_Pending && b.orderStatus === Sd.Status_Pending) return 1;

        // รองลงมาคือ "PendingPayment" (รอจ่าย)
        if (a.orderStatus === Sd.Status_PendingPayment && b.orderStatus !== Sd.Status_PendingPayment) return -1;
        if (a.orderStatus !== Sd.Status_PendingPayment && b.orderStatus === Sd.Status_PendingPayment) return 1;

        // สุดท้ายเรียงตามเวลาล่าสุด
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [rows, filters]);

  // ✅ [จุดที่ 2] นับจำนวนออเดอร์ที่รอการอนุมัติ
  const pendingCount = rows.filter(r => r.orderStatus === Sd.Status_Pending).length;

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
            <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="h5" fontWeight={800} sx={{ color: "#2b3445" }}>
                จัดการรายการคำสั่งซื้อ
                </Typography>
                
                {/* ✅ Badge แจ้งเตือนงานด่วน */}
                {pendingCount > 0 && (
                    <Chip 
                        icon={<NotificationsActiveIcon />} 
                        label={`รออนุมัติ ${pendingCount} รายการ`} 
                        color="warning" 
                        size="small"
                        sx={{ fontWeight: 'bold', animation: 'pulse 2s infinite' }}
                    />
                )}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              รายการออเดอร์ทั้งหมดในระบบ
            </Typography>
          </Box>
          
          <Button
            startIcon={isFetching ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
            onClick={() => refetch()}
            variant="outlined"
            disabled={isFetching}
            sx={{ 
                borderRadius: 2, 
                textTransform: "none", 
                fontWeight: 700,
                borderColor: '#ef5350',
                color: '#d32f2f',
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
                        onView={() => setSelectedOrderId(row.id)}
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
        onClose={() => setSelectedOrderId(null)}
      />
      
      {/* Animation สำหรับ Chip */}
      <style>{`
        @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
            100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </Box>
  );
}