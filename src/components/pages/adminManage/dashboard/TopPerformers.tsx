/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from "framer-motion";
import {
  Paper,
  Typography,
  Avatar,
  IconButton,
  Button,
  Box,
  Stack,
} from "@mui/material";
import {
  Crown,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  Circle,
} from "lucide-react";
import { alpha } from "@mui/material/styles";

const TopPerformers = ({ items }: { items: any[] }) => {
  // หาค่าสูงสุดเพื่อใช้ทำ Progress Bar
  const maxQty =
    items && items.length > 0
      ? Math.max(...items.map((i) => i.totalQuantity))
      : 1;

  const getRankStyle = (idx: number) => {
    switch (idx) {
      case 0:
        return {
          bg: "#fffbeb",
          text: "#d97706",
          glow: "#fbbf24",
          border: "#fde68a",
        }; // Gold
      case 1:
        return {
          bg: "#f8fafc",
          text: "#475569",
          glow: "#94a3b8",
          border: "#e2e8f0",
        }; // Silver
      case 2:
        return {
          bg: "#fff7ed",
          text: "#9a3412",
          glow: "#ea580c",
          border: "#ffedd5",
        }; // Bronze
      default:
        return {
          bg: "#f8fafc",
          text: "#64748b",
          glow: "transparent",
          border: "#f1f5f9",
        };
    }
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
        overflow: "hidden",
      }}
    >
      {/* ส่วนหัวการ์ด (Header) */}
      <Box sx={{ px: 5, pt: 5, pb: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Stack spacing={1.5}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  color: "#f59e0b",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  bgcolor: "#fffbeb",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: "20px",
                  border: "1px solid #fef3c7",
                }}
              >
                <Circle size={8} fill="#f59e0b" /> จัดอันดับยอดขาย
              </Typography>
            </Box>

            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: "#fffbeb",
                  color: "#d97706",
                  borderRadius: "16px",
                  display: "flex",
                }}
              >
                <Crown size={28} />
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: "text.primary",
                  letterSpacing: "-0.02em",
                }}
              >
                สินค้าขายดีที่สุด
              </Typography>
            </Stack>

            <Typography
              variant="body1"
              sx={{ color: "text.secondary", fontWeight: 500, ml: 7 }}
            >
              รายการสินค้าที่มียอดจำหน่าย{" "}
              <span style={{ fontWeight: 700, color: "#d97706" }}>
                สูงที่สุด
              </span>
            </Typography>
          </Stack>

          <IconButton sx={{ bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <MoreVertical size={20} className="text-slate-400" />
          </IconButton>
        </Stack>
      </Box>

      {/* รายการสินค้า (List Items) */}
      <Box sx={{ px: 5, flexGrow: 1 }}>
        <Stack spacing={3}>
          {items?.map((item, idx) => {
            const style = getRankStyle(idx);
            const progress = (item.totalQuantity / maxQty) * 100;

            return (
              <motion.div
                key={idx}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                style={{ cursor: "default" }}
              >
                <Stack
                  spacing={1.5}
                  sx={{
                    p: 2.5,
                    borderRadius: "24px",
                    transition: "0.3s",
                    "&:hover": { bgcolor: "#f8fafc" },
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Stack direction="row" alignItems="center" spacing={3}>
                      {/* Rank Badge พร้อม Glow */}
                      <Avatar
                        sx={{
                          width: 52,
                          height: 52,
                          bgcolor: style.bg,
                          color: style.text,
                          fontSize: "1.25rem",
                          fontWeight: "900",
                          border: `2px solid ${style.border}`,
                          boxShadow:
                            idx <= 2
                              ? `0 0 15px ${alpha(style.glow, 0.3)}`
                              : "none",
                        }}
                      >
                        {idx + 1}
                      </Avatar>

                      <Stack spacing={0.5}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 800,
                            color: "text.primary",
                            lineHeight: 1.2,
                          }}
                        >
                          {item.menuItemName}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.secondary",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          จำหน่ายแล้ว{" "}
                          <span
                            style={{
                              color: "text.primary",
                              fontSize: "1rem",
                              fontWeight: 800,
                            }}
                          >
                            {item.totalQuantity}
                          </span>{" "}
                          จาน
                        </Typography>
                      </Stack>
                    </Stack>

                    <Box sx={{ textAlign: "right" }}>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 900, color: "text.primary" }}
                      >
                        ฿{item.totalRevenue.toLocaleString()}
                      </Typography>
                      {idx === 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "end",
                            gap: 0.5,
                            color: "#10b981",
                            fontWeight: 800,
                            fontSize: "12px",
                            mt: 0.5,
                          }}
                        >
                          <TrendingUp size={14} /> ยอดนิยมอันดับ 1
                        </Box>
                      )}
                    </Box>
                  </Stack>

                  {/* Progress Bar แบบ Glow */}
                  <Box
                    sx={{
                      width: "100%",
                      h: 10,
                      bgcolor: "#f1f5f9",
                      borderRadius: "10px",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      style={{
                        height: "10px",
                        borderRadius: "10px",
                        backgroundColor:
                          style.glow === "transparent" ? "#cbd5e1" : style.glow,
                        boxShadow:
                          idx <= 2
                            ? `0 0 10px ${alpha(style.glow, 0.5)}`
                            : "none",
                      }}
                    />
                  </Box>
                </Stack>
              </motion.div>
            );
          })}
        </Stack>
      </Box>

      {/* ปุ่มกดดูรายงาน (Footer) */}
      <Box sx={{ p: 5 }}>
        <Button
          fullWidth
          variant="outlined"
          endIcon={<ChevronRight size={22} />}
          sx={{
            py: 2,
            borderRadius: "20px",
            borderColor: "#e2e8f0",
            color: "#475569",
            fontWeight: 800,
            fontSize: "1rem",
            textTransform: "none",
            borderWidth: "2px",
            "&:hover": {
              borderWidth: "2px",
              bgcolor: "#f8fafc",
              borderColor: "#cbd5e1",
            },
          }}
        >
          เปิดดูรายงานสินค้าทั้งหมด
        </Button>
      </Box>
    </Paper>
  );
};

export default TopPerformers;
