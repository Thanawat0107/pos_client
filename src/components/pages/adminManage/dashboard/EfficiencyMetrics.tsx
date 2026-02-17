/* eslint-disable @typescript-eslint/no-explicit-any */
import { Paper, Typography, Box, Stack, Avatar } from "@mui/material";
import { Target, CheckCircle2, Timer, Zap, Circle } from "lucide-react";
import { alpha } from "@mui/material/styles";
import { motion } from "framer-motion";

interface Props {
  aov: number;
  successRate: number;
  prepTime: number;
}

const EfficiencyMetrics = ({ aov, successRate, prepTime }: Props) => {
  // เป้าหมายของร้าน (Target)
  const targetAOV = 500;
  const targetPrepTime = 15;

  // คำนวณ % สำหรับ Progress Bar
  const aovPercent = Math.min((aov / targetAOV) * 100, 100);
  const prepPercent =
    prepTime > 0 ? Math.min((targetPrepTime / prepTime) * 100, 100) : 0;

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
        overflow: "hidden",
      }}
    >
      {/* Header ส่วนหัว */}
      <Box sx={{ px: 5, pt: 5, pb: 4 }}>
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
              <Circle size={8} fill="#6366f1" /> ดัชนีชี้วัดคุณภาพ
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
              <Zap size={28} />
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                color: "text.primary",
                letterSpacing: "-0.02em",
              }}
            >
              ประสิทธิภาพการดำเนินงาน
            </Typography>
          </Stack>

          <Typography
            variant="body1"
            sx={{ color: "text.secondary", fontWeight: 500, ml: 7 }}
          >
            วิเคราะห์คุณภาพและ{" "}
            <span style={{ fontWeight: 700, color: "#6366f1" }}>
              สถิติความเร็ว
            </span>{" "}
            การให้บริการ
          </Typography>
        </Stack>
      </Box>

      {/* รายการตัวชี้วัด (Efficiency Items) */}
      <Box sx={{ px: 5, pb: 5 }}>
        <Stack spacing={5}>
          <EfficiencyItem
            icon={<Target size={26} />}
            label="ยอดสั่งซื้อเฉลี่ยต่อบิล"
            value={`฿${aov.toLocaleString()}`}
            target={`เป้าหมายยอดขาย ฿${targetAOV}`}
            percent={aovPercent}
            color="#6366f1" // Indigo
          />

          <EfficiencyItem
            icon={<CheckCircle2 size={26} />}
            label="อัตราการทำรายการสำเร็จ"
            value={`${successRate}%`}
            target="เป้าหมายความแม่นยำ 100%"
            percent={successRate}
            color="#10b981" // Emerald
          />

          <EfficiencyItem
            icon={<Timer size={26} />}
            label="เวลาที่ใช้ในการเตรียมอาหาร"
            value={`${prepTime} นาที`}
            target={`เป้าหมายความเร็ว < ${targetPrepTime} นาที`}
            percent={prepPercent}
            color="#f59e0b" // Amber
          />
        </Stack>
      </Box>
    </Paper>
  );
};

const EfficiencyItem = ({
  icon,
  label,
  value,
  target,
  percent,
  color,
}: any) => (
  <Box>
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ mb: 2 }}
    >
      <Stack direction="row" spacing={2.5} alignItems="center">
        <Avatar
          variant="rounded"
          sx={{
            width: 52,
            height: 52,
            bgcolor: alpha(color, 0.08),
            color: color,
            borderRadius: "16px",
            border: `1px solid ${alpha(color, 0.1)}`,
          }}
        >
          {icon}
        </Avatar>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: "text.primary",
              lineHeight: 1.2,
              mb: 0.5,
            }}
          >
            {label}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", fontWeight: 600 }}
          >
            {target}
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ textAlign: "right" }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 900, color: color, letterSpacing: "-0.02em" }}
        >
          {value}
        </Typography>
      </Box>
    </Stack>

    {/* Progress Bar แบบ Glow */}
    <Box sx={{ position: "relative", pt: 0.5 }}>
      <Box
        sx={{
          display: "flex",
          mb: 1,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "text.disabled",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          ระดับความสำเร็จ
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 900,
            color: color,
            bgcolor: alpha(color, 0.05),
            px: 1,
            py: 0.2,
            borderRadius: "6px",
          }}
        >
          {Math.round(percent)}%
        </Typography>
      </Box>

      <Box
        sx={{
          overflow: "hidden",
          height: "10px",
          display: "flex",
          borderRadius: "10px",
          bgcolor: "#f1f5f9",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{
            backgroundColor: color,
            borderRadius: "10px",
            boxShadow: `0 0 12px ${alpha(color, 0.4)}`, // Effect เรืองแสง
          }}
          className="h-full"
        />
      </Box>
    </Box>
  </Box>
);

export default EfficiencyMetrics;
