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

export const menuSchema = Yup.object().shape({
  name: Yup.string().required("กรุณากรอกชื่อเมนู"),
  basePrice: Yup.number().min(0, "ราคาต้องไม่ติดลบ").required("กรุณาระบุราคา"),
  menuCategoryId: Yup.number()
    .min(1, "กรุณาเลือกหมวดหมู่")
    .required("กรุณาเลือกหมวดหมู่"),
});

export const detailSchema = Yup.object({
  id: Yup.number().optional(),
  name: Yup.string().trim().required("กรุณากรอกชื่อตัวเลือก"),
  price: Yup.number()
    .min(0, "ราคาต้องไม่ติดลบ")
    .required("กรุณากรอกราคา"),
  isUsed: Yup.boolean().optional(),
});

export const optionSchema = Yup.object().shape({
  name: Yup.string().required("กรุณากรอกชื่อกลุ่ม"),
  menuItemOptionDetail: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required("กรุณากรอกชื่อตัวเลือก"),
      extraPrice: Yup.number().min(0, "ราคาต้องไม่ติดลบ").required("ระบุราคา"),
    })
  ),
});

export const categorySchema = Yup.object({
  name: Yup.string().trim().required("กรุณากรอกชื่อหมวดหมู่"),
  slug: Yup.string().trim().required("กรุณากรอก slug"),
  isUsed: Yup.boolean().required(),
});

// Validation Schema สำหรับหน้านี้โดยเฉพาะ (เพราะเปลี่ยน logic ของ ingredients)
export const localRecipeSchema = Yup.object().shape({
  menuItemId: Yup.number().min(1, "กรุณาเลือกเมนูอาหาร").required("กรุณาเลือกเมนูอาหาร"),
  instructions: Yup.string().required("กรุณาระบุขั้นตอนการทำ"),
  // ingredientsList ต้องเป็น Array และข้างในต้องมีข้อมูล
  ingredientsList: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required("ระบุชื่อ"),
      quantity: Yup.string().required("ระบุปริมาณ"),
    })
  ),
});;

export const manualSchema = Yup.object().shape({
  content: Yup.string().required("กรุณาระบุรายละเอียด"),
  category: Yup.string().required("กรุณาระบุหมวดหมู่"),
  targetRole: Yup.string().required("กรุณาระบุผู้มีสิทธิ์ใช้งาน"),
});

// Validation Schema
export const contentSchema = Yup.object().shape({
  title: Yup.string().required("กรุณาระบุหัวข้อ"),
  contentType: Yup.string().required("กรุณาเลือกประเภท"),
  startDate: Yup.date().required("ระบุวันเริ่มต้น"),
  endDate: Yup.date()
    .required("ระบุวันสิ้นสุด")
    .min(Yup.ref("startDate"), "วันสิ้นสุดต้องหลังจากวันเริ่มต้น"),
});