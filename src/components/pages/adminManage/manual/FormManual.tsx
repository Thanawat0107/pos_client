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
  Paper,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FormikProvider, useFormik } from "formik";
import { useEffect, useRef, useState } from "react";
import type { Manual } from "../../../../@types/dto/Manual";
import type { CreateManual } from "../../../../@types/createDto/CreateManual";
import type { UpdateManual } from "../../../../@types/UpdateDto/UpdateManual";
import { manualSchema } from "../../../../helpers/validationSchema";
import { ROLES } from "../../../../helpers/SD";

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Manual;
  onSubmit: (
    data: CreateManual | UpdateManual,
    id?: number
  ) => Promise<void> | void;
};

export default function FormManual({
  open,
  onClose,
  initial,
  onSubmit,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const formik = useFormik({
    enableReinitialize: true,
    validationSchema: manualSchema,
    initialValues: {
      content: initial?.content ?? "",
      category: initial?.category ?? "",
      targetRole: initial?.targetRole ?? "All",
      fileUrl: initial?.fileUrl ?? "",
      file: undefined as File | undefined,
      isUsed: initial ? initial.isUsed : true,
    },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await onSubmit(values as any, initial?.id);
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

  useEffect(() => {
    if (open) {
      setFilePreview(initial?.fileUrl || null);
    } else {
      resetForm();
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [open, initial, resetForm]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFieldValue("file", file);
      // ถ้าเป็นรูปให้โชว์ Preview ถ้าไม่ใช่ให้โชว์ชื่อไฟล์
      if (file.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null); // กรณีเป็น PDF หรืออื่นๆ อาจจะไม่โชว์รูป
      }
    }
  };

  const handleRemoveFile = () => {
    setFieldValue("file", undefined);
    setFieldValue("fileUrl", "");
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: 1, sm: 500 } } }}
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
              {initial ? "แก้ไขคู่มือ" : "เพิ่มคู่มือใหม่"}
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

            {/* 1. File Upload */}
            <Box textAlign="center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*, .pdf" // รับรูปและ PDF
                hidden
                onChange={handleFileChange}
              />
              {filePreview ? (
                <Box position="relative">
                  <Box
                    component="img"
                    src={filePreview}
                    sx={{
                      width: "100%",
                      height: 200,
                      objectFit: "contain",
                      bgcolor: "#f5f5f5",
                      borderRadius: 2,
                      border: "1px solid #eee",
                    }}
                  />
                  <IconButton
                    onClick={handleRemoveFile}
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
                    height: 100,
                    borderStyle: "dashed",
                    color: "text.secondary",
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {values.file
                    ? `เลือกไฟล์: ${values.file.name}`
                    : "คลิกเพื่ออัปโหลดรูปภาพหรือไฟล์"}
                </Button>
              )}
            </Box>

            {/* 2. Basic Info */}
            <TextField
              label="หมวดหมู่ (Category)"
              name="category"
              value={values.category}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.category && !!errors.category}
              helperText={touched.category && errors.category}
              fullWidth
              placeholder="เช่น การใช้งานระบบ, การแก้ไขปัญหา"
            />

            <TextField
              select
              label="ผู้มีสิทธิ์ใช้งาน (Target Role)"
              name="targetRole"
              value={values.targetRole}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.targetRole && !!errors.targetRole}
              helperText={touched.targetRole && errors.targetRole}
              fullWidth
            >
              {ROLES.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="เนื้อหา / รายละเอียด"
              name="content"
              multiline
              rows={4}
              value={values.content}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.content && !!errors.content}
              helperText={touched.content && errors.content}
              fullWidth
            />

            {/* 3. Status Switch */}
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
                    {values.isUsed ? "สถานะ: ใช้งาน (Active)" : "สถานะ: ปิดการใช้งาน"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {values.isUsed
                      ? "ผู้ใช้ในบทบาทที่ระบุจะเห็นคู่มือนี้"
                      : "ซ่อนคู่มือนี้จากผู้ใช้"}
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