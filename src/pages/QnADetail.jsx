import React, { useEffect, useState } from 'react';
import { CircularProgress, Container, Typography, Box, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Question from '../components/Question';
import Answer from '../components/Answer';

const QnADetail = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const [q, setQ] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchDetail = async () => {
      try {
        const { data } = await axios.get(`/v1/questions/${questionId}`);
        setQ(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [questionId]);

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!q) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <Typography>존재하지 않는 질문입니다.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* 질문 내용 렌더링: 댓글 버튼 숨김 */}
      <Question
        posts={[q]}
        fetchMorePosts={() => {}}
        hasMore={false}
        onEditPost={() => {}}
        onDeletePost={() => {}}
        hideCommentButton
      />

      {/* 답변 리스트 */}
      <Answer questionId={q.id} questionAuthorId={q.author.id} />

      {/* 뒤로가기 버튼 */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          뒤로가기
        </Button>
      </Box>
    </Container>
  );
};

export default QnADetail;