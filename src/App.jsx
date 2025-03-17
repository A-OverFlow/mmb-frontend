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
import FreeBoard from "./pages/FreeBoard.jsx";

const AppContent = () => {
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const response = await axios.get('/auth/reissue-token');
        if (response.data && response.data.access_token) {
          dispatch(setAccessToken(response.data.access_token)); // Redux에 저장
          const userInfo = await axios.get("/users/me");
          const user = userInfo.data; // 받아온 사용자 정보
          // 사용자 정보를 Redux에 저장
          dispatch(setUserId(user.id));
          dispatch(setUserNickname(user.nickname));
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
          <Route path="/freeboard" element={<FreeBoard/>}/>
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
