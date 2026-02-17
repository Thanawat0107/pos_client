/* eslint-disable @typescript-eslint/no-explicit-any */
import { Grid } from "@mui/material";
import StatCard from "./StatCard";

export interface KPIItem {
  label: string;
  val: number | undefined;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  suffix: string;
  trend?: string;
  trendColor?: string;
  subLabel?: string;
}

interface StatsGridProps {
  kpis: KPIItem[];
}

const StatsGrid = ({ kpis }: StatsGridProps) => (
  // เพิ่มช่องว่างเป็น 5 (40px) เพื่อความโปร่งระดับพรีเมียม
  <Grid container spacing={5}>
    {kpis.map((item, i) => (
      <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard item={item} index={i} />
      </Grid>
    ))}
  </Grid>
);

export default StatsGrid;