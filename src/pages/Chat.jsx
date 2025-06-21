import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "../api/axios"; // axios 인스턴스
import {
  Box,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Typography,
  Paper
} from "@mui/material";

/**
 * Chat 컴포넌트
 * - 최근 메시지 조회 (REST)
 * - 메시지 송수신 (WebSocket)
 * - 채팅창 상단에 접속자 수 실시간 표시
 */
function Chat() {
  const [messages, setMessages] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]); // ✅ 접속자 목록 상태
  const [input, setInput] = useState("");
  const [wsReady, setWsReady] = useState(false);
  const wsRef = useRef(null);
  const listEndRef = useRef(null);

  const token = useSelector((state) => state.auth.accessToken);

  const scrollToBottom = () => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get("/v1/chat/messages");
        setMessages(response.data);
      } catch (error) {
        console.error("메시지 로드 실패", error);
      }
    };
    fetchMessages();
  }, []);

  useEffect(() => {
    if (!token) return;

    const wsUrl = `wss://dev.mumulbo.com/api/v1/ws/chat?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket 연결 성공");
      setWsReady(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "USER_LIST_UPDATE") {
          setConnectedUsers(data.connectedUserList); // ✅ 접속자 목록 갱신
        } else if (["TEXT", "WHISPER"].includes(data.type)) {
          setMessages((prev) => [...prev, data]);
        }
      } catch (err) {
        console.error("WebSocket 메시지 파싱 실패", err);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket 연결 종료");
      setWsReady(false);
    };

    ws.onerror = (error) => {
      console.error("WebSocket 에러", error);
      setWsReady(false);
    };

    return () => ws.close();
  }, [token]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const payload = { type: "TEXT", message: trimmed, roomId: "main" };

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    } else {
      try {
        const response = await axios.post("/v1/chat/message", payload);
        setMessages((prev) => [...prev, response.data]);
      } catch (error) {
        console.error("메시지 전송 실패", error);
      }
    }

    setInput("");
  };

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages]);

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      {/* ✅ 제목 + 접속자 수 표시 */}
      <Box display="flex" justifyContent="space-between" alignItems="center" m={1} mb={3}>
        <Typography variant="h5">실시간 채팅</Typography>
        <Typography variant="body2" color="textSecondary">
          접속자 수: {connectedUsers.length}
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ height: 500, overflowY: "auto", p: 2, mb: 2 }}>
        <List>
          {messages.map((msg, idx) => {
            const sender = msg.senderName || msg.senderEmail || "익명";
            return (
              <ListItem key={msg.id ?? idx} alignItems="flex-start">
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Typography color={"primary"} variant="subtitle1">{sender}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(msg.sentAt).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                  secondary={<Typography variant="body1">{msg.message}</Typography>}
                />
              </ListItem>
            );
          })}
          <div ref={listEndRef} />
        </List>
      </Paper>

      <Box m={1} mb={5} sx={{ display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          placeholder={token ? "메시지를 입력하세요" : "로그인 후 채팅이 가능합니다"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={!token}
          sx={{
            backgroundColor: token ? "#ffffff" : undefined
          }}
        />
        <Button
          variant="contained"
          onClick={sendMessage}
          disabled={!token}
        >
          전송
        </Button>
      </Box>
    </Box>
  );
}

export default Chat;
