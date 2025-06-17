import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.jsx';
import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";

// 안랩 로고 스타일 기반 MUI 테마
const theme = createTheme({
  palette: {
    primary: {
      main: "#007BC8",     // AhnLab Blue (메인 로고색)
      light: "#4DA8E2",    // 밝은 하늘색 계열
      dark: "#005A9C",     // 좀 더 진한 블루 (로고 그림자색 느낌)
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#7F8FA6",      // 푸른 회색 느낌 (보조색)
      light: "#B0BEC5",
      dark: "#546E7A",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f4f6f8",   // 매우 연한 회색 (신뢰감 + 현대적)
      paper: "#ffffff",     // 기본 화이트
    },
    text: {
      primary: "#1A1A1A",   // 다크 그레이
      secondary: "#5C6B73", // 중간 회색
    },
  },
  typography: {
    // fontFamily: '"Nanum Gothic", sans-serif', // 공식 폰트 유사 계열
    // fontFamily: '"Noto Sans KR", sans-serif'
    fontFamily: '"Gowun Dodum", sans-serif'

  },
});

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <ThemeProvider theme={theme}>
    <CssBaseline/>
    <App/>
  </ThemeProvider>
  // </StrictMode>,
);
