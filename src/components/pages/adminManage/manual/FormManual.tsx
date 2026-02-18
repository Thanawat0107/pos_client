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
import DescriptionIcon from "@mui/icons-material/Description"; // เพิ่มไอคอนสำหรับ PDF
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
  const [isPdf, setIsPdf] = useState(false);

  const formik = useFormik({
    enableReinitialize: true,
    validationSchema: manualSchema,
    initialValues: {
      title: initial?.title ?? "", // [เพิ่ม] หัวข้อ
      location: initial?.location ?? "", // [เพิ่ม] สถานที่
      content: initial?.content ?? "",
      category: initial?.category ?? "",
      targetRole: initial?.targetRole ?? "Customer",
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
      setIsPdf(initial?.fileUrl?.toLowerCase().endsWith(".pdf") || false);
    } else {
      resetForm();
      setFilePreview(null);
      setIsPdf(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [open, initial, resetForm]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFieldValue("file", file);
      if (file.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(file));
        setIsPdf(false);
      } else if (file.type === "application/pdf") {
        setFilePreview(file.name);
        setIsPdf(true);
      }
    }
  };

  const handleRemoveFile = () => {
    setFieldValue("file", undefined);
    setFieldValue("fileUrl", "");
    setFilePreview(null);
    setIsPdf(false);
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
            sx={{ p: 2, bgcolor: "primary.main", color: "white" }}
          >
            <Typography variant="h6" fontWeight={800}>
              {initial ? "แก้ไขคู่มือ" : "เพิ่มคู่มือใหม่"}
            </Typography>
            <IconButton onClick={onClose} disabled={isSubmitting} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Divider />

          {/* Body */}
          <Stack spacing={2.5} sx={{ p: 3, flex: 1, overflowY: "auto" }}>
            {Object.keys(errors).length > 0 && submitCount > 0 && (
              <Alert severity="error">กรุณากรอกข้อมูลให้ครบถ้วน</Alert>
            )}

            {/* 1. File Upload Section */}
            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight={700}>
                รูปภาพหรือไฟล์คู่มือ (Image/PDF)
              </Typography>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*, .pdf"
                hidden
                onChange={handleFileChange}
              />
              {filePreview ? (
                <Box position="relative" sx={{ mt: 1 }}>
                  {isPdf ? (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 4,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        bgcolor: "#f9f9f9",
                        borderStyle: "dashed",
                      }}
                    >
                      <DescriptionIcon sx={{ fontSize: 48, color: "error.main" }} />
                      <Typography variant="caption" sx={{ mt: 1 }}>{values.file?.name || "ไฟล์ PDF"}</Typography>
                    </Paper>
                  ) : (
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
                  )}
                  <IconButton
                    onClick={handleRemoveFile}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      bgcolor: "white",
                      boxShadow: 2,
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
                    flexDirection: "column",
                    gap: 1,
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Typography variant="body2">คลิกเพื่ออัปโหลดรูปภาพหรือ PDF</Typography>
                  <Typography variant="caption" color="text.disabled">รองรับ .jpg, .png, .pdf</Typography>
                </Button>
              )}
            </Box>

            {/* 2. Title Field - [เพิ่มใหม่] */}
            <TextField
              label="หัวข้อคู่มือ (Title)"
              name="title"
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.title && !!errors.title}
              helperText={touched.title && errors.title}
              fullWidth
              placeholder="เช่น จุดบริการน้ำดื่มสะอาด, ขั้นตอนการล้างจาน"
            />

            <Stack direction="row" spacing={2}>
              {/* Category */}
              <TextField
                label="หมวดหมู่ (Category)"
                name="category"
                value={values.category}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.category && !!errors.category}
                helperText={touched.category && errors.category}
                fullWidth
                placeholder="เช่น Service, SOP"
              />

              {/* Target Role */}
              <TextField
                select
                label="กลุ่มเป้าหมาย"
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
            </Stack>

            {/* 3. Location Field - [เพิ่มใหม่] */}
            <TextField
              label="สถานที่ (Location)"
              name="location"
              value={values.location}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.location && !!errors.location}
              helperText={touched.location && errors.location}
              fullWidth
              placeholder="เช่น โซน A ชั้น 1, หลังเคาน์เตอร์"
            />

            {/* Content Area */}
            <TextField
              label="เนื้อหา / รายละเอียด"
              name="content"
              multiline
              rows={5}
              value={values.content}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.content && !!errors.content}
              helperText={touched.content && errors.content}
              fullWidth
            />

            {/* Status Switch */}
            {initial && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderColor: values.isUsed ? "success.main" : "divider",
                  bgcolor: values.isUsed ? "rgba(76, 175, 80, 0.04)" : "transparent",
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {values.isUsed ? "เปิดการใช้งาน (Public)" : "ปิดการใช้งาน (Hidden)"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    กำหนดว่าผู้ใช้ทั่วไปจะเห็นคู่มือนี้หรือไม่
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
              color="inherit"
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
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "บันทึกข้อมูล"}
            </Button>
          </Stack>
        </Box>
      </FormikProvider>
    </Drawer>
  );
}