export interface AdminDashboard {
  totalRevenue: number;
  todayRevenue: number;
  totalOrders: number;
  pendingOrders: number; // ออเดอร์ที่ต้องรีบทำ

  averageOrderValue: number;
  revenueGrowthPercentage: number; // เทียบกับเมื่อวาน

  weeklyRevenue: RevenueChartData[];

  topSellingItems: TopItem[];

  orderStatusCount: Record<string, number>;

  totalProfit: number; // กำไรสะสมทั้งหมด
  todayProfit: number; // กำไรเฉพาะวันนี้

  promoUsageStats: Record<string, number>; // โค้ดโปรโมชั่นไหนถูกใช้บ่อยที่สุด
  promoTypeStats: string[];

  totalCancelledOrders: number;

  successRate : number; // อัตราความสำเร็จของออเดอร์ (เช่น 95%)
  averagePrepTime: number; // เวลาปรุงเฉลี่ย (เช่น 15 นาที)
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
