import React, {useEffect, useState} from "react";
import {Box, Button, Collapse, Paper, TextField, Typography} from "@mui/material";
import {useDispatch} from "react-redux";
import {alert} from "../slices/alertSlice.js";

const PostInput = ({onSubmit, editingPost, onCancelEdit, isLoggedIn}) => {
  const [subject, setSubject] = useState(editingPost ? editingPost.subject : "");
  const [content, setContent] = useState(editingPost ? editingPost.content : "");
  const [expanded, setExpanded] = useState(!!editingPost);
  const [titleError, setTitleError] = useState(false);
  const [contentError, setContentError] = useState(false);
  const [titleHelperText, setTitleHelperText] = useState("");
  const [contentHelperText, setContentHelperText] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    if (editingPost) {
      setSubject(editingPost.subject);
      setContent(editingPost.content);
      setExpanded(true);
      window.scrollTo(0, 0);
    }
  }, [editingPost]);

  const handleClear = () => {
    setSubject("");
    setContent("");
    setExpanded(false);
    setTitleError(false);
    setContentError(false);
    setTitleHelperText("");
    setContentHelperText("");
    if (onCancelEdit) onCancelEdit();
  };

  const handleSubmit = () => {
    let valid = true;

    if (subject.length > 50) {
      setTitleError(true);
      setTitleHelperText("제목은 50자 이내로 입력해주세요.");
      valid = false;
    } else {
      setTitleError(false);
      setTitleHelperText("");
    }

    if (content.length > 1000) {
      setContentError(true);
      setContentHelperText("내용은 1000자 이내로 입력해주세요.");
      valid = false;
    } else {
      setContentError(false);
      setContentHelperText("");
    }

    if (valid && subject && content) {
      onSubmit({subject, content, id: editingPost?.id});
      handleClear();
    }
  };

  const toggleExpanded = () => {
    if (!isLoggedIn) {
      dispatch(alert.info("로그인이 필요해요."))
      return;
    }
    setExpanded(true);
  };

  return (
    <Paper elevation={3} style={{padding: "16px", marginBottom: "24px"}} sx={{boxShadow: 'none'}}>
      {!expanded && !editingPost && (
        <Box style={{display: "flex", justifyContent: "flex-end"}}>
          <Button variant="contained" onClick={toggleExpanded}>
            무엇이든 물어보기
          </Button>
        </Box>
      )}

      <Collapse in={expanded}>
        <Typography variant="h6" gutterBottom style={{marginTop: "16px"}}>
          {editingPost ? "질문 수정" : "질문 작성"}
        </Typography>
        <Box component="form" noValidate autoComplete="off">
          <TextField
            fullWidth
            label="제목"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
            margin="normal"
            slotProps={{htmlInput: {maxLength: 50}}}
            error={titleError}
            helperText={titleHelperText}
          />
          <TextField
            fullWidth
            label="내용"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            margin="normal"
            multiline
            rows={4}
            slotProps={{htmlInput: {maxLength: 1000}}}
            error={contentError}
            helperText={contentHelperText}
          />
          <Box style={{display: "flex", justifyContent: "flex-end", marginTop: "16px"}}>
            <Button variant="outlined" onClick={handleClear} style={{marginRight: "8px"}}>
              {editingPost ? "취소" : "취소"}
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              {editingPost ? "수정" : "작성"}
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default PostInput;
