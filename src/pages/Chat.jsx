import React, {useState, useEffect, useRef, useCallback} from "react";
import {useSelector} from "react-redux";
import axios from "../api/axios"; // axios 설정 인스턴스
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
 * - REST API로 과거 메시지 로드
 * - WebSocket으로 실시간 메시지 송수신 (JWT를 Authorization 헤더에 포함)
 */
function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [wsReady, setWsReady] = useState(false);
  const wsRef = useRef(null);
  const listEndRef = useRef(null);

  // Redux에서 JWT 토큰 가져오기
  const token = useSelector((state) => state.auth.accessToken);

  // 과거 메시지 로드 (REST API)
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get("/v1/chat/messages");
        setMessages(res.data);
        scrollToBottom();
      } catch
      (err) {
        console.error("메시지 로드 실패", err);
      }
    };
    if (token) fetchMessages();
  }

  ,
  [token]
  )
  ;

  // WebSocket 연결 및 이벤트 핸들링
  useEffect(() => {
    if (!token) return;

    const wsUrl = "wss://dev.mumulbo.com/api/v1/ws/chat";
    // Sec-WebSocket-Protocol 헤더를 사용해 토큰을 전송합니다.
    const ws = new WebSocket(wsUrl, [`Bearer ${token}`]);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket 연결 성공");
      setWsReady(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // TEXT, WHISPER, USER_LIST_UPDATE 타입만 처리
        if (["TEXT", "WHISPER", "USER_LIST_UPDATE"].includes(data.type)) {
          setMessages((prev) => [...prev, data]);
        }
        scrollToBottom();
      } catch (e) {
        console.error("WS 메시지 파싱 실패", e);
      }
    };

    ws.onclose = (e) => {
      console.log("WebSocket 연결 종료", e);
      setWsReady(false);
      // 필요시 재접속 로직 추가 가능
    };

    ws.onerror = (err) => {
      console.error("WebSocket 에러", err);
      setWsReady(false);
    };

    return () => {
      ws.close();
    };
  }, [token]);

  // 스크롤을 맨 아래로 이동
  const scrollToBottom = () => {
    listEndRef.current?.scrollIntoView({behavior: "smooth"});
  };

  // 메시지 전송
  const sendMessage = useCallback(() => {
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket 준비되지 않음 또는 입력 없음");
      return;
    }
    const msg = {type: "TEXT", message: input.trim()};
    wsRef.current.send(JSON.stringify(msg));
    setInput("");
  }, [input]);

  return (
    <Box sx={{maxWidth: 600, mx: "auto", mt: 4}}>
      <Typography variant="h5" gutterBottom>
        실시간 채팅
      </Typography>
      <Paper elevation={3} sx={{height: 500, overflowY: "auto", p: 2, mb: 2}}>
        <List>
          {messages.map((msg, idx) => (
            <ListItem key={msg.id ?? idx}>
              <ListItemText
                primary={msg.senderName ?? msg.senderEmail ?? "익명"}
                secondary={msg.message}
              />
            </ListItem>
          ))}
          <div ref={listEndRef}/>
        </List>
      </Paper>

      <Box sx={{display: "flex", gap: 1}}>
        <TextField
          fullWidth
          placeholder="메시지를 입력하세요"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button variant="contained" onClick={sendMessage} disabled={!wsReady}>
          전송
        </Button>
      </Box>
    </Box>
  );
}

export default Chat;
