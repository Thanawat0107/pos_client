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

    // File / Blob
    if (isFile(value)) {
      formData.append(key, value);
      return;
    }

    // Date
    if (value instanceof Date) {
      formData. append(key, value.toISOString());
      return;
    }

    // Array
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        // ถ้า item เป็น object → ต้องใช้รูปแบบ field[index]. PropertyName
        if (isPlainObject(item)) {
          Object.entries(item).forEach(([childKey, childValue]) => {
            // Capitalize first letter สำหรับ ASP.NET (PascalCase)
            const capitalizedKey = childKey.charAt(0).toUpperCase() + childKey.slice(1);
            appendFormData(childValue, `${key}[${index}].${capitalizedKey}`);
          });
        } else {
          // ถ้าเป็น primitive array
          appendFormData(item, `${key}[${index}]`);
        }
      });
      return;
    }

    // Object ซ้อน → parent.Child (PascalCase)
    if (isPlainObject(value)) {
      Object.entries(value). forEach(([childKey, childValue]) => {
        const capitalizedKey = childKey.charAt(0).toUpperCase() + childKey.slice(1);
        appendFormData(childValue, `${key}.${capitalizedKey}`);
      });
      return;
    }

    // primitive (string / number / boolean หรืออย่างอื่นที่ cast ได้)
    formData.append(key, String(value));
  };

  // root level - Capitalize keys
  Object.entries(data). forEach(([key, value]) => {
    const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
    appendFormData(value, capitalizedKey);
  });

  return formData;
}