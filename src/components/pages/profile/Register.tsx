/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Divider,
  Stack,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Facebook,
  Google,
  KeyboardArrowDown,
} from "@mui/icons-material";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useRegisterMutation } from "../../../services/authApi";
import { useFormik } from "formik";
import { registerValidate } from "../../../helpers/validationSchema";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [register, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const formik = useFormik({
    initialValues: {
      userName: "",
      email: "",
      phoneNumber: "",
      password: "",
    },
    validationSchema: registerValidate,
    onSubmit: async (values) => {
      try {
        const payload = {
          userName: values.userName,
          email: values.email,
          phoneNumber: values.phoneNumber,
          password: values.password,
        };

        await register(payload).unwrap();

        setApiError("");
        setSuccessMsg("สมัครสมาชิกสำเร็จ! กำลังพาไปหน้าเข้าสู่ระบบ...");
        setTimeout(() => {
          navigate("/login");
        }, 800);
      } catch (err: any) {
        console.error("Register Failed:", err);
        setSuccessMsg("");
        setApiError(
          err?.data?.message || err?.message || "สมัครสมาชิกไม่สำเร็จ"
        );
      }
    },
  });

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: { xs: 2, sm: 4 },
          marginBottom: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "none",
          padding: 0,
          borderRadius: 0,
          bgcolor: "transparent",
        }}
      >
        {/* 1. Logo Section */}
        <RestaurantMenuIcon
          sx={{
            fontSize: { xs: 50, sm: 60 },
            color: "#D32F2F",
            mb: 1,
          }}
        />

        <Typography
          component="h1"
          variant="h5"
          sx={{ fontWeight: "bold", textAlign: "center" }}
        >
          Create an account
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mb: 3, textAlign: "center" }}
        >
          Connect with your friends today!
        </Typography>

        <Box
          component="form"
          noValidate
          sx={{ width: "100%" }}
          onSubmit={formik.handleSubmit}
        >
          {/* 3. Email */}
          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
            Email
          </Typography>
          <TextField
            fullWidth
            id="email"
            placeholder="example@gmail.com"
            type="email"
            {...formik.getFieldProps("email")}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            variant="outlined"
            sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
          />

          {/* 2. UserName */}
          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
            UserName
          </Typography>
          <TextField
            fullWidth
            id="userName"
            placeholder="Enter your username"
            {...formik.getFieldProps("userName")}
            error={formik.touched.userName && Boolean(formik.errors.userName)}
            helperText={formik.touched.userName && formik.errors.userName}
            name="userName"
            variant="outlined"
            sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
          />

          {/* 4. Phone Number */}
          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
            Phone number
          </Typography>
          <TextField
            fullWidth
            id="phoneNumber"
            placeholder="XXX XXX XXXX"
            {...formik.getFieldProps("phoneNumber")}
            error={
              formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)
            }
            helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
            name="phoneNumber"
            variant="outlined"
            sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      py: 0.5,
                    }}
                  >
                    <span style={{ fontSize: "1.2rem", marginRight: 4 }}>
                      🇹🇭
                    </span>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "bold", color: "text.primary" }}
                    >
                      +66
                    </Typography>

                    <KeyboardArrowDown
                      fontSize="small"
                      sx={{ color: "text.secondary", ml: 0.5 }}
                    />
                    <Divider
                      orientation="vertical"
                      flexItem
                      sx={{ mx: 1, height: 20, my: "auto" }}
                    />
                  </Box>
                </InputAdornment>
              ),
            }}
          />

          {/* 5. Password */}
          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
            Password
          </Typography>
          <TextField
            fullWidth
            placeholder="Enter your password"
            type={showPassword ? "text" : "password"}
            {...formik.getFieldProps("password")}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            id="password"
            variant="outlined"
            sx={{ mb: 3, "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowPassword}
                    edge="end"
                    size="large"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* ERROR / SUCCESS */}
          {apiError && (
            <Typography
              color="error"
              sx={{ textAlign: "center", mb: 1, fontWeight: "bold" }}
            >
              {apiError}
            </Typography>
          )}
          {successMsg && (
            <Typography
              color="success.main"
              sx={{ textAlign: "center", mb: 1, fontWeight: "bold" }}
            >
              {successMsg}
            </Typography>
          )}

          {/* 6. Sign Up Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{
              mb: 3,
              bgcolor: "#D32F2F",
              height: 50,
              fontSize: "1rem",
              borderRadius: 1,
              textTransform: "none",
              "&:hover": {
                bgcolor: "#b71c1c",
              },
            }}
          >
            {isLoading ? "กำลังสมัครสมาชิก..." : "Sign Up"}
          </Button>

          {/* 7. Divider */}
          <Divider sx={{ mb: 3, color: "text.secondary" }}>Or with</Divider>

          {/* 8. Social Buttons */}
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            sx={{ mb: 4 }}
          >
            <IconButton
              size="large"
              sx={{ border: "1px solid #ddd", width: 50, height: 50 }}
            >
              <Facebook sx={{ color: "#1877F2" }} />
            </IconButton>
            <IconButton
              size="large"
              sx={{ border: "1px solid #ddd", width: 50, height: 50 }}
            >
              <Google sx={{ color: "#DB4437" }} />
            </IconButton>
          </Stack>

          {/* 9. Footer Link to Login */}
          <Typography
            variant="body2"
            align="center"
            sx={{ color: "text.secondary" }}
          >
            Already have an account ?{" "}
            <Link
              component={RouterLink}
              to="/login"
              variant="body2"
              sx={{
                color: "#D32F2F",
                fontWeight: "bold",
                textDecoration: "none",
                display: "inline-block",
                p: 0.5,
              }}
            >
              Log in
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
