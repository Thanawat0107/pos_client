/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import dayjs from "dayjs";

Font.registerHyphenationCallback((word) => [word]);

// --- Color Palette (อิงตามโทนสีของเว็บ Dashboard) ---
const colors = {
  primary: "#111827", // ดำเข้ม (ส่วนหัวข้อหลัก)
  secondary: "#6366f1", // สีม่วงอมน้ำเงิน (สำหรับกราฟ/ไฮไลท์)
  success: "#10b981", // เขียว Emerald (สำหรับรายได้/สำเร็จ)
  successBg: "#ecfdf5",
  warning: "#f59e0b", // เหลือง/ส้ม (สำหรับรอดำเนินการ/สินค้าขายดี)
  warningBg: "#fffbeb",
  danger: "#f43f5e", // แดง (สำหรับยกเลิก)
  dangerBg: "#fff1f2",
  textDark: "#1f2937",
  textMuted: "#6b7280",
  bgLight: "#f9fafb",
  border: "#e5e7eb",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Sarabun",
    padding: 35,
    backgroundColor: "#ffffff",
    color: colors.textDark,
  },

  // --- Header ---
  headerBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  reportTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    letterSpacing: -0.5,
  },
  reportSubtitle: { fontSize: 10, color: colors.textMuted, marginTop: 4 },
  dateBox: { alignItems: "flex-end" },
  dateLabel: {
    fontSize: 8,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  dateValue: { fontSize: 10, fontWeight: "bold", color: colors.primary },

  // --- KPI Summary Cards ---
  kpiContainer: { flexDirection: "row", gap: 12, marginBottom: 25 },
  kpiCard: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.bgLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kpiLabel: {
    fontSize: 9,
    color: colors.textMuted,
    marginBottom: 8,
    fontWeight: "bold",
  },
  kpiValueRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  kpiValue: { fontSize: 22, fontWeight: "bold", color: colors.primary },
  kpiUnit: { fontSize: 10, color: colors.textMuted, fontWeight: "bold" },
  kpiSub: { fontSize: 8, color: colors.textMuted, marginTop: 6 },

  // --- Main Content Layout ---
  row: { flexDirection: "row", gap: 20 },
  colLeft: { flex: 1.2 }, // คอลัมน์ซ้ายใหญ่กว่านิดหน่อย
  colRight: { flex: 1 },

  // --- Sections ---
  section: {
    marginBottom: 25,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  sectionTitleBox: {
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: { fontSize: 12, fontWeight: "bold", color: colors.primary },

  // --- Top Items (สินค้าขายดี) ---
  itemRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  itemRankBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: colors.warning,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  itemRankText: { fontSize: 10, fontWeight: "bold", color: colors.warning },
  itemNameBox: { flex: 1 },
  itemName: { fontSize: 10, fontWeight: "bold", color: colors.textDark },
  itemQty: { fontSize: 8, color: colors.textMuted, marginTop: 2 },
  itemPrice: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.textDark,
    textAlign: "right",
  },

  // --- Efficiency Bars (ประสิทธิภาพ) ---
  barContainer: { marginBottom: 16 },
  barHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 6,
  },
  barTitleBox: { flex: 1 },
  barTitle: { fontSize: 10, fontWeight: "bold", color: colors.textDark },
  barTarget: { fontSize: 8, color: colors.textMuted, marginTop: 2 },
  barValue: { fontSize: 10, fontWeight: "bold" },
  barTrack: {
    height: 8,
    backgroundColor: colors.bgLight,
    borderRadius: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  barFill: { height: "100%", borderRadius: 4 },

  // --- Status Grid (สัดส่วนออเดอร์) ---
  statusGrid: { flexDirection: "row", gap: 10 },
  statusBox: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  statusNum: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  statusLabel: { fontSize: 8, fontWeight: "bold" },

  // --- Footer ---
  footer: {
    position: "absolute",
    bottom: 25,
    left: 35,
    right: 35,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 8, color: colors.textMuted },
});

// --- Helper Functions ---
const fmtMoney = (n: number) =>
  (n ?? 0).toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
const fmtNum = (n: number) => (n ?? 0).toLocaleString("th-TH");

