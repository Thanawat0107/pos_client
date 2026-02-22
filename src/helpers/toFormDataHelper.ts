/* eslint-disable @typescript-eslint/no-explicit-any */
// เช็คว่าเป็นไฟล์ไหม (รองรับทั้ง File / Blob)
function isFile(value: unknown): value is File | Blob {
  return value instanceof File || value instanceof Blob;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    !isFile(value) &&
    !(value instanceof Date)
  );
}

/**
 * แปลง object → FormData แบบรองรับ:
 * - primitive: string / number / boolean
 * - Date: แปลงเป็น ISO string
 * - File / Blob
 * - array: ใช้ key แบบ field[0]. Property, field[1].Property... 
 * - nested object: ใช้ key แบบ parent.child
 *
 * ใช้กับ ASP.NET Core [FromForm] / DTO ที่มี List<> / object ซ้อนได้
 */
export function toFormData<T extends Record<string, any>>(data: T): FormData {
  const formData = new FormData();

  const appendFormData = (value: any, key: string) => {
    if (value === undefined || value === null) return;

    if (isFile(value)) {
      formData.append(key, value);
      return;
    }

    if (value instanceof Date) {
      formData.append(key, value.toISOString());
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        // --- จุดที่แก้ไข: ถ้าเป็นไฟล์ในอาเรย์ ให้ใช้ key เดิมซ้ำๆ ---
        if (isFile(item)) {
          formData.append(key, item); 
        } 
        else if (isPlainObject(item)) {
          Object.entries(item).forEach(([childKey, childValue]) => {
            const capitalizedKey = childKey.charAt(0).toUpperCase() + childKey.slice(1);
            appendFormData(childValue, `${key}[${index}].${capitalizedKey}`);
          });
        } else {
          // สำหรับ primitive array ทั่วไป (เช่น string[]) ยังคงใช้ [index] ได้
          formData.append(`${key}[${index}]`, String(item));
        }
      });
      return;
    }

    if (isPlainObject(value)) {
      Object.entries(value).forEach(([childKey, childValue]) => {
        const capitalizedKey = childKey.charAt(0).toUpperCase() + childKey.slice(1);
        appendFormData(childValue, `${key}.${capitalizedKey}`);
      });
      return;
    }

    formData.append(key, String(value));
  };

  // root level - แนะนำให้เช็กเรื่องตัวเล็กตัวใหญ่
  Object.entries(data).forEach(([key, value]) => {
    // ถ้าใน Swagger เป็นตัวเล็ก (newImages) แต่ตรงนี้เปลี่ยนเป็นตัวใหญ่ (NewImages) 
    // อาจทำให้ [FromForm] หาไม่เจอได้ในบาง Config
    // แนะนำ: ถ้าใช้ PascalCase ใน C# DTO ให้ใช้แบบเดิม แต่ถ้า Swagger เป็น camelCase ให้ระวังจุดนี้
    const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
    appendFormData(value, capitalizedKey);
  });

  return formData;
}