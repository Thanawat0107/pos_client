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
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Autocomplete,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
// Icons สำหรับ SD_ServiceType
import LocalDrinkIcon from "@mui/icons-material/LocalDrink"; // Water
import RestaurantIcon from "@mui/icons-material/Restaurant"; // Utensils
import WcIcon from "@mui/icons-material/Wc"; // Restroom
import CategoryIcon from "@mui/icons-material/Category"; // Default

import { FormikProvider, useFormik } from "formik";
import { useEffect, useRef, useState } from "react";
import type { Manual } from "../../../../@types/dto/Manual";
import type { CreateManual } from "../../../../@types/createDto/CreateManual";
import type { UpdateManual } from "../../../../@types/UpdateDto/UpdateManual";
import { manualSchema } from "../../../../helpers/validationSchema";
import { ROLES, SD_ServiceType } from "../../../../helpers/SD";
import { useGetManualCategoriesQuery } from "../../../../services/manualApi";

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Manual;
  onSubmit: (
    data: CreateManual | UpdateManual,
    id?: number,
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

  // --- 1. ฟังก์ชันดึง Icon ตาม Service Type ---
  const getServiceIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case SD_ServiceType.Water:
        return <LocalDrinkIcon sx={{ color: "#2196f3", mr: 1 }} />;
      case SD_ServiceType.Utensils:
        return <RestaurantIcon sx={{ color: "#ff9800", mr: 1 }} />;
      case SD_ServiceType.Restroom:
        return <WcIcon sx={{ color: "#9c27b0", mr: 1 }} />;
      default:
        return <CategoryIcon sx={{ color: "#757575", mr: 1 }} />;
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    validationSchema: manualSchema,
    initialValues: {
      title: initial?.title ?? "",
      location: initial?.location ?? "",
      content: initial?.content ?? "",
      category: initial?.category ?? "",
      targetRole: initial?.targetRole ?? ROLES[3].value, // Default: Customer
      keepImages: initial?.images ?? [], // รูปเดิมจาก API DTO
      newImages: [] as File[],
      isUsed: initial ? initial.isUsed : true,
    },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const { isUsed, keepImages, newImages, ...rest } = values;

        const payload = {
          ...rest,
          IsUsed: isUsed,
          // ตรวจสอบชื่อ Key ให้เป็นตัวใหญ่ตาม DTO ของ C# (NewImages)
          KeepImages: initial ? keepImages : [],
          // ส่งอาเรย์ไปตรงๆ เพื่อให้ toFormData (ฉบับปรับปรุง) จัดการ
          NewImages: newImages.length > 0 ? newImages : null,
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
    touched,
    errors,
    setFieldValue,
    isSubmitting,
    resetForm,
    submitCount,
  } = formik;

  // --- 2. เรียกใช้ Hook ดึงหมวดหมู่ (RTK Query) ---
  const { data: catRes, isLoading: loadingCategories } =
    useGetManualCategoriesQuery(
      values.targetRole,
      { skip: !open }, // ดึงข้อมูลเฉพาะตอนเปิด Drawer
    );
  const categoryOptions = catRes ?? [];

  // --- 3. จัดการสถานะ Drawer ---
  useEffect(() => {
    if (!open) {
      resetForm();
      setNewImagePreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [open, resetForm]);

  // --- 4. Logic จัดการรูปภาพ ---
  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const previews = files.map((f) => URL.createObjectURL(f));
    setFieldValue("newImages", [...values.newImages, ...files]);
    setNewImagePreviews((prev) => [...prev, ...previews]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveNewImage = (index: number) => {
    setFieldValue(
      "newImages",
      values.newImages.filter((_, i) => i !== index),
    );
    setNewImagePreviews(newImagePreviews.filter((_, i) => i !== index));
  };

  const handleRemoveKeepImage = (index: number) => {
    setFieldValue(
      "keepImages",
      values.keepImages.filter((_, i) => i !== index),
    );
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 550 }, borderLeft: "1px solid #e0e0e0" },
      }}
    >
      <FormikProvider value={formik}>
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            bgcolor: "#fcfcfc",
          }}
        >
          {/* Header */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ p: 2.5, bgcolor: "primary.main", color: "white" }}
          >
            <Box>
              <Typography variant="h6" fontWeight={800}>
                {initial ? "แก้ไขข้อมูลคู่มือ" : "ลงทะเบียนคู่มือใหม่"}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                ระบุรายละเอียดและกลุ่มเป้าหมายที่ต้องการให้มองเห็น
              </Typography>
            </Box>
            <IconButton
              onClick={onClose}
              disabled={isSubmitting}
              sx={{ color: "white" }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>

          {/* Body */}
          <Stack spacing={3} sx={{ p: 3, flex: 1, overflowY: "auto" }}>
            {Object.keys(errors).length > 0 && submitCount > 0 && (
              <Alert severity="error" variant="filled">
                กรุณากรอกข้อมูลในช่องที่จำเป็นให้ครบถ้วน
              </Alert>
            )}

            {/* ส่วนจัดการรูปภาพ */}
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={1.5}
              >
                <Typography variant="subtitle2" fontWeight={700}>
                  รูปภาพประกอบ (
                  {values.keepImages.length + values.newImages.length})
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddPhotoAlternateIcon />}
                  onClick={() => fileInputRef.current?.click()}
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

              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  minHeight: 100,
                  bgcolor: "#f9f9f9",
                  borderStyle: "dashed",
                }}
              >
                {values.keepImages.length > 0 || newImagePreviews.length > 0 ? (
                  <ImageList cols={3} gap={10} sx={{ m: 0 }}>
                    {/* รูปภาพเดิม */}
                    {values.keepImages.map((url, i) => (
                      <ImageListItem
                        key={`old-${i}`}
                        sx={{
                          borderRadius: 1.5,
                          overflow: "hidden",
                          border: "1px solid #ddd",
                        }}
                      >
                        <img
                          src={url}
                          alt="keep"
                          style={{ height: 100, objectFit: "cover" }}
                        />
                        <ImageListItemBar
                          sx={{
                            background: "rgba(211, 47, 47, 0.8)",
                            height: 30,
                          }}
                          actionIcon={
                            <IconButton
                              size="small"
                              sx={{ color: "white" }}
                              onClick={() => handleRemoveKeepImage(i)}
                            >
                              <CloseIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          }
                        />
                      </ImageListItem>
                    ))}
                    {/* รูปภาพใหม่ */}
                    {newImagePreviews.map((preview, i) => (
                      <ImageListItem
                        key={`new-${i}`}
                        sx={{
                          borderRadius: 1.5,
                          overflow: "hidden",
                          border: "2px dashed #1976d2",
                        }}
                      >
                        <img
                          src={preview}
                          alt="new"
                          style={{ height: 100, objectFit: "cover" }}
                        />
                        <ImageListItemBar
                          sx={{ height: 30 }}
                          actionIcon={
                            <IconButton
                              size="small"
                              sx={{ color: "white" }}
                              onClick={() => handleRemoveNewImage(i)}
                            >
                              <CloseIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          }
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                ) : (
                  <Stack
                    alignItems="center"
                    justifyContent="center"
                    sx={{ height: 100, color: "text.disabled" }}
                  >
                    <Typography variant="caption">
                      ยังไม่มีรูปภาพประกอบ
                    </Typography>
                  </Stack>
                )}
              </Paper>
            </Box>

            <TextField
              fullWidth
              label="หัวข้อ (Title)"
              name="title"
              value={values.title}
              onChange={handleChange}
              error={touched.title && !!errors.title}
              helperText={touched.title && errors.title}
              variant="outlined"
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              {/* Target Role */}
              <TextField
                select
                fullWidth
                label="กลุ่มเป้าหมาย"
                name="targetRole"
                value={values.targetRole}
                onChange={handleChange}
              >
                {ROLES.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </TextField>

              {/* Autocomplete หมวดหมู่ พร้อม Icon */}
              <Autocomplete
                fullWidth
                freeSolo
                options={categoryOptions}
                loading={loadingCategories}
                value={values.category}
                onInputChange={(_, val) => setFieldValue("category", val)}
                onChange={(_, val) => setFieldValue("category", val)}
                renderOption={(props, option) => (
                  <Box
                    component="li"
                    {...props}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    {getServiceIcon(option)}
                    {option}
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="หมวดหมู่"
                    error={touched.category && !!errors.category}
                    helperText={touched.category && errors.category}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: values.category
                        ? getServiceIcon(values.category)
                        : null,
                      endAdornment: (
                        <>
                          {loadingCategories ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Stack>

            <TextField
              fullWidth
              label="สถานที่ (Location)"
              name="location"
              value={values.location}
              onChange={handleChange}
              placeholder="เช่น โซน VIP, ชั้น 2"
            />

            <TextField
              fullWidth
              multiline
              rows={5}
              label="เนื้อหา / ขั้นตอนการใช้งาน"
              name="content"
              value={values.content}
              onChange={handleChange}
            />

            <Paper
              variant="outlined"
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderRadius: 2,
              }}
            >
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  การแสดงผล
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  เปิดใช้งานเพื่อให้บุคคลทั่วไปสามารถเข้าชมคู่มือนี้ได้
                </Typography>
              </Box>
              <Switch
                checked={values.isUsed}
                onChange={(e) => setFieldValue("isUsed", e.target.checked)}
                color="success"
              />
            </Paper>
          </Stack>

          {/* Footer */}
          <Divider />
          <Stack direction="row" spacing={2} sx={{ p: 2.5, bgcolor: "white" }}>
            <Button
              fullWidth
              variant="outlined"
              color="inherit"
              onClick={onClose}
              disabled={isSubmitting}
            >
              ยกเลิก
            </Button>
            <Button
              fullWidth
              variant="contained"
              type="submit"
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
