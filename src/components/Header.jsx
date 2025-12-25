import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Logo from 'components/layout/Logo';

import { NavLink } from "react-router-dom";


const drawerWidth = 240;
const navItems = [
  // {
  //   label: 'Реєстрація',
  //   href: 'orikhiv-aid/register'
  // },
  // {
  //   label: 'Нагадати номер',
  //   href: 'orikhiv-aid/reminder'
  // }
];

function DrawerAppBar(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Допомога ВПО
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item?.label} disablePadding>
            <ListItemButton sx={{ textAlign: 'center' }} component={NavLink} to={item?.href} >
              <ListItemText primary={item?.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar component="nav" sx={{
        background: '#2E3B55',
        position: 'sticky',
        // mb: 5,
      }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Logo />
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              {navItems.map((item) => (
                <Button
                  key={item?.label}
                  sx={{ color: '#fff' }}
                  component={NavLink} to={item?.href}
                >
                  {item?.label}
                </Button>
              ))}
            </Box>

          </Toolbar>
        </Container>

      </AppBar>
      <Box component="nav">
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
    </Box>
  );
}


export default DrawerAppBar;