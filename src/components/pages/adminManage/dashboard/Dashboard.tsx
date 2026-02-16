import { useState } from "react";
import { Container, Grid, Stack, Box, Typography } from "@mui/material";
import {
  Wallet,
  TrendingUp,
  ShoppingBag,
  Clock,
  BarChart3,
} from "lucide-react";
import {
  useGetFullDashboardQuery,
  useGetRevenueReportQuery,
  useGetTopSellingItemsQuery,
  useGetDetailedReportQuery, // ✨ เพิ่ม API เส้นรายงานละเอียด
} from "../../../../services/dashboardApi";
import { motion } from "framer-motion";
import dayjs, { Dayjs } from "dayjs";

// Import Sub-components
import DashboardHeader from "./DashboardHeader";
import StatsGrid from "./StatsGrid";
import RevenueStream from "./RevenueStream";
import TopPerformers from "./TopPerformers";
import StatusDistribution from "./StatusDistribution";
import EfficiencyMetrics from "./EfficiencyMetrics";
import LoadingScreen from "./LoadingScreen";
import DetailedReportTable from "./DetailedReportTable"; // ✨ เพิ่มคอมโพเนนต์ตาราง

const Dashboard = () => {
  // --- 1. ระบบ Filter สำหรับการดูย้อนหลังอิสระ (รองรับ 3 ปี) ---
  const [filters, setFilters] = useState({
    startDate: dayjs().subtract(7, "day"),
    endDate: dayjs(),
    viewType: "day",
  });

  // ✨ State สำหรับการค้นหาในตารางรายงานละเอียด
  const [searchTerm, setSearchTerm] = useState("");

  // --- 2. เรียกใช้ API ทั้ง 4 เส้นพร้อมกันโดยส่งค่า Filter ไปด้วย ---

  // เส้นที่ 1: ข้อมูลสรุปภาพรวม (KPIs, Status Count, Efficiency)
  const {
    data: dashboard,
    isLoading: isFullLoading,
    refetch: refetchFull,
  } = useGetFullDashboardQuery({
    start: filters.startDate.toISOString(),
    end: filters.endDate.toISOString(),
  });

  // เส้นที่ 2: รายงานรายรับสำหรับกราฟ (ปรับตามมุมมอง วัน/เดือน/ปี)
  const {
    data: revenueReport,
    isFetching: isReportLoading,
    refetch: refetchReport,
  } = useGetRevenueReportQuery({
    start: filters.startDate.toISOString(),
    end: filters.endDate.toISOString(),
    viewType: filters.viewType,
  });

  // เส้นที่ 3: รายการสินค้าขายดี (เปลี่ยนตามช่วงเวลาที่กรองจริง)
  const { 
    data: topSellingDetail, 
    isFetching: isTopLoading,
    refetch: refetchTop 
  } = useGetTopSellingItemsQuery({
    count: 5,
    start: filters.startDate.toISOString(),
    end: filters.endDate.toISOString(),
  });

  // ✨ เส้นที่ 4: รายงานละเอียดระดับ Item-level (ค้นหาได้)
  const {
    data: detailedData,
    isFetching: isDetailedLoading,
    refetch: refetchDetailed,
  } = useGetDetailedReportQuery({
    start: filters.startDate.toISOString(),
    end: filters.endDate.toISOString(),
    search: searchTerm,
  });

  // --- 3. ฟังก์ชันจัดการการเปลี่ยนแปลง ---
  
  const handleFilterChange = (
    start: Dayjs | null,
    end: Dayjs | null,
    type: string,
  ) => {
    if (start && end)
      setFilters({ startDate: start, endDate: end, viewType: type });
  };

  const handleRefresh = () => {
    refetchFull();
    refetchReport();
    refetchTop();
    refetchDetailed();
  };

  // แสดง Loading เฉพาะตอนโหลดครั้งแรก
  if (isFullLoading) return <LoadingScreen />;

  const efficiencyData = {
    aov: dashboard?.averageOrderValue || 0,
    successRate: dashboard?.successRate || 0,
    prepTime: dashboard?.averagePrepTime || 0,
  };

  const kpis = [
    {
      label: "ยอดขายรวมในช่วงนี้",
      val: dashboard?.totalRevenue || 0,
      icon: <Wallet size={24} />,
      color: "primary.main",
      bgColor: "primary.light",
      suffix: "฿",
      subLabel: `กำไรประมาณการ: ฿${dashboard?.totalProfit?.toLocaleString()}`,
    },
    {
      label: "แนวโน้มยอดขาย",
      val: dashboard?.todayRevenue || 0,
      icon: <TrendingUp size={24} />,
      color: "success.main",
      bgColor: "success.light",
      suffix: "฿",
      trend: `${(dashboard?.revenueGrowthPercentage ?? 0) >= 0 ? "+" : ""}${dashboard?.revenueGrowthPercentage ?? 0}%`,
      trendColor: (dashboard?.revenueGrowthPercentage ?? 0) >= 0 ? "success.main" : "error.main",
    },
    {
      label: "ออเดอร์ทั้งหมด",
      val: dashboard?.totalOrders || 0,
      icon: <ShoppingBag size={24} />,
      color: "warning.main",
      bgColor: "warning.light",
      suffix: "รายการ",
      subLabel: `ยกเลิก: ${dashboard?.totalCancelledOrders || 0} รายการ`,
    },
    {
      label: "รอปรุง (Pending)",
      val: dashboard?.pendingOrders || 0,
      icon: <Clock size={24} />,
      color: "error.main",
      bgColor: "error.light",
      suffix: "จาน",
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        <Stack spacing={4}>
          {/* ส่วนที่ 1: Header พร้อมระบบ Filter */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <DashboardHeader
              onRefresh={handleRefresh}
              startDate={filters.startDate}
              endDate={filters.endDate}
              viewType={filters.viewType}
              onDateChange={handleFilterChange}
            />
          </motion.div>

          {/* ส่วนที่ 2: KPI Cards */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <StatsGrid kpis={kpis} />
          </motion.div>

          {/* ส่วนที่ 3: แผนภูมิและข้อมูลเจาะลึก */}
          <Grid container spacing={4} alignItems="stretch">
            <Grid size={{ xs: 12, lg: 8 }}>
              <motion.div style={{ height: "100%", opacity: isReportLoading ? 0.6 : 1 }}>
                <RevenueStream
                  data={revenueReport || []}
                  title={filters.viewType === "day" ? "รายวัน" : filters.viewType === "month" ? "รายเดือน" : "รายปี"}
                />
              </motion.div>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <motion.div style={{ height: "100%", opacity: isTopLoading ? 0.6 : 1 }}>
                <TopPerformers items={topSellingDetail || dashboard?.topSellingItems || []} />
              </motion.div>
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <StatusDistribution data={dashboard?.orderStatusCount || {}} />
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 8 }}>
              <EfficiencyMetrics {...efficiencyData} />
            </Grid>
          </Grid>

          {/* ✨ ส่วนที่ 4: ตารางรายงานโดยละเอียด (Detailed Item-level Report) */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <DetailedReportTable
              data={detailedData || []}
              loading={isDetailedLoading}
              onSearch={(val) => setSearchTerm(val)}
            />
          </motion.div>

          {/* ส่วนที่ 5: สถิติโปรโมชั่น */}
          {dashboard?.promoUsageStats && Object.keys(dashboard.promoUsageStats).length > 0 && (
            <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2, border: "1px dashed", borderColor: "divider" }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <BarChart3 size={20} color="#6366f1" />
                <Typography variant="body2" fontWeight="bold">
                  โปรโมชั่นยอดนิยมในช่วงเวลาที่เลือก:{" "}
                  {Object.entries(dashboard.promoUsageStats)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 1)
                    .map(([code, count]) => `${code} (${count} ครั้ง)`)}
                </Typography>
              </Stack>
            </Box>
          )}
        </Stack>
      </motion.div>
    </Container>
  );
};

export default Dashboard;