/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
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
} from '@mui/material';
import { Visibility, VisibilityOff, Facebook, Google } from '@mui/icons-material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from '../../../hooks/useAppHookState';
import { useLoginMutation } from '../../../services/authApi';
import type { RegisterResponse } from '../../../@types/Responsts/RegisterResponse';
import type { SD_Roles } from '../../../@types/Enum';
import { useFormik } from 'formik';
import { setCredentials } from '../../../stores/slices/authSlice';
import { loginValidate } from '../../../helpers/validationSchema';
import { jwtDecode } from 'jwt-decode';
import { storage } from '../../../helpers/storageHelper';
import { signalRService } from '../../../services/signalrService';

interface DecodedToken extends RegisterResponse {
  role: SD_Roles;
}
export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [login, { isLoading }] = useLoginMutation();

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
          // ⚠️ สำคัญ: ถึงไม่ Remember Me ก็ต้องใส่ Token ลง LocalStorage ชั่วคราว
          // เพราะ SignalRService ของเราอ่านจาก localStorage.getItem("token")
          // ไม่อย่างนั้น SignalR จะต่อแบบ Anonymous (Admin จะกดปุ่มไม่ได้)
          localStorage.setItem("token", result.token);

          // หรือถ้าใช้ storage wrapper ของคุณก็อาจจะเป็น:
          // await storage.set("token", result.token);
          // แต่ตั้ง expiration เป็น session แทน (แล้วแต่ lib ที่ใช้)
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

        // --- ⭐ 3. สั่ง Reconnect SignalR ---
        // ขั้นตอนนี้จะปิด connection เก่า (ถ้ามี) และต่อใหม่พร้อมแนบ Token ที่เพิ่งได้มา
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
    // เปลี่ยน maxWidth เป็น sm เพื่อให้บน Tablet/PC มีพื้นที่กว้างขึ้นเล็กน้อยและดูสมส่วน
    <Container component="main" maxWidth="xs">
      {/* ใช้ Paper หรือ Box ที่ปรับแต่งเพื่อให้
        - บนมือถือ (xs): ไม่มีเงา (boxShadow: 'none')
        - บนจอใหญ่ (sm ขึ้นไป): มีเงา (boxShadow: 3) และมี padding
      */}
      <Box
        sx={{
          marginTop: { xs: 2, sm: 4 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "none", // ปิดเงาทุกกรณี
          padding: 0, // ปิด padding ของกล่อง (เนื้อหาจะชิดขอบ Container)
          borderRadius: 0, // ปิดขอบมน
          bgcolor: "transparent", // พื้นหลังใส (กลืนไปกับ Background หลัก)
        }}
      >
        {/* 1. Logo Section */}
        <RestaurantMenuIcon
          sx={{
            fontSize: { xs: 50, sm: 60 }, // ปรับขนาดตามหน้าจอ
            color: "#D32F2F",
            mb: 1,
          }}
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
          {/* 2. Email Field */}
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
            variant="outlined"
            // ปรับความสูง input ให้กดง่ายบนมือถือ
            sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
          />

          {/* 3. Password Field */}
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
            variant="outlined"
            sx={{ mb: 1, "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                    size="large" // เพิ่มขนาดปุ่มตาให้กดง่ายขึ้นบนมือถือ
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* 4. Remember Me & Forgot Password */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2, flexWrap: "wrap" }} // flexWrap ช่วยให้ถ้าจอมือถือเล็กมาก ตัวหนังสือจะไม่ทับกัน
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

          {/* 5. Login Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large" // ใช้ size large เพื่อ Touch target ที่ดีบนมือถือ
            disabled={isLoading}
            sx={{
              mt: 1,
              mb: 3,
              bgcolor: "#D32F2F",
              height: 50, // Fix height ให้อยู่ระดับที่นิ้วโป้งกดง่าย
              fontSize: "1rem",
              borderRadius: 1,
              textTransform: "none", // ให้ตัวอักษรดูทันสมัย (ไม่เป็นตัวใหญ่ทั้งหมด)
              "&:hover": {
                bgcolor: "#b71c1c",
              },
            }}
          >
            {isLoading ? "กำลังเข้าสู่ระบบ..." : "Log In"}
          </Button>

          {/* 6. Divider */}
          <Divider sx={{ mb: 3, color: "text.secondary" }}>Or with</Divider>

          {/* 7. Social Buttons */}
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            sx={{ mb: 4 }}
          >
            <IconButton
              sx={{ border: "1px solid #ddd", width: 50, height: 50 }}
              aria-label="facebook"
              size="large"
            >
              <Facebook sx={{ color: "#1877F2" }} />
            </IconButton>
            <IconButton
              sx={{ border: "1px solid #ddd", width: 50, height: 50 }}
              aria-label="google"
              size="large"
            >
              <Google sx={{ color: "#DB4437" }} />
            </IconButton>
          </Stack>

          {/* 8. Footer */}
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
                // เพิ่มพื้นที่สัมผัสสำหรับการกดลิงก์บนมือถือ
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