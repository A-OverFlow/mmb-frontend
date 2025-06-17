import React, { useEffect, useState } from 'react';
import { Box, Button, IconButton, TextField, Typography, Paper, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from '../api/axios';
import { useSelector } from 'react-redux';

const Answer = ({ questionId, questionAuthorId }) => {
  const accessToken = useSelector(state => state.auth.accessToken);
  const userId = useSelector(state => state.auth.id);

  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const fetchAnswers = async () => {
    try {
      const res = await axios.get(`/v1/answers/${questionId}`);
      setAnswers(res.data);
    } catch (err) {
      console.error('답변 목록 조회 실패:', err);
    }
  };

  useEffect(() => {
    if (!questionId) return;
    fetchAnswers();
  }, [questionId]);

  const handleSubmit = async () => {
    if (!newAnswer.trim()) return;
    try {
      await axios.post('/v1/answers', { questionId, answer: newAnswer });
      setNewAnswer('');
      fetchAnswers();
    } catch (err) {
      console.error('답변 등록 실패:', err);
    }
  };

  const handleDelete = async answerId => {
    try {
      await axios.delete(`/v1/answers/${answerId}`);
      fetchAnswers();
    } catch (err) {
      console.error('답변 삭제 실패:', err);
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.patch(`/v1/answers/${editingAnswerId}`, { answer: editingContent });
      setEditingAnswerId(null);
      setEditingContent('');
      fetchAnswers();
    } catch (err) {
      console.error('답변 수정 실패:', err);
    }
  };

  const handleStartEdit = answer => {
    setEditingAnswerId(answer.answerId);
    setEditingContent(answer.answer);
  };

  const handleCancelEdit = () => {
    setEditingAnswerId(null);
    setEditingContent('');
  };

  return (
    <Box>
      {answers.length === 0 ? (
        <Typography color="text.secondary">아직 답변이 없습니다.</Typography>
      ) : (
        answers.map(ans => (
          <Paper
            key={ans.answerId}
            variant="outlined"
            sx={{ mb: 2, p: 2, backgroundColor: '#fff' }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography
                variant="subtitle2"
                color="primary.main"
                sx={ans.userId === questionAuthorId ? { fontWeight: 'bold' } : {}}
              >
                {ans.userId === questionAuthorId && '<작성자> '}
                {ans.author || '알 수 없음'}
                <Typography component="span" variant="subtitle2">
                  #{ans.userId}
                </Typography>
              </Typography>

              {ans.userId === userId && (
                <Box>
                  <IconButton size="small" onClick={() => handleStartEdit(ans)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setDeleteTargetId(ans.answerId);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
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
                  onChange={e => setEditingContent(e.target.value)}
                  sx={{ mt: 1, backgroundColor: '#fff' }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                  <Button size="small" onClick={handleCancelEdit}>
                    취소
                  </Button>
                  <Button size="small" variant="contained" onClick={handleUpdate}>
                    수정
                  </Button>
                </Box>
              </>
            ) : (
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
                {ans.answer}
              </Typography>
            )}

            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              작성일: {new Date(ans.createdAt).toLocaleString()}
            </Typography>
          </Paper>
        ))
      )}

      {accessToken ? (
        <>
          <TextField
            fullWidth
            label="답변 작성"
            multiline
            minRows={3}
            value={newAnswer}
            onChange={e => setNewAnswer(e.target.value)}
            sx={{ mt: 2, backgroundColor: '#fff' }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Button variant="contained" onClick={handleSubmit} disabled={!newAnswer.trim()}>
              등록
            </Button>
          </Box>
        </>
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2, fontStyle: 'italic', textAlign: 'center' }}
        >
          지금 로그인하고 답변을 작성해 보세요.
        </Typography>
      )}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>답변 삭제 확인</DialogTitle>
        <DialogContent>
          <Typography>정말 이 답변을 삭제하시겠어요?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>취소</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDelete(deleteTargetId);
              setDeleteDialogOpen(false);
            }}
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Answer;
