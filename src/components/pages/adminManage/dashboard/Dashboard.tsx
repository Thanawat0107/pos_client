/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Container, Grid, Stack, Box, Typography, Paper } from "@mui/material";
import {
  Wallet,
  TrendingUp,
  ShoppingBag,
  Clock,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  useGetFullDashboardQuery,
  useGetRevenueReportQuery,
  useGetTopSellingItemsQuery,
  useGetDetailedReportQuery,
} from "../../../../services/dashboardApi";
import { motion, AnimatePresence } from "framer-motion";
import dayjs, { Dayjs } from "dayjs";

// Import Sub-components
import DashboardHeader from "./DashboardHeader";
import StatsGrid from "./StatsGrid";
import RevenueStream from "./RevenueStream";
import TopPerformers from "./TopPerformers";
import StatusDistribution from "./StatusDistribution";
import EfficiencyMetrics from "./EfficiencyMetrics";
import LoadingScreen from "./LoadingScreen";
import DetailedReportTable from "./DetailedReportTable";

const Dashboard = () => {
  const [filters, setFilters] = useState({
    startDate: dayjs().subtract(7, "day"),
    endDate: dayjs(),
    viewType: "day",
  });

  const [searchTerm, setSearchTerm] = useState("");

  const queryParams = {
    start: filters.startDate.toISOString(),
    end: filters.endDate.toISOString(),
  };

  const {
    data: dashboard,
    isLoading: isFullLoading,
    refetch: refetchFull,
  } = useGetFullDashboardQuery(queryParams);

  const {
    data: revenueReport,
    isFetching: isReportLoading,
    refetch: refetchReport,
  } = useGetRevenueReportQuery({ ...queryParams, viewType: filters.viewType });

  const {
    data: topSellingDetail,
    isFetching: isTopLoading,
    refetch: refetchTop,
  } = useGetTopSellingItemsQuery({ ...queryParams, count: 5 });

  const {
    data: detailedData,
    isFetching: isDetailedLoading,
    refetch: refetchDetailed,
  } = useGetDetailedReportQuery({ ...queryParams, search: searchTerm });

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

  if (isFullLoading) return <LoadingScreen />;

  const efficiencyData = {
    aov: dashboard?.averageOrderValue || 0,
    successRate: dashboard?.successRate || 0,
    prepTime: dashboard?.averagePrepTime || 0,
  };

  const kpis = [
    {
      label: "ยอดขายรวมทั้งหมด",
      val: dashboard?.totalRevenue || 0,
      icon: <Wallet size={28} />,
      color: "#2563eb",
      bgColor: "#eff6ff",
      suffix: "฿",
      subLabel: `ประมาณการกำไร: ฿${dashboard?.totalProfit?.toLocaleString()}`,
    },
    {
      label: "รายได้สะสมวันนี้",
      val: dashboard?.todayRevenue || 0,
      icon: <TrendingUp size={28} />,
      color: "#10b981",
      bgColor: "#ecfdf5",
      suffix: "฿",
      trend: `${(dashboard?.revenueGrowthPercentage ?? 0) >= 0 ? "+" : ""}${dashboard?.revenueGrowthPercentage ?? 0}%`,
      trendColor:
        (dashboard?.revenueGrowthPercentage ?? 0) >= 0 ? "#10b981" : "#ef4444",
    },
    {
      label: "รายการออเดอร์ทั้งหมด",
      val: dashboard?.totalOrders || 0,
      icon: <ShoppingBag size={28} />,
      color: "#d97706",
      bgColor: "#fffbeb",
      suffix: "ออเดอร์",
      subLabel: `ยกเลิกแล้ว: ${dashboard?.totalCancelledOrders || 0} รายการ`,
    },
    {
      label: "ออเดอร์รอปรุงอาหาร",
      val: dashboard?.pendingOrders || 0,
      icon: <Clock size={28} />,
      color: "#e11d48",
      bgColor: "#fff1f2",
      suffix: "รายการ",
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", py: { xs: 4, md: 8 } }}>
      <Container maxWidth="xl" sx={{ px: { xs: 3, md: 6 } }}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
          }}
        >
          <Stack spacing={5}>
            {/* ส่วนที่ 1: หัวข้อหลักและตัวกรอง */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: -20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 5,
                  borderRadius: "32px",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0 10px 40px -10px rgba(0,0,0,0.03)",
                }}
              >
                <DashboardHeader
                  onRefresh={handleRefresh}
                  startDate={filters.startDate}
                  endDate={filters.endDate}
                  viewType={filters.viewType}
                  onDateChange={handleFilterChange}
                  data={dashboard}
                  detailedData={detailedData}
                />
              </Paper>
            </motion.div>

            {/* ส่วนที่ 2: การ์ดสรุปยอด (KPIs) */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <StatsGrid kpis={kpis} />
            </motion.div>

            {/* ส่วนที่ 3: กราฟวิเคราะห์และสินค้าขายดี */}
            <Grid container spacing={4} alignItems="stretch">
              <Grid size={{ xs: 12, lg: 8 }}>
                <Box
                  className={`transition-all duration-500 ${isReportLoading ? "opacity-30 blur-sm" : "opacity-100"}`}
                  sx={{ height: "100%" }}
                >
                  <RevenueStream
                    data={revenueReport || []}
                    title={
                      filters.viewType === "day"
                        ? "รายวัน"
                        : filters.viewType === "month"
                          ? "รายเดือน"
                          : "รายปี"
                    }
                  />
                </Box>
              </Grid>

              <Grid size={{ xs: 12, lg: 4 }}>
                <Box
                  className={`transition-all duration-500 ${isTopLoading ? "opacity-30 blur-sm" : "opacity-100"}`}
                  sx={{ height: "100%" }}
                >
                  <TopPerformers
                    items={topSellingDetail || dashboard?.topSellingItems || []}
                  />
                </Box>
              </Grid>

              {/* ส่วนที่ 4: สัดส่วนและประสิทธิภาพ */}
              <Grid size={{ xs: 12, md: 5, lg: 4 }}>
                <Box sx={{ height: "100%" }}>
                  <StatusDistribution
                    data={dashboard?.orderStatusCount || {}}
                  />
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 7, lg: 8 }}>
                <Box sx={{ height: "100%" }}>
                  <EfficiencyMetrics {...efficiencyData} />
                </Box>
              </Grid>
            </Grid>

            {/* ส่วนที่ 5: ตารางรายละเอียดเชิงลึก */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  borderRadius: "32px",
                  border: "1px solid",
                  borderColor: "divider",
                  overflow: "hidden",
                  boxShadow: "0 10px 40px -10px rgba(0,0,0,0.03)",
                }}
              >
                <Box
                  sx={{
                    p: 5,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    bgcolor: "#fcfdfe",
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        p: 1,
                        bgcolor: "indigo.50",
                        borderRadius: "12px",
                        color: "indigo.600",
                        display: "flex",
                      }}
                    >
                      <Sparkles size={24} />
                    </Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 900,
                        color: "text.primary",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      รายงานการสั่งอาหารเชิงลึก
                    </Typography>
                  </Stack>
                </Box>
                <Box sx={{ p: 2 }}>
                  <DetailedReportTable
                    data={detailedData || []}
                    loading={isDetailedLoading}
                    onSearch={(val) => setSearchTerm(val)}
                  />
                </Box>
              </Paper>
            </motion.div>

            {/* ส่วนที่ 6: ข้อมูลเชิงลึกโปรโมชัน (Banner) */}
            <AnimatePresence>
              {dashboard?.promoUsageStats &&
                Object.keys(dashboard.promoUsageStats).length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Box
                      sx={{
                        p: 5,
                        borderRadius: "32px",
                        bgcolor: "#1e1b4b",
                        color: "white",
                        position: "relative",
                        overflow: "hidden",
                        boxShadow: "0 20px 40px -10px rgba(30, 27, 75, 0.3)",
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          top: -50,
                          right: -50,
                          width: 250,
                          height: 250,
                          bgcolor: "rgba(79, 70, 229, 0.2)",
                          borderRadius: "50%",
                          filter: "blur(60px)",
                        }}
                      />

                      <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={4}
                        alignItems="center"
                        sx={{ position: "relative", zIndex: 1 }}
                      >
                        <Box
                          sx={{
                            p: 3,
                            bgcolor: "rgba(255,255,255,0.1)",
                            backdropFilter: "blur(10px)",
                            borderRadius: "24px",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          <Zap size={32} className="text-amber-400" />
                        </Box>
                        <Box>
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 900,
                              mb: 1,
                              letterSpacing: "0.02em",
                            }}
                          >
                            ข้อมูลเชิงลึกด้านโปรโมชัน (Promotion Insights)
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{ color: "indigo.100", fontWeight: 500 }}
                          >
                            โปรโมชันที่มียอดการใช้งานสูงสุด:{" "}
                            <Box
                              component="span"
                              sx={{
                                color: "#fbbf24",
                                fontWeight: 900,
                                fontSize: "1.5rem",
                                ml: 1,
                                textShadow: "0 0 15px rgba(251, 191, 36, 0.4)",
                              }}
                            >
                              {Object.entries(dashboard.promoUsageStats)
                                .sort(([, a]: any, [, b]: any) => b - a)
                                .slice(0, 1)
                                .map(
                                  ([code, count]) => `${code} (${count} ครั้ง)`,
                                )}
                            </Box>
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </motion.div>
                )}
            </AnimatePresence>
          </Stack>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Dashboard;
