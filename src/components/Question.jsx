import React, {useEffect, useState} from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import {useSelector} from "react-redux";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import Answer from "./Answer";
import axios from "../api/axios";
import UserInfo from "../components/UserInfo.jsx";

/**
 * 질문 리스트 컴포넌트
 */
const Question = ({posts, fetchMorePosts, hasMore, onEditPost, onDeletePost}) => {
  const userId = useSelector((state) => state.auth.id);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState([]);
  const [showMoreButton, setShowMoreButton] = useState({});
  const [answerCounts, setAnswerCounts] = useState({});
  const [answerOpen, setAnswerOpen] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState(null);

  // 메뉴 열기
  const handleMenuClick = (e, post) => {
    setAnchorEl(e.currentTarget);
    setSelectedPost(post);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPost(null);
  };

  // 본문 확장/축소
  const toggleExpand = (postId) => {
    setExpandedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  // 답변 보기
  const handleAnswerClick = (postId) => {
    setActiveQuestionId(postId);
    setAnswerOpen(true);
  };
  const handleCloseAnswer = () => {
    setAnswerOpen(false);
    setActiveQuestionId(null);
  };

  // 새 게시글에 대해서만 답변 수 조회
  const fetchAnswerCounts = async (newPosts) => {
    const uncachedPosts = newPosts.filter((post) => !(post.id in answerCounts));
    if (uncachedPosts.length === 0) return;

    const counts = {};
    await Promise.all(
      uncachedPosts.map(async (post) => {
        try {
          const res = await axios.get(`/v1/answers/${post.id}`);
          counts[post.id] = Array.isArray(res.data) ? res.data.length : 0;
        } catch {
          counts[post.id] = 0;
        }
      })
    );

    setAnswerCounts((prev) => ({...prev, ...counts}));
  };

  const handleAnswerCountUpdate = async (questionId) => {
    try {
      const res = await axios.get(`/v1/answers/${questionId}`);
      const updatedCount = Array.isArray(res.data) ? res.data.length : 0;
      setAnswerCounts((prev) => ({
        ...prev,
        [questionId]: updatedCount,
      }));
    } catch (error) {
      console.error("답변 수 업데이트 실패:", error);
    }
  };

  // 게시글 변경 시 더보기 버튼 + 답변 수 처리
  useEffect(() => {
    posts.forEach((post) => {
      const el = document.getElementById(`post-content-${post.id}`);
      if (el && el.scrollHeight > el.clientHeight) {
        setShowMoreButton((prev) => ({...prev, [post.id]: true}));
      }
    });

    if (posts.length > 0) {
      fetchAnswerCounts(posts);
    }
  }, [posts]);

  return (
    <div>
      <InfiniteScroll
        dataLength={posts.length}
        next={() => hasMore && fetchMorePosts(false)}
        hasMore={hasMore}
        loader={<CircularProgress sx={{display: "block", margin: "20px auto"}}/>}
        endMessage={
          <Typography align="center" mb={3}>
            - 끝 -
          </Typography>
        }
      >
        {posts.map((post) => (
          <Card key={post.id} sx={{mb: 2, p: 1, boxShadow: "none", position: "relative"}}>
            <CardContent>
              {/* 작성자(User) 정보(아이콘 + 닉네임 + 아이디) 컴포넌트 분리 */}
              <UserInfo user={post.author}/>

              <Typography variant="h6" sx={{mb: 1}}>{post.subject}</Typography>

              <Box
                id={`post-content-${post.id}`}
                sx={{
                  maxHeight: expandedPosts.includes(post.id) ? "none" : 150,
                  overflow: "hidden",
                  whiteSpace: "pre-wrap",
                }}
              >
                <Typography variant="body2" sx={{mb: 1}}>{post.content}</Typography>
              </Box>

              {showMoreButton[post.id] && !expandedPosts.includes(post.id) && (
                <Box sx={{textAlign: "right", mb: 1}}>
                  <Button size="small" onClick={() => toggleExpand(post.id)} sx={{textTransform: "none", p: 0}}>
                    더보기
                  </Button>
                </Box>
              )}
              {expandedPosts.includes(post.id) && (
                <Box sx={{textAlign: "right", mt: 1}}>
                  <Button size="small" onClick={() => toggleExpand(post.id)} sx={{textTransform: "none", p: 0}}>
                    간략히
                  </Button>
                </Box>
              )}

              <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1}}>
                <Typography variant="caption" color="text.secondary">
                  작성일: {new Date(post.createdAt).toLocaleString()}
                </Typography>
                <IconButton size="small" onClick={() => handleAnswerClick(post.id)}>
                  <Badge badgeContent={answerCounts[post.id] ?? 0} color="primary" showZero>
                    <ChatBubbleOutlineIcon fontSize="small"/>
                  </Badge>
                </IconButton>
              </Box>

              {/* 메뉴 (작성자 본인일 경우만 표시) */}
              {userId === post.author.id && (
                <IconButton
                  size="small"
                  sx={{position: "absolute", top: 8, right: 8}}
                  onClick={(e) => handleMenuClick(e, post)}
                >
                  <MoreVertIcon/>
                </IconButton>
              )}

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
            </CardContent>
          </Card>
        ))}
      </InfiniteScroll>

      {/* 답변 모달 */}
      <Answer
        open={answerOpen}
        onClose={handleCloseAnswer}
        questionId={activeQuestionId}
        userId={userId}
        onAnswerChanged={handleAnswerCountUpdate}
      />
    </div>
  );
};

export default Question;
