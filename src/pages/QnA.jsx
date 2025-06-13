import React, {useEffect, useState} from "react";
import {Box, Switch, Typography} from "@mui/material";
import {useSelector} from "react-redux";
import axios from "../api/axios";
import PostInput from "../components/PostInput";
import Question from "../components/Question";

const QnA = () => {
  // 게시글 리스트 상태
  const [posts, setPosts] = useState([]);
  // 수정 중인 게시글
  const [editingPost, setEditingPost] = useState(null);
  // 추가 로드 가능 여부
  const [hasMore, setHasMore] = useState(true);
  // 마지막으로 불러온 게시글 ID
  const [lastId, setLastId] = useState(null);
  // 내가 쓴 글만 보기 플래그
  const [showOnlyMine, setShowOnlyMine] = useState(false);

  // 리덕스에서 사용자 정보 가져오기
  const userId = useSelector((state) => state.auth.id);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const userNickname = useSelector((state) => state.auth.nickname);

  /**
   * 서버에서 게시글을 가져오는 함수
   * @param {boolean} reset - true면 리스트 초기화, false면 이어서 로드
   */
  const fetchPosts = async (reset = false) => {
    try {
      // 쿼리 파라미터 설정
      const params = new URLSearchParams();
      params.append("pageSize", 10);
      if (!reset && lastId) params.append("lastId", lastId);
      if (showOnlyMine) params.append("authorId", userId);

      const url = `/v1/questions?${params.toString()}`;
      const response = await axios.get(url);
      const {questions, hasNext, lastId: newLastId} = response.data;

      // 기존 게시글과 병합 후 중복 제거
      setPosts((prev) => {
        const combined = reset ? questions : [...prev, ...questions];
        const uniqueMap = new Map(combined.map((p) => [p.id, p]));
        return Array.from(uniqueMap.values());
      });

      setHasMore(hasNext);
      setLastId(newLastId);
    } catch (error) {
      console.error("게시글 가져오기 에러:", error);
    }
  };

  // 게시글 등록 및 수정 처리
  const handlePostSubmit = async (post) => {
    try {
      if (post.id) {
        // 수정 모드
        await axios.put(`/v1/questions/${post.id}`, post);
        setEditingPost(null);
      } else {
        // 새 글 등록
        post.author = userNickname;
        await axios.post("/v1/questions", post);
      }
      // 완료 후 리스트 초기화해서 재조회
      fetchPosts(true);
    } catch (error) {
      console.error("게시글 제출 에러:", error);
    }
  };

  // 수정 모드 활성화
  const handleEditPost = (postId) => {
    const post = posts.find((p) => p.id === postId);
    setEditingPost(post);
  };

  // 수정 취소
  const handleCancelEdit = () => {
    setEditingPost(null);
  };

  // 게시글 삭제 처리
  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`/v1/questions/${postId}`);
      // 삭제 후 리스트 초기화해서 재조회
      fetchPosts(true);
    } catch (error) {
      console.error("게시글 삭제 에러:", error);
    }
  };

  // '내가 쓴 글만 보기' 토글 시 상태 초기화 및 재조회
  useEffect(() => {
    setLastId(null);
    setHasMore(true);
    fetchPosts(true);
  }, [showOnlyMine]);

  return (
    <>
      {/* 글쓰기 폼 (로그인 시만 표시) */}
      <PostInput
        onSubmit={handlePostSubmit}
        editingPost={editingPost}
        onCancelEdit={handleCancelEdit}
        isLoggedIn={!!accessToken}
      />

      {/* 내가 쓴 글만 보기 토글 */}
      {accessToken && (
        <Box sx={{display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1, mt: 2, mb: 2, px: 2}}>
          <Typography variant="body2" color="text.secondary">
            내가 쓴 글만 보기
          </Typography>
          <Switch
            checked={showOnlyMine}
            onChange={(e) => setShowOnlyMine(e.target.checked)}
            color="primary"
          />
        </Box>
      )}

      {/* 질문 리스트 출력 */}
      <Question
        posts={posts}
        fetchMorePosts={fetchPosts}
        hasMore={hasMore}
        onEditPost={handleEditPost}
        onDeletePost={handleDeletePost}
      />
    </>
  );
};

export default QnA;