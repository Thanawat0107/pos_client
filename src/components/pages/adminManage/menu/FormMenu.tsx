import {
  Drawer, Box, Stack, Typography, IconButton, TextField, Button, Divider, Switch,
  FormControlLabel,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useFormik } from "formik";
import { menuSchema } from "../validation";
import type { MenuCategory } from "../../../../@types/dto/MenuCategory";
import type { MenuItemDto } from "../../../../@types/dto/MenuItem";

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Partial<MenuItemDto>;
  categories: MenuCategory[];
  onSubmit: (data: MenuItemDto) => Promise<void> | void;
};

export default function FormMenu({ open, onClose, initial, categories, onSubmit }: Props) {
  const formik = useFormik<MenuItemDto>({
    initialValues: {
      id: initial?.id,
      name: initial?.name ?? "",
      basePrice: initial?.basePrice ?? 0,
      categoryId: initial?.categoryId ?? "",
      imageUrl: initial?.imageUrl ?? "",
      description: initial?.description ?? "",
      isActive: initial?.isActive ?? true,
    },
    enableReinitialize: true,
    validationSchema: menuSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await onSubmit(values);
        onClose();
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { values, errors, touched, handleChange, handleBlur, isSubmitting } = formik;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: 1, sm: 440 }, // มือถือเต็มจอ
          maxWidth: 560,
        },
      }}
    >
      <Box component="form" onSubmit={formik.handleSubmit} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2, pt: "calc(env(safe-area-inset-top) + 8px)" }}>
          <Typography variant="h6" fontWeight={800}>{values.id ? "แก้ไขเมนู" : "เพิ่มเมนูใหม่"}</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Stack>
        <Divider />

        {/* Body */}
        <Stack spacing={2} sx={{ p: 2, pb: 3, flex: 1, overflow: "auto" }}>
          <TextField
            label="ชื่อเมนู"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.name && Boolean(errors.name)}
            helperText={touched.name && errors.name}
            fullWidth
          />

          <TextField
            label="ราคา"
            name="price"
            type="number"
            inputMode="decimal" // 👈 มือถือขึ้นคีย์บอร์ดตัวเลข
            inputProps={{ min: 0, step: "0.01" }}
            value={values.basePrice}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.basePrice && Boolean(errors.basePrice)}
            helperText={touched.basePrice && errors.basePrice}
            fullWidth
          />

          <TextField
            select
            label="หมวดหมู่"
            name="menuCategoryId"
            value={values.menuCategoryId}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.menuCategoryId && Boolean(errors.menuCategoryId)}
            helperText={touched.menuCategoryId && errors.menuCategoryId}
            fullWidth
          >
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="ลิงก์รูป (URL)"
            name="image"
            value={values.imageUrl}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.imageUrl && Boolean(errors.imageUrl)}
            helperText={(touched.imageUrl && errors.imageUrl) || "ใส่ไว้ก่อนก็ได้ ปรับทีหลังได้"}
            fullWidth
          />

          <TextField
            label="รายละเอียด"
            name="description"
            multiline rows={3}
            value={values.description}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.description && Boolean(errors.description)}
            helperText={touched.description && errors.description}
            fullWidth
          />

          <FormControlLabel
            control={<Switch name="isActive" checked={values.isUsed && !values.isDeleted} onChange={handleChange} />}
            label={values.isUsed && !values.isDeleted ? "แสดงในเมนู (Active)" : "ซ่อนจากเมนู (Inactive)"}
          />
        </Stack>

        {/* Footer sticky buttons */}
        <Divider />
        <Stack
          direction="row"
          spacing={1}
          sx={{
            p: 2,
            position: "sticky",
            bottom: 0,
            bgcolor: "background.paper",
            borderTop: "1px solid",
            borderColor: "divider",
            pb: "calc(env(safe-area-inset-bottom) + 8px)", // เคารพ safe-area
          }}
        >
          <Button onClick={onClose} variant="text" fullWidth>ยกเลิก</Button>
          <Button type="submit" variant="contained" fullWidth disabled={isSubmitting}>บันทึก</Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
