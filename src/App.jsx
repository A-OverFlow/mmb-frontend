import React, { useEffect, useState } from 'react';
import { Provider, useDispatch }        from 'react-redux';
import { BrowserRouter as Router,
  Routes,
  Route }                       from 'react-router-dom';
import { Container }                    from '@mui/material';

import store                           from './store';
import axios                           from './api/axios';
import { setAccessToken,
  setId,
  setNickname }                 from './slices/authSlice';
import AlertNotification               from './components/AlertNotification';
import Navbar                          from './components/Navbar';
import Home                            from './pages/Home';
import Login                           from './pages/Login';
import MyInfo                          from './pages/MyInfo';
import QnALayout                       from './pages/QnALayout';
import QnADetail                       from './pages/QnADetail';
import QnA                             from './pages/QnA';

const AppContent = () => {
  const dispatch = useDispatch();
  const [inited, setInited] = useState(false);

  const getCookie = (name) => {
    const v = `; ${document.cookie}`;
    const parts = v.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  useEffect(() => {
    (async () => {
      try {
        const rt = getCookie('refreshToken');
        if (!rt) return;
        const res = await axios.post('/v1/auth/reissue', { refreshToken: rt });
        if (res.data.accessToken) {
          dispatch(setAccessToken(res.data.accessToken));
          document.cookie = `refreshToken=${res.data.refreshToken}; path=/; max-age=${7*24*60*60}; samesite=strict`;

          const me = await axios.get('/v1/members/me');
          dispatch(setId(me.data.id));
          dispatch(setNickname(me.data.nickname));
        }
      } catch (e) {
        console.info('토큰 재발급 실패', e.response?.data?.message);
      } finally {
        setInited(true);
      }
    })();
  }, [dispatch]);

  if (!inited) return <div>Initializing...</div>;

  return (
    <Router>
      <Navbar/>
      <Container maxWidth="sm">
        <Routes>
          <Route path="/"      element={<Home/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/myinfo" element={<MyInfo/>} />

          {/* QnA 중첩 라우트 */}
          <Route path="/qna" element={<QnALayout/>}>
            {/* index 경로는 따로 선언할 필요 없이 QnALayout 내부의 QnA를 보여줍니다 */}
            <Route path=":questionId" element={<QnADetail/>} />
          </Route>
        </Routes>
      </Container>
    </Router>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <AlertNotification/>
      <AppContent/>
    </Provider>
  );
}
