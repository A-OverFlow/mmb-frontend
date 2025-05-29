import React from "react";
import { useSelector } from "react-redux";
import { Box, Typography } from "@mui/material";
import ChatBox from "../components/ChatBox.jsx"; // 추가된 컴포넌트 import

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
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          mt: 4,
        }}
      >
        <Typography variant="body1">
          {accessToken ? "로그인 완료!" : "로그인 하지 않았습니다."}
        </Typography>
      </Box>

      {/* 우측 하단에 위치하는 채팅창 */}
      <ChatBox />
    </Box>
  );
};

export default Home;
