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
  MenuItem,
  Paper,
  CircularProgress,
  Alert,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FormikProvider, useFormik } from "formik";
import { useEffect, useMemo, useRef, useState } from "react";
import * as Yup from "yup";

// Type Imports
import type { Content } from "../../../../@types/dto/Content";
import type { CreateContent } from "../../../../@types/createDto/CreateContent";
import type { UpdateContent } from "../../../../@types/UpdateDto/UpdateContent";

// Helper สำหรับแปลง Date เป็น string เพื่อใส่ใน input type="datetime-local"
const formatDateForInput = (date: Date | string | undefined) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return ""; // เช็ค date invalid
  // ปรับ Timezone offset ให้ตรงกับ Local
  const offset = d.getTimezoneOffset() * 60000;
  const localISOTime = new Date(d.getTime() - offset).toISOString().slice(0, 16);
  return localISOTime;
};

// Validation Schema
const contentSchema = Yup.object().shape({
  title: Yup.string().required("กรุณาระบุหัวข้อ"),
  contentType: Yup.string().required("กรุณาเลือกประเภท"),
  startDate: Yup.date().required("ระบุวันเริ่มต้น"),
  endDate: Yup.date()
    .required("ระบุวันสิ้นสุด")
    .min(Yup.ref("startDate"), "วันสิ้นสุดต้องหลังจากวันเริ่มต้น"),
});

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Content;
  onSubmit: (
    data: CreateContent | UpdateContent,
    id?: number
  ) => Promise<void> | void;
};

const CONTENT_TYPES = [
  { value: "News", label: "ข่าวสาร (News)" },
  { value: "Promotion", label: "โปรโมชั่น (Promotion)" },
  { value: "Event", label: "กิจกรรม (Event)" },
];

const DISCOUNT_TYPES = [
  { value: "Percent", label: "เปอร์เซ็นต์ (%)" },
  { value: "Amount", label: "บาท (Amount)" },
];

