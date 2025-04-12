import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useDispatch} from "react-redux";
import {setAccessToken, logout, setUserId, setUserNickname} from "../slices/authSlice"; // setUser 액션 임포트
import {Backdrop, Box, Button, CircularProgress, Typography} from "@mui/material";
import axios from '../api/axios.js'; // axios 임포트

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false); // 모달 오픈 상태 관리

  // 카카오 로그인 URL (카카오 앱 키와 리다이렉트 URI를 설정해야 함)
  const KAKAO_LOGIN_URL = import.meta.env.VITE_API_URL + "/oauth2/authorization/kakao"; // 서버에서 처리하는 카카오 로그인 URI

  useEffect(() => {
    const handleAuth = async () => {
      // 쿼리 파라미터에서 access_token과 logout 추출
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('access_token');
      const isLogout = urlParams.get('logout'); // 로그아웃 파라미터 확인

      setOpenModal(true); // 모달 오픈

      // 로그아웃 처리
      if (isLogout !== null) {
        // 서버에서 로그아웃 요청 (refreshToken 삭제)
        await axios.delete('/auth/refresh-token');
        dispatch(logout()); // 사용자 정보 초기화
        navigate('/');
      }

      // 로그인 처리
      if (token) {
        // 액세스 토큰이 있으면 Redux에 저장
        dispatch(setAccessToken(token));
        // 사용자 정보 받아오기
        try {
          const response = await axios.get("/users/me");
          const user = response.data; // 받아온 사용자 정보
          // 사용자 정보를 Redux에 저장
          dispatch(setUserId(user.id));
          dispatch(setUserNickname(user.nickname));
          // 메인 페이지로 리다이렉트
          navigate('/');
        } catch (error) {
          console.error("Failed to fetch user data", error);
          // 에러 처리 (예: 로그인 페이지로 리디렉션)
          navigate('/login');
        }
      }

      setOpenModal(false); // 모달 닫기
    };

    handleAuth();
  }, [dispatch, navigate]);

  return (
    <>
      {/* 전체 화면을 덮는 Backdrop */}
      <Backdrop
        open={openModal} // 모달이 열리면 true
        sx={{
          color: '#000', // 글씨 색을 검정색으로 설정
          zIndex: (theme) => theme.zIndex.drawer + 1, // 다른 요소들보다 위에 오도록 설정
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
          <CircularProgress size={50} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            처리 중입니다...
          </Typography>
        </Box>
      </Backdrop>

      {/* 로그인 페이지 UI */}
      <Box textAlign="center" mt={5}>
        <Typography variant="h3" gutterBottom>
          로그인 페이지
        </Typography>
        {/* 카카오 로그인 버튼 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Button
            variant="contained"
            color="warning"
            size="large"
            href={KAKAO_LOGIN_URL}
            sx={{
              width: 'auto', // 버튼 너비 자동 설정
              backgroundColor: "#FEE500",
              color: "#000000",
              "&:hover": {
                backgroundColor: "#E5D000",
              },
            }}
          >
            카카오로 로그인
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default Login;
