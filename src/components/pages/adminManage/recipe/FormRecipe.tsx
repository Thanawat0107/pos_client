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
  Autocomplete,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useFormik } from "formik";
import { useEffect } from "react";
import type { Recipe } from "../../../../@types/dto/Recipe";
import type { CreateRecipe } from "../../../../@types/createDto/CreateRecipe";
import type { UpdateRecipe } from "../../../../@types/UpdateDto/UpdateRecipe";
// ตรวจสอบว่าไฟล์ validationSchema มี localRecipeSchema อยู่จริง หรือนำมาแปะไว้ในไฟล์นี้ชั่วคราวก็ได้ครับ
import { localRecipeSchema } from "../../../../helpers/validationSchema";

// Helper 1: แปลง JSON Object -> Array
const transformToFormArray = (jsonObj: any) => {
  if (!jsonObj || Object.keys(jsonObj).length === 0) {
    return [{ name: "", quantity: "" }];
  }
  return Object.entries(jsonObj).map(([key, value]) => ({
    name: key,
    quantity: value as string,
  }));
};

// Helper 2: แปลง Array -> JSON Object
const transformToJsonObject = (arr: { name: string; quantity: string }[]) => {
  const result: Record<string, string> = {};
  arr.forEach((item) => {
    if (item.name.trim()) {
      result[item.name.trim()] = item.quantity.trim();
    }
  });
  return result;
};

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Partial<Recipe>;
  onSubmit: (data: CreateRecipe | UpdateRecipe) => Promise<void> | void;
  isLoading?: boolean;
  menuOptions?: any[];
};

export default function FormRecipe({
  open,
  onClose,
  initial,
  onSubmit,
  isLoading = false,
  menuOptions = [],
}: Props) {
  const formik = useFormik({
    enableReinitialize: true,
    validationSchema: localRecipeSchema,
    initialValues: {
      id: initial?.id ?? 0,
      menuItemId: initial?.menuItemId ?? 0,
      ingredientsList: transformToFormArray(initial?.ingredients),
      instructions: initial?.instructions ?? "",
      isUsed: initial?.isUsed ?? true,
    },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const ingredientsObj = transformToJsonObject(values.ingredientsList);

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

  // หา Object เมนูที่เลือก
  const selectedMenu = menuOptions.find((m) => m.id === values.menuItemId) || null;

  const handleAddIngredient = () => {
    setFieldValue("ingredientsList", [
      ...values.ingredientsList,
      { name: "", quantity: "" },
    ]);
  };

  const handleRemoveIngredient = (index: number) => {
    const newList = [...values.ingredientsList];
    if (newList.length > 1) {
      newList.splice(index, 1);
      setFieldValue("ingredientsList", newList);
    } else {
      setFieldValue("ingredientsList", [{ name: "", quantity: "" }]);
    }
  };

  // ✅ แก้ไขส่วนนี้: เปลี่ยนวิธีอัปเดตค่าให้เป็น Immutable (สร้าง Object ใหม่เสมอ)
  const handleIngredientChange = (
    index: number,
    field: "name" | "quantity",
    value: string
  ) => {
    const newList = values.ingredientsList.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setFieldValue("ingredientsList", newList);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: 1, sm: 500 } },
      }}
    >
      <Box
        component="form"
        onSubmit={formik.handleSubmit}
        sx={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ p: 2, pt: "calc(env(safe-area-inset-top) + 8px)" }}
        >
          <Typography variant="h6" fontWeight={800}>
            {initial?.id ? "แก้ไขสูตรอาหาร" : "เพิ่มสูตรอาหารใหม่"}
          </Typography>
          <IconButton onClick={onClose} disabled={isSubmitting}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider />

        <Stack spacing={3} sx={{ p: 2, flex: 1, overflowY: "auto" }}>
          
          {/* ✅ เพิ่ม isOptionEqualToValue เพื่อช่วยให้ค่าไม่หลุด */}
          <Autocomplete
            options={menuOptions}
            getOptionLabel={(option) => option.name || ""}
            value={selectedMenu}
            onChange={(_, newValue) => {
              setFieldValue("menuItemId", newValue ? newValue.id : 0);
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onBlur={handleBlur}
            renderInput={(params) => (
              <TextField
                {...params}
                label="เลือกเมนูอาหาร"
                name="menuItemId"
                // ตรวจสอบ error ให้ละเอียดขึ้นป้องกัน crash
                error={touched.menuItemId && Boolean(errors.menuItemId)}
                helperText={touched.menuItemId && (errors.menuItemId as string)}
                fullWidth
              />
            )}
          />

          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              ส่วนประกอบ (Ingredients)
            </Typography>
            <Stack spacing={2}>
              {values.ingredientsList.map((item, index) => {
                // ดึง Error แบบปลอดภัย
                const itemErrors = (errors.ingredientsList as any)?.[index];
                const itemTouched = (touched.ingredientsList as any)?.[index];

                return (
                  <Stack
                    key={index}
                    direction="row"
                    spacing={1}
                    alignItems="flex-start"
                  >
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 0.7fr", gap: 1, flex: 1 }}>
                      <TextField
                        label={`วัตถุดิบ ${index + 1}`}
                        placeholder="เช่น หมูสับ"
                        value={item.name}
                        onChange={(e) =>
                          handleIngredientChange(index, "name", e.target.value)
                        }
                        error={itemTouched?.name && !!itemErrors?.name}
                        size="small"
                        fullWidth
                      />
                      <TextField
                        label="ปริมาณ"
                        placeholder="เช่น 100g"
                        value={item.quantity}
                        onChange={(e) =>
                          handleIngredientChange(index, "quantity", e.target.value)
                        }
                        error={itemTouched?.quantity && !!itemErrors?.quantity}
                        size="small"
                        fullWidth
                      />
                    </Box>

                    <IconButton
                      color="error"
                      onClick={() => handleRemoveIngredient(index)}
                      disabled={values.ingredientsList.length === 1 && !item.name && !item.quantity}
                      sx={{ mt: 0.5 }}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Stack>
                );
              })}

              <Button
                startIcon={<AddCircleOutlineIcon />}
                variant="outlined"
                onClick={handleAddIngredient}
                sx={{ alignSelf: "flex-start", mt: 1 }}
                size="small"
              >
                เพิ่มวัตถุดิบ
              </Button>
            </Stack>
          </Box>

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
            placeholder="1. ตั้งกระทะ...&#10;2. ใส่หมู..."
          />

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
                   {values.isUsed ? "สูตรนี้กำลังถูกใช้งาน" : "ปิดการใช้งานชั่วคราว"}
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