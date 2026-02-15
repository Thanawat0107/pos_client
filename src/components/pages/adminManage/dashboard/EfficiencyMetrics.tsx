/* eslint-disable @typescript-eslint/no-explicit-any */
import { Paper, Typography, LinearProgress, Box } from "@mui/material";

interface Props {
  aov: number;
  successRate: number;
  prepTime: number;
}

const EfficiencyMetrics = ({ aov, successRate, prepTime }: Props) => (
  <Paper
    elevation={0}
    className="p-8 rounded-[2rem] border border-slate-100 shadow-lg bg-white h-full"
  >
    <Typography variant="h6" className="font-bold text-slate-800 mb-2">
      ประสิทธิภาพการดำเนินงาน
    </Typography>
    <Typography variant="body2" className="text-slate-400 mb-8 font-medium">
      คะแนนความเร็วและคุณภาพบริการเฉลี่ย
    </Typography>

    <div className="space-y-8">
      <EfficiencyItem
        label="ค่าเฉลี่ยต่อออเดอร์ (AOV)"
        value={`${aov.toLocaleString()}฿`}
        percent={75}
        color="#6366f1"
      />
      <EfficiencyItem
        label="อัตราออเดอร์สำเร็จ"
        value={`${successRate}%`}
        percent={successRate}
        color="#10b981"
      />
      <EfficiencyItem
        label="ความเร็วการปรุง (Target 15m)"
        value={`${prepTime} นาที`}
        percent={85}
        color="#f59e0b"
      />
    </div>
  </Paper>
);

const EfficiencyItem = ({ label, value, percent, color }: any) => (
  <Box>
    <div className="flex justify-between items-end mb-2">
      <Typography variant="body2" className="font-bold text-slate-700">
        {label}
      </Typography>
      <Typography variant="subtitle1" className="font-black" style={{ color }}>
        {value}
      </Typography>
    </div>
    <LinearProgress
      variant="determinate"
      value={percent}
      sx={{
        height: 10,
        borderRadius: 5,
        bgcolor: "#f1f5f9",
        "& .MuiLinearProgress-bar": { borderRadius: 5, bgcolor: color },
      }}
    />
  </Box>
);

export default EfficiencyMetrics;
