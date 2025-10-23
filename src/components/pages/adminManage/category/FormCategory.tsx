import * as React from "react";
import {
  Drawer, Box, Stack, Typography, IconButton, TextField,
  Button, Divider, Switch, FormControlLabel
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useFormik } from "formik";
import * as yup from "yup";

export type CategoryEntity = {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Partial<CategoryEntity>;
  onSubmit: (data: CategoryEntity) => Promise<void> | void;
};

const schema = yup.object({
  name: yup.string().trim().required("กรุณากรอกชื่อหมวดหมู่"),
  slug: yup.string().trim().required("กรุณากรอก slug"),
  description: yup.string().nullable().optional(),
  displayOrder: yup.number().min(0).required(),
  isActive: yup.boolean().required(),
});

const toSlug = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9ก-๙\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default function FormCategory({ open, onClose, initial, onSubmit }: Props) {
  const formik = useFormik<CategoryEntity>({
    initialValues: {
      id: initial?.id,
      name: initial?.name ?? "",
      slug: initial?.slug ?? "",
      description: initial?.description ?? "",
      displayOrder: initial?.displayOrder ?? 0,
      isActive: initial?.isActive ?? true,
    },
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

  React.useEffect(() => {
    if (!initial?.id && values.name && !touched.slug && !values.slug) {
      setFieldValue("slug", toSlug(values.name), false);
    }
  }, [values.name, touched.slug, values.slug, initial?.id, setFieldValue]);

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: 1, sm: 420 } } }}>
      <Box component="form" onSubmit={formik.handleSubmit} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={800}>{values.id ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่"}</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Stack>
        <Divider />

        <Stack spacing={2} sx={{ p: 2, pb: 3, flex: 1, overflow: "auto" }}>
          <TextField
            label="ชื่อหมวดหมู่"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.name && Boolean(errors.name)}
            helperText={touched.name && errors.name}
            fullWidth
          />

          <TextField
            label="Slug"
            name="slug"
            value={values.slug}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.slug && Boolean(errors.slug)}
            helperText={(touched.slug && errors.slug) || "ใช้สำหรับ URL / อ้างอิงระบบ"}
            fullWidth
          />

          <TextField
            label="คำอธิบาย"
            name="description"
            value={values.description}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.description && Boolean(errors.description)}
            helperText={touched.description && errors.description}
            multiline rows={3} fullWidth
          />

          <TextField
            label="ลำดับแสดง (displayOrder)"
            name="displayOrder"
            type="number"
            inputProps={{ min: 0, step: 1 }}
            value={values.displayOrder}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.displayOrder && Boolean(errors.displayOrder)}
            helperText={touched.displayOrder && errors.displayOrder}
            fullWidth
          />

          <FormControlLabel
            control={<Switch name="isActive" checked={values.isActive} onChange={handleChange} />}
            label={values.isActive ? "แสดงผล (Active)" : "ซ่อน (Inactive)"}
          />
        </Stack>

        <Divider />
        <Stack direction="row" spacing={1} sx={{ p: 2 }}>
          <Button onClick={onClose} variant="text" fullWidth>ยกเลิก</Button>
          <Button type="submit" variant="contained" fullWidth disabled={isSubmitting}>บันทึก</Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
