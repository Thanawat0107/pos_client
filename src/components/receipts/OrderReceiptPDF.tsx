/* eslint-disable @typescript-eslint/no-explicit-any */
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { OrderHeader } from "../../@types/dto/OrderHeader";
import { formatThaiDate, formatThaiTime } from "../../utility/utils";
import { registerPdfFonts } from "../../hooks/useFont";

// Register Thai fonts
registerPdfFonts();

// ── helpers ───────────────────────────────────────────────────────────────────
const fmtMoney = (n: number) =>
  (n ?? 0).toLocaleString("th-TH", { minimumFractionDigits: 2 });

const paymentLabel = (method: string) => {
  const map: Record<string, string> = {
    cash: "CASH",
    promptPay: "PROMPTPAY",
  };
  return map[method] ?? method.toUpperCase();
};

const statusLabel = (s: string) => {
  const map: Record<string, string> = {
    pendingPayment: "AWAITING PAYMENT",
    paid: "PAID",
    pending: "PENDING",
    approved: "APPROVED",
    preparing: "PREPARING",
    ready: "READY TO SERVE",
    completed: "COMPLETED",
    cancelled: "CANCELLED",
    closed: "CLOSED",
  };
  return map[s] ?? s.toUpperCase();
};

// ── 80mm page: 227pt wide ─────────────────────────────────────────────────────
// ปรับสัดส่วนคอลัมน์ให้ดูโมเดิร์นขึ้น (ลดพื้นที่จำนวน เพิ่มพื้นที่ชื่อเมนู)
const COL_QTY = "15%";
const COL_NAME = "55%";
const COL_PRICE = "30%";

const S = StyleSheet.create({
  page: {
    fontFamily: "Sarabun",
    fontSize: 8,
    backgroundColor: "#ffffff",
    color: "#000000",
    paddingHorizontal: 12,
    paddingVertical: 20,
  },

  // 1. BRANDING HEADER (Artisan Style)
  headerContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  brandName: {
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 2,
  },
  brandTagline: {
    fontSize: 7,
    letterSpacing: 2,
    color: "#555",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  brandMeta: {
    fontSize: 7,
    color: "#333",
    textAlign: "center",
    lineHeight: 1.4,
  },

  // 2. INVERTED PICKUP TICKET (Global Trend)
  ticketBox: {
    backgroundColor: "#000000",
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  ticketLabel: {
    color: "#ffffff",
    fontSize: 7,
    letterSpacing: 2,
    marginBottom: 4,
  },
  ticketNumber: {
    color: "#ffffff",
    fontSize: 42,
    fontWeight: "bold",
    lineHeight: 1,
  },

  // 3. MINIMAL ORDER INFO
  metaGrid: {
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  metaLabel: {
    fontSize: 7,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 7.5,
    fontWeight: "bold",
    textAlign: "right",
  },

  // DIVIDERS (ใช้เส้นบางและเส้นหนาผสมกันสร้างมิติ)
  dividerThick: {
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    marginVertical: 10,
  },
  dividerThin: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#000",
    marginVertical: 8,
  },
  dividerDotted: {
    borderBottomWidth: 1,
    borderBottomStyle: "dotted",
    borderBottomColor: "#888",
    marginVertical: 8,
  },

  // 4. CLEAN TABLE ITEMS
  tableHeader: {
    flexDirection: "row",
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginBottom: 8,
  },
  thText: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#555",
    letterSpacing: 1,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  itemQty: {
    width: COL_QTY,
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "left",
  },
  itemBody: {
    width: COL_NAME,
    paddingRight: 4,
  },
  itemName: {
    fontSize: 9,
    fontWeight: "bold",
    lineHeight: 1.3,
  },
  itemOption: {
    fontSize: 7,
    color: "#555",
    marginTop: 2,
  },
  itemNote: {
    fontSize: 7,
    color: "#000",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginTop: 2,
    alignSelf: "flex-start",
    borderRadius: 2,
  },
  itemPrice: {
    width: COL_PRICE,
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "right",
  },

  // 5. GRAND TOTAL EMPHASIS
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 8,
    color: "#555",
  },
  summaryValue: {
    fontSize: 9,
    fontWeight: "bold",
  },
  grandTotalBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: "#000",
  },
  grandTotalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
  },

  // 6. FOOTER & SCANNER
  footer: {
    alignItems: "center",
    marginTop: 16,
  },
  qrPlaceholder: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: "#ccc",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  footerGreeting: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 4,
  },
  footerSub: {
    fontSize: 7,
    color: "#666",
    textAlign: "center",
    marginBottom: 12,
  },
  barcodeText: {
    fontFamily: "Helvetica", // ใช้ฟอนต์มาตรฐานสำหรับตัวเลข Barcode
    fontSize: 6,
    letterSpacing: 4,
    color: "#888",
  },
});

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  order: OrderHeader;
}

