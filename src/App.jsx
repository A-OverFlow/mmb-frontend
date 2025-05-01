// src/App.jsx
import React, {useEffect, useState} from 'react';
import {Provider, useDispatch} from 'react-redux';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import store from './store';
import axios from './api/axios'; // Axios 기본 설정 파일
import {setAccessToken, setUserId, setUserNickname} from './slices/authSlice'; // 액세스 토큰 설정 액션
import AlertNotification from './components/AlertNotification.jsx';
import Home from './pages/Home';
import Login from './pages/Login';
import Navbar from "./components/Navbar.jsx";
import MyInfo from "./pages/MyInfo.jsx";
import QnA from "./pages/QnA.jsx";

const AppContent = () => {
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  // 쿠키 파싱 함수
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const refreshToken = getCookie('refreshToken');
        if (refreshToken === null) return;

        const response = await axios.post('/v1/auth/reissue', {refreshToken: refreshToken});
        if (response.data && response.data.accessToken) {

          dispatch(setAccessToken(response.data.accessToken)); // Redux에 저장

          // todo 서버에서 쿠키로 설정하도록 협의
          //  reissue api도 토큰을 읽어서 처리하도록 협의
          // 7일간 유지
          document.cookie = `refreshToken=${response.data.refreshToken}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=strict`;

          const userInfo = await axios.get("/v1/members/me");
          const user = userInfo.data; // 받아온 사용자 정보
          // 사용자 정보를 Redux에 저장
          dispatch(setUserId(user.id));
          dispatch(setUserNickname(user.username));
        }
      } catch (error) {
        console.info('Browser refresh and failed to reissue access token:', error.response.data.message);
      } finally {
        setIsInitialized(true); // 초기화 완료
      }
    };

    fetchAccessToken();
  }, [dispatch]);

  // 최상위 컴포넌트의 useEffect()가 실행을 마칠 때까지 대기
  if (!isInitialized) {
    return <div>Initializing...</div>; // 초기화 중 로딩 표시
  }

  return (
    <>
      <Router>
        <Navbar/>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/myinfo" element={<MyInfo/>}/>
          <Route path="/qna" element={<QnA/>}/>
        </Routes>
      </Router>
    </>
  );
};

const App = () => (
  <Provider store={store}>
    <AlertNotification/>
    <AppContent/>
  </Provider>
);

export default App;
