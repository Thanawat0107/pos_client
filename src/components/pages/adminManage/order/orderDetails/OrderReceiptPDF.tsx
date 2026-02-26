/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { OrderHeader } from "../../../../../@types/dto/OrderHeader";
import { formatThaiDate, formatThaiTime } from "../../../../../utility/utils";
import { registerPdfFonts } from "../../../../../hooks/useFont";

// Register Thai fonts
registerPdfFonts();

// ── helpers ───────────────────────────────────────────────────────────────────
const fmtMoney = (n: number) =>
  (n ?? 0).toLocaleString("th-TH", { minimumFractionDigits: 2 });

const paymentLabel = (method: string) => {
  const map: Record<string, string> = {
    cash: "เงินสด (Cash)",
    promptPay: "พร้อมเพย์ (PromptPay)",
  };
  return map[method] ?? method ?? "-";
};

const statusLabel = (s: string) => {
  const map: Record<string, string> = {
    pendingPayment: "รอชำระเงิน",
    paid: "ชำระแล้ว",
    pending: "รอดำเนินการ",
    approved: "อนุมัติแล้ว",
    preparing: "กำลังปรุง",
    ready: "พร้อมเสิร์ฟ",
    completed: "สำเร็จ",
    cancelled: "ยกเลิก",
    closed: "ปิด",
  };
  return map[s] ?? s;
};

// ── 80mm page: 227pt wide, padding 12pt × 2 = 203pt usable ───────────────────
const COL_QTY = 32;
const COL_PRICE = 65;

