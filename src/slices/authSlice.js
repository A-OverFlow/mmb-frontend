// slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  accessToken: null,
  userId: null,       // 사용자 ID
  userNickname: null, // 사용자 닉네임
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
    setUserId: (state, action) => {
      state.userId = action.payload; // 사용자 ID 설정
    },
    setUserNickname: (state, action) => {
      state.userNickname = action.payload; // 사용자 닉네임 설정
    },
    logout: (state) => {
      state.accessToken = null;
      state.userId = null;       // 로그아웃 시 사용자 ID 초기화
      state.userNickname = null; // 로그아웃 시 사용자 닉네임 초기화
    },
  },
});

export const { setAccessToken, setUserId, setUserNickname, logout } = authSlice.actions;

export default authSlice.reducer;
