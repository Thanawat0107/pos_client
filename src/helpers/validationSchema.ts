import * as Yup from "yup";

export const loginValidate = Yup.object({
  userName: Yup.string().required("Required"),
  password: Yup.string().min(2, "Min 6 characters").required("Required"),
});

export const registerValidate = Yup.object({
  userName: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email format").required("Required"),
  password: Yup.string().min(2, "Min 2 characters").required("Required"),
  // phoneNumber: Yup.string().matches(/^[0-9]{10}$/, "Invalid phone number").required("Required"),
});

// Validation Schema
export const menuSchema = Yup.object().shape({
  name: Yup.string()
    .required("กรุณากรอกชื่อเมนู")
    .min(2, "ชื่อเมนูต้องมีอย่างน้อย 2 ตัวอักษร")
    .max(100, "ชื่อเมนูต้องไม่เกิน 100 ตัวอักษร"),
  description: Yup.string()
    .max(500, "รายละเอียดต้องไม่เกิน 500 ตัวอักษร"),
  basePrice: Yup.number()
    .required("กรุณากรอกราคา")
    .min(0, "ราคาต้องมากกว่าหรือเท่ากับ 0"),
  menuCategoryId: Yup.number()
    .required("กรุณาเลือกหมวดหมู่")
    .min(1, "กรุณาเลือกหมวดหมู่"),
});