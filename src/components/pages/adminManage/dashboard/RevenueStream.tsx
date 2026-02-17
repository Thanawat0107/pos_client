/* eslint-disable @typescript-eslint/no-explicit-any */
import Chart from "react-apexcharts";
import {
  Typography,
  Chip,
  Card,
  CardContent,
  useTheme,
  Box,
  Stack,
} from "@mui/material";
import { BarChart3, TrendingUp, Inbox, Circle } from "lucide-react";
import { alpha } from "@mui/material/styles";

interface RevenueStreamProps {
  data: any[];
  title: string; // รับค่ามาเป็น 'day', 'week', 'month' หรือ 'year'
}

const RevenueStream = ({ data, title }: RevenueStreamProps) => {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;

  // ฟังก์ชันแปลงหน่วยเวลาเป็นภาษาไทย
  const translateTitle = (t: string) => {
    const mapping: Record<string, string> = {
      day: "รายวัน",
      week: "รายสัปดาห์",
      month: "รายเดือน",
      year: "รายปี",
    };
    return mapping[t.toLowerCase()] || t;
  };

  const titleThai = translateTitle(title);

  const options: any = {
    chart: {
      type: "area",
      toolbar: { show: false },
      fontFamily: "'Inter', 'Kanit', sans-serif", // เพิ่ม Font ไทย
      offsetX: 10,
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
      dropShadow: {
        enabled: true,
        top: 8,
        left: 0,
        blur: 12,
        color: primaryColor,
        opacity: 0.2,
      },
    },
    colors: [primaryColor],
    stroke: {
      curve: "smooth",
      width: 5,
      lineCap: "round",
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.6,
        opacityTo: 0.05,
        stops: [0, 95, 100],
      },
    },
    markers: {
      size: data?.length > 31 ? 0 : 6,
      colors: [primaryColor],
      strokeColors: "#fff",
      strokeWidth: 3,
    },
    xaxis: {
      categories: data?.map((d) => d.date) || [],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        offsetY: 10,
        style: {
          colors: "#94a3b8",
          fontSize: "13px",
          fontWeight: 600,
        },
      },
    },
    yaxis: {
      labels: {
        padding: 20,
        style: {
          colors: "#94a3b8",
          fontSize: "13px",
          fontWeight: 600,
        },
        formatter: (val: number) => {
          if (val >= 1000) return `฿${(val / 1000).toFixed(1)}k`;
          return `฿${val.toLocaleString()}`;
        },
      },
    },
    grid: {
      borderColor: alpha(theme.palette.divider, 0.08),
      strokeDashArray: 6,
      padding: {
        top: 20,
        right: 40,
        bottom: 20,
        left: 30,
      },
    },
    tooltip: {
      theme: "light",
      custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {
        const value = series[seriesIndex][dataPointIndex];
        return `
          <div style="padding: 16px; border-radius: 16px; border: none; box-shadow: 0 15px 30px -5px rgba(0,0,0,0.1); background: #fff;">
            <div style="font-size: 12px; font-weight: 700; color: #94a3b8; margin-bottom: 8px; letter-spacing: 0.5px;">
              วันที่ ${w.globals.labels[dataPointIndex]}
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${primaryColor}; box-shadow: 0 0 10px ${alpha(primaryColor, 0.5)}"></div>
              <div style="font-size: 22px; font-weight: 900; color: #1e293b;">
                ฿${value.toLocaleString()}
              </div>
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px; font-weight: 500;">รายได้รวมทั้งหมด</div>
          </div>
        `;
      },
    },
    dataLabels: { enabled: false },
  };

  const series = [{ name: "รายได้", data: data?.map((d) => d.amount) || [] }];

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "32px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 4px 20px -5px rgba(0,0,0,0.05)",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* ส่วนหัวการ์ด */}
      <Box sx={{ px: 5, pt: 5, pb: 2 }}>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={2}
        >
          <Stack spacing={1.5}>
            {/* ปรับจาก Live Analytics เป็นภาษาไทย */}
            <Box display="flex" alignItems="center" gap={1}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  color: "#10b981",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  bgcolor: "#f0fdf4",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: "20px",
                  border: "1px solid #d1fae5",
                }}
              >
                <Circle size={8} fill="#10b981" /> ข้อมูลแบบเรียลไทม์
              </Typography>
            </Box>

            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: "primary.light",
                  color: "primary.main",
                  borderRadius: "16px",
                  display: "flex",
                  opacity: 0.8,
                }}
              >
                <TrendingUp size={24} />
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: "text.primary",
                  letterSpacing: "-0.02em",
                }}
              >
                วิเคราะห์รายรับ
              </Typography>
            </Stack>

            <Typography
              variant="body1"
              sx={{ color: "text.secondary", fontWeight: 500, ml: 7 }}
            >
              สรุปภาพรวมรายได้ยอดนิยม{" "}
              <span style={{ color: primaryColor, fontWeight: 700 }}>
                {titleThai}
              </span>
            </Typography>
          </Stack>

          <Chip
            icon={<BarChart3 size={18} />}
            label={`มุมมอง${titleThai}`}
            sx={{
              height: "48px",
              borderRadius: "16px",
              fontWeight: 700,
              px: 2,
              bgcolor: "#f8fafc",
              border: "1px solid #e2e8f0",
              color: "text.primary",
            }}
          />
        </Stack>
      </Box>

      {/* ส่วนแสดงกราฟ */}
      <CardContent sx={{ px: 4, pb: 6, pt: 0, "&:last-child": { pb: 6 } }}>
        {data && data.length > 0 ? (
          <Box sx={{ width: "100%", position: "relative" }}>
            <Chart options={options} series={series} type="area" height={400} />
          </Box>
        ) : (
          <Box
            sx={{
              height: 400,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "grey.50",
              borderRadius: "24px",
              m: 2,
              border: "2px dashed",
              borderColor: "divider",
            }}
          >
            <div
              style={{
                padding: "20px",
                background: "#fff",
                borderRadius: "50%",
                boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                marginBottom: "16px",
              }}
            >
              <Inbox size={48} color={theme.palette.grey[300]} />
            </div>
            <Typography
              sx={{ color: "text.primary", fontWeight: 700, variant: "h6" }}
            >
              ไม่พบข้อมูลรายได้
            </Typography>
            <Typography sx={{ color: "text.secondary", fontWeight: 500 }}>
              ลองเลือกช่วงเวลาอื่นเพื่อตรวจสอบอีกครั้ง
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueStream;
