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
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { FieldArray, FormikProvider, useFormik } from "formik";
import { useEffect, useRef, useState } from "react";
import type { MenuItemDto } from "../../../../@types/dto/MenuItem";
import type { MenuCategory } from "../../../../@types/dto/MenuCategory";
import type { CreateMenuItem } from "../../../../@types/createDto/createMenuItem";
import type { MenuItemOption } from "../../../../@types/dto/MenuItemOption";
import type { UpdateMenuItem } from "../../../../@types/UpdateDto/updateMenuItem";
import { menuSchema } from "../../../../helpers/validationSchema";

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: MenuItemDto;
  categories: MenuCategory[];
  optionList: MenuItemOption[];
  onSubmit: (
    data: CreateMenuItem | UpdateMenuItem,
    id?: number,
  ) => Promise<void> | void;
};

export default function FormMenu({
  open,
  onClose,
  initial,
  categories,
  optionList,
  onSubmit,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const formik = useFormik({
    enableReinitialize: true,
    validationSchema: menuSchema,
    initialValues: {
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      basePrice: initial?.basePrice ?? 0,
      imageUrl: initial?.imageUrl ?? "",
      imageFile: undefined as File | undefined,
      menuCategoryId:
        initial?.menuCategoryId ??
        (categories.length > 0 ? categories[0].id : ""),
      isUsed: initial ? initial.isUsed && !initial.isDeleted : true,
      menuItemOptionGroups:
        initial?.menuItemOptionGroups?.map((g) => ({
          // ใช้ id ของ group ถ้ามี (กรณี update)
          id: (g as any).id,
          menuItemOptionId: g.menuItemOptionId,
        })) ?? [],
    },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const { isUsed, menuItemOptionGroups, ...rest } = values;

        // กรอง Option ที่เป็นค่าว่างทิ้งไป และแปลง id เป็น number
        const formattedGroups = menuItemOptionGroups
          .filter((g) => g.menuItemOptionId)
          .map((g) => ({
            ...(g.id && { id: g.id }),
            menuItemOptionId: Number(g.menuItemOptionId),
          }));

        const payload = {
          ...rest,
          isUsed,
          menuItemOptionGroups: formattedGroups,
        };

        if (!payload.menuCategoryId) {
          alert("กรุณาเลือกหมวดหมู่สินค้า");
          return;
        }

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
    submitCount,
  } = formik;

  // Reset Form เมื่อเปิด/ปิด
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
      setFieldValue("imageFile", file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setFieldValue("imageFile", undefined);
    setFieldValue("imageUrl", "");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Helper สำหรับหาข้อมูล MenuItemOption เพื่อแสดงผล Details
  const getSelectedOptionInfo = (optionId: number | string) => {
    return optionList.find((opt) => opt.id === Number(optionId));
  };

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
          {/* Header */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: 3, py: 2.5 }}
          >
            <Typography sx={{ fontSize: "1.4rem", fontWeight: 800 }}>
              {initial ? "แก้ไขเมนู" : "เพิ่มเมนูใหม่"}
            </Typography>
            <IconButton onClick={onClose} disabled={isSubmitting} size="medium">
              <CloseIcon sx={{ fontSize: "1.5rem" }} />
            </IconButton>
          </Stack>
          <Divider />

          {/* Body */}
          <Stack spacing={3} sx={{ px: 3, py: 3, flex: 1, overflowY: "auto" }}>
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
                      height: 220,
                      objectFit: "cover",
                      borderRadius: 3,
                      border: "1.5px solid",
                      borderColor: "divider",
                    }}
                  />
                  <IconButton
                    onClick={handleRemoveImage}
                    sx={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      bgcolor: "white",
                      boxShadow: 2,
                      "&:hover": { bgcolor: "#f5f5f5" },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: "1.2rem" }} />
                  </IconButton>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{
                    height: 120,
                    borderStyle: "dashed",
                    borderWidth: "2px",
                    borderRadius: 3,
                    fontSize: "1rem",
                    color: "text.secondary",
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  คลิกเพื่ออัปโหลดรูปภาพ
                </Button>
              )}
            </Box>

            {/* 2. Basic Info */}
            <TextField
              label="ชื่อเมนู"
              name="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.name && !!errors.name}
              helperText={touched.name && errors.name}
              fullWidth
              InputProps={{ sx: { fontSize: "1rem", borderRadius: 2 } }}
              InputLabelProps={{ sx: { fontSize: "1rem" } }}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="ราคาเริ่มต้น (บาท)"
                name="basePrice"
                type="number"
                value={values.basePrice}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.basePrice && !!errors.basePrice}
                fullWidth
                InputProps={{ inputProps: { min: 0 }, sx: { fontSize: "1rem", borderRadius: 2 } }}
                InputLabelProps={{ sx: { fontSize: "1rem" } }}
              />
              <TextField
                select
                label="หมวดหมู่"
                name="menuCategoryId"
                value={values.menuCategoryId}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.menuCategoryId && !!errors.menuCategoryId}
                helperText={touched.menuCategoryId && errors.menuCategoryId}
                fullWidth
                InputProps={{ sx: { fontSize: "1rem", borderRadius: 2 } }}
                InputLabelProps={{ sx: { fontSize: "1rem" } }}
              >
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id} sx={{ fontSize: "1rem", py: 1.25 }}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <TextField
              label="รายละเอียดเมนู"
              name="description"
              multiline
              rows={3}
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              fullWidth
              InputProps={{ sx: { fontSize: "1rem", borderRadius: 2 } }}
              InputLabelProps={{ sx: { fontSize: "1rem" } }}
            />

            {/* 3. Option Groups (Dynamic Fields) */}
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={1.5}
              >
                <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>
                  ตัวเลือกเพิ่มเติม
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() =>
                    setFieldValue("menuItemOptionGroups", [
                      ...values.menuItemOptionGroups,
                      { menuItemOptionId: "" },
                    ])
                  }
                  sx={{ fontSize: "0.9rem", fontWeight: 600 }}
                >
                  เพิ่มกลุ่มตัวเลือก
                </Button>
              </Stack>

              <FieldArray name="menuItemOptionGroups">
                {({ remove }) => (
                  <Stack spacing={2}>
                    {values.menuItemOptionGroups.map((group, index) => {
                      const selectedOpt = getSelectedOptionInfo(
                        group.menuItemOptionId,
                      );
                      return (
                        <Paper
                          key={index}
                          variant="outlined"
                          sx={{ p: 2.5, borderRadius: 2, position: "relative" }}
                        >
                          <Stack spacing={2}>
                            <Stack
                              direction="row"
                              spacing={1.5}
                              alignItems="flex-start"
                            >
                              <TextField
                                select
                                fullWidth
                                label={`กลุ่มตัวเลือกที่ ${index + 1}`}
                                name={`menuItemOptionGroups.${index}.menuItemOptionId`}
                                value={group.menuItemOptionId}
                                onChange={handleChange}
                                error={
                                  touched.menuItemOptionGroups?.[index]
                                    ?.menuItemOptionId &&
                                  !!(errors.menuItemOptionGroups as any)?.[
                                    index
                                  ]?.menuItemOptionId
                                }
                                InputProps={{ sx: { fontSize: "0.95rem", borderRadius: 2 } }}
                                InputLabelProps={{ sx: { fontSize: "0.95rem" } }}
                              >
                                {optionList.map((opt) => (
                                  <MenuItem key={opt.id} value={opt.id} sx={{ fontSize: "0.95rem", py: 1.25 }}>
                                    {opt.name}{" "}
                                    {opt.isRequired ? "(บังคับ)" : "(ไม่บังคับ)"}
                                  </MenuItem>
                                ))}
                              </TextField>
                              <IconButton
                                color="error"
                                onClick={() => remove(index)}
                                sx={{ mt: 0.5 }}
                              >
                                <DeleteOutlineIcon sx={{ fontSize: "1.4rem" }} />
                              </IconButton>
                            </Stack>

                            {/* แสดงส่วนรายละเอียดของ Option ที่เลือก */}
                            {selectedOpt && (
                              <Box
                                sx={{
                                  pl: 1.5,
                                  borderLeft: "3px solid",
                                  borderColor: "primary.main",
                                  py: 0.75,
                                }}
                              >
                                <Typography
                                  sx={{ fontSize: "0.875rem" }}
                                  color="text.secondary"
                                  display="block"
                                  gutterBottom
                                >
                                  รูปแบบ:{" "}
                                  {selectedOpt.isMultiple
                                    ? "เลือกได้หลายอย่าง"
                                    : "เลือกได้เพียง 1 อย่าง"}
                                </Typography>
                                <Stack direction="row" flexWrap="wrap" gap={1}>
                                  {selectedOpt.menuOptionDetails.map(
                                    (detail) => (
                                      <Chip
                                        key={detail.id}
                                        label={`${detail.name} (+${detail.extraPrice})`}
                                        size="small"
                                        variant="outlined"
                                        color={
                                          detail.isDefault ? "primary" : "default"
                                        }
                                        sx={{ fontSize: "0.8rem", height: 26 }}
                                      />
                                    ),
                                  )}
                                </Stack>
                              </Box>
                            )}
                          </Stack>
                        </Paper>
                      );
                    })}

                    {values.menuItemOptionGroups.length === 0 && (
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 3.5,
                          textAlign: "center",
                          borderStyle: "dashed",
                          borderRadius: 2,
                          bgcolor: "grey.50",
                        }}
                      >
                        <Typography sx={{ fontSize: "0.95rem" }} color="text.secondary">
                          ยังไม่มีการตั้งค่าตัวเลือกเพิ่มเติม
                        </Typography>
                      </Paper>
                    )}
                  </Stack>
                )}
              </FieldArray>
            </Box>

            {/* 4. Status Switch */}
            {initial && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderRadius: 2,
                  borderWidth: "1.5px",
                  borderColor: values.isUsed ? "success.main" : "divider",
                  bgcolor: values.isUsed ? "success.lighter" : "transparent",
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>
                    {values.isUsed ? "สถานะ: พร้อมขาย" : "สถานะ: ปิดการขาย"}
                  </Typography>
                  <Typography sx={{ fontSize: "0.875rem" }} color="text.secondary">
                    กำหนดการแสดงผลของเมนูในหน้าแอปพลิเคชันลูกค้า
                  </Typography>
                </Box>
                <Switch
                  checked={values.isUsed}
                  onChange={(e) => setFieldValue("isUsed", e.target.checked)}
                  color="success"
                  size="medium"
                />
              </Paper>
            )}
          </Stack>

          {/* Footer */}
          <Divider />
          <Stack
            direction="row"
            spacing={2}
            sx={{ px: 3, py: 2.5, bgcolor: "background.paper" }}
          >
            <Button
              onClick={onClose}
              fullWidth
              variant="outlined"
              disabled={isSubmitting}
              sx={{ fontSize: "1rem", fontWeight: 600, py: 1.25, borderRadius: 2 }}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting || categories.length === 0}
              sx={{ fontSize: "1rem", fontWeight: 700, py: 1.25, borderRadius: 2 }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "บันทึกเมนู"
              )}
            </Button>
          </Stack>
        </Box>
      </FormikProvider>
    </Drawer>
  );
}
