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
  FormHelperText,
  FormControlLabel, // ✅ Import เพิ่ม
  Checkbox,
  Grid,         // ✅ Import เพิ่ม
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FormikProvider, useFormik } from "formik";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Content } from "../../../../@types/dto/Content";
import type { CreateContent } from "../../../../@types/createDto/CreateContent";
import type { UpdateContent } from "../../../../@types/UpdateDto/UpdateContent";
import { contentSchema } from "../../../../helpers/validationSchema";
import { CONTENT_TYPE_OPTIONS, ContentType } from "../../../../@types/Enum";

const DISCOUNT_TYPES = [
  { value: "Percent", label: "เปอร์เซ็นต์ (%)" },
  { value: "Amount", label: "บาท (Amount)" },
];

const MAX_FILE_SIZE_MB = 5;

// --- Helper Functions ---
const formatDateForInput = (date: Date | string | undefined) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const offset = d.getTimezoneOffset() * 60000;
  // ตัดวินาทีออกให้เหลือแค่ yyyy-MM-ddThh:mm เพื่อใส่ใน datetime-local
  const localISOTime = new Date(d.getTime() - offset)
    .toISOString()
    .slice(0, 16);
  return localISOTime;
};

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Content;
  onSubmit: (
    data: CreateContent | UpdateContent,
    id?: number
  ) => Promise<void> | void;
};

