// Answer.jsx
import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "../api/axios";

const Answer = ({open, onClose, questionId, questionAuthorId, userId, onAnswerChanged}) => {
  const accessToken = useSelector((state) => state.auth.accessToken);

  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  const fetchAnswers = async () => {
    try {
      const res = await axios.get(`/v1/answers/${questionId}`);
      setAnswers(res.data);
    } catch (err) {
      console.error("답변 목록 조회 실패:", err);
    }
  };

  // 모달 열 때마다 입력/편집 상태 초기화 및 답변 로드
  useEffect(() => {
    if (open) {
      fetchAnswers();
      setNewAnswer("");
      setEditingAnswerId(null);
      setEditingContent("");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!newAnswer.trim()) return;
    try {
      await axios.post("/v1/answers", {questionId, answer: newAnswer});
      setNewAnswer("");
      fetchAnswers();
      onAnswerChanged?.(questionId);
    } catch (err) {
      console.error("답변 등록 실패:", err);
    }
  };

  const handleDelete = async (answerId) => {
    try {
      await axios.delete(`/v1/answers/${answerId}`);
      fetchAnswers();
      onAnswerChanged?.(questionId);
    } catch (err) {
      console.error("답변 삭제 실패:", err);
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.patch(`/v1/answers/${editingAnswerId}`, {answer: editingContent});
      setEditingAnswerId(null);
      setEditingContent("");
      fetchAnswers();
    } catch (err) {
      console.error("답변 수정 실패:", err);
    }
  };

  const handleStartEdit = (answer) => {
    setEditingAnswerId(answer.answerId);
    setEditingContent(answer.answer);
  };
  const handleCancelEdit = () => {
    setEditingAnswerId(null);
    setEditingContent("");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>답변</DialogTitle>
      <DialogContent dividers>
        <List>
          {answers.length === 0 && <Typography color="text.secondary">아직 답변이 없습니다.</Typography>}
          {answers.map((ans) => (
            <ListItem key={ans.answerId} sx={{flexDirection: "column", alignItems: "stretch"}}>
              <Box sx={{display: "flex", justifyContent: "space-between"}}>
                <Typography
                  variant="subtitle2"
                  color="primary.main"
                  sx={
                    ans.userId === questionAuthorId
                      ? { fontWeight: "bold" }
                      : {}
                  }
                >
                  {/* 질문자 본인 답변인 경우 앞에 '작성자 ' 붙이기 */}
                  {ans.userId === questionAuthorId && '<작성자> '}
                  {ans.author || "익명"}{" "}
                  <Typography component="span" variant="subtitle2">
                    #{ans.userId}
                  </Typography>
                </Typography>

                {ans.userId === userId && (
                  <Box>
                    <IconButton size="small" onClick={() => handleStartEdit(ans)}>
                      <EditIcon fontSize="small"/>
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(ans.answerId)}>
                      <DeleteIcon fontSize="small"/>
                    </IconButton>
                  </Box>
                )}
              </Box>

              {editingAnswerId === ans.answerId ? (
                <>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    sx={{mt: 1}}
                  />
                  <Box sx={{display: "flex", justifyContent: "flex-end", gap: 1, mt: 1}}>
                    <Button size="small" onClick={handleCancelEdit}>취소</Button>
                    <Button size="small" variant="contained" onClick={handleUpdate}>수정</Button>
                  </Box>
                </>
              ) : (
                <Typography variant="body2" sx={{whiteSpace: "pre-wrap", mt: 1}}>
                  {ans.answer}
                </Typography>
              )}

              <Typography variant="caption" color="text.secondary" sx={{mt: 0.5}}>
                작성일: {new Date(ans.createdAt).toLocaleString()}
              </Typography>
            </ListItem>
          ))}
        </List>

        {accessToken ? (
          <TextField
            fullWidth
            label="답변 작성"
            multiline
            minRows={3}
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            sx={{mt: 2}}
          />
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{mt: 2, fontStyle: "italic", textAlign: "center"}}>
            로그인 후 답변을 작성할 수 있습니다.
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
        {accessToken && (
          <Button onClick={handleSubmit} variant="contained" disabled={!newAnswer.trim()}>
            등록
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default Answer;
