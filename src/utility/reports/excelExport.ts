/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

export const exportToExcel = async (
  data: any,
  detailedData: any[],
  filters: any,
) => {
  const workbook = new ExcelJS.Workbook();
  const generatedAt = dayjs().format("DD/MM/YYYY HH:mm");
  const startDateStr = filters?.startDate
    ? dayjs(filters.startDate).format("DD/MM/YYYY")
    : "-";
  const endDateStr = filters?.endDate
    ? dayjs(filters.endDate).format("DD/MM/YYYY")
    : "-";

  // ดึงและทำความสะอาดข้อมูล
  const safeData = data || {};
  const topItems = Array.isArray(safeData.topSellingItems)
    ? safeData.topSellingItems
    : Array.isArray(safeData.topSellingDetail)
      ? safeData.topSellingDetail
      : [];
  const statusCount = safeData.orderStatusCount || {};

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

  // --- Theme Colors ---
  const colors = {
    primary: "FF1E293B", // Slate 800
    secondary: "FF6366F1", // Indigo 500
    success: "FF10B981", // Emerald 500
    warning: "FFF59E0B", // Amber 500
    danger: "FFEF4444", // Red 500
    bgLight: "FFF1F5F9", // Slate 100
    bgZebra: "FFF8FAFC", // Slate 50
    border: "FFCBD5E1", // Slate 300
    white: "FFFFFFFF",
  };

  const borderStyle: Partial<ExcelJS.Borders> = {
    top: { style: "thin", color: { argb: colors.border } },
    left: { style: "thin", color: { argb: colors.border } },
    bottom: { style: "thin", color: { argb: colors.border } },
    right: { style: "thin", color: { argb: colors.border } },
  };

  // ============================================================================
  // SHEET 1: EXECUTIVE SUMMARY (หน้าสรุปข้อมูล)
  // ============================================================================
  const summarySheet = workbook.addWorksheet("Executive Summary", {
    views: [{ showGridLines: false }],
  });

  // --- Header ---
  summarySheet.mergeCells("A1:D1");
  const title = summarySheet.getCell("A1");
  title.value = "EXECUTIVE ANALYTICS REPORT";
  title.font = {
    name: "Sarabun",
    size: 18,
    bold: true,
    color: { argb: colors.primary },
  };

  summarySheet.getCell("A2").value =
    "ก๋วยเตี๋ยวแชมป์ • Business Performance & Analytics";
  summarySheet.getCell("A2").font = {
    color: { argb: "FF64748B" },
    italic: true,
  };

  summarySheet.getCell("A4").value = "รอบการวิเคราะห์ (Period):";
  summarySheet.getCell("B4").value = `${startDateStr} - ${endDateStr}`;
  summarySheet.getCell("A5").value = "สร้างเอกสารเมื่อ:";
  summarySheet.getCell("B5").value = generatedAt;
  summarySheet.getCell("A4").font = { bold: true };
  summarySheet.getCell("A5").font = { bold: true };

  // --- Section 1: KPI Summary ---
  summarySheet.mergeCells("A7:B7");
  const sec1 = summarySheet.getCell("A7");
  sec1.value = "1. สรุปยอดขายและการดำเนินการ (KEY METRICS)";
  sec1.font = { bold: true, color: { argb: colors.white } };
  sec1.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: colors.primary },
  };
  sec1.alignment = { vertical: "middle", horizontal: "left", indent: 1 };

  const kpiData = [
    ["ยอดขายรวมทั้งหมด", safeData.totalRevenue || 0],
    ["ประมาณการกำไร", safeData.totalProfit || 0],
    ["รายการออเดอร์ทั้งหมด", safeData.totalOrders || 0],
    ["ยอดสั่งซื้อเฉลี่ยต่อบิล (AOV)", safeData.averageOrderValue || 0],
  ];

  kpiData.forEach((item, index) => {
    const row = summarySheet.getRow(8 + index);
    const labelCell = row.getCell(1);
    const valCell = row.getCell(2);

    labelCell.value = item[0];
    valCell.value = item[1];

    // ตกแต่งตาราง KPI
    labelCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colors.bgLight },
    };
    labelCell.font = { bold: true, color: { argb: colors.primary } };
    labelCell.border = borderStyle;

    valCell.border = borderStyle;
    valCell.font = { bold: true };
    valCell.alignment = { horizontal: "right" };
    valCell.numFmt = index < 2 || index === 3 ? "#,##0.00 ฿" : "#,##0";
  });

  // --- Section 2: Efficiency & Status ---
  summarySheet.mergeCells("A13:B13");
  const sec2 = summarySheet.getCell("A13");
  sec2.value = "2. ประสิทธิภาพและสัดส่วนสถานะ (EFFICIENCY & STATUS)";
  sec2.font = { bold: true, color: { argb: colors.white } };
  sec2.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: colors.primary },
  };
  sec2.alignment = { vertical: "middle", horizontal: "left", indent: 1 };

  const effData = [
    ["อัตราการทำรายการสำเร็จ", `${safeData.successRate || 0} %`],
    ["เวลาเฉลี่ยในการเตรียมอาหาร", `${safeData.averagePrepTime || 0} นาที`],
    ["ออเดอร์สำเร็จ", countSuccess],
    ["ออเดอร์รอปรุง/รอชำระ", countPending],
    ["ออเดอร์ยกเลิก", countCancel],
  ];

  effData.forEach((item, index) => {
    const row = summarySheet.getRow(14 + index);
    const labelCell = row.getCell(1);
    const valCell = row.getCell(2);

    labelCell.value = item[0];
    valCell.value = item[1];

    labelCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colors.bgLight },
    };
    labelCell.font = { bold: true, color: { argb: colors.primary } };
    labelCell.border = borderStyle;

    valCell.border = borderStyle;
    valCell.font = { bold: true };
    valCell.alignment = { horizontal: "right" };
    if (typeof item[1] === "number") valCell.numFmt = "#,##0";

    // ใส่สีให้ตัวเลขสถานะ
    if (index === 2)
      valCell.font = { bold: true, color: { argb: colors.success } };
    if (index === 3)
      valCell.font = { bold: true, color: { argb: colors.warning } };
    if (index === 4)
      valCell.font = { bold: true, color: { argb: colors.danger } };
  });

  // --- Section 3: Top Performing Items ---
  summarySheet.mergeCells("A21:D21");
  const sec3 = summarySheet.getCell("A21");
  sec3.value = "3. สินค้าขายดีที่สุด (TOP 5 ITEMS)";
  sec3.font = { bold: true, color: { argb: colors.white } };
  sec3.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: colors.primary },
  };
  sec3.alignment = { vertical: "middle", horizontal: "left", indent: 1 };

  // Table Headers
  const topItemHeader = summarySheet.getRow(22);
  topItemHeader.values = [
    "อันดับ",
    "ชื่อสินค้า",
    "จำนวน (จาน)",
    "ยอดขาย (THB)",
  ];
  topItemHeader.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colors.secondary },
    };
    cell.font = { bold: true, color: { argb: colors.white } };
    cell.alignment = { horizontal: "center" };
    cell.border = borderStyle;
  });

  if (topItems.length > 0) {
    topItems.slice(0, 5).forEach((item: any, idx: number) => {
      const itemName =
        item.name ||
        item.menuItemName ||
        item.itemName ||
        item.title ||
        "ไม่ระบุ";
      const itemQty =
        item.quantity ||
        item.qty ||
        item.count ||
        item.totalQuantity ||
        item.soldQuantity ||
        0;
      const itemRev =
        item.revenue ||
        item.totalRevenue ||
        item.totalPrice ||
        item.totalAmount ||
        item.sales ||
        0;

      const row = summarySheet.addRow([idx + 1, itemName, itemQty, itemRev]);

      row.eachCell((cell, colNumber) => {
        cell.border = borderStyle;
        // ทำ Zebra Striping (สลับสีแถว)
        if (idx % 2 !== 0) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: colors.bgZebra },
          };
        }
        if (colNumber === 1) cell.alignment = { horizontal: "center" };
        if (colNumber === 3) cell.numFmt = "#,##0";
        if (colNumber === 4) cell.numFmt = "#,##0.00 ฿";
      });
    });
  } else {
    const emptyRow = summarySheet.addRow(["ไม่มีข้อมูลการขายในช่วงเวลานี้"]);
    summarySheet.mergeCells(`A${emptyRow.number}:D${emptyRow.number}`);
    emptyRow.getCell(1).alignment = { horizontal: "center" };
    emptyRow.getCell(1).border = borderStyle;
  }

  // ปรับความกว้างคอลัมน์ Sheet 1
  summarySheet.getColumn(1).width = 32;
  summarySheet.getColumn(2).width = 35;
  summarySheet.getColumn(3).width = 18;
  summarySheet.getColumn(4).width = 22;

  // ============================================================================
  // SHEET 2: DETAILED ORDER LOG (ข้อมูลดิบออเดอร์)
  // ============================================================================
  const detailSheet = workbook.addWorksheet("Detailed Order Log", {
    views: [{ state: "frozen", ySplit: 1 }], // ล็อกแถวหัวตาราง (Freeze Panes)
  });

  // Table Headers
  const detailHeader = detailSheet.getRow(1);
  detailHeader.values = [
    "วันที่/เวลา",
    "เลขออเดอร์",
    "รายการอาหาร",
    "ชื่อลูกค้า",
    "การชำระเงิน",
    "สถานะ",
    "ยอดเงินสุทธิ",
  ];
  detailHeader.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: colors.primary },
    };
    cell.font = { bold: true, color: { argb: colors.white } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = borderStyle;
  });
  detailHeader.height = 25;

  // ใส่ข้อมูลลงในตาราง
  const targetDetails =
    detailedData?.length > 0 ? detailedData : safeData.details || [];
  targetDetails.forEach((item: any, idx: number) => {
    const row = detailSheet.addRow([
      dayjs(item.createdAt || item.date).format("DD/MM/YYYY HH:mm"),
      item.orderNumber || item.id || item.orderCode,
      item.name || item.items || item.menuItemName,
      item.customerName || "-",
      (item.paymentMethod || "N/A").toUpperCase(),
      (item.status || item.orderStatus || "N/A").toUpperCase(),
      item.totalAmount || item.amount || item.total,
    ]);

    row.eachCell((cell, colNumber) => {
      cell.border = borderStyle;
      // ทำ Zebra Striping
      if (idx % 2 !== 0) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: colors.bgZebra },
        };
      }

      // จัด Alignment และ Format
      if (
        colNumber === 1 ||
        colNumber === 2 ||
        colNumber === 5 ||
        colNumber === 6
      ) {
        cell.alignment = { horizontal: "center" };
      }
      if (colNumber === 7) {
        cell.numFmt = "#,##0.00 ฿";
        cell.font = { bold: true };
      }

      // เน้นสีสถานะ
      if (colNumber === 6) {
        const statusStr = cell.value?.toString().toLowerCase() || "";
        if (statusStr.includes("success") || statusStr.includes("เสร็จ"))
          cell.font = { color: { argb: colors.success }, bold: true };
        if (statusStr.includes("pending") || statusStr.includes("รอ"))
          cell.font = { color: { argb: colors.warning }, bold: true };
        if (statusStr.includes("cancel") || statusStr.includes("ยกเลิก"))
          cell.font = { color: { argb: colors.danger }, bold: true };
      }
    });
  });

  // ระบบ Auto-fit Column Width
  detailSheet.columns.forEach((column: any, _i: number) => {
    let maxLength = 12;
    column.eachCell({ includeEmpty: true }, (cell: any) => {
      const columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    // ตั้งความกว้างคอลัมน์ (+ เผื่อระยะขอบ)
    column.width = Math.min(maxLength + 4, 50);
  });

  // --- ส่วนที่ 4: ดาวน์โหลดไฟล์ ---
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `Analytics_Report_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`);
};