const S = StyleSheet.create({
  page: {
    fontFamily: "Sarabun",
    fontSize: 8,
    lineHeight: 1.6,
    backgroundColor: "#ffffff",
    color: "#1a1a1a",
    paddingHorizontal: 14,
    paddingVertical: 16,
  },

  // store header - premium design
  storeHeader: {
    alignItems: "center",
    marginBottom: 10,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 2,
    textAlign: "center",
    color: "#1a1a1a",
  },
  storeSubtitle: {
    fontSize: 8,
    textAlign: "center",
    letterSpacing: 1.5,
    marginTop: 2,
    marginBottom: 6,
    color: "#333",
    fontWeight: "600",
  },
  storeMeta: {
    fontSize: 7,
    color: "#555",
    textAlign: "center",
    marginBottom: 2,
    lineHeight: 1.4,
  },

  // dividers
  solidLine: {
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    marginVertical: 8,
  },
  dashedLine: {
    borderBottomWidth: 0.8,
    borderBottomStyle: "dashed",
    borderBottomColor: "#666",
    marginVertical: 6,
  },
  thinLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
    marginVertical: 4,
  },

  // pickup code box - prominent
  pickupBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#000",
    borderRadius: 4,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  pickupLabel: {
    fontSize: 6,
    fontWeight: "bold",
    letterSpacing: 1.5,
    color: "#666",
    marginBottom: 4,
    textAlign: "center",
  },
  pickupCode: {
    fontSize: 48,
    fontWeight: "bold",
    letterSpacing: 10,
    lineHeight: 1,
    textAlign: "center",
    color: "#000",
  },

  // info rows
  infoSection: {
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
    paddingBottom: 2,
  },
  infoLabel: {
    fontSize: 7.5,
    color: "#666",
    fontWeight: "600",
    maxWidth: "40%",
  },
  infoValue: {
    fontSize: 7.5,
    fontWeight: "bold",
    textAlign: "right",
    flex: 1,
    paddingLeft: 10,
    color: "#1a1a1a",
  },

  // table header
  tableHeader: {
    flexDirection: "row",
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: "#000",
    paddingVertical: 5,
    marginBottom: 6,
  },
  thName: {
    flex: 1,
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#000",
  },
  thQty: {
    width: COL_QTY,
    fontSize: 7.5,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
  },
  thPrice: {
    width: COL_PRICE,
    fontSize: 7.5,
    fontWeight: "bold",
    textAlign: "right",
    color: "#000",
  },

  // item row - safe spacing
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 0.5,
    borderColor: "#e0e0e0",
  },
  itemBody: {
    flex: 1,
    paddingRight: 6,
  },
  itemName: {
    fontSize: 8.5,
    fontWeight: "bold",
    lineHeight: 1.5,
    color: "#1a1a1a",
    marginBottom: 2,
  },
  itemUnitPrice: {
    fontSize: 7,
    color: "#777",
    marginTop: 2,
    lineHeight: 1.4,
  },
  itemOption: {
    fontSize: 7.5,
    color: "#555",
    lineHeight: 1.4,
    marginLeft: 4,
    marginTop: 1,
  },
  itemNote: {
    fontSize: 7,
    color: "#999",
    fontStyle: "italic",
    marginTop: 2,
    lineHeight: 1.4,
  },
  itemQty: {
    width: COL_QTY,
    fontSize: 8.5,
    fontWeight: "bold",
    textAlign: "center",
    paddingTop: 3,
    color: "#1a1a1a",
  },
  itemPrice: {
    width: COL_PRICE,
    fontSize: 8.5,
    fontWeight: "bold",
    textAlign: "right",
    paddingTop: 3,
    color: "#1a1a1a",
  },

  // cancelled section
  cancelledHeader: {
    fontSize: 7,
    color: "#999",
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 6,
    letterSpacing: 1,
  },
  cancelledRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
    paddingBottom: 2,
  },
  cancelledText: {
    fontSize: 7.5,
    color: "#aaa",
    textDecoration: "line-through",
  },

  // summary
  summarySection: {
    marginVertical: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
    paddingBottom: 3,
  },
  summaryLabel: {
    fontSize: 8,
    color: "#666",
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#1a1a1a",
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    paddingTop: 6,
    paddingBottom: 6,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: "#000",
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },

  // note box
  noteBox: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#ddd",
    borderRadius: 3,
    padding: 6,
    marginVertical: 8,
    backgroundColor: "#fafafa",
  },
  noteLabel: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 2,
  },
  noteText: {
    fontSize: 7.5,
    color: "#555",
    lineHeight: 1.5,
  },

  // footer
  footerSection: {
    alignItems: "center",
    marginTop: 12,
  },
  footerThank: {
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1,
    color: "#1a1a1a",
    marginBottom: 3,
  },
  footerSub: {
    fontSize: 7.5,
    color: "#888",
    textAlign: "center",
    marginBottom: 8,
  },
  barcodeStrip: {
    height: 26,
    width: "70%",
    alignSelf: "center",
    marginVertical: 8,
    backgroundColor: "#000",
    borderRadius: 1,
  },
  barcodeNum: {
    fontSize: 6,
    letterSpacing: 2,
    textAlign: "center",
    color: "#999",
    marginTop: 4,
  },
  printedBy: {
    fontSize: 6,
    color: "#ccc",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 1.4,
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
  const printedAt = `${formatThaiDate(new Date(), { day: "2-digit", month: "short", year: "numeric" })} ${formatThaiTime(new Date())} น.`;

  const activeItems = order.orderDetails?.filter((i) => !i.isCancelled) ?? [];
  const cancelledItems = order.orderDetails?.filter((i) => i.isCancelled) ?? [];

  return (
    <Document title={`Receipt-${order.orderCode}`}>
      <Page size={[227, 841]} style={S.page}>
        
        {/* STORE HEADER */}
        <View style={S.storeHeader}>
          <Text style={S.storeName}>ก๋วยเตี๋ยวแชมป์</Text>
          <Text style={S.storeSubtitle}>Noodle Shop</Text>
          <Text style={S.storeMeta}>บริเวณหน้า มหาวิทยาลัยราชภัฏกาญจนบุรี</Text>
          <Text style={S.storeMeta}>โทร 032-514-622  |  เปิด 16:30 - 22:00 น.</Text>
        </View>

        <View style={S.solidLine} />

        {/* PICK UP CODE */}
        {order.pickUpCode ? (
          <View style={S.pickupBox}>
            <Text style={S.pickupLabel}>รหัสรับออเดอร์ / PICK UP CODE</Text>
            <Text style={S.pickupCode}>{order.pickUpCode}</Text>
          </View>
        ) : null}

        {/* ORDER INFO */}
        <View style={S.infoSection}>
          <View style={S.infoRow}>
            <Text style={S.infoLabel}>เลขออเดอร์</Text>
            <Text style={S.infoValue}>{order.orderCode}</Text>
          </View>
          <View style={S.infoRow}>
            <Text style={S.infoLabel}>วันที่ / เวลา</Text>
            <Text style={S.infoValue}>{dateStr} {timeStr} น.</Text>
          </View>
          {order.customerName ? (
            <View style={S.infoRow}>
              <Text style={S.infoLabel}>ชื่อลูกค้า</Text>
              <Text style={S.infoValue}>{order.customerName}</Text>
            </View>
          ) : null}
          {order.customerPhone ? (
            <View style={S.infoRow}>
              <Text style={S.infoLabel}>เบอร์โทร</Text>
              <Text style={S.infoValue}>{order.customerPhone}</Text>
            </View>
          ) : null}
          <View style={S.infoRow}>
            <Text style={S.infoLabel}>สถานะ</Text>
            <Text style={S.infoValue}>{statusLabel(order.orderStatus)}</Text>
          </View>
          <View style={S.infoRow}>
            <Text style={S.infoLabel}>วิธีชำระ</Text>
            <Text style={S.infoValue}>{paymentLabel(order.paymentMethod)}</Text>
          </View>
          {order.appliedPromoCode ? (
            <View style={S.infoRow}>
              <Text style={S.infoLabel}>โปรโมชั่น</Text>
              <Text style={S.infoValue}>{order.appliedPromoCode}</Text>
            </View>
          ) : null}
        </View>

        <View style={S.dashedLine} />

        {/* TABLE HEADER */}
        <View style={S.tableHeader}>
          <Text style={S.thName}>รายการ</Text>
          <Text style={S.thQty}>จน.</Text>
          <Text style={S.thPrice}>ราคา</Text>
        </View>

        {/* ACTIVE ITEMS */}
        {activeItems.map((item, idx) => {
          const options = (item.orderDetailOptions as any[]) ?? [];
          const unitPrice =
            item.quantity > 0 ? item.totalPrice / item.quantity : item.totalPrice;

          return (
            <View key={idx} style={S.itemRow} wrap={false}>
              <View style={S.itemBody}>
                <Text style={S.itemName}>{item.menuItemName}</Text>
                {options.length > 0 ? (
                  <View>
                    {options.map((opt, i) => (
                      <Text key={i} style={S.itemOption}>
                        + {opt.optionValueName}
                      </Text>
                    ))}
                  </View>
                ) : null}
                {item.note ? (
                  <Text style={S.itemNote}>* {item.note}</Text>
                ) : null}
                <Text style={S.itemUnitPrice}>
                  {item.quantity} × ฿{fmtMoney(unitPrice)}
                </Text>
              </View>
              <Text style={S.itemQty}>{item.quantity}</Text>
              <Text style={S.itemPrice}>฿{fmtMoney(item.totalPrice)}</Text>
            </View>
          );
        })}

        {/* CANCELLED ITEMS */}
        {cancelledItems.length > 0 ? (
          <>
            <View style={S.dashedLine} />
            <Text style={S.cancelledHeader}>── รายการที่ถูกยกเลิก ──</Text>
            {cancelledItems.map((item, idx) => {
              const unitPrice =
                item.quantity > 0
                  ? item.totalPrice / item.quantity
                  : item.totalPrice;
              return (
                <View key={idx} style={S.cancelledRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={S.cancelledText}>
                      {item.menuItemName} × {item.quantity} @ ฿{fmtMoney(unitPrice)}
                    </Text>
                  </View>
                  <Text style={[S.cancelledText, { textAlign: "right" }]}>
                    ฿{fmtMoney(item.totalPrice)}
                  </Text>
                </View>
              );
            })}
          </>
        ) : null}

        <View style={S.solidLine} />

        {/* SUMMARY */}
        <View style={S.summarySection}>
          <View style={S.summaryRow}>
            <Text style={S.summaryLabel}>รวมค่าอาหาร</Text>
            <Text style={S.summaryValue}>฿{fmtMoney(order.subTotal)}</Text>
          </View>
          {order.discount > 0 ? (
            <View style={S.summaryRow}>
              <Text style={S.summaryLabel}>
                ส่วนลด
                {order.appliedPromoCode ? ` (${order.appliedPromoCode})` : ""}
              </Text>
              <Text style={[S.summaryValue, { color: "#d32f2f" }]}>
                -฿{fmtMoney(order.discount)}
              </Text>
            </View>
          ) : null}

          <View style={S.totalRow}>
            <Text style={S.totalLabel}>ยอดสุทธิ</Text>
            <Text style={S.totalValue}>฿{fmtMoney(order.total)}</Text>
          </View>

          {order.paidAt ? (
            <View style={S.summaryRow}>
              <Text style={S.summaryLabel}>ชำระเงินเมื่อ</Text>
              <Text style={S.summaryValue}>
                {formatThaiDate(order.paidAt, {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}{" "}
                {formatThaiTime(order.paidAt)} น.
              </Text>
            </View>
          ) : null}
        </View>

        {/* CUSTOMER NOTE */}
        {order.customerNote ? (
          <View style={S.noteBox}>
            <Text style={S.noteLabel}>หมายเหตุ:</Text>
            <Text style={S.noteText}>{order.customerNote}</Text>
          </View>
        ) : null}

        {/* FOOTER */}
        <View style={S.footerSection}>
          <Text style={S.footerThank}>✦ ขอบคุณที่ใช้บริการ ✦</Text>
          <Text style={S.footerSub}>Thank you for your visit!</Text>

          <View style={S.barcodeStrip} />
          <Text style={S.barcodeNum}>
            {String(order.id).padStart(8, "0")}
            {order.pickUpCode ?? "0000"}
          </Text>

          <Text style={S.printedBy}>
            พิมพ์โดยระบบ POS Admin{"\n"}
            {printedAt}
          </Text>
        </View>

      </Page>
    </Document>
  );
}
