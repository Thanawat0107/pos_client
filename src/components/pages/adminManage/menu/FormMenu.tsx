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
    id?: number
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
      // ป้องกันค่า 0 ตอน Create เพื่อให้ Validation ทำงานถูกต้อง
      menuCategoryId: initial?.menuCategoryId ?? (categories.length > 0 ? categories[0].id : ""),
      isUsed: initial ? initial.isUsed && !initial.isDeleted : true,
      menuItemOptionGroups:
        initial?.menuItemOptionGroups?.map((g) => ({
          id: g.id,
          menuItemOptionId: g.menuItemOptionId,
        })) ?? [],
    },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const { isUsed, menuItemOptionGroups, ...rest } = values;

        // กรอง Option ที่เป็นค่าว่างทิ้งไป
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
    submitCount
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
              {initial ? "แก้ไขเมนู" : "เพิ่มเมนูใหม่"}
            </Typography>
            <IconButton onClick={onClose} disabled={isSubmitting}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Divider />

          {/* Body */}
          <Stack spacing={2.5} sx={{ p: 2, flex: 1, overflowY: "auto" }}>
            
            {/* Alert แจ้งเตือนเมื่อกดบันทึกแล้วมี Error */}
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
                      height: 200,
                      objectFit: "cover",
                      borderRadius: 2,
                      border: "1px solid #eee"
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
                  sx={{ height: 100, borderStyle: "dashed", color: "text.secondary" }}
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
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="ราคา"
                name="basePrice"
                type="number"
                value={values.basePrice}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.basePrice && !!errors.basePrice}
                fullWidth
                InputProps={{ inputProps: { min: 0 } }}
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
              >
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <TextField
              label="รายละเอียด"
              name="description"
              multiline
              rows={2}
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              fullWidth
            />

            {/* 3. Option Groups (FieldArray) */}
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  ตัวเลือกเพิ่มเติม (Options)
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={() =>
                    setFieldValue("menuItemOptionGroups", [
                      ...values.menuItemOptionGroups,
                      { menuItemOptionId: "" },
                    ])
                  }
                >
                  เพิ่ม
                </Button>
              </Stack>

              <FieldArray name="menuItemOptionGroups">
                {({ remove }) => (
                  <Stack spacing={1}>
                    {values.menuItemOptionGroups.map((group, index) => (
                      <Stack
                        key={index}
                        direction="row"
                        spacing={1}
                        alignItems="center"
                      >
                        <TextField
                          select
                          size="small"
                          fullWidth
                          label={`ตัวเลือกที่ ${index + 1}`}
                          name={`menuItemOptionGroups.${index}.menuItemOptionId`}
                          value={group.menuItemOptionId}
                          onChange={handleChange}
                          error={touched.menuItemOptionGroups?.[index]?.menuItemOptionId && !!(errors.menuItemOptionGroups as any)?.[index]?.menuItemOptionId}
                        >
                          {optionList.map((opt) => (
                            <MenuItem key={opt.id} value={opt.id}>
                              {opt.name}{" "}
                              <Typography variant="caption" color="text.secondary" ml={1}>
                                {opt.isMultiple ? "(เลือกได้หลาย)" : "(เลือกได้ 1)"}
                              </Typography>
                            </MenuItem>
                          ))}
                        </TextField>
                        <IconButton color="error" onClick={() => remove(index)}>
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Stack>
                    ))}
                    
                    {values.menuItemOptionGroups.length === 0 && (
                      <Paper variant="outlined" sx={{ p: 2, textAlign: "center", borderStyle: "dashed" }}>
                        <Typography variant="caption" color="text.secondary">
                          ยังไม่มีตัวเลือก (เช่น ระดับความหวาน, ขนาดแก้ว)
                        </Typography>
                      </Paper>
                    )}
                  </Stack>
                )}
              </FieldArray>
            </Box>

            {/* 4. Status Switch (แสดงเฉพาะตอนแก้ไข) */}
            {initial && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderColor: values.isUsed ? "success.main" : "divider",
                  bgcolor: values.isUsed ? "success.lighter" : "transparent"
                }}
              >
                <Box>
                    <Typography variant="body2" fontWeight="bold">
                    {values.isUsed ? "สถานะ: เปิดขาย (Active)" : "สถานะ: ปิดขาย (Inactive)"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {values.isUsed ? "ลูกค้าสามารถสั่งเมนูนี้ได้" : "เมนูนี้จะไม่แสดงให้ลูกค้าเห็น"}
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
            <Button onClick={onClose} fullWidth variant="outlined" disabled={isSubmitting}>
              ยกเลิก
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting || categories.length === 0}
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "บันทึกข้อมูล"}
            </Button>
          </Stack>
        </Box>
      </FormikProvider>
    </Drawer>
  );
}