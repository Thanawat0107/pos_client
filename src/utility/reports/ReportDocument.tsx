/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font, // เพิ่ม Font เข้ามาเพื่อใช้ Hyphenation
} from "@react-pdf/renderer";

// 1. ป้องกันสระลอยและการตัดคำไทยทะลุขอบ (สำคัญมากสำหรับภาษาไทย)
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    fontFamily: "Sarabun",
    padding: 40,
    backgroundColor: "#f8fafc",
    color: "#1e293b",
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    borderBottom: "1pt solid #e2e8f0",
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e1b4b",
  },
  kpiGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 30,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 12,
    border: "0.5pt solid #e2e8f0",
  },
  kpiLabel: {
    fontSize: 10,
    color: "#64748b",
    marginBottom: 5,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
  },
  table: {
    width: "auto",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    border: "0.5pt solid #e2e8f0",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1e1b4b",
    padding: 10,
  },
  tableHeaderCell: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    padding: 10,
    alignItems: "center",
  },
  tableCell: {
    fontSize: 9,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
    width: 60,
  },
});

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "success":
    case "เสร็จสิ้น":
      return { bg: "#ecfdf5", text: "#10b981" };
    case "pending":
    case "รอดำเนินการ":
      return { bg: "#fffbeb", text: "#d97706" };
    case "cancelled":
    case "ยกเลิก":
      return { bg: "#fff1f2", text: "#e11d48" };
    default:
      return { bg: "#f1f5f9", text: "#64748b" };
  }
};

export const ReportDocument = ({ data, detailedData }: any) => (
  <Document title="รายงานการสั่งอาหารเชิงลึก">
    <Page size="A4" style={styles.page}>
      {/* 1. Header */}
      <View style={styles.headerSection}>
        <View>
          <Text style={styles.title}>รายงานการสั่งอาหาร</Text>
          <Text style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>
            ข้อมูล ณ วันที่ {new Date().toLocaleDateString("th-TH")}
          </Text>
        </View>
        <Text style={{ fontSize: 10, color: "#94a3b8" }}>CONFIDENTIAL</Text>
      </View>

      {/* 2. KPI Cards */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>ยอดขายรวม</Text>
          <Text style={styles.kpiValue}>
            ฿{data?.totalRevenue?.toLocaleString()}
          </Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>ออเดอร์ทั้งหมด</Text>
          <Text style={styles.kpiValue}>
            {data?.totalOrders?.toLocaleString()} รายการ
          </Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>อัตราสำเร็จ</Text>
          <Text style={[styles.kpiValue, { color: "#10b981" }]}>
            {data?.successRate}%
          </Text>
        </View>
      </View>

      {/* 3. Detailed Table */}
      <View style={styles.table}>
        {/* เพิ่ม fixed เพื่อให้หัวตารางแสดงในทุกหน้า */}
        <View style={styles.tableHeader} fixed>
          <Text style={[styles.tableHeaderCell, { width: "25%" }]}>
            วันที่/เวลา
          </Text>
          <Text style={[styles.tableHeaderCell, { width: "35%" }]}>รายการ</Text>
          <Text style={[styles.tableHeaderCell, { width: "20%" }]}>สถานะ</Text>
          <Text
            style={[
              styles.tableHeaderCell,
              { width: "20%", textAlign: "right" },
            ]}
          >
            ยอดเงิน
          </Text>
        </View>

        {detailedData?.map((item: any, index: number) => {
          const status = getStatusColor(item.status);
          return (
            <View style={styles.tableRow} key={index} wrap={false}>
              <Text style={[styles.tableCell, { width: "25%" }]}>
                {item.createdAt || item.date}
              </Text>
              <Text
                style={[styles.tableCell, { width: "35%", fontWeight: "bold" }]}
              >
                {item.orderNumber || item.name}
              </Text>

              <View style={{ width: "20%" }}>
                <View
                  style={[styles.statusBadge, { backgroundColor: status.bg }]}
                >
                  <Text style={{ color: status.text }}>{item.status}</Text>
                </View>
              </View>

              <Text
                style={[
                  styles.tableCell,
                  { width: "20%", textAlign: "right", fontWeight: "bold" },
                ]}
              >
                ฿{(item.totalAmount || item.amount)?.toLocaleString()}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Footer หน้ากระดาษ - เพิ่ม fixed เพื่อให้แสดงทุกหน้า */}
      <Text
        style={{
          position: "absolute",
          bottom: 30,
          left: 0,
          right: 0,
          textAlign: "center",
          color: "#94a3b8",
          fontSize: 8,
        }}
        fixed
        render={({ pageNumber, totalPages }) =>
          `หน้า ${pageNumber} จาก ${totalPages}`
        }
      />
    </Page>
  </Document>
);