export default function OrderReceiptPDF({ order }: Props) {
  const dateStr = formatThaiDate(order.createdAt, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = formatThaiTime(order.createdAt);

  const activeItems = order.orderDetails?.filter((i) => !i.isCancelled) ?? [];

  // คำนวณความสูงพื้นฐาน (Header + Footer + ส่วนอื่นๆ) ประมาณ 300pt
// และบวกเพิ่ม 30pt ต่อ 1 รายการอาหาร
const pageHeight = 300 + (activeItems.length * 30);

  return (
    <Document title={`Receipt-${order.orderCode}`}>
      <Page size={[227, pageHeight]} style={S.page}>
        {/* 1. BRANDING */}
        <View style={S.headerContainer}>
          <Text style={S.brandName}>ก๋วยเตี๋ยวแชมป์</Text>
          <Text style={S.brandTagline}>Premium Noodle Bar</Text>
          <Text style={S.brandMeta}>ม.ราชภัฏกาญจนบุรี | T. 032-514-622</Text>
        </View>
        {/* 2. PICKUP TICKET (The "Wow" Factor) */}
        {order.pickUpCode && (
          <View style={S.ticketBox}>
            <Text style={S.ticketLabel}>PICK-UP NUMBER</Text>
            <Text style={S.ticketNumber}>{order.pickUpCode}</Text>
          </View>
        )}
        {/* 3. META INFO */}
        <View style={S.metaGrid}>
          <View style={S.metaRow}>
            <Text style={S.metaLabel}>Order No.</Text>
            <Text style={S.metaValue}>#{order.orderCode}</Text>
          </View>
          <View style={S.metaRow}>
            <Text style={S.metaLabel}>Date / Time</Text>
            <Text style={S.metaValue}>
              {dateStr} {timeStr}
            </Text>
          </View>
          <View style={S.metaRow}>
            <Text style={S.metaLabel}>Status</Text>
            <Text style={S.metaValue}>{statusLabel(order.orderStatus)}</Text>
          </View>
          {order.customerName && (
            <View style={S.metaRow}>
              <Text style={S.metaLabel}>Customer</Text>
              <Text style={S.metaValue}>{order.customerName}</Text>
            </View>
          )}
          <View style={S.metaRow}>
            <Text style={S.metaLabel}>Payment</Text>
            <Text style={S.metaValue}>{paymentLabel(order.paymentMethod)}</Text>
          </View>
        </View>
        <View style={S.dividerThick} />
        {/* 4. ITEMS LIST (Minimalist Grid) */}
        <View style={S.tableHeader}>
          <Text style={[S.thText, { width: COL_QTY }]}>QTY</Text>
          <Text style={[S.thText, { width: COL_NAME }]}>ITEM</Text>
          <Text style={[S.thText, { width: COL_PRICE, textAlign: "right" }]}>
            AMT
          </Text>
        </View>
        {activeItems.map((item, idx) => {
          const options = (item.orderDetailOptions as any[]) ?? [];
          return (
            <View key={idx} style={S.itemRow} wrap={false}>
              <Text style={S.itemQty}>{item.quantity}</Text>

              <View style={S.itemBody}>
                <Text style={S.itemName}>{item.menuItemName}</Text>
                {options.map((opt, i) => (
                  <Text key={i} style={S.itemOption}>
                    ↳ {opt.optionValueName}
                  </Text>
                ))}
                {item.note && <Text style={S.itemNote}>Note: {item.note}</Text>}
              </View>

              <Text style={S.itemPrice}>{fmtMoney(item.totalPrice)}</Text>
            </View>
          );
        })}
        <View style={S.dividerThin} />
        {/* 5. TOTALS */}
        <View style={S.summaryRow}>
          <Text style={S.summaryLabel}>Subtotal</Text>
          <Text style={S.summaryValue}>{fmtMoney(order.subTotal)}</Text>
        </View>
        {order.discount > 0 && (
          <View style={S.summaryRow}>
            <Text style={S.summaryLabel}>
              Discount{" "}
              {order.appliedPromoCode ? `(${order.appliedPromoCode})` : ""}
            </Text>
            <Text style={[S.summaryValue, { color: "#d32f2f" }]}>
              -{fmtMoney(order.discount)}
            </Text>
          </View>
        )}
        <View style={S.grandTotalBox}>
          <Text style={S.grandTotalLabel}>TOTAL</Text>
          <Text style={S.grandTotalValue}>{fmtMoney(order.total)}</Text>
        </View>
        <View style={S.dividerDotted} />
        {/* 6. FOOTER */}
        <View style={S.footer}>
          {/* คุณสามารถใช้ <Image> ของ react-pdf เพื่อใส่ภาพ QR โค้ดรับเงินตรงนี้ได้ */}
          <View style={S.qrPlaceholder}>
            <Text style={{ fontSize: 6, color: "#999" }}>QR CODE</Text>
          </View>

          <Text style={S.footerGreeting}>THANK YOU</Text>
          <Text style={S.footerSub}>We hope to see you again soon!</Text>

          <Text style={S.barcodeText}>*{order.orderCode}*</Text>
        </View>
      </Page>
    </Document>
  );
}
