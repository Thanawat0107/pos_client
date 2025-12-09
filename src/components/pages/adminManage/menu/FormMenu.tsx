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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { FieldArray, FormikProvider, useFormik } from "formik";
import { useEffect, useRef, useState } from "react";
import { menuSchema } from "../validation";
import type { MenuItemDto } from "../../../../@types/dto/MenuItem";
import type { MenuCategory } from "../../../../@types/dto/MenuCategory";
import type { CreateMenuItem } from "../../../../@types/createDto/createMenuItem";
import type { MenuItemOption } from "../../../../@types/dto/MenuItemOption";
import type { UpdateMenuItem } from "../../../../@types/UpdateDto/updateMenuItem";

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
      menuCategoryId: initial?.menuCategoryId ?? (categories[0]?.id || 0),
      // Default เป็น true เสมอถ้า create, ถ้า edit ให้ใช้ค่าเดิม
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

        const formattedGroups = menuItemOptionGroups.map((g) => ({
          ...(g.id && { id: g.id }),
          menuItemOptionId: g.menuItemOptionId,
        }));

        const payload = {
          ...rest,
          isUsed,
          menuItemOptionGroups: formattedGroups,
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
    if (open) setImagePreview(initial?.imageUrl || null);
    else {
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
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Divider />

          {/* Body */}
          <Stack spacing={2.5} sx={{ p: 2, flex: 1, overflowY: "auto" }}>
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
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ height: 100, borderStyle: "dashed" }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  อัปโหลดรูปภาพ
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
                fullWidth
              />
              <TextField
                select
                label="หมวดหมู่"
                name="menuCategoryId"
                value={values.menuCategoryId}
                onChange={handleChange}
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
              fullWidth
            />

            {/* 3. Option Groups */}
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
                        >
                          {optionList.map((opt) => (
                            <MenuItem key={opt.id} value={opt.id}>
                              {opt.name}{" "}
                              {opt.isMultiple
                                ? "(เลือกได้หลาย)"
                                : "(เลือกได้ 1)"}
                            </MenuItem>
                          ))}
                        </TextField>
                        <IconButton color="error" onClick={() => remove(index)}>
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Stack>
                    ))}
                    {values.menuItemOptionGroups.length === 0 && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        align="center"
                      >
                        ยังไม่มีตัวเลือก (เช่น หวาน, ไซส์)
                      </Typography>
                    )}
                  </Stack>
                )}
              </FieldArray>
            </Box>

            {/* 4. Status Switch (แสดงเฉพาะตอนแก้ไขเท่านั้น) */}
            {initial && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2">
                  {values.isUsed ? "สถานะ: เปิดขาย" : "สถานะ: ปิดขาย"}
                </Typography>
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
            <Button onClick={onClose} fullWidth disabled={isSubmitting}>
              ยกเลิก
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : "บันทึก"}
            </Button>
          </Stack>
        </Box>
      </FormikProvider>
    </Drawer>
  );
}