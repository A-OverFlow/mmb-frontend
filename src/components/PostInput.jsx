import React, {useEffect, useState} from "react";
import {Box, Button, Collapse, Paper, TextField, Typography} from "@mui/material";

const PostInput = ({onSubmit, editingPost, onCancelEdit}) => {
  const [title, setTitle] = useState(editingPost ? editingPost.title : "");
  const [content, setContent] = useState(editingPost ? editingPost.body : "");
  const [expanded, setExpanded] = useState(!!editingPost);
  const [titleError, setTitleError] = useState(false);
  const [contentError, setContentError] = useState(false);
  const [titleHelperText, setTitleHelperText] = useState("");
  const [contentHelperText, setContentHelperText] = useState("");

  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title);
      setContent(editingPost.body);
      setExpanded(true);

      // 수정 모드일 때 화면의 최상단으로 스크롤 이동
      window.scrollTo(0, 0);
    }
  }, [editingPost]);

  const handleClear = () => {
    setTitle("");
    setContent("");
    setExpanded(false);
    setTitleError(false);
    setContentError(false);
    setTitleHelperText("");
    setContentHelperText("");
    if (onCancelEdit) onCancelEdit(); // 수정 취소 시 호출
  };

  const handleSubmit = () => {
    let valid = true;

    // 제목 50자 이하, 내용 1000자 이하로 제한
    if (title.length > 50) {
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

    // 유효성 검사 통과 시에만 제출
    if (valid && title && content) {
      onSubmit({title, content, id: editingPost?.id});
      handleClear();
    }
  };

  const toggleExpanded = () => {
    setExpanded(true);
  };

  return (
    <Paper elevation={3} style={{padding: "16px", marginBottom: "24px"}} sx={{boxShadow: 'none'}}>
      {!expanded && !editingPost && (
        <Box style={{display: "flex", justifyContent: "flex-end"}}>
          <Button variant="contained" onClick={toggleExpanded}>
            게시글 작성
          </Button>
        </Box>
      )}

      <Collapse in={expanded}>
        <Typography variant="h6" gutterBottom style={{marginTop: "16px"}}>
          {editingPost ? "게시글 수정" : "게시글 작성"}
        </Typography>
        <Box component="form" noValidate autoComplete="off">
          <TextField
            fullWidth
            label="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); // 기본 엔터키 동작 방지
              }
            }}
            margin="normal"
            slotProps={{htmlInput: {maxLength: 50}}} // 제목 50자 제한 (slotProps 사용)
            error={titleError} // 제목 오류 여부
            helperText={titleHelperText} // 제목 오류 메시지
          />
          <TextField
            fullWidth
            label="내용"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            margin="normal"
            multiline
            rows={4}
            slotProps={{htmlInput: {maxLength: 1000}}} // 내용 1000자 제한 (slotProps 사용)
            error={contentError} // 내용 오류 여부
            helperText={contentHelperText} // 내용 오류 메시지
          />
          <Box style={{display: "flex", justifyContent: "flex-end", marginTop: "16px"}}>
            <Button
              variant="outlined"
              onClick={handleClear}
              style={{marginRight: "8px"}}
            >
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
