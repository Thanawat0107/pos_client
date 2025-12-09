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
  initial?: MenuItemOption;
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
    enableReinitialize: true,
    validationSchema: optionSchema,
    initialValues: {
      id: initial?.id ?? 0,
      name: initial?.name ?? "",
      isRequired: initial?.isRequired ?? false,
      isMultiple: initial?.isMultiple ?? false,
      isUsed: initial?.isUsed ?? true,
      menuOptionDetails: initial?.menuOptionDetails?.map((d) => ({
        id: d.id,
        name: d.name,
        extraPrice: d.extraPrice,
        isUsed: d.isUsed,
        menuItemOptionId: d.menuItemOptionId,
      })) ?? [
        { id: 0, name: "", extraPrice: 0, isUsed: true, menuItemOptionId: 0 },
      ],
    },

    onSubmit: async (values, { setSubmitting }) => {
      try {
        const cleanedDetails = values.menuOptionDetails.map((d) => ({
          // ถ้า Create: ไม่ต้องส่ง id, isUsed ก็ได้ (ตาม Interface) แต่ส่งไปก็ได้ถ้า Backend ไม่ strict
          // ถ้า Update: ต้องส่ง id, isUsed
          id: d.id,
          name: d.name,
          extraPrice: d.extraPrice,
          isUsed: d.isUsed ?? true, // Default true ไว้ก่อน
          menuItemOptionId: values.id, // ผูกกับ ID แม่
        }));

        // 2. สร้าง Payload โดยแยกกรณี Create / Update ตาม Interface
        let payload: CreateMenuItemOption | UpdateMenuItemOption;

        if (values.id && values.id !== 0) {
          // --- กรณี Update ---
          payload = {
            id: values.id,
            name: values.name,
            isRequired: values.isRequired,
            isMultiple: values.isMultiple,
            isUsed: values.isUsed,
            menuOptionDetails: cleanedDetails, // ส่งแบบ UpdateMenuOptionDetail[]
          } as UpdateMenuItemOption;
        } else {
          // --- กรณี Create ---
          payload = {
            name: values.name,
            isRequired: values.isRequired,
            isMultiple: values.isMultiple,
            // CreateMenuOptionDetail ต้องการแค่ name, extraPrice
            // (เราส่ง id, isUsed เกินไปนิดหน่อย แต่ปกติ Backend จะ ignore ให้ ถ้าไม่ ignore ต้อง map ตัดออก)
            menuOptionDetails: cleanedDetails.map((d) => ({
              name: d.name,
              extraPrice: d.extraPrice,
            })),
          } as CreateMenuItemOption;
        }

        await onSubmit(payload);
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
    isSubmitting,
    setFieldValue,
  } = formik;

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

              {!!values.id && (
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
                    setFieldValue("menuOptionDetails", [
                      ...values.menuOptionDetails,
                      { name: "", extraPrice: 0, isUsed: true },
                    ])
                  }
                >
                  เพิ่มรายการ
                </Button>
              </Stack>

              <FieldArray name="menuOptionDetails">
                {({ remove }) => (
                  <Stack spacing={1.5}>
                    {values.menuOptionDetails.map((detail, index) => (
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
                              label={`${index + 1}`}
                              sx={{ fontWeight: 700 }}
                            />
                            {values.menuOptionDetails.length > 1 && (
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
                            name={`menuOptionDetails.${index}.name`}
                            value={detail.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={
                              touched.menuOptionDetails?.[index]?.name &&
                              !!(errors.menuOptionDetails as any)?.[index]
                                ?.name
                            }
                            helperText={
                              touched.menuOptionDetails?.[index]?.name &&
                              (errors.menuOptionDetails as any)?.[index]
                                ?.name
                            }
                            size="small"
                            fullWidth
                          />

                          <TextField
                            label="ราคาเพิ่ม"
                            name={`menuOptionDetails.${index}.extraPrice`}
                            type="number"
                            value={detail.extraPrice}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={
                              touched.menuOptionDetails?.[index]
                                ?.extraPrice &&
                              !!(errors.menuOptionDetails as any)?.[index]
                                ?.extraPrice
                            }
                            helperText={
                              touched.menuOptionDetails?.[index]
                                ?.extraPrice &&
                              (errors.menuOptionDetails as any)?.[index]
                                ?.extraPrice
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

                          {!!detail.id && (
                            <FormControlLabel
                              control={
                                <Switch
                                  name={`menuOptionDetails.${index}.isUsed`}
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

              {typeof errors.menuOptionDetails === "string" && (
                <Typography variant="caption" color="error">
                  {errors.menuOptionDetails}
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
