/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
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
} from "@mui/icons-material";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../hooks/useAppHookState";
import { useLoginMutation } from "../../../services/authApi";
import { useLinkGuestOrdersMutation } from "../../../services/orderApi"; // 🚀 1. Import มา
import type { RegisterResponse } from "../../../@types/Responsts/RegisterResponse";
import type { SD_Roles } from "../../../@types/Enum";
import { useFormik } from "formik";
import { setCredentials } from "../../../stores/slices/authSlice";
import { loginValidate } from "../../../helpers/validationSchema";
import { jwtDecode } from "jwt-decode";
import { storage } from "../../../helpers/storageHelper";
import { signalRService } from "../../../services/signalrService";

interface DecodedToken extends RegisterResponse {
  role: SD_Roles;
}

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [login, { isLoading }] = useLoginMutation();
  const [linkGuestOrders] = useLinkGuestOrdersMutation(); // 🚀 2. เรียกใช้ Mutation Hook

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");

  const from = (location.state as any)?.from?.pathname || "/";

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const formik = useFormik({
    initialValues: {
      userName: "",
      password: "",
    },
    validationSchema: loginValidate,
    onSubmit: async (values) => {
      try {
        const result = await login(values).unwrap();
        const decoded = jwtDecode(result.token) as DecodedToken;

        // --- 1. จัดการ Storage ---
        if (rememberMe) {
          await storage.set("token", result.token);
        } else {
          localStorage.setItem("token", result.token);
        }

        // --- 2. Redux State ---
        dispatch(
          setCredentials({
            userId: decoded.userId,
            userName: decoded.userName,
            email: decoded.email,
            phoneNumber: decoded.phoneNumber,
            role: decoded.role,
            token: result.token,
          }),
        );

        // --- ⭐ 3. เชื่อมโยงออเดอร์ Guest (ปลุกให้ตื่นตรงนี้!) ---
        const guestToken = localStorage.getItem("guestToken");
        if (guestToken && decoded.userId) {
          console.log("🔗 Connecting guest orders to user...");
          // เรียกใช้งาน linkGuestOrders เพื่อผูกออเดอร์ในฐานข้อมูล
          await linkGuestOrders({
            userId: decoded.userId,
            guestToken: guestToken,
          }).unwrap();
        }

        // --- 4. สั่ง Reconnect SignalR ---
        await signalRService.reconnect();

        setApiError("");
        navigate(from, { replace: true });
      } catch (err: any) {
        console.log("Login Failed:", err);
        setApiError(err?.data?.message || "เข้าสู่ระบบไม่สำเร็จ");
      }
    },
  });

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: { xs: 2, sm: 4 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "none",
          padding: 0,
          borderRadius: 0,
          bgcolor: "transparent",
        }}
      >
        <RestaurantMenuIcon
          sx={{ fontSize: { xs: 50, sm: 60 }, color: "#D32F2F", mb: 1 }}
        />

        <Typography
          component="h1"
          variant="h5"
          sx={{ fontWeight: "bold", mb: 3, textAlign: "center" }}
        >
          Get back to your account
        </Typography>

        <Box
          component="form"
          noValidate
          sx={{ width: "100%" }}
          onSubmit={formik.handleSubmit}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
            UserName
          </Typography>
          <TextField
            fullWidth
            id="userName"
            placeholder="example"
            {...formik.getFieldProps("userName")}
            error={formik.touched.userName && Boolean(formik.errors.userName)}
            helperText={formik.touched.userName && formik.errors.userName}
            name="userName"
            autoComplete="username"
            sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
          />

          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
            Password
          </Typography>
          <TextField
            fullWidth
            id="password"
            placeholder="Enter your password"
            type={showPassword ? "text" : "password"}
            {...formik.getFieldProps("password")}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            autoComplete="current-password"
            sx={{ mb: 1, "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
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

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2, flexWrap: "wrap" }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={() => setRememberMe((v) => !v)}
                />
              }
              label="Remember Me"
            />
            <Link
              href="#"
              variant="body2"
              underline="hover"
              sx={{ color: "text.secondary", fontWeight: "bold" }}
            >
              Forgot Password?
            </Link>
          </Stack>

          {apiError && (
            <Typography
              color="error"
              sx={{ textAlign: "center", mb: 2, fontWeight: "bold" }}
            >
              {apiError}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{
              mt: 1,
              mb: 3,
              bgcolor: "#D32F2F",
              height: 50,
              fontSize: "1rem",
              borderRadius: 1,
              textTransform: "none",
              "&:hover": { bgcolor: "#b71c1c" },
            }}
          >
            {isLoading ? "กำลังเข้าสู่ระบบ..." : "Log In"}
          </Button>

          <Divider sx={{ mb: 3, color: "text.secondary" }}>Or with</Divider>

          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            sx={{ mb: 4 }}
          >
            <IconButton
              sx={{ border: "1px solid #ddd", width: 50, height: 50 }}
              size="large"
            >
              <Facebook sx={{ color: "#1877F2" }} />
            </IconButton>
            <IconButton
              sx={{ border: "1px solid #ddd", width: 50, height: 50 }}
              size="large"
            >
              <Google sx={{ color: "#DB4437" }} />
            </IconButton>
          </Stack>

          <Typography
            variant="body2"
            align="center"
            sx={{ color: "text.secondary" }}
          >
            Don't have an account ?
            <Link
              component={RouterLink}
              to="/register"
              variant="body2"
              sx={{
                color: "#D32F2F",
                fontWeight: "bold",
                textDecoration: "none",
                display: "inline-block",
                p: 0.5,
              }}
            >
              Sign Up
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
