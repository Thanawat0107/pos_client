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