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
import type { MenuCategory } from "../../../../@types/dto/MenuCategory";
import { categorySchema } from "../../../../helpers/validationSchema";
import type { CreateMenuCategory } from "../../../../@types/createDto/CreateMenuCategory";
import type { UpdateMenuCategory } from "../../../../@types/UpdateDto/updateMenuCategory";

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Partial<MenuCategory>;
  onSubmit: (
    data: CreateMenuCategory | UpdateMenuCategory
  ) => Promise<void> | void;
  isLoading?: boolean;
};

// Helper: สร้าง Slug อัตโนมัติ
const generateSlug = (text: string) =>
  text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9ก-๙\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default function FormCategory({
  open,
  onClose,
  initial,
  onSubmit,
  isLoading = false,
}: Props) {
  const formik = useFormik<MenuCategory>({
    enableReinitialize: true,
    validationSchema: categorySchema,
    initialValues: {
      id: initial?.id ?? 0,
      name: initial?.name ?? "",
      slug: initial?.slug ?? "",
      isUsed: initial?.isUsed ?? true,
      isDeleted: initial?.isDeleted ?? false,
    },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (initial?.id) {
          const payload: UpdateMenuCategory = {
            id: initial.id,
            name: values.name,
            slug: values.slug,
            isUsed: values.isUsed,
          };
          await onSubmit(payload);
        } else {
          const payload: CreateMenuCategory = {
            name: values.name,
            slug: values.slug,
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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
    if (!initial?.id && !touched.slug) {
      setFieldValue("slug", generateSlug(e.target.value));
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: 1, sm: 400 } }, // ปรับความกว้างให้พอดีกับฟอร์ม
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
            {initial?.id ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่"}
          </Typography>
          <IconButton onClick={onClose} disabled={isSubmitting}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider />

        {/* Body */}
        <Stack spacing={2.5} sx={{ p: 2, flex: 1, overflowY: "auto" }}>
          <TextField
            label="ชื่อหมวดหมู่"
            name="name"
            value={values.name}
            onChange={handleNameChange} // 🟢 ใช้ Handler พิเศษที่สร้าง Slug อัตโนมัติ
            onBlur={handleBlur}
            error={touched.name && !!errors.name}
            helperText={touched.name && errors.name}
            fullWidth
            autoFocus
          />

          <TextField
            label="Slug (URL)"
            name="slug"
            value={values.slug}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.slug && !!errors.slug}
            helperText={
              (touched.slug && errors.slug) || "ใช้สำหรับ URL / อ้างอิงในระบบ"
            }
            fullWidth
            // ถ้าต้องการห้ามแก้ Slug ตอน Edit ให้ uncomment บรรทัดล่างครับ
            // InputProps={{ readOnly: !!initial?.id }}
          />

          {/* Status Switch (Design แบบเดียวกับหน้าเมนู: แสดงเฉพาะตอนแก้ไข) */}
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
                  {values.isUsed ? "แสดงหมวดหมู่นี้ในเมนู" : "ซ่อนหมวดหมู่นี้"}
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
