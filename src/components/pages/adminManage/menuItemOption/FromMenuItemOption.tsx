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
  FormControlLabel,
  Paper,
  Chip,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useFormik, FieldArray, FormikProvider } from "formik";
import type { CreateMenuItemOption } from "../../../../@types/createDto/CreateMenuItemOption";
import type { MenuItemOption } from "../../../../@types/dto/MenuItemOption";
import type { UpdateMenuItemOption } from "../../../../@types/UpdateDto/UpdateMenuItemOption";
import { optionSchema } from "../../../../helpers/validationSchema";

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Partial<MenuItemOption>;
  onSubmit: (
    data: CreateMenuItemOption | UpdateMenuItemOption
  ) => Promise<void> | void;
  isLoading?: boolean;
};

export default function FormMenuItemOption({
  open,
  onClose,
  initial,
  onSubmit,
  isLoading = false,
}: Props) {
  const formik = useFormik({
    initialValues: {
      id: initial?.id ?? 0,
      name: initial?.name ?? "",
      isRequired: initial?.isRequired ?? false,
      isMultiple: initial?.isMultiple ?? false,
      isUsed: initial?.isUsed ?? true,
      menuItemOptionDetail: initial?.menuOptionDetails?.map((d) => ({
        id: d.id,
        name: d.name,
        price: d.extraPrice,
        isUsed: d.isUsed ?? true,
      })) ?? [{ id: 0, name: "", price: 0, isUsed: true }],
    },
    enableReinitialize: true,
    validationSchema: optionSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const {
          id,
          name,
          isRequired,
          isMultiple,
          isUsed,
          menuItemOptionDetail,
        } = values;
        const details = menuItemOptionDetail
          .filter((d) => d.isUsed)
          .map((d) => ({
            ...(id &&
              d.id && { id: d.id, menuItemOptionId: id, isUsed: d.isUsed }),
            name: d.name,
            extraPrice: d.price,
          }));

        await onSubmit({
          ...(id && { id, isUsed }),
          name,
          isRequired,
          isMultiple,
          menuItemOptionDetail: details,
        } as CreateMenuItemOption | UpdateMenuItemOption);

        onClose();
      } finally {
        setSubmitting(false);
      }
    },
  });

  const { values, errors, touched, handleChange, handleBlur, isSubmitting } =
    formik;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: 1, sm: 520 },
          maxWidth: 640,
        },
      }}
    >
      <FormikProvider value={formik}>
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ p: 2, pt: "calc(env(safe-area-inset-top) + 8px)" }}
          >
            <Typography variant="h6" fontWeight={800}>
              {values.id ? "แก้ไขตัวเลือก" : "เพิ่มตัวเลือก"}
            </Typography>
            <IconButton onClick={onClose} disabled={isSubmitting}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Divider />

          {/* Body */}
          <Stack spacing={2.5} sx={{ p: 2, pb: 3, flex: 1, overflow: "auto" }}>
            {/* ชื่อกลุ่ม */}
            <TextField
              label="ชื่อกลุ่มตัวเลือก"
              name="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.name && !!errors.name}
              helperText={
                (touched.name && errors.name) || "เช่น ระดับความหวาน, ท็อปปิ้ง"
              }
              fullWidth
            />

            {/* Switches */}
            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Switch
                    name="isRequired"
                    checked={values.isRequired}
                    onChange={handleChange}
                  />
                }
                label={
                  <Stack>
                    <Typography variant="body2" fontWeight={600}>
                      {values.isRequired ? "บังคับเลือก" : "ไม่บังคับเลือก"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ลูกค้าจำเป็นต้องเลือกหรือไม่
                    </Typography>
                  </Stack>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    name="isMultiple"
                    checked={values.isMultiple}
                    onChange={handleChange}
                  />
                }
                label={
                  <Stack>
                    <Typography variant="body2" fontWeight={600}>
                      {values.isMultiple
                        ? "เลือกได้หลายรายการ"
                        : "เลือกได้ 1 รายการ"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Checkbox หรือ Radio
                    </Typography>
                  </Stack>
                }
              />

              {values.id && (
                <FormControlLabel
                  control={
                    <Switch
                      name="isUsed"
                      checked={values.isUsed}
                      onChange={handleChange}
                    />
                  }
                  label={values.isUsed ? "แสดงผล (Active)" : "ซ่อน (Inactive)"}
                />
              )}
            </Stack>

            <Divider />

            {/* รายละเอียดตัวเลือก */}
            <Stack spacing={1.5}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="subtitle2" fontWeight={700}>
                  รายการตัวเลือก
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() =>
                    formik.setFieldValue("menuItemOptionDetail", [
                      ...values.menuItemOptionDetail,
                      { name: "", price: 0, isUsed: true },
                    ])
                  }
                >
                  เพิ่มรายการ
                </Button>
              </Stack>

              <FieldArray name="menuItemOptionDetail">
                {({ remove }) => (
                  <Stack spacing={1.5}>
                    {values.menuItemOptionDetail.map((detail, index) => (
                      <Paper
                        key={index}
                        variant="outlined"
                        sx={{ p: 1.5, borderRadius: 2 }}
                      >
                        <Stack spacing={1.5}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Chip
                              size="small"
                              label={`#${index + 1}`}
                              sx={{ fontWeight: 700 }}
                            />
                            {values.menuItemOptionDetail.length > 1 && (
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => remove(index)}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Stack>

                          <TextField
                            label="ชื่อตัวเลือก"
                            name={`menuItemOptionDetail.${index}.name`}
                            value={detail.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={
                              touched.menuItemOptionDetail?.[index]?.name &&
                              !!(errors.menuItemOptionDetail as any)?.[index]
                                ?.name
                            }
                            helperText={
                              touched.menuItemOptionDetail?.[index]?.name &&
                              (errors.menuItemOptionDetail as any)?.[index]
                                ?.name
                            }
                            size="small"
                            fullWidth
                          />

                          <TextField
                            label="ราคาเพิ่ม"
                            name={`menuItemOptionDetail.${index}.price`}
                            type="number"
                            value={detail.price}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={
                              touched.menuItemOptionDetail?.[index]?.price &&
                              !!(errors.menuItemOptionDetail as any)?.[index]
                                ?.price
                            }
                            helperText={
                              touched.menuItemOptionDetail?.[index]?.price &&
                              (errors.menuItemOptionDetail as any)?.[index]
                                ?.price
                            }
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  บาท
                                </InputAdornment>
                              ),
                            }}
                            size="small"
                            fullWidth
                          />

                          {detail.id && (
                            <FormControlLabel
                              control={
                                <Switch
                                  name={`menuItemOptionDetail.${index}.isUsed`}
                                  checked={detail.isUsed}
                                  onChange={handleChange}
                                  size="small"
                                />
                              }
                              label={
                                <Typography variant="caption">
                                  {detail.isUsed ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                                </Typography>
                              }
                            />
                          )}
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </FieldArray>

              {typeof errors.menuItemOptionDetail === "string" && (
                <Typography variant="caption" color="error">
                  {errors.menuItemOptionDetail}
                </Typography>
              )}
            </Stack>
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
              onClick={onClose}
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
              disabled={isSubmitting || isLoading}
            >
              บันทึก
            </Button>
          </Stack>
        </Box>
      </FormikProvider>
    </Drawer>
  );
}
