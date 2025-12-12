/* eslint-disable @typescript-eslint/no-unused-vars */
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
  CircularProgress,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useFormik } from "formik";
import { useEffect } from "react";
import type { Recipe } from "../../../../@types/dto/Recipe";
import type { CreateRecipe } from "../../../../@types/createDto/CreateRecipe";
import type { UpdateRecipe } from "../../../../@types/UpdateDto/UpdateRecipe";
import { recipeSchema } from "../../../../helpers/validationSchema";

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Partial<Recipe>;
  onSubmit: (data: CreateRecipe | UpdateRecipe) => Promise<void> | void;
  isLoading?: boolean;
};

export default function FormRecipe({
  open,
  onClose,
  initial,
  onSubmit,
  isLoading = false,
}: Props) {
  const formik = useFormik({
    enableReinitialize: true,
    validationSchema: recipeSchema,
    initialValues: {
      id: initial?.id ?? 0,
      menuItemId: initial?.menuItemId ?? "",
      // แปลง Object ingredients กลับเป็น String เพื่อให้แก้ใน TextField ได้ง่าย
      ingredientsStr: initial?.ingredients
        ? JSON.stringify(initial.ingredients, null, 2)
        : "{}",
      instructions: initial?.instructions ?? "",
      isUsed: initial?.isUsed ?? true,
    },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // แปลง String กลับเป็น JSON Object
        let ingredientsObj = {};
        try {
          ingredientsObj = JSON.parse(values.ingredientsStr);
        } catch (e: any) {
          alert("รูปแบบ JSON ของวัตถุดิบไม่ถูกต้อง");
          return;
        }

        if (initial?.id) {
          const payload: UpdateRecipe = {
            menuItemId: Number(values.menuItemId),
            ingredients: ingredientsObj,
            instructions: values.instructions,
            isUsed: values.isUsed,
          };
          await onSubmit(payload);
        } else {
          const payload: CreateRecipe = {
            menuItemId: Number(values.menuItemId),
            ingredients: ingredientsObj,
            instructions: values.instructions,
          };
          await onSubmit(payload);
        }
        onClose();
      } catch (error) {
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    isSubmitting,
    resetForm,
  } = formik;

  useEffect(() => {
    if (!open) resetForm();
  }, [open, resetForm]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: 1, sm: 450 } }, // กว้างขึ้นเล็กน้อยสำหรับ Textarea
      }}
    >
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
          sx={{ p: 2, pt: "calc(env(safe-area-inset-top) + 8px)" }}
        >
          <Typography variant="h6" fontWeight={800}>
            {initial?.id ? `แก้ไขสูตร (ID: ${initial.id})` : "เพิ่มสูตรอาหารใหม่"}
          </Typography>
          <IconButton onClick={onClose} disabled={isSubmitting}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider />

        {/* Body */}
        <Stack spacing={2.5} sx={{ p: 2, flex: 1, overflowY: "auto" }}>
          
          <TextField
            label="รหัสเมนู (Menu Item ID)"
            name="menuItemId"
            type="number"
            value={values.menuItemId}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.menuItemId && !!errors.menuItemId}
            helperText={touched.menuItemId && errors.menuItemId}
            fullWidth
            autoFocus
            // หากเป็นการแก้ไข อาจจะห้ามแก้ ID เมนู หรือแล้วแต่ Logic ธุรกิจ
            // disabled={!!initial?.id} 
          />

          <TextField
            label="ส่วนประกอบ (JSON Format)"
            name="ingredientsStr"
            value={values.ingredientsStr}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.ingredientsStr && !!errors.ingredientsStr}
            helperText={
              (touched.ingredientsStr && errors.ingredientsStr) ||
              "ตัวอย่าง: { \"หมู\": \"100g\", \"น้ำปลา\": \"1 ช้อนโต๊ะ\" }"
            }
            fullWidth
            multiline
            rows={4}
            sx={{ fontFamily: "monospace" }}
          />

          <TextField
            label="ขั้นตอนการทำ (Instructions)"
            name="instructions"
            value={values.instructions}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.instructions && !!errors.instructions}
            helperText={touched.instructions && errors.instructions}
            fullWidth
            multiline
            minRows={4}
          />

          {/* Status Switch (แสดงเฉพาะตอนแก้ไข) */}
          {initial?.id && (
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
                    ? "สถานะ: ใช้งาน (Active)"
                    : "สถานะ: ปิดใช้งาน"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {values.isUsed ? "สูตรนี้ถูกใช้งานอยู่" : "ระงับการใช้สูตรนี้ชั่วคราว"}
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
          sx={{
            p: 2,
            bgcolor: "background.paper",
            pb: "calc(env(safe-area-inset-bottom) + 8px)",
          }}
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
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "บันทึก"
            )}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}