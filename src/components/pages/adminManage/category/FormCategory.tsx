import {
  Drawer, Box, Stack, Typography, IconButton, TextField,
  Button, Divider, Switch, FormControlLabel
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useFormik } from "formik";
import * as yup from "yup";
import { useEffect } from "react";
import type { MenuCategory } from "../../../../@types/dto/MenuCategory";

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Partial<MenuCategory>;
  onSubmit: (data: MenuCategory) => Promise<void> | void;
  isLoading?: boolean;
};

const schema = yup.object({
  name: yup.string().trim().required("กรุณากรอกชื่อหมวดหมู่"),
  slug: yup.string().trim().required("กรุณากรอก slug"),
  isUsed: yup.boolean().required(),
});

const toSlug = (s: string) =>
  s.trim().toLowerCase().replace(/[^a-z0-9ก-๙\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

export default function FormCategory({ open, onClose, initial, onSubmit, isLoading = false }: Props) {
  const formik = useFormik<MenuCategory>({
    initialValues: {
      id: initial?.id ?? 0,
      name: initial?.name ?? "",
      slug: initial?.slug ?? "",
      isUsed: initial?.isUsed ?? true,
      isDeleted: initial?.isDeleted ?? false,
    } as MenuCategory,
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await onSubmit(values);
        onClose();
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting } = formik;

  useEffect(() => {
    if (!initial?.id && values.name && !touched.slug && !values.slug) {
      setFieldValue("slug", toSlug(values.name), false);
    }
  }, [values.name, touched.slug, values.slug, initial?.id, setFieldValue]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: 1, sm: 440 },
          maxWidth: 560,
        },
      }}
    >
      <Box component="form" onSubmit={formik.handleSubmit} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2, pt: "calc(env(safe-area-inset-top) + 8px)" }}>
          <Typography variant="h6" fontWeight={800}>{values.id ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่"}</Typography>
          <IconButton onClick={onClose} disabled={isSubmitting}><CloseIcon /></IconButton>
        </Stack>
        <Divider />

        <Stack spacing={2} sx={{ p: 2, pb: 3, flex: 1, overflow: "auto" }}>
          <TextField label="ชื่อหมวดหมู่" name="name" value={values.name} onChange={handleChange}
            onBlur={handleBlur} error={touched.name && !!errors.name} helperText={touched.name && errors.name} fullWidth />
          <TextField label="Slug" name="slug" value={values.slug} onChange={handleChange} onBlur={handleBlur}
            error={touched.slug && !!errors.slug} helperText={(touched.slug && errors.slug) || "ใช้สำหรับ URL / อ้างอิงระบบ"} fullWidth />
          <FormControlLabel control={<Switch name="isUsed" checked={values.isUsed} onChange={handleChange} />}
            label={values.isUsed ? "แสดงผล (Active)" : "ซ่อน (Inactive)"} />
        </Stack>

        <Divider />
        <Stack direction="row" spacing={1} sx={{
          p: 2,
          position: "sticky",
          bottom: 0,
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderColor: "divider",
          pb: "calc(env(safe-area-inset-bottom) + 8px)",
        }}>
          <Button onClick={onClose} variant="text" fullWidth disabled={isSubmitting}>ยกเลิก</Button>
          <Button type="submit" variant="contained" fullWidth disabled={isSubmitting || isLoading}>บันทึก</Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
