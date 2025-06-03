// slices/authSlice.js
import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  accessToken: null,
  id: null,       // 사용자 ID
  nickname: null, // 사용자 닉네임
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
    setId: (state, action) => {
      state.id = action.payload; // 사용자 ID 설정
    },
    setNickname: (state, action) => {
      state.nickname = action.payload; // 사용자 닉네임 설정
    },
    logout: (state) => {
      state.accessToken = null;
      state.id = null;       // 로그아웃 시 사용자 ID 초기화
      state.nickname = null; // 로그아웃 시 사용자 닉네임 초기화
    },
  },
});

export const {setAccessToken, setId, setNickname, logout} = authSlice.actions;

export default authSlice.reducer;