export default function FormContent({
  open,
  onClose,
  initial,
  onSubmit,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 1. Initial Values
  const formInitialValues = useMemo(() => {
    // ✅ Logic: ถ้ามี initial และ EndDate เป็น null แสดงว่าเป็นถาวร
    const isPermanentInit = initial ? initial.endDate === null : false;

    return {
      contentType: initial?.contentType ?? ContentType.NEWS,
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      imageUrl: initial?.imageUrl ?? "",
      fileImage: undefined as File | undefined,

      // Promotion Fields
      discountType: initial?.discountType ?? "Percent",
      discountValue: initial?.discountValue ?? 0,
      minOrderAmount: initial?.minOrderAmount ?? 0,
      promoCode: initial?.promoCode ?? "",

      // Date Fields
      startDate: initial?.startDate ? new Date(initial.startDate) : new Date(),
      // ✅ ถ้าเป็นถาวร (endDate=null) ให้ใส่ค่า Default ไว้กัน error แต่อย่าเพิ่งใช้น
      endDate: initial?.endDate ? new Date(initial.endDate) : new Date(), 
      
      // ✅ เพิ่ม isPermanent
      isPermanent: isPermanentInit,
      
      isUsed: initial ? initial.isUsed : true,
    };
  }, [initial]);

  const formik = useFormik({
    enableReinitialize: true,
    validationSchema: contentSchema, 
    initialValues: formInitialValues,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // จัดเตรียม Payload
        const payload: any = {
          ...values,
          startDate: new Date(values.startDate).toISOString(),
          // ✅ Logic: ถ้าถาวร ไม่ต้องส่ง endDate (หรือส่ง null ตาม interface)
          endDate: values.isPermanent ? undefined : new Date(values.endDate).toISOString(),
          isPermanent: values.isPermanent, 
        };

        // ถ้าไม่ใช่ Promotion ให้ล้างค่าทิ้งเพื่อความสะอาด
        if (values.contentType !== ContentType.PROMOTION) {
          payload.discountValue = 0;
          payload.minOrderAmount = 0;
          payload.promoCode = "";
        }

        await onSubmit(payload, initial?.id);
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
    submitCount,
  } = formik;

  // 2. Lifecycle & Effects
  useEffect(() => {
    if (open) {
      setImagePreview(initial?.imageUrl || null);
    } else {
      resetForm();
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [open, initial, resetForm]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    if (values.contentType !== ContentType.PROMOTION) {
      setFieldValue("discountValue", 0);
      setFieldValue("minOrderAmount", 0);
      setFieldValue("promoCode", "");
      setFieldValue("discountType", "Percent");
    }
  }, [values.contentType, setFieldValue]);

  // 3. Handlers
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setFieldValue("fileImage", undefined);
        formik.setFieldError(
          "fileImage",
          `ขนาดไฟล์ต้องไม่เกิน ${MAX_FILE_SIZE_MB}MB`
        );
        e.target.value = "";
        return;
      }
      formik.setFieldError("fileImage", undefined);
      setFieldValue("fileImage", file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setFieldValue("fileImage", undefined);
    setFieldValue("imageUrl", "");
    setImagePreview(null);
    formik.setFieldError("fileImage", undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isPromotion = values.contentType === ContentType.PROMOTION;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: 1, sm: 600 } } }}
    >
      <FormikProvider value={formik}>
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{ height: "100%", display: "flex", flexDirection: "column" }}
        >
          {/* --- Header --- */}
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

          {/* --- Body --- */}
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
                    borderColor: errors.fileImage ? "error.main" : "inherit",
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  คลิกเพื่ออัปโหลดรูปภาพปก (Banner)
                </Button>
              )}
              {errors.fileImage && (
                <FormHelperText error sx={{ textAlign: "center", mt: 1 }}>
                  {errors.fileImage as string}
                </FormHelperText>
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
                disabled={!!initial}
              >
                {CONTENT_TYPE_OPTIONS.map((c) => (
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
            {/* ✅ Wrap ด้วย Paper เพื่อแบ่งกลุ่มให้ชัดเจนขึ้น */}
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  ระยะเวลาแสดงผล (Duration)
                </Typography>

                {/* ย้าย Checkbox มาไว้ตรงหัวข้อ เพื่อความสวยงามและประหยัดพื้นที่ */}
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={values.isPermanent}
                      onChange={(e) => {
                        setFieldValue("isPermanent", e.target.checked);
                        if (!e.target.checked && !values.endDate) {
                          setFieldValue("endDate", new Date());
                        }
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" color="text.secondary">
                      ไม่มีวันหมดอายุ (ถาวร)
                    </Typography>
                  }
                />
              </Stack>

              <Grid container spacing={2}>
                {/* วันเริ่มต้น */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  {" "}
                  {/* ✅ แก้ไขตรงนี้ */}
                  <TextField
                    label="วันเริ่มต้น"
                    type="datetime-local"
                    name="startDate"
                    value={formatDateForInput(values.startDate as any)}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFieldValue(
                        "startDate",
                        val ? new Date(val) : new Date()
                      );
                    }}
                    onBlur={handleBlur}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    error={touched.startDate && !!errors.startDate}
                    helperText={
                      touched.startDate && (errors.startDate as string)
                    }
                  />
                </Grid>

                {/* วันสิ้นสุด */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  {" "}
                  {/* ✅ แก้ไขตรงนี้ */}
                  <TextField
                    label="วันสิ้นสุด"
                    type="datetime-local"
                    name="endDate"
                    value={
                      values.isPermanent
                        ? ""
                        : formatDateForInput(values.endDate as any)
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      setFieldValue(
                        "endDate",
                        val ? new Date(val) : new Date()
                      );
                    }}
                    onBlur={handleBlur}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    disabled={values.isPermanent}
                    sx={{
                      "& .MuiInputBase-root.Mui-disabled": {
                        bgcolor: "action.hover",
                      },
                    }}
                    error={
                      !values.isPermanent && touched.endDate && !!errors.endDate
                    }
                    helperText={
                      values.isPermanent
                        ? "ตั้งค่าเป็นถาวรแล้ว"
                        : !values.isPermanent &&
                          touched.endDate &&
                          (errors.endDate as string)
                    }
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* 4. Promotion Fields (Conditional) */}
            {isPromotion && (
              <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  mb={2}
                  color="primary"
                >
                  ข้อมูลโปรโมชั่น (Promotion Details)
                </Typography>
                <Stack spacing={2}>
                  {initial ? (
                    <TextField
                      label="รหัสโปรโมชั่น (Promo Code)"
                      value={values.promoCode || "-"}
                      disabled
                      fullWidth
                      helperText="รหัสถูกสร้างโดยระบบ (ไม่สามารถแก้ไขได้)"
                      variant="filled"
                    />
                  ) : (
                    <Alert severity="info">
                      ระบบจะสร้างรหัสโปรโมชั่น (Promo Code)
                      ให้อัตโนมัติหลังจากบันทึก
                    </Alert>
                  )}

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
                        <MenuItem key={t.value} value={t.value}>
                          {t.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      label="มูลค่าส่วนลด"
                      name="discountValue"
                      type="number"
                      value={values.discountValue}
                      onChange={handleChange}
                      fullWidth
                      inputProps={{ min: 0 }}
                      error={touched.discountValue && !!errors.discountValue}
                      helperText={touched.discountValue && errors.discountValue}
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
                      startAdornment: (
                        <InputAdornment position="start">฿</InputAdornment>
                      ),
                    }}
                    inputProps={{ min: 0 }}
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
                    {values.isUsed
                      ? "สถานะ: เผยแพร่ (Active)"
                      : "สถานะ: ซ่อน (Inactive)"}
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

          {/* --- Footer --- */}
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