const EfficiencyBar = ({
  label,
  target,
  value,
  max,
  color,
  suffix = "",
}: any) => {
  const safeValue = isNaN(value) ? 0 : value;
  let percent = max > 0 ? (safeValue / max) * 100 : 0;
  percent = Math.max(0, Math.min(100, percent)); // ไม่ให้กราฟทะลุ 100%

  return (
    <View style={styles.barContainer}>
      <View style={styles.barHeader}>
        <View style={styles.barTitleBox}>
          <Text style={styles.barTitle}>{label}</Text>
          <Text style={styles.barTarget}>{target}</Text>
        </View>
        <Text style={[styles.barValue, { color }]}>
          {safeValue.toLocaleString("th-TH", { maximumFractionDigits: 2 })}
          {suffix}
        </Text>
      </View>
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            { width: `${percent}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
};

interface Props {
  data: any;
  detailedData?: any[]; // เก็บรับค่าไว้แต่ไม่ได้นำมาปริ้นตารางแล้ว
  filters: { startDate: any; endDate: any };
}

export const PremiumReport = ({ data, filters }: Props) => {
  const startStr = filters.startDate?.format?.("DD/MM/YYYY") || "-";
  const endStr = filters.endDate?.format?.("DD/MM/YYYY") || "-";
  const generatedAt = dayjs().format("DD/MM/YYYY HH:mm");

  const safeData = data || {};

  // เช็ค Data อย่างรัดกุม ป้องกัน Error "Unknown Item"
  const topItems = Array.isArray(safeData.topSellingItems)
    ? safeData.topSellingItems
    : Array.isArray(safeData.topSellingDetail)
      ? safeData.topSellingDetail
      : [];

  const statusCount = safeData.orderStatusCount || {};

  // รวบรวมสถานะ (รองรับหลาย format ทั้งภาษาไทยและอังกฤษที่อาจจะมาจาก API)
  const countSuccess =
    statusCount["success"] ||
    statusCount["completed"] ||
    statusCount["เสร็จสิ้น"] ||
    statusCount["ชำระแล้ว"] ||
    statusCount["paid"] ||
    0;
  const countPending =
    statusCount["pending"] ||
    statusCount["รอดำเนินการ"] ||
    statusCount["รอชำระเงิน"] ||
    statusCount["pendingPayment"] ||
    0;
  const countCancel = statusCount["cancelled"] || statusCount["ยกเลิก"] || 0;

  return (
    <Document title={`Report_${dayjs().format("YYYYMMDD")}`}>
      <Page size="A4" style={styles.page}>
        {/* ================= 1. HEADER ================= */}
        <View style={styles.headerBox} fixed>
          <View>
            <Text style={styles.reportTitle}>ภาพรวมการวิเคราะห์ข้อมูล</Text>
            <Text style={styles.reportSubtitle}>
              ระบบวิเคราะห์สถิติอัจฉริยะและประสิทธิภาพการดำเนินงาน
            </Text>
          </View>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>รอบการวิเคราะห์ (Period)</Text>
            <Text style={styles.dateValue}>
              {startStr} - {endStr}
            </Text>
          </View>
        </View>

        {/* ================= 2. SUMMARY KPIs ================= */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>ยอดขายรวมทั้งหมด</Text>
            <View style={styles.kpiValueRow}>
              <Text style={styles.kpiValue}>
                {fmtMoney(safeData.totalRevenue)}
              </Text>
              <Text style={styles.kpiUnit}>฿</Text>
            </View>
            <Text style={styles.kpiSub}>
              ประมาณการกำไร: ฿{fmtMoney(safeData.totalProfit)}
            </Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>รายการออเดอร์ทั้งหมด</Text>
            <View style={styles.kpiValueRow}>
              <Text style={styles.kpiValue}>
                {fmtNum(safeData.totalOrders)}
              </Text>
              <Text style={styles.kpiUnit}>รายการ</Text>
            </View>
            <Text style={styles.kpiSub}>
              ยกเลิกแล้ว: {fmtNum(safeData.totalCancelledOrders || countCancel)}{" "}
              รายการ
            </Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>ยอดสั่งซื้อเฉลี่ยต่อบิล (AOV)</Text>
            <View style={styles.kpiValueRow}>
              <Text style={styles.kpiValue}>
                {fmtMoney(safeData.averageOrderValue)}
              </Text>
              <Text style={styles.kpiUnit}>฿</Text>
            </View>
            <Text style={styles.kpiSub}>เป้าหมายยอดขาย: ฿500 / บิล</Text>
          </View>
        </View>

        {/* ================= 3. IN-DEPTH ANALYTICS ================= */}
        <View style={styles.row}>
          {/* --- COLUMN LEFT: ประสิทธิภาพ & สถานะ --- */}
          <View style={styles.colLeft}>
            {/* Section: ประสิทธิภาพการดำเนินงาน */}
            <View style={styles.section}>
              <View style={styles.sectionTitleBox}>
                <Text style={styles.sectionTitle}>ประสิทธิภาพการดำเนินงาน</Text>
              </View>

              <EfficiencyBar
                label="ยอดสั่งซื้อเฉลี่ยต่อบิล"
                target="เป้าหมายยอดขาย ฿500"
                value={safeData.averageOrderValue || 0}
                max={500}
                color={colors.secondary}
                suffix=" ฿"
              />
              <EfficiencyBar
                label="อัตราการทำรายการสำเร็จ"
                target="เป้าหมายความแม่นยำ 100%"
                value={safeData.successRate || 0}
                max={100}
                color={colors.success}
                suffix="%"
              />
              <EfficiencyBar
                label="เวลาที่ใช้ในการเตรียมอาหาร"
                target="เป้าหมายความเร็ว < 15 นาที"
                value={safeData.averagePrepTime || 0}
                max={30} // เซ็ต max ไว้ที่ 30 นาทีสำหรับการวาดกราฟแท่ง
                color={colors.warning}
                suffix=" นาที"
              />
            </View>

            {/* Section: สัดส่วนออเดอร์ */}
            <View style={styles.section}>
              <View style={styles.sectionTitleBox}>
                <Text style={styles.sectionTitle}>สัดส่วนสถานะออเดอร์</Text>
              </View>
              <View style={styles.statusGrid}>
                <View
                  style={[
                    styles.statusBox,
                    {
                      backgroundColor: colors.successBg,
                      borderColor: "#a7f3d0",
                    },
                  ]}
                >
                  <Text style={[styles.statusNum, { color: colors.success }]}>
                    {countSuccess}
                  </Text>
                  <Text style={[styles.statusLabel, { color: colors.success }]}>
                    สำเร็จแล้ว
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBox,
                    {
                      backgroundColor: colors.warningBg,
                      borderColor: "#fde68a",
                    },
                  ]}
                >
                  <Text style={[styles.statusNum, { color: colors.warning }]}>
                    {countPending}
                  </Text>
                  <Text style={[styles.statusLabel, { color: colors.warning }]}>
                    รอปรุง / รอชำระ
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBox,
                    {
                      backgroundColor: colors.dangerBg,
                      borderColor: "#fecdd3",
                    },
                  ]}
                >
                  <Text style={[styles.statusNum, { color: colors.danger }]}>
                    {countCancel}
                  </Text>
                  <Text style={[styles.statusLabel, { color: colors.danger }]}>
                    ยกเลิก
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* --- COLUMN RIGHT: สินค้าขายดี --- */}
          <View style={styles.colRight}>
            <View style={[styles.section, { flex: 1 }]}>
              <View style={styles.sectionTitleBox}>
                <Text style={styles.sectionTitle}>
                  สินค้าขายดีที่สุด (Top 5)
                </Text>
              </View>

              {topItems.length > 0 ? (
                topItems.slice(0, 5).map((item: any, idx: number) => {
                  // ดักข้อมูลแบบครอบจักรวาล ให้ตรงกับ API
                  const itemName =
                    item.name ||
                    item.menuItemName ||
                    item.itemName ||
                    item.title ||
                    "ไม่ระบุชื่อสินค้า";

                  // หา quantity: บางทีมาเป็น totalQuantity, soldQuantity หรือ qty
                  const itemQty =
                    item.quantity ||
                    item.qty ||
                    item.count ||
                    item.totalQuantity ||
                    item.soldQuantity ||
                    0;

                  // หา revenue: บางทีมาเป็น revenue, totalRevenue, totalAmount, totalPrice
                  const itemRev =
                    item.revenue ||
                    item.totalRevenue ||
                    item.totalPrice ||
                    item.totalAmount ||
                    item.sales ||
                    0;

                  return (
                    <View key={idx} style={styles.itemRow}>
                      <View
                        style={[
                          styles.itemRankBox,
                          // เปลี่ยนสีเหรียญตามอันดับ
                          idx === 0
                            ? {
                                backgroundColor: "#fef08a",
                                borderColor: "#eab308",
                              }
                            : idx === 1
                              ? {
                                  backgroundColor: "#f1f5f9",
                                  borderColor: "#cbd5e1",
                                }
                              : idx === 2
                                ? {
                                    backgroundColor: "#ffedd5",
                                    borderColor: "#f97316",
                                  }
                                : {
                                    backgroundColor: "#f9fafb",
                                    borderColor: "#e5e7eb",
                                  },
                        ]}
                      >
                        <Text
                          style={[
                            styles.itemRankText,
                            idx === 0
                              ? { color: "#ca8a04" }
                              : idx === 1
                                ? { color: "#64748b" }
                                : idx === 2
                                  ? { color: "#c2410c" }
                                  : { color: "#9ca3af" },
                          ]}
                        >
                          {idx + 1}
                        </Text>
                      </View>

                      <View style={styles.itemNameBox}>
                        <Text style={styles.itemName}>{itemName}</Text>
                        <Text style={styles.itemQty}>
                          จำหน่ายแล้ว {fmtNum(itemQty)} จาน
                        </Text>
                      </View>

                      <Text style={styles.itemPrice}>฿{fmtMoney(itemRev)}</Text>
                    </View>
                  );
                })
              ) : (
                <Text
                  style={{
                    fontSize: 9,
                    color: colors.textMuted,
                    textAlign: "center",
                    marginTop: 20,
                  }}
                >
                  ยังไม่มีข้อมูลการขายในช่วงเวลานี้
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* ================= FOOTER ================= */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            เอกสารฉบับนี้สร้างโดยระบบอัตโนมัติเมื่อ {generatedAt}
          </Text>
          <Text style={styles.footerText}>ระบบการจัดการร้านอาหาร (POS)</Text>
        </View>
      </Page>
    </Document>
  );
};
