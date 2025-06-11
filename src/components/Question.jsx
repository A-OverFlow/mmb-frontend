import React, { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Badge,
} from "@mui/material";
import { useSelector } from "react-redux";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import Answer from "./Answer";
import axios from "../api/axios";

/**
 * 질문 리스트 컴포넌트
 * @param {Array} posts - 질문 데이터 배열
 * @param {Function} fetchMorePosts - 추가 데이터 로드 함수
 * @param {boolean} hasMore - 추가 로드 가능 여부
 * @param {Function} onEditPost - 수정 버튼 클릭 콜백
 * @param {Function} onDeletePost - 삭제 버튼 클릭 콜백
 */
const Question = ({ posts, fetchMorePosts, hasMore, onEditPost, onDeletePost }) => {
  const userId = useSelector((state) => state.auth.id);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState([]);
  const [showMoreButton, setShowMoreButton] = useState({});
  const [answerCounts, setAnswerCounts] = useState({});
  const [answerOpen, setAnswerOpen] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState(null);

  // 메뉴 열기 핸들러
  const handleMenuClick = (e, post) => {
    setAnchorEl(e.currentTarget);
    setSelectedPost(post);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPost(null);
  };

  // 본문 확장/축소 토글
  const toggleExpand = (postId) => {
    setExpandedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  // 답변 모달 열기
  const handleAnswerClick = (postId) => {
    setActiveQuestionId(postId);
    setAnswerOpen(true);
  };
  // 답변 모달 닫기
  const handleCloseAnswer = () => {
    setAnswerOpen(false);
    setActiveQuestionId(null);
  };

  // 각 질문의 답변 수 조회
  const fetchAnswerCounts = async () => {
    const counts = {};
    await Promise.all(
      posts.map(async (post) => {
        try {
          const res = await axios.get(`/v1/questions/${post.id}/answers`);
          counts[post.id] = Array.isArray(res.data) ? res.data.length : 0;
        } catch {
          counts[post.id] = 0;
        }
      })
    );
    setAnswerCounts(counts);
  };

  // 포스트가 변경될 때마다 '더보기' 버튼 표시 여부 및 답변 수 동기화
  useEffect(() => {
    posts.forEach((post) => {
      const el = document.getElementById(`post-content-${post.id}`);
      if (el && el.scrollHeight > el.clientHeight) {
        setShowMoreButton((prev) => ({ ...prev, [post.id]: true }));
      }
    });
    if (posts.length > 0) {
      fetchAnswerCounts();
    }
  }, [posts]);

  return (
    <div>
      <InfiniteScroll
        dataLength={posts.length}
        next={() => {
          if (hasMore) fetchMorePosts(false);
        }}
        hasMore={hasMore}
        loader={<CircularProgress sx={{ display: "block", margin: "20px auto" }} />}
        endMessage={
          <Typography align="center" mb={3}>
            - 끝 -
          </Typography>
        }
      >
        {posts.map((post) => (
          <Card key={post.id} sx={{ mb: 2, p: 1, boxShadow: "none", position: "relative" }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold", mb: 0.5 }}>
                Question {post.id}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <Typography component="span" color="primary.main" sx={{ mr: 0.5 }}>
                  {post.author.nickname}
                </Typography>
                <Typography component="span" color="text.secondary">
                  #{post.author.id}
                </Typography>
              </Typography>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {post.subject}
              </Typography>
              <Box
                id={`post-content-${post.id}`}
                sx={{ maxHeight: expandedPosts.includes(post.id) ? "none" : 150, overflow: "hidden", whiteSpace: "pre-wrap" }}
              >
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {post.content}
                </Typography>
              </Box>
              {showMoreButton[post.id] && !expandedPosts.includes(post.id) && (
                <Box sx={{ textAlign: "right", mb: 1 }}>
                  <Button size="small" onClick={() => toggleExpand(post.id)} sx={{ textTransform: "none", p: 0 }}>
                    더보기
                  </Button>
                </Box>
              )}
              {expandedPosts.includes(post.id) && (
                <Box sx={{ textAlign: "right", mt: 1 }}>
                  <Button size="small" onClick={() => toggleExpand(post.id)} sx={{ textTransform: "none", p: 0 }}>
                    간략히
                  </Button>
                </Box>
              )}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  작성일: {new Date(post.createdAt).toLocaleString()}
                </Typography>
                <IconButton size="small" onClick={() => handleAnswerClick(post.id)}>
                  <Badge badgeContent={answerCounts[post.id] ?? 0} color="primary" showZero>
                    <ChatBubbleOutlineIcon fontSize="small" />
                  </Badge>
                </IconButton>
              </Box>
              {userId === post.author.id && (
                <IconButton
                  size="small"
                  sx={{ position: "absolute", top: 8, right: 8 }}
                  onClick={(e) => handleMenuClick(e, post)}
                >
                  <MoreVertIcon />
                </IconButton>
              )}
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl) && selectedPost?.id === post.id} onClose={handleMenuClose}>
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
            </CardContent>
          </Card>
        ))}
      </InfiniteScroll>

      {/* 답변 모달 */}
      <Answer open={answerOpen} onClose={handleCloseAnswer} questionId={activeQuestionId} userId={userId} />
    </div>
  );
};

export default Question;
