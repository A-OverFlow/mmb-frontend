import React, { useEffect, useRef, useState } from "react";
import { Box, FormControlLabel, Switch } from "@mui/material";
import { useSelector } from "react-redux";
import axios from "../api/axios";
import PostInput from "../components/PostInput";
import Board from "../components/Board";

const QnA = () => {
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastId, setLastId] = useState(null);
  const [showOnlyMine, setShowOnlyMine] = useState(false); // ✅ 스위치 상태
  const isFetching = useRef(false);
  const loaderRef = useRef(null);

  const userId = useSelector((state) => state.auth.id);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const userNickname = useSelector((state) => state.auth.nickname);

  const fetchPosts = async (reset = false) => {
    try {
      if (isFetching.current || (!hasMore && !reset)) return;
      isFetching.current = true;

      const params = new URLSearchParams();
      params.append("pageSize", 10);
      if (!reset && lastId) params.append("lastId", lastId);
      if (showOnlyMine) params.append("authorId", userId); // ✅ 본인 글만 보기 적용

      const url = `/v1/questions?${params.toString()}`;

      const response = await axios.get(url);
      const { questions, hasNext, lastId: newLastId } = response.data;

      setPosts((prev) => {
        const combined = reset ? questions : [...prev, ...questions];
        const uniqueMap = new Map(combined.map((post) => [post.id, post]));
        return Array.from(uniqueMap.values());
      });

      setHasMore(hasNext);
      setLastId(newLastId);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      isFetching.current = false;
    }
  };

  const handlePostSubmit = async (post) => {
    try {
      if (post.id) {
        await axios.put(`/v1/questions/${post.id}`, post);
        setEditingPost(null);
      } else {
        post.author = userNickname;
        await axios.post("/v1/questions", post);
      }
      fetchPosts(true);
    } catch (error) {
      console.error("Error submitting post:", error);
    }
  };

  const handleEditPost = (postId) => {
    const postToEdit = posts.find((post) => post.id === postId);
    setEditingPost(postToEdit);
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
  };

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`/v1/questions/${postId}`);
      fetchPosts(true);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  useEffect(() => {
    fetchPosts(true); // 초기 또는 스위치 변경 시 호출
  }, [showOnlyMine]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchPosts();
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [posts, hasMore]);

  return (
    <>
      {accessToken && (
        <PostInput
          onSubmit={handlePostSubmit}
          editingPost={editingPost}
          onCancelEdit={handleCancelEdit}
        />
      )}

      {accessToken && (
        <Box sx={{ textAlign: "right", marginTop: 2, marginBottom: 1, paddingX: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={showOnlyMine}
                onChange={(e) => {
                  setShowOnlyMine(e.target.checked);
                  setLastId(null);
                }}
                color="primary"
              />
            }
            label="내가 쓴 글만 보기"
          />
        </Box>
      )}


      <Board
        posts={posts}
        fetchMorePosts={fetchPosts}
        hasMore={hasMore}
        onEditPost={handleEditPost}
        onDeletePost={handleDeletePost}
      />
      <div ref={loaderRef} style={{ height: 30 }} />
    </>
  );
};

export default QnA;
