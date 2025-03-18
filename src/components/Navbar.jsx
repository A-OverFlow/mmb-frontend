import React, {useCallback, useState} from 'react';
import {useSelector} from 'react-redux';
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

const Navbar = () => {
  const navigate = useNavigate();
  const accessToken = useSelector((state) => state.auth.accessToken);
  const LOGOUT_URL = import.meta.env.VITE_API_URL + "/logout";
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = useCallback(
    (open) => {
      setDrawerOpen(open);
    },
    [setDrawerOpen]
  );

  const handleLogout = () => {
    toggleDrawer(false);
    window.location.href = LOGOUT_URL;
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
        {/*{accessToken ? (*/}
        {/*  <>*/}
        {/*    <ListItem disablePadding>*/}
        {/*      <ListItemButton onClick={() => navigate('/myinfo')}>*/}
        {/*        <PersonIcon sx={{mr: 2}}/>*/}
        {/*        <ListItemText primary="내 정보"/>*/}
        {/*      </ListItemButton>*/}
        {/*    </ListItem>*/}
        {/*    <ListItem disablePadding>*/}
        {/*      <ListItemButton onClick={handleLogout}>*/}
        {/*        <ExitToAppIcon sx={{mr: 2}}/>*/}
        {/*        <ListItemText primary="로그아웃"/>*/}
        {/*      </ListItemButton>*/}
        {/*    </ListItem>*/}
        {/*  </>*/}
        {/*) : (*/}
        {/*  <ListItem disablePadding>*/}
        {/*    <ListItemButton onClick={handleLogin}>*/}
        {/*      <ListItemText primary="LOGIN"/>*/}
        {/*    </ListItemButton>*/}
        {/*  </ListItem>*/}
        {/*)}*/}

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
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogin}>
            <ListItemText primary="LOGIN"/>
          </ListItemButton>
        </ListItem>
      </List>
      <Divider/>
    </Box>
  );

  return (
    <Box sx={{flexGrow: 1}}>
      <AppBar position="static" sx={{boxShadow: 'none'}}>
        <Toolbar>
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

          {/*{accessToken ? (*/}
          {/*  <AccountCircle*/}
          {/*    style={{ cursor: 'pointer' }}*/}
          {/*    onClick={() => toggleDrawer(true)}*/}
          {/*  />*/}
          {/*) : (*/}
          {/*  <Typography*/}
          {/*    variant="body1"*/}
          {/*    sx={{ cursor: 'pointer' }}*/}
          {/*    onClick={handleLogin}*/}
          {/*  >*/}
          {/*    Login*/}
          {/*  </Typography>*/}
          {/*)}*/}

          <AccountCircle
            style={{cursor: 'pointer'}}
            onClick={() => toggleDrawer(true)}
          />
          <Typography
            variant="body1"
            sx={{cursor: 'pointer'}}
            onClick={handleLogin}
          >
            Login
          </Typography>

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
