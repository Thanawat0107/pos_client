/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { OrderHeader } from "../../../../../@types/dto/OrderHeader";

Font.registerHyphenationCallback((word) => [word]);

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
// column widths: qty=28  price=58  name=flex (≈117pt)
const COL_QTY = 28;
const COL_PRICE = 58;

const S = StyleSheet.create({
  page: {
    fontFamily: "Sarabun",
    backgroundColor: "#ffffff",
    color: "#000000",
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 8,
    lineHeight: 1.5,
  },

  // store header
  storeName: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1.5,
  },
  storeSubtitle: {
    fontSize: 7,
    textAlign: "center",
    letterSpacing: 2.5,
    marginBottom: 1,
  },
  storeMeta: { fontSize: 6.5, color: "#555", textAlign: "center", marginTop: 1 },

  // dividers
  solidLine: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#000",
    marginVertical: 6,
  },
  dashedLine: {
    borderBottomWidth: 0.5,
    borderBottomStyle: "dashed",
    borderBottomColor: "#888",
    marginVertical: 5,
  },

  // pickup code box
  pickupBox: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#000",
    borderRadius: 3,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  pickupLabel: {
    fontSize: 5.5,
    fontWeight: "bold",
    letterSpacing: 2,
    color: "#555",
    marginBottom: 3,
    textAlign: "center",
  },
  pickupCode: {
    fontSize: 46,
    fontWeight: "bold",
    letterSpacing: 12,
    lineHeight: 1,
    textAlign: "center",
  },

  // info rows (label left, value right)
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2.5,
  },
  infoLabel: { fontSize: 7, color: "#555", flexShrink: 0 },
  infoValue: {
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "right",
    flex: 1,
    paddingLeft: 8,
  },

  // table header
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 3,
    marginBottom: 5,
  },
  thName: { flex: 1, fontSize: 7, fontWeight: "bold" },
  thQty: {
    width: COL_QTY,
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "center",
  },
  thPrice: {
    width: COL_PRICE,
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "right",
  },

  // item row
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 7,
    paddingBottom: 5,
    borderBottomWidth: 0.3,
    borderBottomColor: "#ddd",
    borderBottomStyle: "dashed",
  },
  itemBody: { flex: 1, paddingRight: 4 },
  itemName: { fontSize: 8, fontWeight: "bold", lineHeight: 1.4 },
  itemUnitPrice: { fontSize: 6.5, color: "#666", marginTop: 1 },
  itemOption: { fontSize: 7, color: "#444", lineHeight: 1.4 },
  itemNote: { fontSize: 6.5, color: "#888", fontStyle: "italic" },
  itemQty: {
    width: COL_QTY,
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
    paddingTop: 1,
  },
  itemPrice: {
    width: COL_PRICE,
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "right",
    paddingTop: 1,
  },

  // cancelled section
  cancelledHeader: {
    fontSize: 6.5,
    color: "#aaa",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 3,
  },
  cancelledRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  cancelledText: { fontSize: 7, color: "#bbb" },

  // summary
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  summaryLabel: { fontSize: 8, color: "#555" },
  summaryValue: { fontSize: 8 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 3,
  },
  totalLabel: { fontSize: 11, fontWeight: "bold" },
  totalValue: { fontSize: 20, fontWeight: "bold" },

  // note box
  noteBox: {
    borderWidth: 0.5,
    borderStyle: "dashed",
    borderColor: "#aaa",
    borderRadius: 2,
    padding: 5,
    marginTop: 6,
    marginBottom: 4,
  },
  noteLabel: { fontSize: 6.5, fontWeight: "bold" },
  noteText: { fontSize: 6.5, marginTop: 1 },

  // footer
  footerThank: {
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  footerSub: { fontSize: 7, color: "#777", textAlign: "center", marginTop: 1 },
  barcodeStrip: {
    height: 24,
    width: "70%",
    alignSelf: "center",
    marginTop: 10,
    backgroundColor: "#000",
    borderRadius: 1,
  },
  barcodeNum: {
    fontSize: 5.5,
    letterSpacing: 2,
    textAlign: "center",
    color: "#666",
    marginTop: 3,
  },
  printedBy: {
    fontSize: 5.5,
    color: "#bbb",
    textAlign: "center",
    marginTop: 8,
  },
});

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  order: OrderHeader;
}

