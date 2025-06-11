import React, {useEffect, useState} from "react";
import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography,} from "@mui/material";
import axios from "../api/axios.js";
import {useDispatch, useSelector} from "react-redux";
import {logout, setNickname} from "../slices/authSlice.js";
import {useNavigate} from "react-router-dom";
import {alert} from "../slices/alertSlice.js";

const MyInfo = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = useSelector((state) => state.auth.id);

  // 현재 호스트를 가져옵니다 (예: https://mumulbo.com)
  const host = window.location.origin;

  // 프로필 이미지 업로드용 상태
  const [selectedFile, setSelectedFile] = useState(null);
  // 서버에서 받아온 picture 경로 (예: images/profiles/xxx)
  const [profilePicture, setProfilePicture] = useState("");

  // 사용자 정보 상태
  const [name, setUserName] = useState("");
  const [nickname, setUserNickname] = useState("");
  const [email, setUserEmail] = useState("");
  const [introduction, setUserIntroduction] = useState("");
  const [website, setUserWebsite] = useState("");

  // 수정용 입력 상태
  const [newNickname, setNewNickname] = useState("");
  const [newIntroduction, setNewIntroduction] = useState("");
  const [newWebsite, setNewWebsite] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchMyInfo = async () => {
      try {
        const {data} = await axios.get("/v1/members/me/profile");
        const {name, nickname, email, introduction, website, picture} = data;

        setUserName(name);
        setUserNickname(nickname);
        setUserEmail(email);
        setUserIntroduction(introduction || "");
        setUserWebsite(website || "");
        setProfilePicture(picture || "");

        setNewNickname(nickname);
        setNewIntroduction(introduction || "");
        setNewWebsite(website || "");

        dispatch(setNickname(nickname));
      } catch (error) {
        console.error("사용자 정보 조회 실패:", error);
        dispatch(alert.error("사용자 정보를 불러오지 못했습니다."));
      }
    };

    fetchMyInfo();
  }, [dispatch]);

  // 파일 선택 핸들러
  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await axios.put("/v1/members/me/profile/picture", formData, {
        headers: {"Content-Type": "multipart/form-data"},
      });
      dispatch(alert.success("프로필 이미지가 성공적으로 업로드되었습니다."));
      setSelectedFile(null);

      // 업로드 후 새 picture 경로를 다시 가져와 상태 업데이트
      const {data} = await axios.get("/v1/members/me/profile");
      setProfilePicture(data.picture || "");
    } catch (error) {
      console.error("프로필 이미지 업로드 실패:", error);
      dispatch(alert.error("프로필 이미지 업로드에 실패했습니다."));
    }
  };

  const handleInfoUpdate = async () => {
    if (newNickname.length < 2 || newNickname.length > 10 || /\s/.test(newNickname)) {
      dispatch(alert.error("닉네임은 2~10자의 공백 없는 문자열이어야 합니다."));
      return;
    }
    let formattedWebsite = newWebsite.trim();
    if (formattedWebsite && !/^https?:\/\//i.test(formattedWebsite)) {
      formattedWebsite = `https://${formattedWebsite}`;
    }
    if (!isValidUrl(formattedWebsite)) {
      dispatch(alert.error("유효한 웹사이트 주소를 입력해주세요."));
      return;
    }

    try {
      await axios.patch("/v1/members/me/profile/info", {
        nickname: newNickname,
        introduction: newIntroduction,
        website: formattedWebsite,
      });

      setUserNickname(newNickname);
      setUserIntroduction(newIntroduction);
      setUserWebsite(formattedWebsite);

      dispatch(setNickname(newNickname));
      dispatch(alert.success("사용자 정보가 성공적으로 변경되었습니다."));
      setIsEditing(false);
    } catch (error) {
      console.error("정보 수정 실패:", error);
      dispatch(alert.error("사용자 정보 변경에 실패했습니다."));
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setNewNickname(nickname);
    setNewIntroduction(introduction);
    setNewWebsite(website);
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

  const isValidUrl = (url) => {
    if (!url) return true;
    const pattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(:[0-9]+)?(\/.*)?$/i;
    return pattern.test(url);
  };

  return (
    <Box textAlign="center" mt={5}>
      <Typography variant="h3" gutterBottom>
        내 정보
      </Typography>

      <Box sx={{maxWidth: 600, mx: "auto", textAlign: "left", p: 2}}>
        {/* 1) 프로필 이미지 출력 (ID 위) */}
        {profilePicture && (
          <Box display="flex" justifyContent="center" mb={2}>
            <img
              src={`${import.meta.env.VITE_BACKEND_API_HOST}/${profilePicture}`}
              alt="프로필 사진"
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          </Box>
        )}

        {/* 2) 프로필 이미지 업로드 섹션 */}
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <input
            accept="image/*"
            id="profile-upload"
            type="file"
            style={{display: "none"}}
            onChange={handleFileChange}
          />
          <label htmlFor="profile-upload">
            <Button variant="contained" component="span">
              이미지 선택
            </Button>
          </label>
          {selectedFile && (
            <>
              <Typography variant="body2">{selectedFile.name}</Typography>
              <Button variant="contained" onClick={handleImageUpload}>
                업로드
              </Button>
            </>
          )}
        </Box>

        {/* 3) 회원 기본 정보 */}
        <Box display="flex" gap={1} mb={1}>
          <Typography variant="body2" color="text.secondary">
            ID
          </Typography>
          <Typography variant="body1">{userId}</Typography>
        </Box>
        <Box display="flex" gap={1} mb={1}>
          <Typography variant="body2" color="text.secondary">
            이름
          </Typography>
          <Typography variant="body1">{name}</Typography>
        </Box>
        <Box display="flex" gap={1} mb={1}>
          <Typography variant="body2" color="text.secondary">
            닉네임
          </Typography>
          <Typography variant="body1">{nickname}</Typography>
        </Box>
        <Box display="flex" gap={1} mb={1}>
          <Typography variant="body2" color="text.secondary">
            이메일
          </Typography>
          <Typography variant="body1">{email}</Typography>
        </Box>
        <Box display="flex" gap={1} mb={1}>
          <Typography variant="body2" color="text.secondary">
            웹사이트
          </Typography>
          <Typography variant="body1">
            {website ? (
              <a href={website} target="_blank" rel="noopener noreferrer">
                {website}
              </a>
            ) : (
              "없음"
            )}
          </Typography>
        </Box>

        {/* 4) 자기소개 */}
        <Box mt={2}>
          <Typography variant="body2" color="text.secondary">
            자기소개
          </Typography>
          <Typography variant="body1" sx={{whiteSpace: "pre-wrap"}}>
            {introduction || "없음"}
          </Typography>
        </Box>

        {/* 5) 수정 / 탈퇴 버튼 */}
        <Box sx={{display: "flex", justifyContent: "flex-end", gap: 2, mt: 3}}>
          <Button variant="text" color="primary" onClick={() => setIsEditing(true)}>
            사용자 정보 수정
          </Button>
          <Button variant="text" color="error" onClick={() => setIsDialogOpen(true)}>
            회원 탈퇴
          </Button>
        </Box>
      </Box>

      {/* 사용자 정보 수정 다이얼로그 */}
      <Dialog open={isEditing} onClose={handleEditCancel} maxWidth="sm" fullWidth>
        <DialogTitle>사용자 정보 수정</DialogTitle>
        <DialogContent>
          <TextField
            label="닉네임"
            value={newNickname}
            onChange={(e) => setNewNickname(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Typography variant="body2" color="text.secondary">
            닉네임은 2~10자의 공백 없는 문자열이어야 합니다.
          </Typography>
          <TextField
            label="웹사이트"
            value={newWebsite}
            onChange={(e) => setNewWebsite(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="https://example.com"
          />
          <TextField
            label="자기소개"
            value={newIntroduction}
            onChange={(e) => setNewIntroduction(e.target.value)}
            fullWidth
            multiline
            margin="normal"
            inputProps={{maxLength: 250}}
            helperText={`${newIntroduction.length}/250자`}
            FormHelperTextProps={{sx: {textAlign: "right"}}}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel}>취소</Button>
          <Button variant="contained" onClick={handleInfoUpdate}>
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* 회원 탈퇴 확인 다이얼로그 */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>회원 탈퇴</DialogTitle>
        <DialogContent>
          정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.
        </DialogContent>
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
