/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

export const exportToExcel = async (data: any, detailedData: any[], filters: any) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Revenue Report");

  // --- ส่วนที่ 1: การสร้าง Summary Dashboard (ด้านบนสุด) ---
  worksheet.mergeCells("A1:E1");
  const mainTitle = worksheet.getCell("A1");
  mainTitle.value = "Executive Revenue Summary";
  mainTitle.font = { name: 'Sarabun', size: 18, bold: true, color: { argb: "FF1E1B4B" } };
  mainTitle.alignment = { horizontal: "center" };

  // ใส่ข้อมูล KPI สรุปยอด
  worksheet.getCell("A3").value = "ยอดขายรวมทั้งหมด:";
  worksheet.getCell("B3").value = data?.totalRevenue || 0;
  worksheet.getCell("B3").numFmt = "#,##0.00฿";
  
  worksheet.getCell("A4").value = "รายการออเดอร์:";
  worksheet.getCell("B4").value = data?.totalOrders || 0;

  worksheet.getCell("A5").value = "ช่วงเวลา:";
  worksheet.getCell("B5").value = `${dayjs(filters.startDate).format("DD/MM/YYYY")} - ${dayjs(filters.endDate).format("DD/MM/YYYY")}`;

  // ตกแต่งส่วน Summary
  ["A3", "A4", "A5"].forEach(key => {
    worksheet.getCell(key).font = { bold: true };
  });

  // --- ส่วนที่ 2: ตารางข้อมูลหลัก ---
  const startRow = 7; // เริ่มตารางที่บรรทัดที่ 7
  worksheet.getRow(startRow).values = ["วันที่/เวลา", "เลขออเดอร์", "รายการอาหาร", "สถานะ", "ยอดเงินสุทธิ"];
  
  const headerRow = worksheet.getRow(startRow);
  headerRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E1B4B" } };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { horizontal: "center" };
  });

  // ใส่ข้อมูลลงในตาราง
  detailedData.forEach((item, _index) => {
    const row = worksheet.addRow([
      item.createdAt || item.date,
      item.orderNumber || item.id,
      item.name || item.items,
      item.status,
      item.totalAmount || item.amount,
    ]);

    // จัด Format ยอดเงิน
    row.getCell(5).numFmt = "#,##0.00฿";
  });

  // --- ส่วนที่ 3: ระบบ Auto-fit Column Width ---
  worksheet.columns.forEach((column: any) => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, (cell: any) => {
      const columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    // ตั้งความกว้างคอลัมน์ (บวกเพิ่มเล็กน้อยเผื่อพื้นที่ว่าง)
    column.width = maxLength < 12 ? 12 : maxLength + 3;
  });

  // --- ส่วนที่ 4: ดาวน์โหลดไฟล์ ---
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `Revenue_Report_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`);
};