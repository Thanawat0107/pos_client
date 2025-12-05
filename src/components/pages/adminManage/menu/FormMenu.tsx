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
  FormControlLabel,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useFormik } from "formik";
import { useState } from "react";
import { menuSchema } from "../validation";
import type { MenuItemDto } from "../../../../@types/dto/MenuItem";
import type { MenuCategory } from "../../../../@types/dto/MenuCategory";
import type { CreateMenuItem } from "../../../../@types/createDto/createMenuItem";

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: MenuItemDto;
  categories: MenuCategory[];
  onSubmit: (data: CreateMenuItem, id?: number) => Promise<void> | void;
};

export default function FormMenu({ open, onClose, initial, categories, onSubmit }: Props) {
  // สถานะ active/inactive
  const isActive = initial ? (initial.isUsed && !initial.isDeleted) : true;
  const [activeState, setActiveState] = useState(isActive);

  const formik = useFormik<CreateMenuItem>({
    initialValues: {
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      basePrice: initial?.basePrice ?? 0,
      imageUrl: initial?.imageUrl ?? "",
      menuCategoryId: initial?.menuCategoryId ?? 0,
      menuItemOptionGroups: initial?.menuItemOptionGroups ?? [],
    },
    enableReinitialize: true,
    validationSchema: menuSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await onSubmit(values, initial?.id);
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
          width: { xs: 1, sm: 440 },
          maxWidth: 560,
        },
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
            {initial ? "แก้ไขเมนู" : "เพิ่มเมนูใหม่"}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
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
            name="basePrice"
            type="number"
            inputMode="decimal"
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
            {categories
              .filter((c) => c.isUsed && !c.isDeleted)
              .map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
          </TextField>

          <TextField
            label="ลิงก์รูป (URL)"
            name="imageUrl"
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
            multiline
            rows={3}
            value={values.description}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.description && Boolean(errors.description)}
            helperText={touched.description && errors.description}
            fullWidth
          />

          <FormControlLabel
            control={
              <Switch 
                checked={activeState} 
                onChange={(e) => setActiveState(e.target.checked)} 
              />
            }
            label={activeState ? "แสดงในเมนู (Active)" : "ซ่อนจากเมนู (Inactive)"}
          />
        </Stack>

        {/* Footer */}
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
            pb: "calc(env(safe-area-inset-bottom) + 8px)",
          }}
        >
          <Button onClick={onClose} variant="text" fullWidth>
            ยกเลิก
          </Button>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSubmitting}
          >
            บันทึก
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}