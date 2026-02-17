/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    fontFamily: "Sarabun", // เรียกใช้ฟอนต์ที่ลงทะเบียนไว้ใน main.tsx
    padding: 40,
    backgroundColor: "#ffffff",
    color: "#334155",
  },
  // --- Header Section ---
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
    borderBottom: "1pt solid #e2e8f0",
    paddingBottom: 20,
  },
  brandContainer: {
    flexDirection: "column",
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1e1b4b",
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 9,
    color: "#64748b",
    marginTop: 2,
  },
  reportMeta: {
    textAlign: "right",
  },
  metaText: {
    fontSize: 8,
    color: "#94a3b8",
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#475569",
  },

  // --- KPI Cards Section ---
  kpiContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 25,
  },
  kpiCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    border: "0.5pt solid #e2e8f0",
  },
  kpiLabel: {
    fontSize: 8,
    color: "#64748b",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  kpiValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0f172a",
  },

  // --- Table Section ---
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1e1b4b",
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableHeaderCell: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 9,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomColor: "#f1f5f9",
    borderBottomWidth: 0.5,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  tableCell: {
    fontSize: 9,
    color: "#334155",
  },
  orderId: {
    fontSize: 8,
    color: "#94a3b8",
  },

  // --- Status Badges ---
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "center",
    width: 65,
  },

  // --- Footer ---
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: "0.5pt solid #f1f5f9",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#cbd5e1",
  },
});

/**
 * 3. Helper Function: Status Logic
 * จัดการสีและข้อความสถานะให้ตรงกับระบบของคุณ
 */
const getStatusTheme = (status: string) => {
  const s = status?.toLowerCase();
  if (s === "success" || s === "เสร็จสิ้น")
    return { bg: "#ecfdf5", text: "#10b981", label: "สำเร็จ" };
  if (s === "pending" || s === "รอดำเนินการ")
    return { bg: "#fffbeb", text: "#d97706", label: "รอปรุง" };
  if (s === "cancelled" || s === "ยกเลิก")
    return { bg: "#fff1f2", text: "#e11d48", label: "ยกเลิก" };
  return { bg: "#f1f5f9", text: "#64748b", label: status };
};

/**
 * 4. Main Component: PremiumReport
 */
interface Props {
  data: any;           // ข้อมูล KPI รวม
  detailedData: any[]; // รายการข้อมูลในตาราง
  filters: {
    startDate: any;
    endDate: any;
  };
}

export const PremiumReport = ({ data, detailedData, filters }: Props) => (
  <Document title={`Revenue-Report-${new Date().getTime()}`}>
    <Page size="A4" style={styles.page}>
      
      {/* ส่วนที่ 1: Header */}
      <View style={styles.header}>
        <View style={styles.brandContainer}>
          <Text style={styles.brandTitle}>Analysis Overview</Text>
          <Text style={styles.brandSubtitle}>ระบบวิเคราะห์สถิติและประสิทธิภาพการดำเนินงาน</Text>
        </View>
        <View style={styles.reportMeta}>
          <Text style={styles.metaText}>ช่วงเวลาที่เลือก</Text>
          <Text style={styles.metaValue}>
            {filters.startDate?.format?.("DD MMM YYYY") || filters.startDate} - {filters.endDate?.format?.("DD MMM YYYY") || filters.endDate}
          </Text>
        </View>
      </View>

      {/* ส่วนที่ 2: KPI Summary Cards */}
      <View style={styles.kpiContainer}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>ยอดขายรวมทั้งหมด</Text>
          <Text style={styles.kpiValue}>฿{data?.totalRevenue?.toLocaleString()}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>ออเดอร์ทั้งหมด</Text>
          <Text style={styles.kpiValue}>{data?.totalOrders?.toLocaleString()} รายการ</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>อัตราความสำเร็จ</Text>
          <Text style={[styles.kpiValue, { color: "#10b981" }]}>{data?.successRate}%</Text>
        </View>
      </View>

      {/* ส่วนที่ 3: Detailed Data Table */}
      <View style={styles.table}>
        {/* Table Header - ใช้ fixed เพื่อให้แสดงหัวตารางในทุกหน้าอัตโนมัติ */}
        <View style={styles.tableHeader} fixed>
          <View style={{ width: "20%" }}><Text style={styles.tableHeaderCell}>เลขออเดอร์</Text></View>
          <View style={{ width: "40%" }}><Text style={styles.tableHeaderCell}>รายการอาหาร</Text></View>
          <View style={{ width: "20%" }}><Text style={styles.tableHeaderCell}>สถานะ</Text></View>
          <View style={{ width: "20%", textAlign: "right" }}><Text style={styles.tableHeaderCell}>ยอดสุทธิ</Text></View>
        </View>

        {/* Table Body */}
        {(detailedData || data?.details)?.map((row: any, index: number) => {
          const theme = getStatusTheme(row.status);
          return (
            <View key={index} style={styles.tableRow} wrap={false}>
              <View style={{ width: "20%" }}>
                <Text style={styles.orderId}>#{row.id || row.orderNumber}</Text>
                <Text style={{ fontSize: 7, color: "#94a3b8" }}>{row.date || row.createdAt}</Text>
              </View>
              
              <Text style={[styles.tableCell, { width: "40%", fontWeight: "bold" }]}>
                {row.items || row.name}
              </Text>

              <View style={{ width: "20%" }}>
                <View style={[styles.badge, { backgroundColor: theme.bg }]}>
                  <Text style={{ color: theme.text }}>{theme.label}</Text>
                </View>
              </View>

              <Text style={[styles.tableCell, { width: "20%", textAlign: "right", fontWeight: "bold" }]}>
                ฿{row.amount?.toLocaleString() || row.totalAmount?.toLocaleString()}
              </Text>
            </View>
          );
        })}
      </View>

      {/* ส่วนที่ 4: Footer และเลขหน้า */}
      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>เอกสารฉบับนี้สร้างขึ้นโดยระบบอัตโนมัติ</Text>
        <Text 
          style={styles.footerText} 
          render={({ pageNumber, totalPages }) => `หน้า ${pageNumber} จาก ${totalPages}`} 
        />
      </View>

    </Page>
  </Document>
);