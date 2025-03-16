import React, {useState} from "react";
import {Box, Typography, Paper, BottomNavigation, BottomNavigationAction} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import PersonIcon from '@mui/icons-material/Person';
import {BrowserRouter as Router, Route, Routes, Link} from "react-router-dom";
import QnAPage from './page/QnAPage';

// 네비게이션 바 컴포넌트
function BottomNav({value, setValue}) {
  return (
    <Paper sx={{position: "fixed", bottom: 0, left: 0, right: 0}} elevation={3}>
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
      >
        <BottomNavigationAction label="Home" icon={<HomeIcon/>} component={Link} to="/"/>
        <BottomNavigationAction label="QnA" icon={<QuestionAnswerIcon/>} component={Link} to="/qna"/>
        <BottomNavigationAction label="Profile" icon={<PersonIcon/>} component={Link} to="/profile"/>
      </BottomNavigation>
    </Paper>
  );
}

export default function App() {
  const [value, setValue] = useState(0);

  return (
    <Router>
      <Box sx={{pb: 7}}>
        {/* 여기에 내용 추가 */}
        <Routes>
          <Route path="/" element={<div>Home Page</div>}/>
          <Route path="/qna" element={<QnAPage/>}/>
          <Route path="/profile" element={<div>Profile Page</div>}/>
        </Routes>
      </Box>

      {/* BottomNavigation이 항상 보이도록 */}
      <BottomNav value={value} setValue={setValue}/>
    </Router>
  );
}