export default function FormContent({
  open,
  onClose,
  initial,
  onSubmit,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // ✅ 1. ใช้ useMemo เพื่อสร้าง initialValues เพียงครั้งเดียวเมื่อ initial เปลี่ยน
  // ป้องกันการสร้าง new Date() ใหม่ทุกครั้งที่ render ซึ่งเป็นสาเหตุของ Infinite Loop
  const formInitialValues = useMemo(() => {
    return {
      contentType: initial?.contentType ?? "News",
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      imageUrl: initial?.imageUrl ?? "",
      fileImage: undefined as File | undefined,

      // Promotion Fields
      discountType: initial?.discountType ?? "Percent",
      discountValue: initial?.discountValue ?? 0,
      minOrderAmount: initial?.minOrderAmount ?? 0,
      promoCode: initial?.promoCode ?? "",

      // Date Fields (สร้าง Date ใหม่เฉพาะตอน initial เปลี่ยนเท่านั้น)
      startDate: initial?.startDate ? new Date(initial.startDate) : new Date(),
      endDate: initial?.endDate ? new Date(initial.endDate) : new Date(),

      isUsed: initial ? initial.isUsed : true,
    };
  }, [initial]); // Dependency array: ทำงานใหม่เฉพาะตอน initial เปลี่ยน

  const formik = useFormik({
    enableReinitialize: true,
    validationSchema: contentSchema,
    initialValues: formInitialValues, // ✅ ส่งค่าที่ memo แล้วเข้าไป
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          ...values,
          startDate: new Date(values.startDate),
          endDate: new Date(values.endDate),
        };
        await onSubmit(payload as any, initial?.id);
        onClose();
      } catch (error) {
        console.error("Submit error:", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const {
    values,
    handleChange,
    handleBlur,
    touched,
    errors,
    setFieldValue,
    isSubmitting,
    resetForm,
  } = formik;

  useEffect(() => {
    if (open) {
      setImagePreview(initial?.imageUrl || null);
    } else {
      resetForm();
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [open, initial, resetForm]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFieldValue("fileImage", file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setFieldValue("fileImage", undefined);
    setFieldValue("imageUrl", "");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isPromotion = values.contentType === "Promotion";

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: 1, sm: 600 } } }} // กว้างกว่า Menu นิดหน่อย
    >
      <FormikProvider value={formik}>
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
          {/* Header */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ p: 2 }}
          >
            <Typography variant="h6" fontWeight={800}>
              {initial ? "แก้ไข Content" : "เพิ่ม Content ใหม่"}
            </Typography>
            <IconButton onClick={onClose} disabled={isSubmitting}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Divider />

          {/* Body */}
          <Stack spacing={2.5} sx={{ p: 2, flex: 1, overflowY: "auto" }}>
            {Object.keys(errors).length > 0 && submitCount > 0 && (         
              <Alert severity="error">
                กรุณากรอกข้อมูลให้ครบถ้วน (ตรวจสอบช่องสีแดง)
              </Alert>
            )}

            {/* 1. Image Upload */}
            <Box textAlign="center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
              {imagePreview ? (
                <Box position="relative">
                  <Box
                    component="img"
                    src={imagePreview}
                    sx={{
                      width: "100%",
                      height: 250,
                      objectFit: "cover",
                      borderRadius: 2,
                      border: "1px solid #eee",
                    }}
                  />
                  <IconButton
                    onClick={handleRemoveImage}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      bgcolor: "white",
                      "&:hover": { bgcolor: "#f5f5f5" },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{
                    height: 120,
                    borderStyle: "dashed",
                    color: "text.secondary",
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  คลิกเพื่ออัปโหลดรูปภาพปก (Banner)
                </Button>
              )}
            </Box>

            {/* 2. Basic Info */}
            <Stack direction="row" spacing={2}>
                 <TextField
                    select
                    label="ประเภท (Type)"
                    name="contentType"
                    value={values.contentType}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.contentType && !!errors.contentType}
                    helperText={touched.contentType && errors.contentType}
                    sx={{ width: "40%" }}
                  >
                    {CONTENT_TYPES.map((c) => (
                      <MenuItem key={c.value} value={c.value}>
                        {c.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="หัวข้อ (Title)"
                    name="title"
                    value={values.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.title && !!errors.title}
                    helperText={touched.title && errors.title}
                    fullWidth
                  />
            </Stack>

            <TextField
              label="รายละเอียด (Description)"
              name="description"
              multiline
              rows={3}
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              fullWidth
            />

            {/* 3. Duration */}
             <Stack direction="row" spacing={2}>
                <TextField
                  label="วันเริ่มต้น"
                  type="datetime-local"
                  name="startDate"
                  value={formatDateForInput(values.startDate as any)}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  error={touched.startDate && !!errors.startDate}
                  helperText={touched.startDate && (errors.startDate as string)}
                />
                 <TextField
                  label="วันสิ้นสุด"
                  type="datetime-local"
                  name="endDate"
                  value={formatDateForInput(values.endDate as any)}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  error={touched.endDate && !!errors.endDate}
                  helperText={touched.endDate && (errors.endDate as string)}
                />
             </Stack>

            {/* 4. Promotion Fields (Show only if type is Promotion) */}
            {isPromotion && (
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                    <Typography variant="subtitle2" fontWeight="bold" mb={2} color="primary">
                        ข้อมูลโปรโมชั่น (Promotion Details)
                    </Typography>
                    <Stack spacing={2}>
                         <TextField
                            label="รหัสโปรโมชั่น (Promo Code)"
                            name="promoCode"
                            value={values.promoCode}
                            onChange={handleChange}
                            fullWidth
                            placeholder="เช่น SALE2025"
                         />
                         <Stack direction="row" spacing={2}>
                             <TextField
                                select
                                label="รูปแบบส่วนลด"
                                name="discountType"
                                value={values.discountType}
                                onChange={handleChange}
                                fullWidth
                              >
                                {DISCOUNT_TYPES.map((t) => (
                                  <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                                ))}
                              </TextField>
                              <TextField
                                label="มูลค่าส่วนลด"
                                name="discountValue"
                                type="number"
                                value={values.discountValue}
                                onChange={handleChange}
                                fullWidth
                                InputProps={{ inputProps: { min: 0 } }}
                              />
                         </Stack>
                         <TextField
                            label="ยอดสั่งซื้อขั้นต่ำ"
                            name="minOrderAmount"
                            type="number"
                            value={values.minOrderAmount}
                            onChange={handleChange}
                            fullWidth
                            InputProps={{
                                startAdornment: <InputAdornment position="start">฿</InputAdornment>,
                                inputProps: { min: 0 } 
                            }}
                         />
                    </Stack>
                </Paper>
            )}

            {/* 5. Status Switch */}
            {initial && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderColor: values.isUsed ? "success.main" : "divider",
                  bgcolor: values.isUsed ? "success.lighter" : "transparent",
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {values.isUsed ? "สถานะ: เผยแพร่ (Active)" : "สถานะ: ซ่อน (Inactive)"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {values.isUsed
                      ? "ลูกค้าจะเห็นรายการนี้ตามระยะเวลาที่กำหนด"
                      : "รายการนี้จะไม่แสดงผล"}
                  </Typography>
                </Box>
                <Switch
                  checked={values.isUsed}
                  onChange={(e) => setFieldValue("isUsed", e.target.checked)}
                  color="success"
                />
              </Paper>
            )}
          </Stack>

          {/* Footer */}
          <Divider />
          <Stack
            direction="row"
            spacing={2}
            sx={{ p: 2, bgcolor: "background.paper" }}
          >
            <Button
              onClick={onClose}
              fullWidth
              variant="outlined"
              disabled={isSubmitting}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "บันทึกข้อมูล"
              )}
            </Button>
          </Stack>
        </Box>
      </FormikProvider>
    </Drawer>
  );
}