/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useMemo, useEffect } from "react";
import {
  Box,
  Container,
  Stack,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useGetOrderAllQuery } from "../../../../../services/orderApi";
import { useManageOrderLogic } from "./useManageOrderLogic";
import ManageOrderHeader from "./ManageOrderHeader";
import ManageOrderTable from "./ManageOrderTable";
import OrderFilterBar from "../../OrderFilterBar";
import OrderDetailDrawer from "../orderDetails/OrderDetailDrawer";

export default function ManageOrderList() {
  // 1. API Call
  const { data, isLoading, isError, refetch, isFetching } = useGetOrderAllQuery(
    { pageNumber: 1, pageSize: 50 },
    { refetchOnMountOrArgChange: true },
  );

  const rows = data?.results ?? [];

  // 2. Filter Logic
  const { filters, setFilters, resetFilters, filteredRows, pendingCount } =
    useManageOrderLogic(rows);

  // 3. Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset page เมื่อ filter เปลี่ยน
  useEffect(() => { setPage(1); }, [filters]);

  const pageRows = useMemo(
    () => filteredRows.slice((page - 1) * pageSize, page * pageSize),
    [filteredRows, page, pageSize],
  );

  // 4. Selection State
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    return rows.find((r) => r.id === selectedOrderId) ?? null;
  }, [selectedOrderId, rows]);

  if (isError) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">โหลดข้อมูลไม่สำเร็จ</Alert>
      </Container>
    );
  }

  return (
    <Box className="min-h-screen bg-[#F5F6F8] pb-12 font-sans">
      <Container maxWidth="xl" className="px-4 md:px-8 pt-6 md:pt-8">
        <Stack spacing={2.5}>

          {/* ── 1. Header ── */}
          <ManageOrderHeader
            pendingCount={pendingCount}
            isFetching={isFetching}
            onRefresh={refetch}
          />

          {/* ── 2. Filter Card ── */}
          <Paper
            elevation={0}
            className="bg-white rounded-3xl shadow-sm border border-gray-200"
            sx={{ px: { xs: 2.5, md: 4 }, py: { xs: 2, md: 3 } }}
          >
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
            <Typography
              className="text-[#E63946] font-bold mt-4 flex items-center gap-2"
              sx={{ fontSize: { xs: "0.95rem", md: "1.1rem" }, fontWeight: 700, mt: 2 }}
            >
              <Box
                component="span"
                sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#E63946", display: "inline-block" }}
              />
              รายการที่พบทั้งหมด: {filteredRows.length} รายการ
            </Typography>
          </Paper>

          {/* ── 3. Table Card ── */}
          {isLoading ? (
            <Box className="flex flex-col justify-center items-center min-h-64 gap-4">
              <CircularProgress size={56} thickness={4} sx={{ color: "#D32F2F" }} />
              <Typography variant="h6" className="text-gray-500 font-semibold">
                กำลังโหลดข้อมูล...
              </Typography>
            </Box>
          ) : (
            <ManageOrderTable
              rows={pageRows}
              totalCount={filteredRows.length}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
              onSelectOrder={setSelectedOrderId}
              onClearFilters={resetFilters}
            />
          )}

        </Stack>
      </Container>

      {/* Drawer */}
      <OrderDetailDrawer
        open={Boolean(selectedOrder)}
        order={selectedOrder}
        onClose={() => setSelectedOrderId(null)}
      />

      {/* Pulse animation */}
      <style>{`@keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.8; transform:scale(1.05); } }`}</style>
    </Box>
  );
}
