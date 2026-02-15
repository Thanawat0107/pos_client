/* eslint-disable @typescript-eslint/no-explicit-any */
import { Grid } from "@mui/material";
import StatCard from "./StatCard";

// กำหนด Interface ให้ชัดเจนเพื่อให้แก้ไขง่ายในอนาคต
export interface KPIItem {
  label: string;
  val: number | undefined;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  suffix: string;
  trend?: string;
  trendColor?: string;
}

interface StatsGridProps {
  kpis: KPIItem[];
}

const StatsGrid = ({ kpis }: StatsGridProps) => (
  <Grid container spacing={4}>
    {kpis.map((item, i) => (
      <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard item={item} index={i} />
      </Grid>
    ))}
  </Grid>
);

export default StatsGrid;