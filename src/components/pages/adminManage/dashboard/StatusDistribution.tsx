/* eslint-disable @typescript-eslint/no-explicit-any */
import Chart from "react-apexcharts";
import { Paper, Typography, Box } from "@mui/material";

// Helper สำหรับแปลงชื่อ Status ให้สวยงาม (ถ้าต้องการ)
const formatStatus = (status: string) => {
  // เช่น เปลี่ยนจาก "PendingPayment" เป็น "Pending Payment"
  return status.replace(/([A-Z])/g, ' $1').trim();
};

const StatusDistribution = ({ data }: { data: Record<string, number> }) => {
  const labels = Object.keys(data || {});
  const series = Object.values(data || {});
  
  // กำหนดสีเผื่อไว้กรณี Status เยอะกว่าที่คิด
  const statusColors = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6", "#64748b", "#06b6d4"];

  const options: any = {
    labels: labels.map(formatStatus), // แปลงชื่อให้สวยก่อนโชว์
    colors: statusColors,
    legend: { show: false }, // ปิด Legend มาตรฐานเพื่อใช้ Custom ด้านล่างแทน (แบบที่คุณทำ)
    stroke: { show: false },
    plotOptions: {
      pie: {
        expandOnClick: true,
        donut: {
          size: "75%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "รวมออเดอร์",
              fontSize: "14px",
              fontWeight: 700,
              color: "#64748b",
              formatter: function (w: any) {
                return w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)
              }
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    tooltip: {
       y: { formatter: (val: number) => `${val} รายการ` }
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{ p: 4, borderRadius: 8, border: "1px solid", borderColor: "divider", boxShadow: 3, height: "100%" }}
    >
      <Typography variant="h6" sx={{ fontWeight: "bold", color: "text.primary", mb: 3 }}>
        สัดส่วนสถานะออเดอร์
      </Typography>

      <Box sx={{ minHeight: 320 }}>
        {series.length > 0 ? (
          <Chart options={options} series={series} type="donut" height={320} />
        ) : (
          <Box sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.disabled">ไม่มีข้อมูลออเดอร์ในสัปดาห์นี้</Typography>
          </Box>
        )}
      </Box>

      {/* Custom Legend พื้นหลังสีเทาอ่อนแบบที่คุณทำมา ดูทันสมัยมากครับ */}
      <Box className="mt-6 grid grid-cols-2 gap-3">
        {labels.map((key, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: statusColors[i % statusColors.length] }}
              ></div>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                {formatStatus(key)}
              </Typography>
            </div>
            <Typography variant="caption" sx={{ fontWeight: 800, color: "text.primary" }}>
              {series[i]}
            </Typography>
          </div>
        ))}
      </Box>
    </Paper>
  );
};

export default StatusDistribution;