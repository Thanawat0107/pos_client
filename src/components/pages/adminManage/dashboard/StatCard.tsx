/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Card,
  CardContent,
  Avatar,
  Chip,
  Typography,
  Stack,
  Box,
  useTheme,
} from "@mui/material";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { alpha } from "@mui/material/styles";

interface StatCardProps {
  item: {
    label: string;
    val: any;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    suffix: string;
    trend?: string;
    trendColor?: string;
  };
  index: number;
}

const StatCard = ({ item }: StatCardProps) => {
  const theme = useTheme();

  // ฟังก์ชันช่วยดึงค่าสีจริงจาก Theme Path (เช่น "primary.main" -> "#1976d2")
  const resolveColor = (colorPath: string) => {
    if (!colorPath) return "#000";
    const parts = colorPath.split(".");
    let current: any = theme.palette;
    for (const part of parts) {
      if (current[part]) current = current[part];
      else return colorPath; // ถ้าไม่ใช่ path ของ theme ให้ส่งค่าเดิมกลับไป (เช่น hex)
    }
    return current;
  };

  const actualColor = resolveColor(item.color);
  const actualTrendColor = resolveColor(item.trendColor || "text.primary");

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: theme.shadows[4],
          borderColor: alpha(actualColor, 0.3),
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: 3 }}
        >
          <Avatar
            sx={{
              bgcolor: alpha(actualColor, 0.1), // ใช้สีจริงที่ resolve แล้ว
              color: actualColor,
              width: 48,
              height: 48,
              borderRadius: 2,
            }}
          >
            {item.icon}
          </Avatar>

          {item.trend && (
            <Chip
              label={item.trend}
              size="small"
              icon={
                item.trend.includes("-") ? (
                  <ArrowDownRight size={16} />
                ) : (
                  <ArrowUpRight size={16} />
                )
              }
              sx={{
                fontWeight: "bold",
                borderRadius: "6px",
                bgcolor: alpha(actualTrendColor, 0.1),
                color: actualTrendColor,
                "& .MuiChip-icon": { color: "inherit" },
              }}
            />
          )}
        </Stack>

        <Box>
          <Typography
            variant="overline"
            color="text.secondary"
            fontWeight="bold"
            sx={{ letterSpacing: 1, display: "block", mb: 0.5 }}
          >
            {item.label}
          </Typography>
          <Stack direction="row" alignItems="baseline" spacing={1}>
            <Typography variant="h4" fontWeight={800} color="text.primary">
              {item.val?.toLocaleString() ?? "0"}
            </Typography>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              fontWeight="medium"
            >
              {item.suffix}
            </Typography>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;