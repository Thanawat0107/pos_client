/* eslint-disable @typescript-eslint/no-explicit-any */
import Chart from "react-apexcharts";
import {
  Typography,
  Chip,
  Card,
  CardHeader,
  CardContent,
  useTheme,
  Box,
} from "@mui/material";
import { BarChart3 } from "lucide-react";

// 1. ปรับ Interface ให้รับ title เข้ามาด้วย
interface RevenueStreamProps {
  data: any[];
  title: string; // รับค่าหัวข้อกราฟจากหน้า Dashboard
}

const RevenueStream = ({ data, title }: RevenueStreamProps) => {
  const theme = useTheme();

  const options: any = {
    chart: {
      type: "area",
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif",
      animations: { enabled: true, easing: "easeinout", speed: 800 },
    },
    colors: [theme.palette.primary.main],
    stroke: { curve: "smooth", width: 3 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100],
      },
    },
    markers: {
      size: data?.length > 31 ? 0 : 4, // ถ้าข้อมูลเยอะเกินไป (เช่น รายวัน 3 ปี) ให้ซ่อนจุดเพื่อความสวยงาม
      colors: [theme.palette.primary.main],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 6 },
    },
    xaxis: {
      categories: data?.map((d) => d.date) || [],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: "#94a3b8", fontWeight: 500 },
        rotate: -45, // เอียงตัวอักษรเล็กน้อยกรณีข้อมูลวันที่ยาว
        rotateAlways: false,
      },
    },
    yaxis: {
      labels: {
        style: { colors: "#94a3b8" },
        formatter: (val: number) => `฿${val.toLocaleString()}`,
      },
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
      padding: { left: 20 },
      yaxis: { lines: { show: true } },
    },
    tooltip: {
      theme: "light",
      x: { show: true },
      y: {
        formatter: (val: number) => `฿${val.toLocaleString()}`,
      },
    },
    dataLabels: { enabled: false },
  };

  const series = [
    {
      name: "รายได้",
      data: data?.map((d) => d.amount) || [],
    },
  ];

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 4px 20px 0 rgba(0,0,0,0.05)",
      }}
    >
      <CardHeader
        title={
          <Typography variant="h6" fontWeight="bold">
            กระแสรายรับ
          </Typography>
        }
        subheader={
          <Typography variant="body2" color="text.secondary">
            {/* แสดง title ที่ส่งมาจากหน้าหลัก เช่น "กราฟรายปี" */}
            แสดงผลแบบ {title}
          </Typography>
        }
        action={
          <Chip
            icon={<BarChart3 size={14} />}
            label={title} // แสดงประเภทการกรองบน Chip เช่น "กราฟรายปี"
            size="small"
            sx={{
              fontWeight: 600,
              bgcolor: "primary.lighter",
              color: "primary.main",
              border: "none",
            }}
          />
        }
        sx={{ pb: 0, pt: 3, px: 3 }}
      />
      <CardContent sx={{ px: 1 }}>
        {data && data.length > 0 ? (
          <Chart options={options} series={series} type="area" height={340} />
        ) : (
          <Box
            sx={{
              height: 340,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography color="text.disabled">
              ไม่พบข้อมูลรายได้ในช่วงเวลาที่เลือก
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueStream;
