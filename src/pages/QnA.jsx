// QnA.jsx
import React, {useState, useRef, useEffect} from "react";
import {useSelector} from "react-redux";
import axios from "../api/axios";
import PostInput from "../components/PostInput";
import Board from "../components/Board";

const QnA = () => {
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null); // 수정 중인 게시글
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  // const accessToken = useSelector((state) => state.auth.accessToken);
  const accessToken = true; // 아직 백엔드가 없으니까 일단 true로 설정
  const isFetching = useRef(false);

  const fetchPosts = async (reset = false) => {
    try {
      if (isFetching.current) return;
      isFetching.current = true;

      // JSONPlaceholder API
      // todo 백엔드 API 교체
      const response = await axios.get("https://jsonplaceholder.typicode.com/posts", {
        params: {
          _page: reset ? 1 : page,  // JSONPlaceholder는 페이지가 1부터 시작
          _limit: 10,               // 한 페이지당 10개 데이터
        },
      });

      const newPosts = response.data;
      console.log(newPosts);
      setPosts((prevPosts) => (reset ? newPosts : [...prevPosts, ...newPosts]));
      setHasMore(newPosts.length > 0);
      setPage((prevPage) => (reset ? 1 : prevPage + 1));

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
        await axios.put(`/qna/posts/${post.id}`, post);
        setEditingPost(null); // 수정 완료 후 초기화
      } else {
        // 새 게시글 작성
        await axios.post("/qna/posts", post);
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
      await axios.delete(`/qna/posts/${postId}`);
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