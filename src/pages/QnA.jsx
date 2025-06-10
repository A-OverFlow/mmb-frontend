import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import axios from "../api/axios";
import PostInput from "../components/PostInput";
import Board from "../components/Board";

const QnA = () => {
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null); // 수정 중인 게시글
  const [hasMore, setHasMore] = useState(true); // 다음 페이지 존재 여부
  const [lastId, setLastId] = useState(null); // 마지막 질문 ID
  const isFetching = useRef(false); // 중복 호출 방지
  const loaderRef = useRef(null); // 무한 스크롤 트리거
  const accessToken = useSelector((state) => state.auth.accessToken);
  const userNickname = useSelector((state) => state.auth.nickname);

  const fetchPosts = async (reset = false) => {
    try {
      if (isFetching.current || (!hasMore && !reset)) return;
      isFetching.current = true;

      const url = lastId !== null && !reset
        ? `/v1/questions?lastId=${lastId}&pageSize=10`
        : `/v1/questions?pageSize=10`;

      const response = await axios.get(url);
      const { questions, hasNext, lastId: newLastId } = response.data;

      setPosts(prev => {
        const combined = reset ? questions : [...prev, ...questions];
        const uniqueMap = new Map(combined.map(post => [post.id, post]));
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
        post.author = userNickname; // 백엔드에서 설정해줄 경우 생략 가능
        await axios.post("/v1/questions", post);
      }
      fetchPosts(true); // 목록 리셋
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
      fetchPosts(true); // 삭제 후 목록 갱신
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  useEffect(() => {
    fetchPosts(true); // 초기 데이터 로딩
  }, []);

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