export default function OrderReceiptPDF({ order }: Props) {
  const dt = new Date(order.createdAt);
  const dateStr = dt.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = dt.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const printedAt = new Date().toLocaleString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const activeItems = order.orderDetails?.filter((i) => !i.isCancelled) ?? [];
  const cancelledItems =
    order.orderDetails?.filter((i) => i.isCancelled) ?? [];

  return (
    <Document title={`Receipt-${order.orderCode}`}>
      {/* 80mm = 227pt */}
      <Page size={[227, 841]} style={S.page}>

        {/* STORE HEADER */}
        <Text style={S.storeName}>GEMINI CAFE</Text>
        <Text style={S.storeSubtitle}>{"& RESTAURANT"}</Text>
        <Text style={S.storeMeta}>{"สาขาสำนักงานใหญ่  โทร 02-123-4567"}</Text>
        <Text style={S.storeMeta}>{"TAX ID: 0-1234-56789-01-2"}</Text>

        <View style={S.solidLine} />

        {/* PICK UP CODE */}
        {order.pickUpCode ? (
          <View style={S.pickupBox}>
            <Text style={S.pickupLabel}>{"รหัสรับออเดอร์  PICK UP CODE"}</Text>
            <Text style={S.pickupCode}>{order.pickUpCode}</Text>
          </View>
        ) : null}

        {/* ORDER INFO */}
        <View style={S.infoRow}>
          <Text style={S.infoLabel}>{"เลขออเดอร์"}</Text>
          <Text style={S.infoValue}>{order.orderCode}</Text>
        </View>
        <View style={S.infoRow}>
          <Text style={S.infoLabel}>{"วันที่"}</Text>
          <Text style={S.infoValue}>{dateStr + "  " + timeStr + " น."}</Text>
        </View>
        {order.customerName ? (
          <View style={S.infoRow}>
            <Text style={S.infoLabel}>{"ชื่อลูกค้า"}</Text>
            <Text style={S.infoValue}>{order.customerName}</Text>
          </View>
        ) : null}
        {order.customerPhone ? (
          <View style={S.infoRow}>
            <Text style={S.infoLabel}>{"เบอร์โทร"}</Text>
            <Text style={S.infoValue}>{order.customerPhone}</Text>
          </View>
        ) : null}
        <View style={S.infoRow}>
          <Text style={S.infoLabel}>{"สถานะ"}</Text>
          <Text style={S.infoValue}>{statusLabel(order.orderStatus)}</Text>
        </View>
        <View style={S.infoRow}>
          <Text style={S.infoLabel}>{"วิธีชำระ"}</Text>
          <Text style={S.infoValue}>{paymentLabel(order.paymentMethod)}</Text>
        </View>
        {order.appliedPromoCode ? (
          <View style={S.infoRow}>
            <Text style={S.infoLabel}>{"โปรโมชั่น"}</Text>
            <Text style={S.infoValue}>{order.appliedPromoCode}</Text>
          </View>
        ) : null}

        <View style={S.dashedLine} />

        {/* TABLE HEADER */}
        <View style={S.tableHeader}>
          <Text style={S.thName}>{"รายการ"}</Text>
          <Text style={S.thQty}>{"จน."}</Text>
          <Text style={S.thPrice}>{"ราคา"}</Text>
        </View>

        {/* ACTIVE ITEMS */}
        {activeItems.map((item, idx) => {
          const options = (item.orderDetailOptions as any[]) ?? [];
          const unitPrice =
            item.quantity > 0
              ? item.totalPrice / item.quantity
              : item.totalPrice;

          return (
            <View key={idx} style={S.itemRow} wrap={false}>
              <View style={S.itemBody}>
                <Text style={S.itemName}>{item.menuItemName}</Text>
                {options.map((opt, i) => (
                  <Text key={i} style={S.itemOption}>
                    {"+ " + opt.optionValueName}
                  </Text>
                ))}
                {item.note ? (
                  <Text style={S.itemNote}>{"* " + item.note}</Text>
                ) : null}
                <Text style={S.itemUnitPrice}>
                  {item.quantity + " x " + fmtMoney(unitPrice)}
                </Text>
              </View>
              <Text style={S.itemQty}>{item.quantity}</Text>
              <Text style={S.itemPrice}>{"฿" + fmtMoney(item.totalPrice)}</Text>
            </View>
          );
        })}

        {/* CANCELLED ITEMS */}
        {cancelledItems.length > 0 ? (
          <>
            <View style={S.dashedLine} />
            <Text style={S.cancelledHeader}>{"-- รายการที่ถูกยกเลิก --"}</Text>
            {cancelledItems.map((item, idx) => (
              <View key={idx} style={S.cancelledRow}>
                <Text style={S.cancelledText}>
                  {item.menuItemName + " x" + item.quantity}
                </Text>
                <Text style={S.cancelledText}>
                  {"฿" + fmtMoney(item.totalPrice)}
                </Text>
              </View>
            ))}
          </>
        ) : null}

        <View style={S.solidLine} />

        {/* SUMMARY */}
        <View style={S.summaryRow}>
          <Text style={S.summaryLabel}>{"รวมค่าอาหาร"}</Text>
          <Text style={S.summaryValue}>{"฿" + fmtMoney(order.subTotal)}</Text>
        </View>
        {order.discount > 0 ? (
          <View style={S.summaryRow}>
            <Text style={S.summaryLabel}>
              {"ส่วนลด" +
                (order.appliedPromoCode
                  ? "  (" + order.appliedPromoCode + ")"
                  : "")}
            </Text>
            <Text style={S.summaryValue}>{"-฿" + fmtMoney(order.discount)}</Text>
          </View>
        ) : null}
        <View style={S.dashedLine} />
        <View style={S.totalRow}>
          <Text style={S.totalLabel}>{"ยอดสุทธิ"}</Text>
          <Text style={S.totalValue}>{"฿" + fmtMoney(order.total)}</Text>
        </View>
        {order.paidAt ? (
          <View style={[S.infoRow, { marginTop: 5 }]}>
            <Text style={S.infoLabel}>{"ชำระเงินเมื่อ"}</Text>
            <Text style={S.infoValue}>
              {new Date(order.paidAt).toLocaleString("th-TH", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }) + " น."}
            </Text>
          </View>
        ) : null}

        {/* CUSTOMER NOTE */}
        {order.customerNote ? (
          <View style={S.noteBox}>
            <Text style={S.noteLabel}>{"หมายเหตุ:"}</Text>
            <Text style={S.noteText}>{order.customerNote}</Text>
          </View>
        ) : null}

        <View style={S.solidLine} />

        {/* FOOTER */}
        <Text style={S.footerThank}>{"** ขอบคุณที่ใช้บริการ **"}</Text>
        <Text style={S.footerSub}>{"Thank you for your visit!"}</Text>

        <View style={S.barcodeStrip} />
        <Text style={S.barcodeNum}>
          {String(order.id).padStart(8, "0") + (order.pickUpCode ?? "0000")}
        </Text>

        <Text style={S.printedBy}>
          {"พิมพ์โดยระบบ POS Admin  " + printedAt + " น."}
        </Text>

      </Page>
    </Document>
  );
}
