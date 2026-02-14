export interface AdminDashboard {
  // 1. Summary Cards (ตัวเลขตัวใหญ่ๆ ด้านบน)
  totalRevenue: number;
  todayRevenue: number;
  totalOrders: number;
  pendingOrders: number; // ออเดอร์ที่ต้องรีบทำ

  // 2. Performance Stats
  averageOrderValue: number;
  revenueGrowthPercentage: number; // เทียบกับเมื่อวาน

  // 3. Chart Data (ข้อมูลสำหรับทำกราฟเส้น/แท่งรายวัน)
  weeklyRevenue: RevenueChartData[];

  // 4. Insights (สินค้าขายดี)
  topSellingItems: TopItem[];

  // 5. Status Distribution (กราฟวงกลม)
  orderStatusCount: Record<string, number>;
}

export interface RevenueChartData {
  date: string;
  amount: number;
}

export interface TopItem {
  menuItemName: string;
  totalQuantity: number;
  totalRevenue: number;
}
