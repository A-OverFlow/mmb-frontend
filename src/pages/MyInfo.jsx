import React, {useState} from "react";
import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography} from "@mui/material";
import axios from "../api/axios.js";
import {useDispatch, useSelector} from "react-redux";
import {logout, setUserNickname} from "../slices/authSlice.js";
import {useNavigate} from "react-router-dom";
import {alert} from "../slices/alertSlice.js";

const MyInfo = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // 닉네임 편집 모드 상태
  const userNickname = useSelector((state) => state.auth.userNickname); // Redux에서 사용자 정보 가져오기
  const [nickname, setNickname] = useState(userNickname); // 현재 닉네임 상태
  const [newNickname, setNewNickname] = useState(userNickname); // 새로운 닉네임 상태

  // 닉네임 변경 API 호출
  const handleNicknameChange = async () => {
    if (newNickname.length < 2 || newNickname.length > 10 || /\s/.test(newNickname)) {
      return; // 조건을 만족하지 않으면 API 호출 방지
    }
    await axios.patch("/users/me", {nickname: newNickname});
    setNickname(newNickname);
    dispatch(setUserNickname(newNickname));
    dispatch(alert.success("닉네임이 성공적으로 변경되었습니다."))
    setIsEditing(false); // 편집 모드 종료
  };

  const handleNicknameCancel = () => {
    setIsEditing(false);
    setNewNickname(userNickname); // 닉네임 초기화
  };

  const handleConfirmDeletion = async () => {
    await axios.delete("/users/me");
    await axios.delete('/auth/refresh-token');
    dispatch(logout());
    dispatch(alert.success("회원 탈퇴가 완료되었습니다."))
    setIsDialogOpen(false);
    navigate('/');
  };

  return (
    <Box textAlign="center" mt={5}>
      <Typography variant="h3" gutterBottom>
        내 정보
      </Typography>

      {/* 현재 닉네임 표시 */}
      <Box sx={{marginBottom: 2}}>
        <Typography variant="h6">현재 닉네임: {nickname}</Typography>
      </Box>

      {/* 닉네임 수정 모달 */}
      <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", gap: 2, marginTop: 2}}>
        <Button
          variant="outlined"
          color={isEditing ? "success" : "primary"}
          onClick={() => setIsEditing(true)}
          sx={{width: "200px", textTransform: "none"}}
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
            slotProps={{htmlInput: {maxLength: 10}}}
            sx={{width: "100%", marginTop: 2}}
          />
          <Typography color="textSecondary" variant="body2" sx={{marginTop: 1}}>
            닉네임은 2~10자리 이내의 공백 없는 문자로 입력해주세요.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="secondary" onClick={handleNicknameCancel}>
            취소
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNicknameChange}
            disabled={
              newNickname.length < 2 || // 닉네임 길이가 2 미만
              newNickname.length > 10 || // 닉네임 길이가 10 초과
              /\s/.test(newNickname) || // 닉네임에 공백 포함
              newNickname === nickname // 현재 닉네임과 수정하려는 닉네임이 동일
            } // 버튼 비활성화 조건 추가
          >
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* 회원 탈퇴 */}
      <Box sx={{display: "flex", justifyContent: "center", gap: 2, marginTop: 2}}>
        <Button
          variant="outlined"
          color="error"
          onClick={() => setIsDialogOpen(true)}
          sx={{width: "140px"}}
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
