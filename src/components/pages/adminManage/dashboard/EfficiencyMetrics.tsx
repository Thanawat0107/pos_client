/* eslint-disable @typescript-eslint/no-explicit-any */
import { Paper, Typography, LinearProgress, Box } from "@mui/material";

interface Props {
  aov: number;
  successRate: number;
  prepTime: number;
}

const EfficiencyMetrics = ({ aov, successRate, prepTime }: Props) => {
  // สมมติเป้าหมายของร้าน (Target)
  const targetAOV = 500; // เป้าหมายยอดต่อบิลคือ 500฿
  const targetPrepTime = 15; // เป้าหมายปรุงเสร็จใน 15 นาที

  // คำนวณ % สำหรับ Progress Bar
  const aovPercent = Math.min((aov / targetAOV) * 100, 100);
  
  // Prep Time ยิ่งน้อยยิ่งดี ดังนั้นถ้าทำได้ตามเป้า (15นาที) ให้ได้ 100%
  // สูตร: (เป้าหมาย / เวลาจริง) * 100
  const prepPercent = prepTime > 0 ? Math.min((targetPrepTime / prepTime) * 100, 100) : 0;

  return (
    <Paper elevation={0} className="p-8 rounded-[2rem] border border-slate-100 shadow-lg bg-white h-full">
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
          percent={aovPercent} // ใช้ค่าจริงที่คำนวณจาก Target
          color="#6366f1"
        />
        <EfficiencyItem
          label="อัตราออเดอร์สำเร็จ"
          value={`${successRate}%`}
          percent={successRate} // ใช้ Success Rate จาก Backend ได้เลย
          color="#10b981"
        />
        <EfficiencyItem
          label={`ความเร็วการปรุง (เป้าหมาย ${targetPrepTime}น.)`}
          value={`${prepTime} นาที`}
          percent={prepPercent} // ยิ่งปรุงเร็วกว่า 15 นาที หลอดยิ่งเต็ม
          color="#f59e0b"
        />
      </div>
    </Paper>
  );
};

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
