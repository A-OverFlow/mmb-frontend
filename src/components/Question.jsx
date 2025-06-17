import React, { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import axios from '../api/axios';
import UserInfo from './UserInfo';

const Question = ({
                    posts,
                    fetchMorePosts,
                    hasMore,
                    onEditPost,
                    onDeletePost,
                    hideCommentButton = false,
                  }) => {
  const navigate = useNavigate();
  const userId = useSelector(state => state.auth.id);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState([]);
  const [showMoreButton, setShowMoreButton] = useState({});
  const [answerCounts, setAnswerCounts] = useState({});
  const [lastAnswers, setLastAnswers] = useState({});

  // 본문 토글
  const toggleExpand = postId => {
    setExpandedPosts(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  // 답변(댓글) 페이지 이동
  const handleAnswerClick = post => {
    navigate(`/qna/${post.id}`);
  };

  // 메뉴 열기/닫기
  const handleMenuClick = (e, post) => {
    setAnchorEl(e.currentTarget);
    setSelectedPost(post);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPost(null);
  };

  // 답변 개수와 마지막 답변 스니펫 불러오기
  const fetchAnswerData = async newPosts => {
    const uncached = newPosts.filter(
      p => !(p.id in answerCounts) || !(p.id in lastAnswers)
    );
    if (!uncached.length) return;

    const counts = {};
    const snippets = {};
    await Promise.all(
      uncached.map(async p => {
        try {
          const res = await axios.get(`/v1/answers/${p.id}`);
          const answers = Array.isArray(res.data) ? res.data : [];
          counts[p.id] = answers.length;
          const last = answers[answers.length - 1];
          snippets[p.id] = last?.answer?.slice(0, 100) || '';
        } catch {
          counts[p.id] = 0;
          snippets[p.id] = '';
        }
      })
    );
    setAnswerCounts(prev => ({ ...prev, ...counts }));
    setLastAnswers(prev => ({ ...prev, ...snippets }));
  };

  useEffect(() => {
    // “더보기” 버튼 여부 체크
    posts.forEach(post => {
      const el = document.getElementById(`post-content-${post.id}`);
      if (el && el.scrollHeight > el.clientHeight) {
        setShowMoreButton(prev => ({ ...prev, [post.id]: true }));
      }
    });
    if (posts.length) {
      fetchAnswerData(posts);
    }
  }, [posts]);

  return (
    <>
      {posts.map(post => (
        <Card
          key={post.id}
          sx={{ mb: 2, p: 1, boxShadow: 'none', position: 'relative' }}
        >
          <CardContent>
            <UserInfo user={post.author} />

            <Typography variant="h6" sx={{ mb: 1 }}>
              {post.subject}
            </Typography>

            <Box
              id={`post-content-${post.id}`}
              sx={{
                maxHeight: expandedPosts.includes(post.id) ? 'none' : 150,
                overflow: 'hidden',
                whiteSpace: 'pre-wrap'
              }}
            >
              <Typography variant="body2" sx={{ mb: 1 }}>
                {post.content}
              </Typography>
            </Box>

            {showMoreButton[post.id] && !expandedPosts.includes(post.id) && (
              <Box sx={{ textAlign: 'right', mb: 1 }}>
                <Button
                  size="small"
                  onClick={() => toggleExpand(post.id)}
                  sx={{ textTransform: 'none', p: 0 }}
                >
                  더보기
                </Button>
              </Box>
            )}
            {expandedPosts.includes(post.id) && (
              <Box sx={{ textAlign: 'right', mt: 1 }}>
                <Button
                  size="small"
                  onClick={() => toggleExpand(post.id)}
                  sx={{ textTransform: 'none', p: 0 }}
                >
                  간략히
                </Button>
              </Box>
            )}

            {/* 작성일 */}
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                작성일: {new Date(post.createdAt).toLocaleString()}
              </Typography>
            </Box>

            {/* 최근 답변 + 댓글 버튼 영역 (댓글 숨김 시, 전체 영역 숨김) */}
            {!hideCommentButton && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 1,
                }}
              >
                <SubdirectoryArrowRightIcon fontSize="small" sx={{ mr: 0.5 }} />

                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {lastAnswers[post.id] || '아직 답변이 없습니다.'}
                </Typography>

                <IconButton size="small" onClick={() => handleAnswerClick(post)}>
                  <Badge
                    badgeContent={answerCounts[post.id] ?? 0}
                    color="primary"
                    showZero
                  >
                    <ChatBubbleOutlineIcon fontSize="small" />
                  </Badge>
                </IconButton>
              </Box>
            )}

            {/* 본인 글일 때만 수정/삭제 */}
            {userId === post.author.id && (
              <>
                <IconButton
                  size="small"
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                  onClick={e => handleMenuClick(e, post)}
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl) && selectedPost?.id === post.id}
                  onClose={handleMenuClose}
                >
                  <MenuItem
                    onClick={() => {
                      onEditPost(selectedPost.id);
                      handleMenuClose();
                    }}
                  >
                    수정
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      onDeletePost(selectedPost.id);
                      handleMenuClose();
                    }}
                  >
                    삭제
                  </MenuItem>
                </Menu>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default Question;
