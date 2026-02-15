/* eslint-disable @typescript-eslint/no-explicit-any */
import Chart from "react-apexcharts";
import { Paper, Typography, Box } from "@mui/material";

const StatusDistribution = ({ data }: { data: Record<string, number> }) => {
  const options: any = {
    labels: Object.keys(data || {}),
    colors: ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6"],
    legend: { position: "bottom", fontFamily: "Inter", fontWeight: 600 },
    plotOptions: {
      pie: {
        donut: {
          size: "75%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              fontSize: "14px",
              fontWeight: 700,
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
  };

  return (
    <Paper
      elevation={0}
      className="p-8 rounded-[2rem] border border-slate-100 shadow-lg bg-white h-full"
    >
      <Typography variant="h6" className="font-bold text-slate-800 mb-6">
        สัดส่วนสถานะออเดอร์
      </Typography>
      <Chart
        options={options}
        series={Object.values(data || {})}
        type="donut"
        height={320}
      />
      <Box className="mt-6 grid grid-cols-2 gap-2">
        {Object.entries(data || {}).map(([key, val], i) => (
          <div
            key={i}
            className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100"
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: options.colors[i] }}
            ></div>
            <Typography variant="caption" className="font-bold text-slate-600">
              {key}: {val}
            </Typography>
          </div>
        ))}
      </Box>
    </Paper>
  );
};

export default StatusDistribution;
