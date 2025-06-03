import React, { useEffect, useState } from "react";
import {
  Box, Button, Dialog, DialogActions, DialogContent,
  DialogTitle, TextField, Typography
} from "@mui/material";
import axios from "../api/axios.js";
import { useDispatch } from "react-redux";
import { logout, setUserNickname } from "../slices/authSlice.js";
import { useNavigate } from "react-router-dom";
import { alert } from "../slices/alertSlice.js";

const MyInfo = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 사용자 정보 상태
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");

  const [newNickname, setNewNickname] = useState("");

  // 페이지 로드시 사용자 정보 조회
  useEffect(() => {
    const fetchMyInfo = async () => {
      try {
        const response = await axios.get("/v1/members/me/profile");
        const { name, nickname, email } = response.data;

        setName(name);
        setNickname(nickname);
        setEmail(email);
        setNewNickname(nickname);

        dispatch(setUserNickname(nickname));
      } catch (error) {
        console.error("사용자 정보 조회 실패:", error);
        dispatch(alert.error("사용자 정보를 불러오지 못했습니다."));
      }
    };

    fetchMyInfo();
  }, [dispatch]);

  const handleNicknameChange = async () => {
    if (newNickname.length < 2 || newNickname.length > 10 || /\s/.test(newNickname)) {
      return;
    }

    try {
      await axios.patch("/v1/members/me/profile/info", { nickname: newNickname });
      setNickname(newNickname);
      dispatch(setUserNickname(newNickname));
      dispatch(alert.success("닉네임이 성공적으로 변경되었습니다."));
      setIsEditing(false);
    } catch (error) {
      console.error("닉네임 변경 실패:", error);
      dispatch(alert.error("닉네임 변경에 실패했습니다."));
    }
  };

  const handleNicknameCancel = () => {
    setIsEditing(false);
    setNewNickname(nickname);
  };

  const handleConfirmDeletion = async () => {
    try {
      await axios.delete("/members/me");
      await axios.delete("/auth/refresh-token");
      dispatch(logout());
      dispatch(alert.success("회원 탈퇴가 완료되었습니다."));
      setIsDialogOpen(false);
      navigate("/");
    } catch (error) {
      console.error("회원 탈퇴 실패:", error);
      dispatch(alert.error("회원 탈퇴에 실패했습니다."));
    }
  };

  return (
    <Box textAlign="center" mt={5}>
      <Typography variant="h3" gutterBottom>내 정보</Typography>

      {/* 사용자 정보 출력 */}
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="h6">이름: {name}</Typography>
        <Typography variant="h6">이메일: {email}</Typography>
        <Typography variant="h6">닉네임: {nickname}</Typography>
      </Box>

      {/* 닉네임 수정 */}
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, marginTop: 2 }}>
        <Button
          variant="outlined"
          color={isEditing ? "success" : "primary"}
          onClick={() => setIsEditing(true)}
          sx={{ width: "200px", textTransform: "none" }}
        >
          {isEditing ? "닉네임 수정중" : "닉네임 수정"}
        </Button>
      </Box>

      <Dialog open={isEditing} onClose={handleNicknameCancel}>
        <DialogTitle>닉네임 수정</DialogTitle>
        <DialogContent>
          <TextField
            label="닉네임"
            variant="outlined"
            value={newNickname}
            onChange={(e) => setNewNickname(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 10 } }}
            sx={{ width: "100%", marginTop: 2 }}
          />
          <Typography color="textSecondary" variant="body2" sx={{ marginTop: 1 }}>
            닉네임은 2~10자리 이내의 공백 없는 문자로 입력해주세요.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="secondary" onClick={handleNicknameCancel}>
            취소
          </Button>
          <Button variant="contained" color="primary" onClick={handleNicknameChange}>
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* 회원 탈퇴 */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, marginTop: 2 }}>
        <Button
          variant="outlined"
          color="error"
          onClick={() => setIsDialogOpen(true)}
          sx={{ width: "140px" }}
        >
          회원 탈퇴
        </Button>
      </Box>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>회원 탈퇴</DialogTitle>
        <DialogContent>정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.</DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setIsDialogOpen(false)} color="primary">
            취소
          </Button>
          <Button variant="contained" onClick={handleConfirmDeletion} color="error">
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyInfo;
