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
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
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
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  const formik = useFormik({
    enableReinitialize: true,
    validationSchema: manualSchema,
    initialValues: {
      title: initial?.title ?? "",
      location: initial?.location ?? "",
      content: initial?.content ?? "",
      category: initial?.category ?? "",
      targetRole: initial?.targetRole ?? "Customer",
      // รูปภาพเดิมที่ต้องการคงไว้ (กรณี update)
      keepImages: initial?.images ?? [] as string[],
      // รูปภาพใหม่ที่จะอัปโหลด
      newImages: [] as File[],
      isUsed: initial ? initial.isUsed : true,
    },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const { isUsed, keepImages, newImages, ...rest } = values;
        const payload: CreateManual | UpdateManual = initial
          ? {
              ...rest,
              isUsed,
              keepImages,
              newImages: newImages.length > 0 ? newImages : null,
            }
          : {
              ...rest,
              newImages: newImages.length > 0 ? newImages : null,
            };
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

  useEffect(() => {
    if (open) {
      // ไม่ต้องทำอะไรพิเศษ เพราะ enableReinitialize จะ reset ให้อัตโนมัติ
      setNewImagePreviews([]);
    } else {
      resetForm();
      setNewImagePreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [open, initial, resetForm]);

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const previews = files.map((f) => URL.createObjectURL(f));
    setFieldValue("newImages", [...values.newImages, ...files]);
    setNewImagePreviews((prev) => [...prev, ...previews]);
    // reset input เพื่อให้เลือกไฟล์เดิมซ้ำได้
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ลบรูปใหม่ออกจาก newImages
  const handleRemoveNewImage = (index: number) => {
    const updatedFiles = values.newImages.filter((_, i) => i !== index);
    const updatedPreviews = newImagePreviews.filter((_, i) => i !== index);
    setFieldValue("newImages", updatedFiles);
    setNewImagePreviews(updatedPreviews);
  };

  // ลบรูปเดิมออกจาก keepImages
  const handleRemoveKeepImage = (index: number) => {
    const updated = values.keepImages.filter((_, i) => i !== index);
    setFieldValue("keepImages", updated);
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

            {/* 1. Image Upload Section */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2" fontWeight={700}>
                  รูปภาพคู่มือ
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddPhotoAlternateIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ fontSize: "0.85rem" }}
                >
                  เพิ่มรูปภาพ
                </Button>
              </Stack>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleImagesChange}
              />

              {/* รูปภาพเดิม (keepImages) */}
              {values.keepImages.length > 0 && (
                <Box mb={1.5}>
                  <Typography variant="caption" color="text.secondary" mb={0.5} display="block">
                    รูปภาพปัจจุบัน
                  </Typography>
                  <ImageList cols={3} gap={8} sx={{ m: 0 }}>
                    {values.keepImages.map((url, i) => (
                      <ImageListItem key={i} sx={{ borderRadius: 1.5, overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
                        <img src={url} alt={`existing-${i}`} style={{ height: 90, objectFit: "cover", width: "100%" }} />
                        <ImageListItemBar
                          sx={{ background: "rgba(0,0,0,0.35)", height: 28 }}
                          actionIcon={
                            <IconButton size="small" sx={{ color: "white", p: 0.25 }} onClick={() => handleRemoveKeepImage(i)}>
                              <CloseIcon sx={{ fontSize: "1rem" }} />
                            </IconButton>
                          }
                          actionPosition="right"
                          position="bottom"
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              )}

              {/* รูปภาพใหม่ (newImages preview) */}
              {newImagePreviews.length > 0 && (
                <Box mb={1.5}>
                  <Typography variant="caption" color="text.secondary" mb={0.5} display="block">
                    รูปภาพที่จะอัปโหลด
                  </Typography>
                  <ImageList cols={3} gap={8} sx={{ m: 0 }}>
                    {newImagePreviews.map((preview, i) => (
                      <ImageListItem key={i} sx={{ borderRadius: 1.5, overflow: "hidden", border: "1.5px dashed", borderColor: "primary.main" }}>
                        <img src={preview} alt={`new-${i}`} style={{ height: 90, objectFit: "cover", width: "100%" }} />
                        <ImageListItemBar
                          sx={{ background: "rgba(0,0,0,0.35)", height: 28 }}
                          actionIcon={
                            <IconButton size="small" sx={{ color: "white", p: 0.25 }} onClick={() => handleRemoveNewImage(i)}>
                              <CloseIcon sx={{ fontSize: "1rem" }} />
                            </IconButton>
                          }
                          actionPosition="right"
                          position="bottom"
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                </Box>
              )}

              {values.keepImages.length === 0 && newImagePreviews.length === 0 && (
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{
                    height: 100,
                    borderStyle: "dashed",
                    color: "text.secondary",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <AddPhotoAlternateIcon sx={{ fontSize: "2rem" }} />
                  <Typography variant="body2">คลิกเพื่ออัปโหลดรูปภาพ</Typography>
                  <Typography variant="caption" color="text.disabled">รองรับ .jpg, .png, .webp (เลือกได้หลายรูป)</Typography>
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