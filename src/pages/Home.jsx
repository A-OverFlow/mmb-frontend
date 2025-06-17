import React, { useEffect, useState } from "react";
import axios from "../api/axios.js";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography, Alert } from "@mui/material";

// Odometer (Rolling Numbers) 효과를 위한 라이브러리
import Odometer from 'react-odometerjs';
import 'odometer/themes/odometer-theme-default.css';

const Home = () => {
  // 사용자 닉네임(환영 문구)
  const userNickname = useSelector((state) => state.auth.nickname);
  const navigate = useNavigate();

  // 카운트 상태 관리 (초기값 0으로 설정하여 Odometer가 0에서 목표값으로 애니메이션)
  const [memberCount, setMemberCount] = useState(0);    // 전체 회원 수
  const [questionCount, setQuestionCount] = useState(0); // 전체 질문 수
  const [answerCount, setAnswerCount] = useState(0);    // 전체 답변 수

  // 에러 상태 관리
  const [memberError, setMemberError] = useState("");
  const [questionError, setQuestionError] = useState("");
  const [answerError, setAnswerError] = useState("");

  // 로딩 상태
  const [loading, setLoading] = useState(true);

  // 최근 답변 목록 및 에러
  const [recentAnswers, setRecentAnswers] = useState([]);
  const [recentError, setRecentError] = useState("");

  useEffect(() => {
    // 페이지 로드 시 모든 데이터 비동기로 조회
    const fetchAll = async () => {
      try {
        const memberPromise = axios
          .get("/v1/members/count")
          .then(res => setMemberCount(res.data.count))
          .catch(() => setMemberError("회원 수를 불러오지 못했습니다."));

        const questionPromise = axios
          .get("/v1/questions/count")
          .then(res => setQuestionCount(res.data.count))
          .catch(() => setQuestionError("질문 수를 불러오지 못했습니다."));

        const answerPromise = axios
          .get("/v1/answers/count")
          .then(res => setAnswerCount(res.data.answerCount))
          .catch(() => setAnswerError("답변 수를 불러오지 못했습니다."));

        const recentPromise = axios
          .get("/v1/answers/recent")
          .then(res => setRecentAnswers(res.data))
          .catch(() => setRecentError("최근 답변을 불러오지 못했습니다."));

        await Promise.allSettled([memberPromise, questionPromise, answerPromise, recentPromise]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return (
    <Box textAlign="center" mt={5} position="relative">
      {/* 로딩 스피너 (오버레이) */}
      {loading && (
        <Box position="absolute" top={0} left="50%" sx={{ transform: 'translateX(-50%)' }}>
          <CircularProgress />
        </Box>
      )}

      {/* 환영 문구 */}
      <Box mb={5}>
        {userNickname ? (
          <Typography variant="h5" gutterBottom>
            {userNickname}님, 무엇이든 물어보세요!
          </Typography>
        ) : (
          <Typography variant="h5" color="text.secondary" gutterBottom>
            지금 로그인하고, 무엇이든 물어보세요!
          </Typography>
        )}
      </Box>

      {/* 카운트 영역 */}
      <Box display="flex" sx={{ width: '100%', maxWidth: 960, mx: 'auto', opacity: loading ? 0.5 : 1, transition: 'opacity 0.3s' }}>
        {/* 전체 회원 수 */}
        <Box flex={1} p={2} borderRight={1} borderColor="divider">
          <Typography variant="h6" gutterBottom>전체 회원 수</Typography>
          {memberError ? (
            <Typography color="error">{memberError}</Typography>
          ) : (
            <Typography variant="h3">
              <Odometer
                value={loading ? 0 : memberCount}
                format="(,ddd)"
                duration={2000}
              />
            </Typography>
          )}
        </Box>

        {/* 전체 질문 수 */}
        <Box flex={1} p={2} borderRight={1} borderColor="divider">
          <Typography variant="h6" gutterBottom>전체 질문 수</Typography>
          {questionError ? (
            <Typography color="error">{questionError}</Typography>
          ) : (
            <Typography variant="h3">
              <Odometer
                value={loading ? 0 : questionCount}
                format="(,ddd)"
                duration={2000}
              />
            </Typography>
          )}
        </Box>

        {/* 전체 답변 수 */}
        <Box flex={1} p={2}>
          <Typography variant="h6" gutterBottom>전체 답변 수</Typography>
          {answerError ? (
            <Typography color="error">{answerError}</Typography>
          ) : (
            <Typography variant="h3">
              <Odometer
                value={loading ? 0 : answerCount}
                format="(,ddd)"
                duration={2000}
              />
            </Typography>
          )}
        </Box>
      </Box>

      {/* 최근 답변 섹션 */}
      <Box
        mt={4}
        px={2}
        sx={{ width: "100%", maxWidth: 960, mx: "auto", textAlign: "left" }}
      >
        <Typography variant="h6" gutterBottom>
          최근 답변
        </Typography>

        {loading ? (
          <CircularProgress size={24} />
        ) : recentError ? (
          <Typography color="error">{recentError}</Typography>
        ) : (
          recentAnswers.map((ans) => (
            <Box
              key={ans.answerId}
              mb={2}
              p={2}
              border={1}
              borderColor="divider"
              borderRadius={1}
              sx={{ cursor: "pointer", backgroundColor: '#fff' }}
              onClick={() => navigate(`/qna/${ans.questionId}`)}
            >
              {/* 작성자 및 유저ID */}
              <Typography variant="subtitle2" color="primary.main">
                {ans.author || "알 수 없음"}#{ans.userId}
              </Typography>

              {/* 답변 내용 */}
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mt: 1 }}>
                {ans.answer}
              </Typography>

              {/* 작성 일시 */}
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 0.5 }}
              >
                작성일: {new Date(ans.createdAt).toLocaleString()}
              </Typography>
            </Box>
          ))
        )}
      </Box>

      {/* 하단: Beta 안내 */}
      <Box mt={8} mb={10} px={2} display="flex" justifyContent="center">
        <Alert severity="info" variant="outlined" sx={{ maxWidth: 600, textAlign: 'center' }}>
          현재 서비스는 <strong>Beta 버전 (v1.1)</strong>입니다.<br/>
          일부 기능은 안정화 중이며, 예고 없이 변경될 수 있습니다.<br/>
          사용 중 오류나 비정상 동작이 발생할 수 있습니다.<br/>
          저장된 데이터는 정식 버전 이행 시 초기화될 수 있습니다.<br/>
          민감한 정보 입력은 삼가주시고, 피드백은 언제든 환영합니다.<br/>
          안정된 서비스를 제공하기 위해 최선을 다하겠습니다. 감사합니다.
        </Alert>
      </Box>
    </Box>
  );
};

export default Home;
