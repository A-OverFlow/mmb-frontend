import React from 'react';
import {Avatar, Box, Typography} from '@mui/material';

/**
 * 작성자(User) 정보(프로필 사진 + 아이콘 + 닉네임 + 아이디번호)를 렌더링하는 컴포넌트
 */
const UserInfo = ({user}) => {
  // 프로필 이미지 URL을 환경 변수와 user.picture를 조합하여 생성
  const imageUrl = `${import.meta.env.VITE_BACKEND_API_HOST}/${user.picture}`;

  return (
    <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
      {/* 프로필 사진 */}
      <Avatar
        src={imageUrl}
        alt={user.nickname}
        sx={{width: 60, height: 60, mr: 1}}
      />
      {/* 닉네임 + 아이디 + 아이콘 */}
      <Typography
        variant="h6"
        color="primary.main"
        sx={{display: 'flex', alignItems: 'center'}}
      >
        {/* 닉네임 */}
        {user.nickname}
        {/* 아이디번호 */}
        <Typography
          component="span"
          color="text.secondary"
          sx={{ml: 0.5}}
        >
          #{user.id}
        </Typography>
      </Typography>
    </Box>
  );
};

export default UserInfo;