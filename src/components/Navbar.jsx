import React, {useCallback, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import PersonIcon from '@mui/icons-material/Person';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import {useNavigate} from 'react-router-dom';
import {logout} from "../slices/authSlice.js";

const Navbar = () => {
  const navigate = useNavigate();
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const dispatch = useDispatch();

  const toggleDrawer = useCallback(
    (open) => {
      setDrawerOpen(open);
    },
    [setDrawerOpen]
  );

  const handleLogout = () => {
    toggleDrawer(false);

    dispatch(logout());
    // 쿠키에서 refreshToken 제거
    document.cookie = "refreshToken=; path=/; max-age=0; samesite=strict";

    // 홈으로 리다이렉트
    navigate('/');

  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBoard = () => {
    navigate('/qna');
  };

  const list = () => (
    <Box sx={{width: 250}} role="presentation" onClick={() => toggleDrawer(false)}>
      <List>
        {accessToken ? (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate('/myinfo')}>
                <PersonIcon sx={{mr: 2}}/>
                <ListItemText primary="내 정보"/>
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ExitToAppIcon sx={{mr: 2}}/>
                <ListItemText primary="로그아웃"/>
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogin}>
              <ListItemText primary="LOGIN"/>
            </ListItemButton>
          </ListItem>
        )}
      </List>
      <Divider/>
    </Box>
  );

  return (
    <Box sx={{flexGrow: 1}}>
      <AppBar position="static" sx={{boxShadow: 'none'}}>
        <Toolbar>
          <img
            src="/android-chrome-192x192.png"
            alt="무물보 로고"
            style={{
              height: 36,
              width: 36,
              marginRight: 8,
              cursor: 'pointer'
            }}
            onClick={handleGoHome}
          />
          <Typography
            variant="h6"
            component="div"
            sx={{cursor: 'pointer', marginRight: 2}}
            onClick={handleGoHome}
          >
            무물보
          </Typography>

          <Typography
            variant="subtitle1"
            component="div"
            sx={{cursor: 'pointer', marginRight: 2}}
            onClick={handleGoBoard}
          >
            QnA
          </Typography>

          <Typography variant="h6" component="div" sx={{flexGrow: 1}}></Typography>

          {accessToken ? (
            <AccountCircle
              style={{cursor: 'pointer'}}
              onClick={() => toggleDrawer(true)}
            />
          ) : (
            <Typography
              variant="body1"
              sx={{cursor: 'pointer'}}
              onClick={handleLogin}
            >
              Login
            </Typography>
          )}

        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => toggleDrawer(false)}
        aria-hidden={drawerOpen ? 'false' : 'true'}
      >
        {list()}
      </Drawer>
    </Box>
  );
};

export default Navbar;
