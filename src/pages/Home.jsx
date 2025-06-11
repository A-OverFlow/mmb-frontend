import React, {useEffect, useState} from "react";
import axios from "../api/axios.js";
import {useSelector} from "react-redux";
import {Box, CircularProgress, Divider, Typography} from "@mui/material";
import ChatBox from "../components/ChatBox.jsx";

const Home = () => {
  // 리덕스에서 닉네임 조회
  const userNickname = useSelector((state) => state.auth.nickname);

  // 전체 회원 수, 총 질문 수, 각 에러 메시지, 로딩 상태
  const [memberCount, setMemberCount] = useState(null);
  const [questionCount, setQuestionCount] = useState(null);
  const [memberError, setMemberError] = useState("");
  const [questionError, setQuestionError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      // 전체 회원 수 조회
      try {
        const res = await axios.get("/v1/members/count");
        setMemberCount(res.data.count);
      } catch (err) {
        console.error("회원 수 조회 실패:", err);
        setMemberError("회원 수를 불러오지 못했습니다.");
      }
      // 총 질문 수 조회
      try {
        const res = await axios.get("/v1/questions/count");
        setQuestionCount(res.data.count);
      } catch (err) {
        console.error("질문 수 조회 실패:", err);
        setQuestionError("질문 수를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  return (
    <Box textAlign="center" mt={5}>
      <Box mb={5}>
        {/* 로그인 상태에 따른 환영/안내 문구 */}
        {userNickname ? (
          <Typography variant="h5" gutterBottom>
            {userNickname}님, 어서오세요!🥳
          </Typography>
        ) : (
          <Typography variant="h5" color="text.secondary" gutterBottom>
            로그인하지 않으셨습니다.⛈️
          </Typography>
        )}
      </Box>

      {loading ? (
        // 로딩 중에는 스피너 표시
        <CircularProgress/>
      ) : (
        // 좌우 반분 화면 구성
        <Box display="flex" sx={{width: "100%", maxWidth: 800, mx: "auto"}}>
          {/* 왼쪽: 전체 회원 수 */}
          <Box flex={1} p={2} borderRight={1} borderColor="divider">
            <Typography variant="h6" gutterBottom>
              전체 회원 수
            </Typography>
            {memberCount !== null ? (
              <Typography variant="h3">{memberCount}</Typography>
            ) : (
              <Typography color="error">{memberError}</Typography>
            )}
          </Box>

          {/* 오른쪽: 총 질문 수 */}
          <Box flex={1} p={2}>
            <Typography variant="h6" gutterBottom>
              총 질문 수
            </Typography>
            {questionCount !== null ? (
              <Typography variant="h3">{questionCount}</Typography>
            ) : (
              <Typography color="error">{questionError}</Typography>
            )}
          </Box>
        </Box>
      )}

      {/* 우측 하단에 고정된 채팅창 */}
      <Box position="fixed" bottom={16} right={16}>
        <ChatBox/>
      </Box>
    </Box>
  );
};

export default Home;
