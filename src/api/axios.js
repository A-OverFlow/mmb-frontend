import axios from "axios";
import store from "../store"; // Redux 스토어
import {logout, setAccessToken} from "../slices/authSlice";
import {alert} from "../slices/alertSlice.js";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const accessToken = state.auth.accessToken;
    // 액세스 토큰이 필요 없는 URL, 오히려 설정하는 것이 문제
    const authApiUrl = ["/auth/refresh-token", "/auth/reissue-token"]
    if (accessToken && !authApiUrl.includes(config.url)) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    // 쿠키를 포함해야 삭제도 할 수 있다
    if (authApiUrl.includes(config.url)) {
      config.withCredentials = true
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // 액세스 or 리프레시 토큰 만료 응답 처리
    if (error.response
      && error.response.status === 401
      && error.response.data.message === 'JWT expired'
      && !originalRequest._retry) {
      originalRequest._retry = true;
      if (originalRequest.url !== "/auth/reissue-token") {
        // 액세스 토큰 만료
        // 쿠키의 리프레시 토큰 사용하여 액세스 토큰 재발급
        const response = await axiosInstance.get("/auth/reissue-token");
        const newAccessToken = response.data.access_token;
        store.dispatch(setAccessToken(newAccessToken));
        return axiosInstance(originalRequest);
      } else {
        // 액세스 토큰 재발급 시도 -> 리프레시 토큰 만료
        await axiosInstance.delete("/auth/refresh-token");
        store.dispatch(logout());
        // 액세스 토큰 재발급에 실패하면 로그인 페이지로 이동
        window.location.href = "/login";
      }
    }
    // 기본 에러 응답 처리
    if (originalRequest.url !== "/auth/reissue-token") {
      // 에러 메시지 생성
      store.dispatch(alert.error(error.response.data.message))
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
