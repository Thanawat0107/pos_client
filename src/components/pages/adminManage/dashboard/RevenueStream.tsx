/* eslint-disable @typescript-eslint/no-explicit-any */
import Chart from "react-apexcharts";
import { Typography, Chip, Card, CardHeader, Divider, CardContent, useTheme } from "@mui/material";
import { Calendar } from "lucide-react";

const RevenueStream = ({ data }: { data: any[] }) => {
  const theme = useTheme(); // เรียกใช้ Theme เพื่อดึงสี
  const options: any = {
    chart: {
      type: "area",
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif",
    },
    colors: [theme.palette.primary.main], // ใช้สีจาก Theme
    stroke: { curve: "smooth", width: 4 },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0 },
    },
    xaxis: {
      categories: data?.map((d) => d.date) || [],
      labels: { style: { colors: "#94a3b8", fontWeight: 500 } },
    },
    yaxis: { labels: { style: { colors: "#94a3b8" } } },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      row: { colors: ["transparent", "transparent"] },
    },
    tooltip: { theme: "light" },
  };

return (
    <Card elevation={0} sx={{ height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <CardHeader
        title={
            <Typography variant="h6" fontWeight="bold">กระแสรายรับ</Typography>
        }
        subheader={
            <Typography variant="body2" color="text.secondary">เปรียบเทียบข้อมูล 7 วันล่าสุด</Typography>
        }
        action={
          <Chip 
            icon={<Calendar size={16} />} 
            label="Live View" 
            variant="outlined" 
            size="small"
            sx={{ fontWeight: 600, borderColor: 'divider' }} 
          />
        }
        sx={{ pb: 0 }}
      />
      <Divider sx={{ mx: 3, mt: 2, mb: 1 }}/>
      <CardContent>
        <Chart options={options} series={[{ name: "Revenue", data: data?.map(d => d.amount) || [] }]} type="area" height={320} />
      </CardContent>
    </Card>
  );
};

export default RevenueStream;
