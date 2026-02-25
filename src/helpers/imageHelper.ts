import { baseUrl } from "./SD";

/**
 * แปลง URL รูปภาพให้พร้อมใช้งาน
 * - ถ้าเป็น absolute URL (http/https) → ใช้ตรงทันที
 * - ถ้าเป็น relative path (/uploads/...) → ต่อกับ baseUrl ของ server
 * - ถ้าไม่มีค่า → ใช้ fallback แทน
 */
export function getImage(
  raw?: string | null,
  fallback = "https://placehold.co/400x400?text=No+Image"
): string {
  if (!raw) return fallback;
  // absolute URL หรือ blob: (local file preview) → ใช้ตรงทันที
  if (raw.startsWith("http") || raw.startsWith("blob:")) return raw;
  // relative path จาก server → ต่อกับ baseUrl
  return baseUrl + raw;
}
