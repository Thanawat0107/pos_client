import { useState, useMemo } from "react";
import type { OrderHeader } from "../../../../../@types/dto/OrderHeader";
import { Sd } from "../../../../../helpers/SD";

const UNPAID = "UNPAID";
const ALL = "all";

export function useManageOrderLogic(rows: OrderHeader[]) {
  const [filters, setFilters] = useState({
    q: "",
    status: ALL,
    pay: ALL,
    channel: ALL,
  });

  const resetFilters = () => {
    setFilters({
      q: "",
      status: ALL,
      pay: ALL,
      channel: ALL,
    });
  };

  // Filter & Sorting Logic
  const filteredRows = useMemo(() => {
    return rows
      .filter((r) => {
        const searchLower = filters.q.toLowerCase();

        // 1. Search
        const matchesQ =
          !filters.q ||
          r.orderCode.toLowerCase().includes(searchLower) ||
          (r.customerName &&
            r.customerName.toLowerCase().includes(searchLower)) ||
          r.customerPhone.includes(filters.q);

        // 2. Status
        const matchesStatus =
          filters.status === ALL || r.orderStatus === filters.status;

        // 3. Channel
        const matchesChannel =
          filters.channel === ALL || r.channel === filters.channel;

        // 4. Payment Logic
        let matchesPay = true;
        if (filters.pay === UNPAID) {
          const isActiveStatuses = [
            Sd.Status_Approved,
            Sd.Status_Preparing,
            Sd.Status_Ready,
          ].includes(r.orderStatus);
          matchesPay =
            r.orderStatus === Sd.Status_PendingPayment ||
            r.orderStatus === Sd.Status_Pending ||
            (isActiveStatuses && !r.paidAt);
        } else if (filters.pay === Sd.Status_Paid) {
          matchesPay =
            r.orderStatus === Sd.Status_Paid ||
            r.orderStatus === Sd.Status_Completed ||
            r.paidAt != null;
        }

        return matchesQ && matchesStatus && matchesChannel && matchesPay;
      })
      .sort((a, b) => {
        // Priority Sorting
        if (
          a.orderStatus === Sd.Status_Pending &&
          b.orderStatus !== Sd.Status_Pending
        )
          return -1;
        if (
          a.orderStatus !== Sd.Status_Pending &&
          b.orderStatus === Sd.Status_Pending
        )
          return 1;

        if (
          a.orderStatus === Sd.Status_PendingPayment &&
          b.orderStatus !== Sd.Status_PendingPayment
        )
          return -1;
        if (
          a.orderStatus !== Sd.Status_PendingPayment &&
          b.orderStatus === Sd.Status_PendingPayment
        )
          return 1;

        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  }, [rows, filters]);

  const pendingCount = rows.filter(
    (r) => r.orderStatus === Sd.Status_Pending,
  ).length;

  return {
    filters,
    setFilters,
    resetFilters,
    filteredRows,
    pendingCount,
  };
}
