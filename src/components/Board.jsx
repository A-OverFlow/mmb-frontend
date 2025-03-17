import React, { useState, useRef, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Box, Card, CardContent, CircularProgress, Typography, IconButton, Menu, MenuItem, Button } from "@mui/material";
import { useSelector } from "react-redux"; // Redux에서 상태 가져오기
import dayjs from "dayjs";
import MoreVertIcon from "@mui/icons-material/MoreVert"; // 점 3개 아이콘

const Board = ({ posts, fetchMorePosts, hasMore, onEditPost, onDeletePost }) => {
  const userId = useSelector((state) => state.auth.userId); // Redux에서 사용자 정보 가져오기
  const [anchorEl, setAnchorEl] = useState(null); // 메뉴 anchor element 관리
  const [selectedPost, setSelectedPost] = useState(null); // 선택된 게시글 ID 관리
  const [expandedPosts, setExpandedPosts] = useState([]); // "더보기"가 눌린 게시글 ID 목록
  const [showMoreButton, setShowMoreButton] = useState({}); // 본문이 길어졌을 때 더보기 버튼 표시 여부

  const contentRef = useRef(); // 본문 영역의 ref

  const handleMenuClick = (event, post) => {
    setAnchorEl(event.currentTarget);
    setSelectedPost(post);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditPost = () => {
    if (onEditPost) onEditPost(selectedPost.id);
    handleMenuClose();
  };

  const handleDeletePost = () => {
    if (onDeletePost) onDeletePost(selectedPost.id);
    handleMenuClose();
  };

  const toggleExpand = (postId) => {
    setExpandedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  useEffect(() => {
    // 페이지가 로드될 때, 본문의 높이를 측정하여 더보기 버튼을 표시할지 결정
    posts.forEach((post) => {
      const contentElement = document.getElementById(`post-content-${post.id}`);
      if (contentElement && contentElement.scrollHeight > contentElement.clientHeight) {
        setShowMoreButton((prev) => ({
          ...prev,
          [post.id]: true, // 본문이 넘칠 경우 "더보기" 버튼 표시
        }));
      }
    });
  }, [posts]);

  return (
    <div>
      <InfiniteScroll
        dataLength={posts.length} // 현재 로딩된 게시글 수
        next={() => fetchMorePosts(false)} // 추가 게시글 로드
        hasMore={hasMore} // 더 불러올 데이터가 있는지 여부
        loader={<CircularProgress sx={{ display: "block", margin: "20px auto" }} />}
        endMessage={<Typography align="center" mb={3}>- 끝 -</Typography>}
      >
        {posts.map((post) => (
          <Card
            key={post.id}
            sx={{
              marginBottom: "20px",
              padding: "10px",
              boxShadow: "none",
              position: "relative", // 오른쪽 상단 아이콘을 위한 relative positioning
            }}
          >
            <CardContent>
              <Typography
                variant="body2"
                sx={{ marginBottom: "5px" }}
              >
                <Typography
                  component="span"
                  color="primary.main"  // 테마에서 정의한 primary 색상 적용
                  sx={{ marginRight: "4px" }} // 닉네임과 ID 사이 간격
                >
                  {post.userNickname}
                </Typography>
                <Typography component="span" color="text.secondary">
                  #{post.userId}
                </Typography>
              </Typography>

              <Typography variant="h6" sx={{ marginBottom: "10px" }}>
                {post.title}
              </Typography>



              {/* 본문 내용 */}
              <Box
                id={`post-content-${post.id}`}
                sx={{
                  maxHeight: expandedPosts.includes(post.id) ? "none" : "150px", // 축소된 상태에서는 최대 높이를 제한
                  overflow: "hidden", // 넘치는 내용 숨김
                  whiteSpace: "pre-wrap", // 원본 줄바꿈 그대로 유지
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    marginBottom: "10px",
                  }}
                >
                  {post.content}
                </Typography>
              </Box>

              {/* 더보기/간략히 버튼을 작성일 위에 배치 */}
              {showMoreButton[post.id] && !expandedPosts.includes(post.id) && (
                <Box sx={{ textAlign: "right", marginBottom: "10px" }}>
                  <Button
                    size="small"
                    onClick={() => toggleExpand(post.id)}
                    sx={{ textTransform: "none", padding: 0 }}
                  >
                    더보기
                  </Button>
                </Box>
              )}

              {/* 간략히 버튼 */}
              {expandedPosts.includes(post.id) && (
                <Box sx={{ textAlign: "right", marginTop: "10px" }}>
                  <Button
                    size="small"
                    onClick={() => toggleExpand(post.id)}
                    sx={{ textTransform: "none", padding: 0 }}
                  >
                    간략히
                  </Button>
                </Box>
              )}

              <Box sx={{ textAlign: "right", marginTop: "10px" }}>
                <Typography variant="caption" color="text.secondary">
                  작성일: {dayjs(post.createdAt).format("YYYY-MM-DD HH:mm")}
                </Typography>
              </Box>

              {/* 사용자가 작성한 게시글에만 점 3개 아이콘을 표시 */}
              {userId && post.userId === userId && (
                <IconButton
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                  }}
                  onClick={(event) => handleMenuClick(event, post)}
                >
                  <MoreVertIcon />
                </IconButton>
              )}

              {/* 메뉴 */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl) && selectedPost.id === post.id}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleEditPost}>수정</MenuItem>
                <MenuItem onClick={handleDeletePost}>삭제</MenuItem>
              </Menu>
            </CardContent>
          </Card>
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default Board;
