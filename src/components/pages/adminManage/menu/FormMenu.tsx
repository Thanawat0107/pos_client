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
import { useRef, useState } from "react";
import { menuSchema } from "../validation";
import type { MenuItemDto } from "../../../../@types/dto/MenuItem";
import type { MenuCategory } from "../../../../@types/dto/MenuCategory";
import type { CreateMenuItem } from "../../../../@types/createDto/createMenuItem";

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: MenuItemDto;
  categories: MenuCategory[];
  onSubmit: (
    data: CreateMenuItem,
    id?: number,
    isUsed?: boolean
  ) => Promise<void> | void;
};

export default function FormMenu({
  open,
  onClose,
  initial,
  categories,
  onSubmit,
}: Props) {
  // สถานะ active/inactive
  const isUsed = initial ? initial.isUsed && !initial.isDeleted : true;
  const [usedState, setUsedState] = useState(isUsed);

  // สำหรับ preview รูปภาพ
  const [imagePreview, setImagePreview] = useState<string | null>(
    initial?.imageUrl || null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formik = useFormik<CreateMenuItem>({
    initialValues: {
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      basePrice: initial?.basePrice ?? 0,
      imageUrl: initial?.imageUrl ?? "",
      imageFile: undefined,
      menuCategoryId: initial?.menuCategoryId ?? 0,
      menuItemOptionGroups: initial?.menuItemOptionGroups ?? [],
    },
    enableReinitialize: true,
    validationSchema: menuSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const submitData: CreateMenuItem = {
          ...values,
        };

        // ส่ง usedState เป็นพารามิเตอร์ที่ 3
        await onSubmit(submitData, initial?.id, usedState);
        handleClose();
      } catch (error) {
        console.error("Submit error:", error);
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
    isSubmitting,
    setFieldValue,
  } = formik;

  const handleClose = () => {
    formik.resetForm();
    setImagePreview(null);
    setUsedState(true);
    onClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ตรวจสอบประเภทไฟล์
    if (!file.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }

    // ตรวจสอบขนาดไฟล์ (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("ขนาดไฟล์ต้องไม่เกิน 5 MB");
      return;
    }

    // ตั้งค่า File object
    setFieldValue("imageFile", file);

    // สร้าง preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFieldValue("imageFile", undefined);
    setFieldValue("imageUrl", "");
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
          {/* Image Upload Section - เพิ่มส่วนนี้ */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              รูปภาพเมนู (อัปโหลด)
            </Typography>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />

            {imagePreview ? (
              <Box
                sx={{
                  position: "relative",
                  borderRadius: 1,
                  overflow: "hidden",
                }}
              >
                <img
                  src={imagePreview}
                  alt="Menu preview"
                  style={{
                    width: "100%",
                    height: 200,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <IconButton
                  onClick={handleRemoveImage}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    bgcolor: "background.paper",
                    "&:hover": { bgcolor: "background.paper" },
                  }}
                  size="small"
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            ) : (
              <Button
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                fullWidth
                sx={{ height: 100, borderStyle: "dashed" }}
              >
                <Stack alignItems="center" spacing={0.5}>
                  <Typography variant="body2">คลิกเพื่อเลือกรูปภาพ</Typography>
                  <Typography variant="caption" color="text.secondary">
                    รองรับ JPG, PNG (ไม่เกิน 5 MB)
                  </Typography>
                </Stack>
              </Button>
            )}
          </Box>

          <TextField
            label="ชื่อเมนู"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.name && Boolean(errors.name)}
            helperText={touched.name && errors.name}
            fullWidth
            autoFocus
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

          {/* Switch สำหรับสถานะ - แสดงทั้งตอนสร้างและแก้ไข */}
          <FormControlLabel
            control={
              <Switch
                checked={usedState}
                onChange={(e) => setUsedState(e.target.checked)}
                color="success"
              />
            }
            label={
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  {usedState ? "แสดงในเมนู (Active)" : "ซ่อนจากเมนู (Inactive)"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {usedState
                    ? "เมนูนี้จะปรากฏให้ลูกค้าเห็น"
                    : "เมนูนี้จะถูกซ่อนจากลูกค้า"}
                </Typography>
              </Box>
            }
          />

          {/* แสดงวันที่สร้าง/แก้ไข (ถ้ามี) */}
          {initial && (
            <Box sx={{ p: 1.5, bgcolor: "action.hover", borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                <strong>สร้างเมื่อ:</strong>{" "}
                {new Date(initial.createdAt).toLocaleString("th-TH")}
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                <strong>แก้ไขล่าสุด:</strong>{" "}
                {new Date(initial.updatedAt).toLocaleString("th-TH")}
              </Typography>
            </Box>
          )}
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
          <Button
            onClick={handleClose}
            variant="text"
            fullWidth
            disabled={isSubmitting}
          >
            ยกเลิก
          </Button>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSubmitting}
          >
            {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
