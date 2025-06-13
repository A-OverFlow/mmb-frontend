import React, {useEffect, useState} from "react";
import axios from "../api/axios.js";
import {useSelector} from "react-redux";
import {Alert, Box, CircularProgress, Typography,} from "@mui/material";

const Home = () => {
  const userNickname = useSelector((state) => state.auth.nickname);

  // 기존 카운트 상태
  const [memberCount, setMemberCount] = useState(null);
  const [questionCount, setQuestionCount] = useState(null);
  const [answerCount, setAnswerCount] = useState(null);

  const [memberError, setMemberError] = useState("");
  const [questionError, setQuestionError] = useState("");
  const [answerError, setAnswerError] = useState("");

  const [loading, setLoading] = useState(true);

  // **최근 답변** 상태
  const [recentAnswers, setRecentAnswers] = useState([]);
  const [recentError, setRecentError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      // 1) 카운트 조회
      const memberPromise = axios.get("/v1/members/count")
        .then(res => setMemberCount(res.data.count))
        .catch(() => setMemberError("회원 수를 불러오지 못했습니다."));
      const questionPromise = axios.get("/v1/questions/count")
        .then(res => setQuestionCount(res.data.count))
        .catch(() => setQuestionError("질문 수를 불러오지 못했습니다."));
      const answerPromise = axios.get("/v1/answers/count")
        .then(res => setAnswerCount(res.data.count))
        .catch(() => setAnswerError("답변 수를 불러오지 못했습니다."));

      // 2) 최근 답변 조회
      const recentPromise = axios.get("/v1/answers/recent")
        .then(res => setRecentAnswers(res.data))
        .catch(() => setRecentError("최근 답변을 불러오지 못했습니다."));

      await Promise.allSettled([
        memberPromise,
        questionPromise,
        answerPromise,
        recentPromise,
      ]);

      setLoading(false);
    };

    fetchAll();
  }, []);

  return (
    <Box textAlign="center" mt={5}>
      {/* 환영 문구 */}
      <Box mb={5}>
        {userNickname ? (
          <Typography variant="h5" gutterBottom>
            {userNickname}님, 어서오세요!
          </Typography>
        ) : (
          <Typography variant="h5" color="text.secondary" gutterBottom>
            로그인하지 않으셨습니다.
          </Typography>
        )}
      </Box>

      {/* 카운트 영역 */}
      {loading ? (
        <CircularProgress/>
      ) : (
        <Box display="flex" sx={{width: "100%", maxWidth: 960, mx: "auto"}}>
          {/* 전체 회원 수 */}
          <Box flex={1} p={2} borderRight={1} borderColor="divider">
            <Typography variant="h6" gutterBottom>전체 회원 수</Typography>
            {memberCount !== null ? (
              <Typography variant="h3">{memberCount}</Typography>
            ) : (
              <Typography color="error">{memberError}</Typography>
            )}
          </Box>

          {/* 전체 질문 수 */}
          <Box flex={1} p={2} borderRight={1} borderColor="divider">
            <Typography variant="h6" gutterBottom>전체 질문 수</Typography>
            {questionCount !== null ? (
              <Typography variant="h3">{questionCount}</Typography>
            ) : (
              <Typography color="error">{questionError}</Typography>
            )}
          </Box>

          {/* 전체 답변 수 */}
          <Box flex={1} p={2}>
            <Typography variant="h6" gutterBottom>전체 답변 수</Typography>
            {answerCount !== null ? (
              <Typography variant="h3">{answerCount}</Typography>
            ) : (
              <Typography color="error">{answerError}</Typography>
            )}
          </Box>
        </Box>
      )}

      {/* 최근 답변 섹션 */}
      <Box
        mt={4}
        px={2}
        sx={{width: "100%", maxWidth: 960, mx: "auto", textAlign: "left"}}
      >
        <Typography variant="h6" gutterBottom>
          최근 답변
        </Typography>

        {loading ? (
          <CircularProgress size={24}/>
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
            >
              {/* 작성자 및 유저ID */}
              <Typography variant="subtitle2">
                {ans.author || "익명"}#{ans.userId}
              </Typography>

              {/* 답변 내용 */}
              <Typography
                variant="body2"
                sx={{whiteSpace: "pre-wrap", mt: 1}}
              >
                {ans.answer}
              </Typography>

              {/* 작성 일시 */}
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{display: "block", mt: 0.5}}
              >
                작성일: {new Date(ans.createdAt).toLocaleString()}
              </Typography>
            </Box>
          ))
        )}
      </Box>

      {/* 하단: 베타 안내 문구 (가운데 정렬) */}
      <Box mt={8} px={2} display="flex" justifyContent="center">
        <Alert
          severity="info"
          variant="outlined"
          sx={{display: "inline-block", textAlign: "center"}}
        >
          현재 서비스는 <strong>Beta 버전 (v1.1)</strong>입니다.<br/>
          - 일부 기능은 안정화 중이며, 예고 없이 변경될 수 있습니다.<br/>
          - 사용 중 오류나 비정상 동작이 발생할 수 있습니다.<br/>
          - 저장된 데이터는 정식 버전 이행 시 초기화될 수 있습니다.<br/>
          - 민감한 정보 입력은 삼가주시고, 피드백은 언제든 환영합니다.<br/>
          안정된 서비스를 제공하기 위해 최선을 다하겠습니다. 감사합니다.
        </Alert>
      </Box>
    </Box>
  );
};

export default Home;
