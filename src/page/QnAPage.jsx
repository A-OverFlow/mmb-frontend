import React, {useState} from "react";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  TextField,
  Button,
  List,
  ListItem,
  CircularProgress
} from "@mui/material";
import {ThumbUp, Comment} from "@mui/icons-material";
import InfiniteScroll from "react-infinite-scroll-component";

// 더미 데이터 (하드코딩된 데이터 사용)
const dummyData = [
  {id: 1, title: "Q1: How to use React?", body: "I'm trying to learn React, but I don't know where to start."},
  {
    id: 2,
    title: "Q2: What's the best state management for React?",
    body: "Should I use Redux or React Context for state management?"
  },
  {
    id: 3,
    title: "Q3: How do I optimize performance in React?",
    body: "What are some good practices to optimize React app performance?"
  },
  {
    id: 4,
    title: "Q4: What's the difference between React and Vue?",
    body: "Can someone explain the main differences between React and Vue?"
  },
  {
    id: 5,
    title: "Q5: How do I deploy a React app?",
    body: "I'm unsure how to deploy a React app to production. Can anyone guide me?"
  }
];

// 더미 데이터를 반환하는 함수 (API 대신 사용)
const fetchQuestions = async ({pageParam = 1}) => {
  // 페이지네이션을 위해 데이터 슬라이싱
  const pageSize = 5;
  const startIndex = (pageParam - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  // 여기서 하드코딩된 더미 데이터를 반환
  return dummyData.slice(startIndex, endIndex);
};

export default function QnAPage() {
  const {data, fetchNextPage, hasNextPage} = useInfiniteQuery({
    queryKey: ["questions"],
    queryFn: fetchQuestions,
    getNextPageParam: (lastPage, allPages) => (lastPage.length ? allPages.length + 1 : undefined),
  });

  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({});

  const handleLike = (id) => {
    setLikes((prev) => ({...prev, [id]: (prev[id] || 0) + 1}));
  };

  const handleCommentChange = (id, text) => {
    setNewComments((prev) => ({...prev, [id]: text}));
  };

  const handleAddComment = (id) => {
    if (!newComments[id]) return;
    setComments((prev) => ({...prev, [id]: [...(prev[id] || []), newComments[id]]}));
    setNewComments((prev) => ({...prev, [id]: ""}));
  };

  return (
    <div style={{maxWidth: "600px", margin: "auto", padding: "20px"}}>
      <Typography variant="h4" gutterBottom>QnA 게시판</Typography>
      <InfiniteScroll
        dataLength={data?.flat().length || 0}
        next={fetchNextPage}
        hasMore={hasNextPage}
        loader={<CircularProgress/>}
      >
        {data?.flat().map((question) => (
          <Card key={question.id} style={{marginBottom: "20px"}}>
            <CardContent>
              <Typography variant="h6">{question.title}</Typography>
              <Typography>{question.body}</Typography>
              <IconButton onClick={() => handleLike(question.id)}>
                <ThumbUp color={likes[question.id] ? "primary" : "default"}/> {likes[question.id] || 0}
              </IconButton>
              <IconButton>
                <Comment/> {comments[question.id]?.length || 0}
              </IconButton>
              <List>
                {comments[question.id]?.map((comment, index) => (
                  <ListItem key={index}>{comment}</ListItem>
                ))}
              </List>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={newComments[question.id] || ""}
                onChange={(e) => handleCommentChange(question.id, e.target.value)}
                placeholder="댓글을 입력하세요"
              />
              <Button onClick={() => handleAddComment(question.id)} variant="contained" style={{marginTop: "10px"}}>
                댓글 추가
              </Button>
            </CardContent>
          </Card>
        ))}
      </InfiniteScroll>
    </div>
  );
}
