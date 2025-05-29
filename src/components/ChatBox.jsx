import React, { useState } from "react";
import { Box, Paper, Typography, TextField, IconButton, Divider } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

const ChatBox = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "안녕하세요! 무엇을 도와드릴까요?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { id: prev.length + 1, text: input }]);
    setInput("");
  };

  return (
    <Paper
      elevation={6}
      sx={{
        position: "fixed",
        bottom: 20,
        right: 20,
        width: 300,
        height: 400,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 2, bgcolor: "primary.main", color: "white" }}>
        <Typography variant="h6">채팅</Typography>
      </Box>

      <Box sx={{ flex: 1, p: 2, overflowY: "auto" }}>
        {messages.map((msg) => (
          <Typography key={msg.id} sx={{ mb: 1 }}>
            {msg.text}
          </Typography>
        ))}
      </Box>

      <Divider />

      <Box sx={{ display: "flex", p: 1 }}>
        <TextField
          size="small"
          variant="outlined"
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <IconButton onClick={handleSend} color="primary" sx={{ ml: 1 }}>
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default ChatBox;
