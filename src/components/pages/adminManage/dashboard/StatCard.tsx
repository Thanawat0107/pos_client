/* eslint-disable @typescript-eslint/no-explicit-any */
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

const StatCard = ({ item }: { item: any; index: number }) => {
  const theme = useTheme();

  const resolveColor = (colorPath: string) => {
    if (colorPath.startsWith("#")) return colorPath;
    const parts = colorPath.split(".");
    let current: any = theme.palette;
    for (const part of parts) {
      if (current[part]) current = current[part];
      else return colorPath;
    }
    return current;
  };

  const actualColor = resolveColor(item.color);

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: "32px", // มนขึ้นอีกนิดเพื่อให้เข้ากับส่วนอื่น
        bgcolor: "white",
        border: "1px solid",
        borderColor: alpha(actualColor, 0.1),
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: "0 10px 40px -10px rgba(0,0,0,0.04)",
        "&:hover": {
          transform: "translateY(-12px)", // ยกตัวสูงขึ้นเล็กน้อย
          boxShadow: `0 30px 60px -12px ${alpha(actualColor, 0.18)}`, // Glow ตามสีของการ์ด
          borderColor: alpha(actualColor, 0.3),
        },
      }}
    >
      <CardContent sx={{ p: "48px !important" }}> {/* เพิ่ม Padding ให้ดู Airy */}
        
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: 5 }}
        >
          {/* Icon พร้อม Glow พื้นหลัง */}
          <Avatar
            variant="rounded"
            sx={{
              bgcolor: alpha(actualColor, 0.08),
              color: actualColor,
              width: 72,
              height: 72,
              borderRadius: "20px",
              border: `1px solid ${alpha(actualColor, 0.1)}`,
              boxShadow: `0 12px 20px -8px ${alpha(actualColor, 0.4)}`,
            }}
          >
            {/* ขยายขนาด Icon ให้เต็มพื้นที่ */}
            {item.icon && typeof item.icon !== 'string' 
              ? Object.assign({}, item.icon, { props: { ...item.icon.props, size: 32 } }) 
              : item.icon}
          </Avatar>

          {/* ป้ายแสดงแนวโน้ม (Trend) */}
          {item.trend && (
            <Chip
              label={`${item.trend.includes("-") ? "" : "+"}${item.trend}`}
              icon={
                item.trend.includes("-") ? (
                  <ArrowDownRight size={16} />
                ) : (
                  <ArrowUpRight size={16} />
                )
              }
              sx={{
                height: 38,
                px: 1.5,
                fontWeight: 900,
                fontSize: "0.95rem",
                borderRadius: "14px",
                bgcolor: alpha(
                  resolveColor(item.trendColor || (item.trend.includes("-") ? "error.main" : "success.main")),
                  0.1,
                ),
                color: resolveColor(item.trendColor || (item.trend.includes("-") ? "error.main" : "success.main")),
                border: `1px solid ${alpha(resolveColor(item.trendColor || (item.trend.includes("-") ? "error.main" : "success.main")), 0.1)}`,
              }}
            />
          )}
        </Stack>

        <Box>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 800,
              color: "text.secondary",
              mb: 1.5,
              opacity: 0.5,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontSize: "0.85rem"
            }}
          >
            {item.label}
          </Typography>

          <Stack direction="row" alignItems="baseline" spacing={1.5}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 950, // ตัวเลขต้องหนาที่สุด
                color: "text.primary",
                letterSpacing: "-0.05em",
                fontSize: { xs: "2.5rem", md: "3rem" }
              }}
            >
              {item.val?.toLocaleString() ?? "0"}
            </Typography>
            <Typography
              variant="h5"
              sx={{ color: "text.secondary", fontWeight: 800, opacity: 0.4 }}
            >
              {item.suffix}
            </Typography>
          </Stack>

          {/* ส่วนข้อมูลรองด้านล่าง (Sub-label) */}
          {item.subLabel && (
            <Box
              sx={{
                mt: 4,
                p: "14px 24px",
                borderRadius: "16px",
                bgcolor: "#f8fafc",
                border: "1px solid #f1f5f9",
                width: "fit-content",
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                }}
              >
                {item.subLabel}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;