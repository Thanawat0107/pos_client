/* eslint-disable @typescript-eslint/no-explicit-any */
import Chart from "react-apexcharts";
import { Paper, Typography, Box, Stack } from "@mui/material";
import { PieChart, ListFilter, Circle } from "lucide-react";
import { alpha } from "@mui/material/styles";

// Helper สำหรับแปลสถานะเป็นไทย
const formatStatusThai = (status: string) => {
  const statusMap: Record<string, string> = {
    completed: "ทำเสร็จแล้ว",
    pending: "รอรับออเดอร์",
    cooking: "กำลังปรุงอาหาร",
    cancelled: "ยกเลิกรายการ",
    pendingpayment: "รอชำระเงิน",
  };

  const lowerStatus = status.toLowerCase();
  return statusMap[lowerStatus] || status;
};

const StatusDistribution = ({ data }: { data: Record<string, number> }) => {
  const labels = Object.keys(data || {});
  const series = Object.values(data || {});

  // กำหนดโทนสีให้ดูสดใสและพรีเมียม
  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("complete")) return "#10b981"; // เขียวสด
    if (s.includes("pending") || s.includes("cook")) return "#f59e0b"; // ส้มทอง
    if (s.includes("cancel") || s.includes("fail")) return "#f43f5e"; // แดงกุหลาบ
    return "#6366f1"; // Indigo สำหรับสถานะอื่นๆ
  };

  const statusColors = labels.map(getStatusColor);

  const options: any = {
    labels: labels.map(formatStatusThai),
    colors: statusColors,
    legend: { show: false },
    stroke: { width: 4, colors: ["#ffffff"] },
    chart: {
      // ✨ เพิ่มมิติให้กราฟ Donut
      dropShadow: {
        enabled: true,
        blur: 10,
        left: 0,
        top: 5,
        opacity: 0.1,
        color: "#000",
      },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "78%", // ปรับวงในให้กว้างขึ้น ดูทันสมัย
          labels: {
            show: true,
            total: {
              show: true,
              label: "รวมรายการ",
              fontSize: "16px",
              fontFamily: "'Inter', 'Kanit', sans-serif",
              fontWeight: 600,
              color: "#94a3b8",
              formatter: function (w: any) {
                return w.globals.seriesTotals
                  .reduce((a: number, b: number) => a + b, 0)
                  .toLocaleString();
              },
            },
            value: {
              fontSize: "36px", // ขยายตัวเลขตรงกลางให้เด่นชัด
              fontFamily: "'Inter', sans-serif",
              fontWeight: 900,
              color: "#1e293b",
              offsetY: 8,
              formatter: (val: string) => val,
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    tooltip: {
      theme: "light",
      y: {
        formatter: (val: number) => `${val.toLocaleString()} รายการ`,
      },
    },
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "32px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 4px 20px -5px rgba(0,0,0,0.05)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header ส่วนหัว */}
      <Box sx={{ px: 5, pt: 5, pb: 3 }}>
        <Stack spacing={1.5}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                color: "#6366f1",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                bgcolor: "#f5f3ff",
                px: 1.5,
                py: 0.5,
                borderRadius: "20px",
                border: "1px solid #ede9fe",
              }}
            >
              <Circle size={8} fill="#6366f1" /> อัปเดตล่าสุดวันนี้
            </Typography>
          </Box>

          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                p: 1.5,
                bgcolor: "#f5f3ff",
                color: "#6366f1",
                borderRadius: "16px",
                display: "flex",
              }}
            >
              <PieChart size={28} />
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                color: "text.primary",
                letterSpacing: "-0.02em",
              }}
            >
              สัดส่วนออเดอร์
            </Typography>
          </Stack>

          <Typography
            variant="body1"
            sx={{ color: "text.secondary", fontWeight: 500, ml: 7 }}
          >
            การกระจายตัวของ{" "}
            <span style={{ fontWeight: 700, color: "#6366f1" }}>
              สถานะคำสั่งซื้อ
            </span>{" "}
            ทั้งหมด
          </Typography>
        </Stack>
      </Box>

      {/* Chart Area กราฟวงกลม */}
      <Box
        sx={{
          px: 5,
          py: 2,
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "320px",
        }}
      >
        {series.length > 0 ? (
          <Chart
            options={options}
            series={series}
            type="donut"
            width="100%"
            height={320}
          />
        ) : (
          <Stack
            alignItems="center"
            spacing={2}
            sx={{ color: "text.disabled", py: 5 }}
          >
            <Box sx={{ p: 3, bgcolor: "#f8fafc", borderRadius: "50%" }}>
              <ListFilter size={48} strokeWidth={1} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              ยังไม่มีข้อมูลคำสั่งซื้อ
            </Typography>
          </Stack>
        )}
      </Box>

      {/* Custom Legend (การ์ดสถานะ) */}
      <Box sx={{ px: 5, pb: 5, mt: "auto" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 2,
          }}
        >
          {labels.map((key, i) => {
            const color = statusColors[i];
            return (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 2.5,
                  borderRadius: "20px",
                  bgcolor: alpha(color, 0.05),
                  border: "1px solid",
                  borderColor: alpha(color, 0.1),
                  transition: "0.2s",
                  "&:hover": {
                    bgcolor: alpha(color, 0.08),
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: color,
                      boxShadow: `0 0 10px ${alpha(color, 0.5)}`,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 800,
                      color: "text.primary",
                      fontSize: "0.9rem",
                    }}
                  >
                    {formatStatusThai(key)}
                  </Typography>
                </Stack>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 900, color: "text.primary" }}
                >
                  {series[i].toLocaleString()}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Paper>
  );
};

export default StatusDistribution;
