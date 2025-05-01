// QnA.jsx
import React, {useEffect, useRef, useState} from "react";
import {useSelector} from "react-redux";
import axios from "../api/axios";
import PostInput from "../components/PostInput";
import Board from "../components/Board";

const QnA = () => {
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null); // 수정 중인 게시글
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const isFetching = useRef(false);
  const userNickname = useSelector((state) => state.auth.userNickname)

  const fetchPosts = async (reset = false) => {
    try {
      if (isFetching.current) return;
      isFetching.current = true;

      const response = await axios.get("/v1/questions");
      const newPosts = response.data;
      console.log(newPosts);

      // todo 페이징 아직 없음
      // setPosts((prevPosts) => (reset ? newPosts : [...prevPosts, ...newPosts]));
      // setHasMore(newPosts.length > 0);
      // setPage((prevPage) => (reset ? 1 : prevPage + 1));

      setPosts(newPosts);

      isFetching.current = false;
    } catch (error) {
      console.error("Error fetching posts:", error);
      isFetching.current = false;
    }
  };

  const handlePostSubmit = async (post) => {
    try {
      if (post.id) {
        // 수정 요청
        await axios.put(`/v1/questions/${post.id}`, post);
        setEditingPost(null); // 수정 완료 후 초기화
      } else {
        // 새 게시글 작성
        post.author = userNickname; // todo 작성자 설정할 필요 없을 듯
        await axios.post("/v1/questions", post);
      }
      fetchPosts(true);
    } catch (error) {
      console.error("Error submitting post:", error);
    }
  };

  const handleEditPost = (postId) => {
    const postToEdit = posts.find((post) => post.id === postId);
    setEditingPost(postToEdit); // 수정 모드로 설정
  };

  const handleCancelEdit = () => {
    setEditingPost(null); // 수정 취소
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
    fetchPosts(true);
  }, []);

  return (
    <>
      {accessToken ? (
        <PostInput
          onSubmit={handlePostSubmit}
          editingPost={editingPost}
          onCancelEdit={handleCancelEdit}
        />
      ) : null}
      <Board
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