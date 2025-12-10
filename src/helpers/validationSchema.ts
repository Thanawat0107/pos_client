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