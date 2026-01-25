/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
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
  CircularProgress,
  Alert,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

// --- Components ---
import ManageOrderItem from "./ManageOrderItem";
import OrderDetailDrawer from "./OrderDetailDrawer"; // นำเข้า Drawer ที่เราสร้าง
import OrderFilterBar from "../OrderFilterBar";

// --- API & Types ---
import { useGetOrderAllQuery } from "../../../../services/orderApi";
import type { OrderHeader } from "../../../../@types/dto/OrderHeader";

export default function ManageOrderList() {
  // 1. State สำหรับการกรองข้อมูล
  // ✅ เพิ่ม State ให้ครบตาม FilterBar
  const [filters, setFilters] = useState({
    q: "",
    status: "all",
    pay: "all",
    channel: "all",
  });
  // 2. State สำหรับการเลือกออเดอร์เพื่อดูรายละเอียด (ใช้เปิด/ปิด Drawer)
  const [selectedOrder, setSelectedOrder] = useState<OrderHeader | null>(null);

  // 3. ดึงข้อมูลจาก API (ดึงมา 1000 รายการเพื่อทำ Client-side Filtering ตามตัวอย่างเดิม)
  const { data, isLoading, isError, refetch } = useGetOrderAllQuery({
    pageNumber: 1,
    pageSize: 1000,
  });

  // เข้าถึง array ข้อมูลผ่าน data.results
  const rows = data?.results ?? [];

  // 4. Logic การกรองและจัดเรียงข้อมูล (Client-side)
  // ✅ ปรับลอจิกการกรอง (useMemo)
  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      const searchLower = filters.q.toLowerCase();
      
      const matchesQ = !filters.q || 
        r.orderCode.toLowerCase().includes(searchLower) ||
        (r.customerName && r.customerName.toLowerCase().includes(searchLower)) ||
        r.customerPhone.includes(filters.q);

      const matchesStatus = filters.status === "all" || r.orderStatus === filters.status;
      
      // หมายเหตุ: ถ้าใน OrderHeader ไม่มีฟิลด์ payStatus ให้กรองจาก orderStatus แทนได้
      const matchesChannel = filters.channel === "all" || r.channel === filters.channel;

      return matchesQ && matchesStatus && matchesChannel;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [rows, filters]);

  // --- UI Handling ---
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">
          ไม่สามารถโหลดข้อมูลออเดอร์ได้ กรุณาลองใหม่อีกครั้ง
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          mb={3}
        >
          <Typography variant="h5" fontWeight={800}>
            จัดการรายการคำสั่งซื้อ
          </Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            variant="outlined"
            disabled={isLoading}
          >
            รีเฟรชข้อมูล
          </Button>
        </Stack>

        {/* Filter Bar */}
        <OrderFilterBar 
          q={filters.q}
          status={filters.status as any}
          pay={filters.pay as any}
          channel={filters.channel as any}
          onSearch={(v) => setFilters(prev => ({ ...prev, q: v }))}
          onStatusChange={(v) => setFilters(prev => ({ ...prev, status: v }))}
          onPayChange={(v) => setFilters(prev => ({ ...prev, pay: v }))}
          onChannelChange={(v) => setFilters(prev => ({ ...prev, channel: v }))}
        />

        {/* ข้อมูลสรุปจำนวนรายการ */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          พบทั้งหมด {filteredRows.length} รายการ
        </Typography>

        {/* Table Section */}
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderRadius: 2, overflow: "hidden" }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell
                  align="center"
                  sx={{ fontWeight: "bold", width: 60 }}
                >
                  #
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  เลขออเดอร์ / รหัสรับ
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>ลูกค้า</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  ยอดรวมสุทธิ
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>สถานะออเดอร์</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  เวลาที่สั่งซื้อ
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  จัดการ
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.map((row, i) => (
                <ManageOrderItem
                  key={row.id}
                  row={row}
                  index={i + 1}
                  // ✅ เมื่อกดปุ่มใน Item ให้เซ็ต State เพื่อเปิด Drawer
                  onView={(data) => setSelectedOrder(data)}
                />
              ))}

              {filteredRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">
                      ไม่พบรายการคำสั่งซื้อ
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      {/* --- Side Drawer สำหรับแสดงรายละเอียด Full Option --- */}
      <OrderDetailDrawer
        open={Boolean(selectedOrder)}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </Box>
  );
}
