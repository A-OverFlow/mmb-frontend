import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {Box, Button, Typography} from "@mui/material";
import {alert} from "../slices/alertSlice.js";

const Home = () => {
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state.auth.accessToken);

  return (
    <Box textAlign="center" mt={5}>
      <Typography variant="h3" gutterBottom>
        메인 페이지
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column", // 세로 정렬
          alignItems: "center",
          gap: 2, // 요소 간의 간격
          mt: 4,
        }}
      >
        <Typography variant="body1">
          {accessToken ? '로그인 완료!' : '로그인 하지 않았습니다.'}
        </Typography>

        {/* 알림 테스트 버튼 추가 */}
        <Button
          variant="contained"
          color="success"
          onClick={() => dispatch(alert.success("성공 메시지!"))}
        >
          성공 알림
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => dispatch(alert.error("에러 발생!"))}
        >
          에러 알림
        </Button>
        <Button
          variant="contained"
          color="info"
          onClick={() => dispatch(alert.info("정보 메시지"))}
        >
          정보 알림
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={() => dispatch(alert.warning("경고 메시지!"))}
        >
          경고 알림
        </Button>
      </Box>
    </Box>
  );
};

export default Home;
