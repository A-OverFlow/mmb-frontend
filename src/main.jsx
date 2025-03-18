import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.jsx'
import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";

// MUI 테마 생성
const theme = createTheme({
  palette: {
    primary: {
      main: "#009688", // Teal
      light: "#52c7b8",
      dark: "#00675b",
    },
    secondary: {
      main: "#607d8b", // Blue Grey
      light: "#8eacbb",
      dark: "#34515e",
    },
    background: {
      default: "#fafafa", // Extra Light Grey
      paper: "#ffffff", // White
    },
    text: {
      primary: "#212121",
      secondary: "#757575",
    },
  },
  typography: {
    fontFamily: '"Nanum Gothic", sans-serif', // Nanum Gothic 적용
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      {/* body의 margin 값을 제거하기 위해 설정*/}
      <CssBaseline/>
      <App/>
    </ThemeProvider>
  </StrictMode>,
)
