/* eslint-disable no-constant-binary-expression */
import { Container, Grid, Stack, Box, Typography } from "@mui/material";
import { Wallet, TrendingUp, ShoppingBag, Clock } from "lucide-react";
import { useGetFullDashboardQuery } from "../../../../services/dashboardApi";
import { motion } from "framer-motion";
import DashboardHeader from "./DashboardHeader";
import StatsGrid from "./StatsGrid";
import RevenueStream from "./RevenueStream";
import TopPerformers from "./TopPerformers";
import StatusDistribution from "./StatusDistribution";
import EfficiencyMetrics from "./EfficiencyMetrics";
import LoadingScreen from "./LoadingScreen";

const Dashboard = () => {
  const { data: dashboard, isLoading, refetch } = useGetFullDashboardQuery();

  if (isLoading) return <LoadingScreen />;

  // ข้อมูล Mock-up สำหรับ EfficiencyMetrics (รอเชื่อมต่อ Backend)
  const efficiencyData = {
    aov: dashboard?.averageOrderValue || 0,
    successRate: 98.5, // TODO: รับค่าจริงจาก Backend
    prepTime: 12, // TODO: รับค่าจริงจาก Backend
  };

  const kpis = [
    {
      label: "ยอดขายรวม",
      val: dashboard?.totalRevenue,
      icon: <Wallet size={24} />,
      color: "primary.main", // ใช้สีจาก Theme
      bgColor: "primary.light",
      suffix: "฿",
      trend: "+12.5%", // Mock
      trendColor: "success.main",
    },
    {
      label: "ยอดขายวันนี้",
      val: dashboard?.todayRevenue,
      icon: <TrendingUp size={24} />,
      color: "success.main",
      bgColor: "success.light",
      suffix: "฿",
      trend: `${dashboard?.revenueGrowthPercentage}%` || "0%",
      trendColor:
        (dashboard?.revenueGrowthPercentage || 0) >= 0
          ? "success.main"
          : "error.main",
    },
    {
      label: "ออเดอร์ทั้งหมด",
      val: dashboard?.totalOrders,
      icon: <ShoppingBag size={24} />,
      color: "warning.main",
      bgColor: "warning.light",
      suffix: "รายการ",
    },
    {
      label: "รอปรุง (Pending)",
      val: dashboard?.pendingOrders,
      icon: <Clock size={24} />,
      color: "error.main",
      bgColor: "error.light",
      suffix: "จาน",
    },
  ];

  // Animation variants สำหรับการปรากฏของ Section ต่างๆ
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    // ใช้ Container เพื่อแก้ปัญหา layout ชิดขอบ
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Stack spacing={4}>
          {" "}
          {/* ใช้ Stack เพื่อเว้นระยะห่างระหว่าง Section */}
          {/* 1. Header */}
          <motion.div variants={itemVariants}>
            <DashboardHeader onRefresh={refetch} />
          </motion.div>
          {/* 2. KPI Cards */}
          <motion.div variants={itemVariants}>
            <StatsGrid kpis={kpis} />
          </motion.div>
          {/* 3. Main Content Grid */}
          <Grid container spacing={4} alignItems="stretch">
            {" "}
            {/* alignItems="stretch" ให้ความสูงเท่ากัน */}
            {/* กราฟรายได้ */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <motion.div variants={itemVariants} style={{ height: "100%" }}>
                <RevenueStream data={dashboard?.weeklyRevenue || []} />
              </motion.div>
            </Grid>
            {/* รายการสินค้าขายดี */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <motion.div variants={itemVariants} style={{ height: "100%" }}>
                <TopPerformers items={dashboard?.topSellingItems || []} />
              </motion.div>
            </Grid>
            {/* สัดส่วนสถานะออเดอร์ */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <motion.div variants={itemVariants} style={{ height: "100%" }}>
                <StatusDistribution data={dashboard?.orderStatusCount || {}} />
              </motion.div>
            </Grid>
            {/* ประสิทธิภาพการดำเนินงาน */}
            <Grid size={{ xs: 12, md: 6, lg: 8 }}>
              <motion.div variants={itemVariants} style={{ height: "100%" }}>
                <EfficiencyMetrics {...efficiencyData} />
              </motion.div>
            </Grid>
          </Grid>
          {/* Footer (Optional) */}
          <motion.div variants={itemVariants}>
            <Box
              sx={{
                textAlign: "center",
                py: 2,
                borderTop: 1,
                borderColor: "divider",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                © {new Date().getFullYear()} POS System. All rights reserved.
              </Typography>
            </Box>
          </motion.div>
        </Stack>
      </motion.div>
    </Container>
  );
};

export default Dashboard;
