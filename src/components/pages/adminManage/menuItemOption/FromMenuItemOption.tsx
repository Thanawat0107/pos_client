/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Drawer,
  Box,
  Stack,
  Typography,
  IconButton,
  TextField,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  Paper,
  Chip,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import StarIcon from "@mui/icons-material/Star";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import { useFormik, FieldArray, FormikProvider } from "formik";

import type { MenuItemOption } from "../../../../@types/dto/MenuItemOption";
import type { UpdateMenuItemOption } from "../../../../@types/UpdateDto/UpdateMenuItemOption";
import { optionSchema } from "../../../../helpers/validationSchema";

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: MenuItemOption;
  onSubmit: (data: any) => Promise<void> | void;
  isLoading?: boolean;
};

export default function FormMenuItemOption({
  open,
  onClose,
  initial,
  onSubmit,
  isLoading = false,
}: Props) {
  const formik = useFormik({
    enableReinitialize: true,
    validationSchema: optionSchema,
    initialValues: {
      id: initial?.id ?? 0,
      name: initial?.name ?? "",
      isRequired: initial?.isRequired ?? false,
      isMultiple: initial?.isMultiple ?? false,
      isUsed: initial?.isUsed ?? true,
      menuOptionDetails: initial?.menuOptionDetails?.map((d) => ({
        id: d.id,
        name: d.name,
        extraPrice: d.extraPrice,
        isDefault: d.isDefault ?? false,
        isUsed: d.isUsed ?? true,
      })) ?? [{ id: 0, name: "", extraPrice: 0, isDefault: false, isUsed: true }],
    },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const isUpdate = values.id !== 0;
        if (isUpdate) {
          const payload: UpdateMenuItemOption = {
            id: values.id,
            name: values.name,
            isRequired: values.isRequired,
            isMultiple: values.isMultiple,
            isUsed: values.isUsed,
            menuOptionDetails: values.menuOptionDetails.map((d) => ({
              id: d.id !== 0 ? d.id : undefined,
              name: d.name,
              extraPrice: Number(d.extraPrice),
              isDefault: d.isDefault,
              isUsed: d.isUsed,
              isDeleted: false,
            })),
          };
          await onSubmit(payload);
        } else {
          const payload = {
            name: values.name,
            isRequired: values.isRequired,
            isMultiple: values.isMultiple,
            menuOptionDetails: values.menuOptionDetails.map((d) => ({
              name: d.name,
              extraPrice: Number(d.extraPrice),
              isDefault: d.isDefault,
              isUsed: d.isUsed,
            })),
          };
          await onSubmit(payload);
        }
        onClose();
      } catch (error) {
        console.error("Submit Error:", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue } = formik;

  const handleSetDefault = (index: number) => {
    const currentDetails = [...values.menuOptionDetails];
    if (!values.isMultiple) {
      currentDetails.forEach((item, i) => { item.isDefault = i === index; });
    } else {
      currentDetails[index].isDefault = !currentDetails[index].isDefault;
    }
    setFieldValue("menuOptionDetails", currentDetails);
  };

  const isEdit = values.id !== 0;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 560 }, maxWidth: 640 } }}
    >
      <FormikProvider value={formik}>
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>

          {/* ─── Header ─── */}
          <Stack direction="row" alignItems="center" justifyContent="space-between"
            sx={{ px: 3, py: 2.5, pt: "calc(env(safe-area-inset-top) + 16px)" }}
          >
            <Box>
              <Typography sx={{ fontSize: "1.4rem", fontWeight: 800, lineHeight: 1.2 }}>
                {isEdit ? "แก้ไขกลุ่มตัวเลือก" : "เพิ่มกลุ่มตัวเลือก"}
              </Typography>
              <Typography sx={{ fontSize: "0.9rem", color: "text.secondary", mt: 0.5 }}>
                {isEdit ? "แก้ไขข้อมูลและตัวเลือกย่อย" : "สร้างกลุ่มตัวเลือกใหม่"}
              </Typography>
            </Box>
            <IconButton onClick={onClose} disabled={isSubmitting} sx={{ bgcolor: "action.hover", borderRadius: 2 }}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Divider />

          {/* ─── Body ─── */}
          <Box sx={{ flex: 1, overflow: "auto", px: 3, py: 3 }}>
            <Stack spacing={4}>

              {/* ส่วนที่ 1: ข้อมูลกลุ่ม */}
              <Stack spacing={2.5}>
                <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "text.secondary" }}>
                  ข้อมูลกลุ่มตัวเลือก
                </Typography>

                <TextField
                  label="ชื่อกลุ่มตัวเลือก"
                  placeholder="เช่น ขนาด, ความหวาน, ท็อปปิ้ง"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.name && !!errors.name}
                  helperText={touched.name && errors.name}
                  fullWidth
                  sx={{
                    "& .MuiInputBase-input": { fontSize: "1rem" },
                    "& .MuiInputLabel-root": { fontSize: "1rem" },
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  }}
                />

                {/* Toggle Cards */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  {/* บังคับเลือก */}
                  <Paper
                    variant="outlined"
                    onClick={() => setFieldValue("isRequired", !values.isRequired)}
                    sx={{
                      flex: 1, p: 2, borderRadius: 2, cursor: "pointer",
                      borderColor: values.isRequired ? "error.main" : "divider",
                      bgcolor: values.isRequired ? "error.lighter" : "background.paper",
                      transition: "all 0.15s",
                      "&:hover": { borderColor: "error.main" },
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>บังคับเลือก</Typography>
                        <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", mt: 0.25 }}>
                          ลูกค้าต้องเลือก
                        </Typography>
                      </Box>
                      <Switch checked={values.isRequired} color="error" size="small" onChange={() => {}} />
                    </Stack>
                  </Paper>

                  {/* เลือกได้หลายอย่าง */}
                  <Paper
                    variant="outlined"
                    onClick={() => {
                      const next = !values.isMultiple;
                      setFieldValue("isMultiple", next);
                      if (!next) {
                        const reset = values.menuOptionDetails.map((d, i) => ({ ...d, isDefault: i === 0 }));
                        setFieldValue("menuOptionDetails", reset);
                      }
                    }}
                    sx={{
                      flex: 1, p: 2, borderRadius: 2, cursor: "pointer",
                      borderColor: values.isMultiple ? "info.main" : "divider",
                      bgcolor: values.isMultiple ? "info.lighter" : "background.paper",
                      transition: "all 0.15s",
                      "&:hover": { borderColor: "info.main" },
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>หลายรายการ</Typography>
                        <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", mt: 0.25 }}>
                          เลือกได้มากกว่า 1
                        </Typography>
                      </Box>
                      <Switch checked={values.isMultiple} color="info" size="small" onChange={() => {}} />
                    </Stack>
                  </Paper>
                </Stack>

                {/* เปิด/ปิดใช้งาน (เฉพาะ Edit) */}
                {isEdit && (
                  <Paper
                    variant="outlined"
                    onClick={() => setFieldValue("isUsed", !values.isUsed)}
                    sx={{
                      p: 2, borderRadius: 2, cursor: "pointer",
                      borderColor: values.isUsed ? "success.main" : "divider",
                      bgcolor: values.isUsed ? "success.lighter" : "background.paper",
                      transition: "all 0.15s",
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>เปิดใช้งานกลุ่มนี้</Typography>
                        <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", mt: 0.25 }}>
                          {values.isUsed ? "กำลังแสดงให้ลูกค้าเลือก" : "ซ่อนจากลูกค้า"}
                        </Typography>
                      </Box>
                      <Switch checked={values.isUsed} color="success" size="small" onChange={() => {}} />
                    </Stack>
                  </Paper>
                )}
              </Stack>

              <Divider />

              {/* ส่วนที่ 2: รายการตัวเลือกย่อย */}
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>รายการตัวเลือกย่อย</Typography>
                    <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                      {values.menuOptionDetails.length} รายการ
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setFieldValue("menuOptionDetails", [
                      ...values.menuOptionDetails,
                      { id: 0, name: "", extraPrice: 0, isDefault: false, isUsed: true },
                    ])}
                    sx={{ borderRadius: 2, fontSize: "0.9rem", fontWeight: 600 }}
                  >
                    เพิ่มรายการ
                  </Button>
                </Stack>

                <FieldArray name="menuOptionDetails">
                  {({ remove }) => (
                    <Stack spacing={2}>
                      {values.menuOptionDetails.map((detail, index) => (
                        <Paper
                          key={index}
                          variant="outlined"
                          sx={{
                            p: 2.5, borderRadius: 2.5,
                            borderColor: detail.isDefault ? "primary.main" : "divider",
                            bgcolor: detail.isDefault ? "primary.lighter" : "background.paper",
                            transition: "all 0.15s",
                          }}
                        >
                          <Stack spacing={2}>
                            {/* Row: หัว card */}
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Chip
                                  label={index + 1}
                                  size="small"
                                  sx={{ fontWeight: 800, fontSize: "0.85rem", height: 26, minWidth: 28 }}
                                />
                                {detail.isDefault && (
                                  <Chip label="ค่าเริ่มต้น" size="small" color="primary"
                                    sx={{ fontWeight: 700, fontSize: "0.8rem", height: 26 }}
                                  />
                                )}
                              </Stack>
                              <Stack direction="row" spacing={0.5}>
                                <Tooltip title={detail.isDefault ? "ถอดค่าเริ่มต้น" : "ตั้งเป็นค่าเริ่มต้น"}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleSetDefault(index)}
                                    sx={{ color: detail.isDefault ? "warning.main" : "text.disabled" }}
                                  >
                                    {detail.isDefault ? <StarIcon fontSize="small" /> : <StarOutlineIcon fontSize="small" />}
                                  </IconButton>
                                </Tooltip>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => remove(index)}
                                  disabled={values.menuOptionDetails.length === 1}
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            </Stack>

                            {/* ชื่อตัวเลือก */}
                            <TextField
                              label="ชื่อตัวเลือก"
                              placeholder="เช่น เล็ก, กลาง, ใหญ่"
                              name={`menuOptionDetails.${index}.name`}
                              value={detail.name}
                              onChange={handleChange}
                              fullWidth
                              error={
                                touched.menuOptionDetails?.[index]?.name &&
                                !!(errors.menuOptionDetails as any)?.[index]?.name
                              }
                              sx={{
                                "& .MuiInputBase-input": { fontSize: "1rem" },
                                "& .MuiInputLabel-root": { fontSize: "0.95rem" },
                                "& .MuiOutlinedInput-root": { borderRadius: 2 },
                              }}
                            />

                            {/* ราคาเพิ่ม + เปิด/ปิด */}
                            <Stack direction="row" spacing={2} alignItems="center">
                              <TextField
                                label="ราคาเพิ่ม"
                                name={`menuOptionDetails.${index}.extraPrice`}
                                type="number"
                                value={detail.extraPrice}
                                onChange={handleChange}
                                slotProps={{
                                  input: {
                                    endAdornment: <InputAdornment position="end">฿</InputAdornment>,
                                  },
                                }}
                                fullWidth
                                sx={{
                                  "& .MuiInputBase-input": { fontSize: "1rem" },
                                  "& .MuiInputLabel-root": { fontSize: "0.95rem" },
                                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                                }}
                              />
                              <FormControlLabel
                                control={
                                  <Switch
                                    name={`menuOptionDetails.${index}.isUsed`}
                                    checked={detail.isUsed}
                                    onChange={handleChange}
                                    color="success"
                                  />
                                }
                                label={
                                  <Typography sx={{ fontSize: "0.95rem", fontWeight: 600 }}>
                                    ใช้งาน
                                  </Typography>
                                }
                              />
                            </Stack>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </FieldArray>
              </Stack>

            </Stack>
          </Box>

          {/* ─── Footer ─── */}
          <Divider />
          <Stack direction="row" spacing={2} sx={{ px: 3, py: 2.5, bgcolor: "background.paper" }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={onClose}
              disabled={isSubmitting}
              sx={{ borderRadius: 2, fontSize: "1rem", fontWeight: 600, py: 1.3 }}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting || isLoading}
              sx={{
                borderRadius: 2, fontSize: "1rem", fontWeight: 700, py: 1.3,
                bgcolor: "#E63946", "&:hover": { bgcolor: "#D32F2F" },
              }}
            >
              {isSubmitting || isLoading ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </Stack>

        </Box>
      </FormikProvider>
    </Drawer>
  );
}
// สมมติชื่อ Create สำหรับ Option (ถ้ามีไฟล์แยก) หรือใช้ Type Inline
