// src/pages/QnA.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Typography } from '@mui/material'; // Switch, Box import 제거
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import PostInput from '../components/PostInput';
import Question from '../components/Question';
import InfiniteScroll from 'react-infinite-scroll-component';

const QnA = () => {
  const { questionId } = useParams();
  const isActive = !questionId; // 상세 페이지 진입 시 false

  const [posts, setPosts] = useState([]);
  const [editingPost, setEditing] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastId, setLastId] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const userId = useSelector(state => state.auth.id);
  const accessToken = useSelector(state => state.auth.accessToken);
  const nickname = useSelector(state => state.auth.nickname);

  const didInitFetch = useRef(false);

  const fetchPosts = async (reset = false) => {
    if (!reset && loadingMore) return; // 중복 호출 방지

    try {
      if (!reset) setLoadingMore(true);

      const params = new URLSearchParams();
      params.append('pageSize', 10);
      if (!reset && lastId) {
        params.append('lastId', lastId);
      }
      // 'showMine' 기능 제거로 authorId 파라미터 로직 삭제

      const res = await axios.get(`/v1/questions?${params.toString()}`);
      const { questions, hasNext, lastId: newLastId } = res.data;

      setPosts(prev => {
        // 중복 제거 후 병합
        const merged = reset ? questions : [...prev, ...questions];
        const uniqMap = new Map(merged.map(p => [p.id, p]));
        return Array.from(uniqMap.values());
      });
      setHasMore(hasNext);
      setLastId(newLastId);
    } catch (error) {
      console.error('게시글 가져오기 실패', error);
    } finally {
      if (!reset) setLoadingMore(false);
    }
  };

  // 최초 한 번만 초기 로드
  useEffect(() => {
    if (!didInitFetch.current) {
      didInitFetch.current = true;
      fetchPosts(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePostSubmit = async post => {
    try {
      if (post.id) {
        await axios.put(`/v1/questions/${post.id}`, post);
        setEditing(null);
      } else {
        post.author = nickname;
        await axios.post('/v1/questions', post);
      }
      fetchPosts(true);
    } catch (error) {
      console.error('게시글 제출 실패', error);
    }
  };

  const handleEdit = id => setEditing(posts.find(p => p.id === id));
  const handleCancel = () => setEditing(null);
  const handleDelete = async id => {
    try {
      await axios.delete(`/v1/questions/${id}`);
      fetchPosts(true);
    } catch (error) {
      console.error('게시글 삭제 실패', error);
    }
  };

  return (
    <>
      {accessToken && (
        <PostInput
          onSubmit={handlePostSubmit}
          editingPost={editingPost}
          onCancelEdit={handleCancel}
          isLoggedIn
        />
      )}

      <InfiniteScroll
        dataLength={posts.length}
        next={isActive && hasMore ? () => fetchPosts(false) : undefined}
        hasMore={isActive && hasMore}
        loader={
          isActive &&
          !loadingMore && (
            <Typography align="center" sx={{ my: 2 }}>
              로딩 중…
            </Typography>
          )
        }
        endMessage={
          isActive && (
            <Typography align="center" mb={3}>
              - 끝 -
            </Typography>
          )
        }
      >
        <Question
          posts={posts}
          fetchMorePosts={fetchPosts}
          hasMore={hasMore}
          onEditPost={handleEdit}
          onDeletePost={handleDelete}
        />
      </InfiniteScroll>
    </>
  );
};

export default QnA;
