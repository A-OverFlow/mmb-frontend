import React from 'react';
import { Avatar, Box, Typography } from '@mui/material';

/**
 * 작성자(User) 정보(프로필 사진 + 아이콘 + 닉네임 + 아이디번호)를 렌더링하는 컴포넌트
 *
 * @param {Object} props
 * @param {Object} props.user - 사용자 정보 (nickname, id, picture 필드 포함)
 * @param {boolean} [props.compact=false] - compact 모드 여부 (true일 경우 작은 크기로 렌더링)
 */
const UserInfo = ({ user, compact = false }) => {
  // 이미지 URL 생성
  const imageUrl = `${import.meta.env.VITE_BACKEND_API_HOST}/${user.picture}`;

  // compact 여부에 따른 크기 설정
  const avatarSize = compact ? 40 : 60;
  const nicknameVariant = compact ? 'body1' : 'h6';
  const idFontSize = compact ? '0.8rem' : '1rem';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      {/* 프로필 사진 */}
      <Avatar
        src={imageUrl}
        alt={user.nickname}
        sx={{ width: avatarSize, height: avatarSize, mr: 1 }}
      />
      {/* 닉네임 + 아이디 */}
      <Typography
        variant={nicknameVariant}
        color="primary.main"
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        {user.nickname}
        <Typography
          component="span"
          color="text.secondary"
          sx={{ ml: 0.5, fontSize: idFontSize }}
        >
          #{user.id}
        </Typography>
      </Typography>
    </Box>
  );
};

export default UserInfo;
