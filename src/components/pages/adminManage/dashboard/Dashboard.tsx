/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Chart from "react-apexcharts";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  ShoppingBag,
  Clock,
  Crown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useGetFullDashboardQuery } from "../../../../services/dashboardApi";

const Dashboard = () => {
  const { data: dashboard, isLoading } = useGetFullDashboardQuery();

  if (isLoading)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="text-5xl mb-4"
        >
          🍜
        </motion.div>
        <p className="text-slate-500 font-medium animate-pulse">
          กำลังจัดจานข้อมูล...
        </p>
      </div>
    );

  // การตั้งค่ากราฟรายได้ (Main Chart)
  const revenueChartOptions: any = {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
      sparkline: { enabled: false },
    },
    colors: ["#3b82f6"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories: dashboard?.weeklyRevenue?.map((d) => d.date) || [],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: "#94a3b8", fontSize: "12px" } },
    },
    yaxis: { labels: { show: false } },
    grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
    tooltip: { x: { show: true }, theme: "light" },
  };

  // การตั้งค่ากราฟวงกลม (Status Distribution)
  const statusChartOptions: any = {
    labels: Object.keys(dashboard?.orderStatusCount || {}),
    colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
    legend: { position: "bottom" },
    plotOptions: { pie: { donut: { size: "70%" } } },
    dataLabels: { enabled: false },
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Master Dashboard
          </h1>
          <p className="text-slate-500">
            รายงานวิเคราะห์ระบบร้านก๋วยเตี๋ยว (Full-Option)
          </p>
        </div>
        <div className="hidden md:block text-right text-sm text-slate-400">
          อัปเดตล่าสุด: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* --- KPI Cards พร้อม Animation --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="ยอดขายรวม"
          value={dashboard?.totalRevenue?.toLocaleString()}
          suffix="฿"
          icon={<Users size={20} />}
          color="blue"
          index={0}
        />
        <StatCard
          label="วันนี้"
          value={dashboard?.todayRevenue?.toLocaleString()}
          suffix="฿"
          icon={<TrendingUp size={20} />}
          trend={dashboard?.revenueGrowthPercentage}
          color="emerald"
          index={1}
        />
        <StatCard
          label="ออเดอร์สะสม"
          value={dashboard?.totalOrders}
          icon={<ShoppingBag size={20} />}
          color="violet"
          index={2}
        />
        <StatCard
          label="Pending"
          value={dashboard?.pendingOrders}
          icon={<Clock size={20} />}
          color="amber"
          index={3}
        />
      </div>

      {/* --- Main Content Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* กราฟรายได้ตัวหลัก - ทรงพลังมาก */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 text-lg">Revenue Stream</h3>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
              LAST 7 DAYS
            </span>
          </div>
          <Chart
            options={revenueChartOptions}
            series={[
              {
                name: "ยอดขาย",
                data: dashboard?.weeklyRevenue?.map((d) => d.amount) || [],
              },
            ]}
            type="area"
            height={320}
          />
        </motion.div>

        {/* เมนูขายดี - สไตล์ Leaderboard */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl"
        >
          <div className="flex items-center gap-2 mb-6 text-amber-400">
            <Crown size={24} />
            <h3 className="font-bold text-lg">Top Performers</h3>
          </div>
          <div className="space-y-6">
            {dashboard?.topSellingItems?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${idx === 0 ? "bg-amber-400 text-slate-900" : "bg-slate-800"}`}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{item.menuItemName}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                      {item.totalQuantity} Bowls sold
                    </p>
                  </div>
                </div>
                <p className="font-bold text-sm text-amber-400">
                  {item.totalRevenue?.toLocaleString()}฿
                </p>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-all">
            VIEW ALL ANALYTICS
          </button>
        </motion.div>

        {/* กราฟวงกลม - สถานะออเดอร์ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <h3 className="font-bold text-slate-800 text-lg mb-4">
            Order Distribution
          </h3>
          <Chart
            options={statusChartOptions}
            series={Object.values(dashboard?.orderStatusCount || {})}
            type="donut"
            height={250}
          />
        </motion.div>
      </div>
    </div>
  );
};

// Sub-component สำหรับ Stat Card ที่มีความเด้ง (Bounce)
const StatCard = ({
  label,
  value,
  suffix = "",
  icon,
  trend,
  color,
  index,
}: any) => {
  const colors: any = {
    blue: "bg-blue-600 shadow-blue-200",
    emerald: "bg-emerald-500 shadow-emerald-200",
    violet: "bg-violet-600 shadow-violet-200",
    amber: "bg-amber-500 shadow-amber-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-50 relative overflow-hidden group"
    >
      <div
        className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-500 ${colors[color]}`}
      ></div>
      <div className="flex justify-between items-start mb-4">
        <div
          className={`p-3 rounded-2xl text-white ${colors[color]} shadow-lg`}
        >
          {icon}
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-bold ${trend >= 0 ? "text-emerald-500" : "text-rose-500"}`}
          >
            {trend >= 0 ? (
              <ArrowUpRight size={16} />
            ) : (
              <ArrowDownRight size={16} />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
        {label}
      </p>
      <div className="flex items-baseline gap-1">
        <h2 className="text-2xl font-black text-slate-800">{value}</h2>
        <span className="text-slate-400 font-bold text-sm">{suffix}</span>
      </div>
    </motion.div>
  );
};

export default Dashboard;
