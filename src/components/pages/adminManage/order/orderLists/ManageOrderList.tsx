/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useMemo } from "react";
import { Box, Container, Alert } from "@mui/material";
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

// ✅ ดึง resetFilters ออกมาด้วย
  const { filters, setFilters, resetFilters, filteredRows, pendingCount } =
    useManageOrderLogic(rows);

  // 3. Selection State
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
    <Box sx={{ py: 3, bgcolor: "#f4f6f8", minHeight: "100vh" }}>
      <Container maxWidth="xl">
        {/* Header */}
        <ManageOrderHeader
          pendingCount={pendingCount}
          isFetching={isFetching}
          onRefresh={refetch}
        />

        {/* Table & Filters */}
        <ManageOrderTable
          isLoading={isLoading}
          rows={filteredRows}
          onSelectOrder={setSelectedOrderId}
          onClearFilters={resetFilters}
        >
          <OrderFilterBar
            q={filters.q}
            status={filters.status}
            pay={filters.pay}
            channel={filters.channel}
            onSearch={(v) => setFilters((prev) => ({ ...prev, q: v }))}
            onStatusChange={(v) =>
              setFilters((prev) => ({ ...prev, status: v }))
            }
            onPayChange={(v) => setFilters((prev) => ({ ...prev, pay: v }))}
            onChannelChange={(v) =>
              setFilters((prev) => ({ ...prev, channel: v }))
            }
          />
        </ManageOrderTable>
      </Container>

      {/* Drawer */}
      <OrderDetailDrawer
        open={Boolean(selectedOrder)}
        order={selectedOrder}
        onClose={() => setSelectedOrderId(null)}
      />

      {/* Global Styles */}
      <style>{`@keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } 100% { opacity: 1; transform: scale(1); } }`}</style>
    </Box>
  );
}
