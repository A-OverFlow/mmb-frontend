import React from "react";
import {useSelector} from "react-redux";
import {Box, Typography} from "@mui/material";

const Home = () => {
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
      </Box>
    </Box>
  );
};

export default Home;
