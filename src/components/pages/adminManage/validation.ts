import * as yup from "yup";

export const menuSchema = yup.object({
  name: yup.string().trim().required("กรุณากรอกชื่อเมนู"),
  price: yup.number().min(0, "ราคาอย่างน้อย 0").required("กรุณากรอกราคา"),
  categoryId: yup.string().required("กรุณาเลือกหมวดหมู่"),
  image: yup.string().url("ลิงก์รูปไม่ถูกต้อง").nullable().optional(),
  description: yup.string().nullable().optional(),
  isActive: yup.boolean().required(),
});