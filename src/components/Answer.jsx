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
import SurveyCorpsIcon from "@/components/icons/SurveyCorpsIcon";

const Answer = ({open, onClose, questionId, userId}) => {
  const accessToken = useSelector((state) => state.auth.accessToken); // ✅ 로그인 여부 확인

  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  const fetchAnswers = async () => {
    try {
      const res = await axios.get(`/v1/questions/${questionId}/answers`);
      setAnswers(res.data);
    } catch (err) {
      console.error("답변 목록 조회 실패:", err);
    }
  };

  const handleSubmit = async () => {
    if (!newAnswer.trim()) return;

    try {
      await axios.post("/v1/answers", {
        questionId,
        answer: newAnswer,
      });
      setNewAnswer("");
      fetchAnswers();
    } catch (err) {
      console.error("답변 등록 실패:", err);
    }
  };

  const handleDelete = async (answerId) => {
    try {
      await axios.delete(`/v1/answers/${answerId}`);
      fetchAnswers();
    } catch (err) {
      console.error("답변 삭제 실패:", err);
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.patch(`/v1/answers/${editingAnswerId}`, {
        answer: editingContent,
      });
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

  useEffect(() => {
    if (open) fetchAnswers();
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>답변</DialogTitle>
      <DialogContent dividers>
        <List>
          {answers.length === 0 && (
            <Typography color="text.secondary">아직 답변이 없습니다.</Typography>
          )}
          {answers.map((answer) => (
            <ListItem
              key={answer.answerId}
              alignItems="flex-start"
              sx={{flexDirection: "column", alignItems: "stretch"}}
            >
              <Box sx={{display: "flex", justifyContent: "space-between"}}>
                <Typography
                  variant="subtitle2"
                  color="primary.main"
                  sx={{display: "flex", alignItems: "center"}}
                >
                  {answer.userId === 2 && (
                    <SurveyCorpsIcon fontSize="medium" sx={{mr: 0.5}}/>
                  )}
                  {answer.author || "익명"}
                  <Typography
                    component="span"
                    color="text.secondary"
                    sx={{ml: 0.5}}
                  >
                    #{answer.userId}
                  </Typography>
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                    sx={{ml: 0.5}}
                  >
                    ({new Date(answer.createdAt).toLocaleString()})
                  </Typography>
                </Typography>

                {answer.userId === userId && (
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleStartEdit(answer)}
                    >
                      <EditIcon fontSize="small"/>
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(answer.answerId)}
                    >
                      <DeleteIcon fontSize="small"/>
                    </IconButton>
                  </Box>
                )}
              </Box>

              {editingAnswerId === answer.answerId ? (
                <>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    sx={{mt: 1}}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 1,
                      mt: 1,
                    }}
                  >
                    <Button size="small" onClick={handleCancelEdit}>
                      취소
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleUpdate}
                    >
                      수정
                    </Button>
                  </Box>
                </>
              ) : (
                <Typography
                  variant="body2"
                  sx={{whiteSpace: "pre-wrap", mt: 1}}
                >
                  {answer.answer}
                </Typography>
              )}
            </ListItem>
          ))}
        </List>

        {/* ✅ 로그인한 경우에만 입력창 표시, 아니면 안내문구 */}
        {accessToken ? (
          <TextField
            fullWidth
            label="답변 작성"
            multiline
            minRows={3}
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            sx={{marginTop: 2}}
          />
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{mt: 2, fontStyle: "italic", textAlign: "center"}}
          >
            로그인 후 답변을 작성할 수 있습니다.
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
        {accessToken && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!newAnswer.trim()}
          >
            등록
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default Answer;
