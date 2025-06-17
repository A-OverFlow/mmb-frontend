import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useDispatch} from "react-redux";
import {logout, setAccessToken, setId, setNickname} from "../slices/authSlice";
import {Backdrop, Box, CircularProgress, Typography} from "@mui/material";
import axios from '../api/axios.js';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);

  // todo 이 로직이 지금 필요가 없음
  useEffect(() => {
    const handleAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('access_token');
      const isLogout = urlParams.get('logout');

      setOpenModal(true);

      if (isLogout !== null) {
        await axios.delete('/auth/refresh-token');
        dispatch(logout());
        navigate('/');
      }

      if (token) {
        dispatch(setAccessToken(token));
        try {
          const response = await axios.get("/members/me");
          const user = response.data;
          dispatch(setId(user.id));
          dispatch(setNickname(user.nickname));
          navigate('/');
        } catch (error) {
          console.error("Failed to fetch user data", error);
          navigate('/login');
        }
      }

      setOpenModal(false);
    };

    handleAuth();
  }, [dispatch, navigate]);

  useEffect(() => {
    // Google 로그인 초기화
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-login-button"),
        { theme: "outline", size: "large" }
      );
    }
  }, []);

  const handleCredentialResponse = async (response) => {
    const idToken = response.credential;

    setOpenModal(true);

    try {
      const loginResponse = await axios.post("/v1/auth/signup", {
        idToken,
      });

      const accessToken = loginResponse.data.accessToken;
      const refreshToken = loginResponse.data.refreshToken;

      dispatch(setAccessToken(accessToken));

      // todo 서버에서 쿠키로 설정하도록 협의
      //  reissue api도 토큰을 읽어서 처리하도록 협의
      // 7일간 유지
      document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=strict`;

      const userResponse = await axios.get("/v1/members/me");
      const user = userResponse.data;

      dispatch(setId(user.id));
      dispatch(setNickname(user.nickname));
      navigate('/');
    } catch (err) {
      console.error("Google login failed:", err);
      navigate('/login');
    } finally {
      setOpenModal(false);
    }
  };

  return (
    <>
      <Backdrop
        open={openModal}
        sx={{
          color: '#000',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Box
          sx={{
            backgroundColor: 'white',
            padding: 4,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress size={50}/>
          <Typography variant="h6" sx={{mt: 2}}>
            처리 중입니다...
          </Typography>
        </Box>
      </Backdrop>

      <Box textAlign="center" mt={5}>
        <Typography mb={5} variant="h5" gutterBottom>
          구글로 1초만에 로그인 🚀
        </Typography>
        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2}}>
          {/* Google 로그인 버튼이 여기에 렌더링됩니다 */}
          <div id="google-login-button"></div>
        </Box>
      </Box>
    </>
  );
};

export default Login;
