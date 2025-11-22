import React, { FC } from 'react'
import Box from '@mui/material/Box'
import { Link as ScrollLink } from 'react-scroll'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { navigations } from './navigation.data'
import LogoutIcon from '@mui/icons-material/Logout'
import Button from '@mui/material/Button'
import { useSignOut } from '@/hooks/useSignOut'

interface NavigationProps {
  isMobile?: boolean;
  onCloseMenu?: () => void;
  theme?: string;
}

const Navigation: FC<NavigationProps> = ({ isMobile, onCloseMenu, theme }) => {
  const router = useRouter();
  const { signOut } = useSignOut();
  const isELearningRelatedPage = 
    router.pathname === '/e-learning-portal' || 
    router.pathname === '/login' || 
    router.pathname === '/signup' || 
    router.pathname === '/payment';
  
  // Check if we're on any authenticated user page (dashboard, profile, change-password)
  const isAuthenticatedUserPage = 
    router.pathname === '/dashboard' || 
    router.pathname === '/profile' || 
    router.pathname === '/change-password' ||
    router.pathname.startsWith('/chapter/');

  // Dashboard theme colors - only for specific authenticated pages
  const isDashboardTheme = theme === 'dashboard';
  const textColor = isDashboardTheme ? 'rgba(76, 81, 191, 0.7)' : 'text.disabled';
  const activeColor = isDashboardTheme ? '#4c51bf' : 'primary.main';
  
  const handleLinkClick = (): void => {
    if (isMobile && onCloseMenu) {
      onCloseMenu();
    }
  };

  const handleDashboardClick = (): void => {
    if (router.pathname !== '/dashboard') {
      if (isMobile && onCloseMenu) {
        onCloseMenu();
      }
      router.push('/dashboard');
    }
  };

  const handleSignOut = async (): Promise<void> => {
    // Close menu if on mobile
    if (isMobile && onCloseMenu) {
      onCloseMenu();
    }
    
    await signOut();
  }

  const navBoxStyles = {
    display: 'flex', 
    flexDirection: { xs: 'column', md: 'row' },
    alignItems: isMobile ? 'flex-start' : 'center',
    width: isMobile ? '100%' : 'auto',
    mt: isMobile ? 2 : 0,
    gap: isMobile ? 2 : 0,
    '& > *': isMobile ? {
      width: '100%',
      textAlign: 'left',
      animation: 'slideIn 0.3s ease-out',
      '@keyframes slideIn': {
        from: {
          opacity: 0,
          transform: 'translateX(20px)',
        },
        to: {
          opacity: 1,
          transform: 'translateX(0)',
        },
      },
    } : {},
  };
  
  // If on dashboard, profile, or change password, only show these navigation links
  if (isAuthenticatedUserPage) {
    return (
      <Box sx={navBoxStyles}>
        <Box
          component="button"
          onClick={handleDashboardClick}
          sx={{
            position: 'relative',
            color: router.pathname === '/dashboard' ? activeColor : textColor,
            cursor: 'pointer',
            fontWeight: router.pathname === '/dashboard' ? 700 : 600,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: { xs: 'flex-start', md: 'center' },
            px: { xs: 2, md: 3 },
            py: { xs: 1.5, md: 0 },
            mb: { xs: 1, md: 0 },
            fontSize: { xs: '1.1rem', md: 'inherit' },
            borderRadius: { xs: 2, md: 0 },
            width: { xs: '100%', md: 'auto' },
            textDecoration: 'none',
            background: 'none',
            border: 'none',
            transition: 'all 0.2s ease',
            ...(router.pathname === '/dashboard' && {
              backgroundColor: { xs: isDashboardTheme ? 'rgba(76, 81, 191, 0.08)' : 'rgba(0, 0, 0, 0.04)', md: 'transparent' },
              borderLeft: { xs: `3px solid ${activeColor}`, md: 'none' },
              pl: { xs: 2.5, md: 3 },
            }),
            '&:hover': {
              color: activeColor,
              backgroundColor: { xs: isDashboardTheme ? 'rgba(76, 81, 191, 0.08)' : 'rgba(0, 0, 0, 0.04)', md: 'transparent' },
              transform: { xs: 'none', md: 'translateY(-2px)' },
            },
          }}
        >
          Dashboard
        </Box>
        
        <Link href="/profile" passHref legacyBehavior>
          <Box
            component="a"
            sx={{
              position: 'relative',
              color: router.pathname === '/profile' ? activeColor : textColor,
              cursor: 'pointer',
              fontWeight: router.pathname === '/profile' ? 700 : 600,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: { xs: 'flex-start', md: 'center' },
              px: { xs: 2, md: 3 },
              py: { xs: 1.5, md: 0 },
              mb: { xs: 1, md: 0 },
              fontSize: { xs: '1.1rem', md: 'inherit' },
              borderRadius: { xs: 2, md: 0 },
              width: { xs: '100%', md: 'auto' },
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              ...(router.pathname === '/profile' && {
                backgroundColor: { xs: isDashboardTheme ? 'rgba(76, 81, 191, 0.08)' : 'rgba(0, 0, 0, 0.04)', md: 'transparent' },
                borderLeft: { xs: `3px solid ${activeColor}`, md: 'none' },
                pl: { xs: 2.5, md: 3 },
              }),
              '&:hover': {
                color: activeColor,
                backgroundColor: { xs: isDashboardTheme ? 'rgba(76, 81, 191, 0.08)' : 'rgba(0, 0, 0, 0.04)', md: 'transparent' },
                transform: { xs: 'none', md: 'translateY(-2px)' },
              },
            }}
            onClick={handleLinkClick}
          >
            My Profile
          </Box>
        </Link>
        
        <Link href="/change-password" passHref legacyBehavior>
          <Box
            component="a"
            sx={{
              position: 'relative',
              color: router.pathname === '/change-password' ? activeColor : textColor,
              cursor: 'pointer',
              fontWeight: router.pathname === '/change-password' ? 700 : 600,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: { xs: 'flex-start', md: 'center' },
              px: { xs: 2, md: 3 },
              py: { xs: 1.5, md: 0 },
              mb: { xs: 1, md: 0 },
              fontSize: { xs: '1.1rem', md: 'inherit' },
              borderRadius: { xs: 2, md: 0 },
              width: { xs: '100%', md: 'auto' },
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              ...(router.pathname === '/change-password' && {
                backgroundColor: { xs: isDashboardTheme ? 'rgba(76, 81, 191, 0.08)' : 'rgba(0, 0, 0, 0.04)', md: 'transparent' },
                borderLeft: { xs: `3px solid ${activeColor}`, md: 'none' },
                pl: { xs: 2.5, md: 3 },
              }),
              '&:hover': {
                color: activeColor,
                backgroundColor: { xs: isDashboardTheme ? 'rgba(76, 81, 191, 0.08)' : 'rgba(0, 0, 0, 0.04)', md: 'transparent' },
                transform: { xs: 'none', md: 'translateY(-2px)' },
              },
            }}
            onClick={handleLinkClick}
          >
            Change Password
          </Box>
        </Link>
        
        <Button
          variant="text"
          sx={{
            ml: { xs: 0, md: 2 },
            mt: { xs: 1, md: 0 },
            whiteSpace: 'nowrap',
            fontWeight: 600,
            fontSize: { xs: '1.2rem', md: 'inherit' },
            color: isDashboardTheme ? '#4c51bf' : 'primary.main',
            '&:hover': {
              backgroundColor: isDashboardTheme ? 'rgba(76, 81, 191, 0.08)' : undefined,
            },
          }}
          startIcon={<LogoutIcon sx={{ color: isDashboardTheme ? '#4c51bf' : undefined }} />}
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={navBoxStyles}>
      {navigations.map(({ path: destination, label }) => {
        // Filter out Alumni, Notes, and Contact when on e-learning portal related pages
        if (isELearningRelatedPage && 
            (destination === 'alumni' || 
             destination === 'notes' || 
             destination === 'contact')) {
          return null;
        }

        // Hide e-learning portal link when already on an e-learning related page
        if (destination === 'e-learning-portal' && isELearningRelatedPage) {
          return null;
        }

        // When NOT on homepage, Home should link back to homepage using Next.js Link
        if (destination === '#' && router.pathname !== '/') {
          return (
            <Link href="/" key={destination} passHref legacyBehavior>
              <Box
                component="a"
                sx={{
                  position: 'relative',
                  color: 'text.disabled',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: { xs: 'flex-start', md: 'center' },
                  px: { xs: 2, md: 3 },
                  py: { xs: 1.5, md: 0 },
                  mb: { xs: 1, md: 0 },
                  fontSize: { xs: '1.1rem', md: 'inherit' },
                  borderRadius: { xs: 2, md: 0 },
                  width: { xs: '100%', md: 'auto' },
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: 'primary.main',
                    backgroundColor: { xs: 'rgba(0, 0, 0, 0.04)', md: 'transparent' },
                    transform: { xs: 'none', md: 'translateY(-2px)' },
                  },
                }}
                onClick={handleLinkClick}
              >
                {label}
              </Box>
            </Link>
          );
        }

        // E-learning portal link and Notes link
        if (destination === 'e-learning-portal' || destination === 'notes') {
          return (
            <Link href={`/${destination}`} key={destination} passHref legacyBehavior>
              <Box
                component="a"
                sx={{
                  position: 'relative',
                  color: router.pathname === `/${destination}` ? 'primary.main' : 'text.disabled',
                  cursor: 'pointer',
                  fontWeight: router.pathname === `/${destination}` ? 700 : 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: { xs: 'flex-start', md: 'center' },
                  px: { xs: 2, md: 3 },
                  py: { xs: 1.5, md: 0 },
                  mb: { xs: 1, md: 0 },
                  fontSize: { xs: '1.1rem', md: 'inherit' },
                  borderRadius: { xs: 2, md: 0 },
                  width: { xs: '100%', md: 'auto' },
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  ...(router.pathname === `/${destination}` && {
                    backgroundColor: { xs: 'rgba(0, 0, 0, 0.04)', md: 'transparent' },
                    borderLeft: { xs: '3px solid', md: 'none' },
                    borderLeftColor: { xs: 'primary.main', md: 'transparent' },
                    pl: { xs: 2.5, md: 3 },
                  }),
                  '&:hover': {
                    color: 'primary.main',
                    backgroundColor: { xs: 'rgba(0, 0, 0, 0.04)', md: 'transparent' },
                    transform: { xs: 'none', md: 'translateY(-2px)' },
                  },
                }}
                onClick={handleLinkClick}
              >
                {label}
              </Box>
            </Link>
          );
        }
        
        // Default ScrollLink for all other navigation items (when not on e-learning portal)
        return (
          <Box
            component={ScrollLink}
            key={destination}
            activeClass="current"
            to={destination}
            spy={true}
            smooth={true}
            duration={350}
            onClick={handleLinkClick}
            sx={{
              position: 'relative',
              color: 'text.disabled',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: { xs: 'flex-start', md: 'center' },
              px: { xs: 2, md: 3 },
              py: { xs: 1.5, md: 0 },
              mb: { xs: 1, md: 0 },
              fontSize: { xs: '1.1rem', md: 'inherit' },
              borderRadius: { xs: 2, md: 0 },
              width: { xs: '100%', md: 'auto' },
              transition: 'all 0.2s ease',
              ...(destination === '/' && {
                color: 'primary.main',
              }),
              '&.current': {
                color: 'primary.main',
                fontWeight: 700,
                backgroundColor: { xs: 'rgba(0, 0, 0, 0.04)', md: 'transparent' },
                borderLeft: { xs: '3px solid', md: 'none' },
                borderLeftColor: { xs: 'primary.main', md: 'transparent' },
                pl: { xs: 2.5, md: 3 },
              },
              '&:hover': {
                color: 'primary.main',
                backgroundColor: { xs: 'rgba(0, 0, 0, 0.04)', md: 'transparent' },
                transform: { xs: 'none', md: 'translateY(-2px)' },
              },
            }}
          >
            {label}
          </Box>
        );
      })}

      {/* Add Login link for e-learning related pages */}
      {isELearningRelatedPage && router.pathname !== '/login' && (
        <Box
          sx={{
            position: 'relative',
            color: 'text.disabled',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: { xs: 'flex-start', md: 'center' },
            px: { xs: 2, md: 3 },
            py: { xs: 1.5, md: 0 },
            mb: { xs: 1, md: 0 },
            fontSize: { xs: '1.1rem', md: 'inherit' },
            borderRadius: { xs: 2, md: 0 },
            width: { xs: '100%', md: 'auto' },
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            '&:hover': {
              color: 'primary.main',
              backgroundColor: { xs: 'rgba(0, 0, 0, 0.04)', md: 'transparent' },
              transform: { xs: 'none', md: 'translateY(-2px)' },
            },
          }}
          onClick={() => router.push('/login')}
        >
          Login
        </Box>
      )}

      {/* Add Login/Signup buttons for home page */}
      {router.pathname === '/' && (
        <>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2, 
            ml: { xs: 0, md: 3 }, 
            mt: { xs: 3, md: 0 },
            width: { xs: '100%', md: 'auto' },
          }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                handleLinkClick();
                router.push('/login');
              }}
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                py: 1.2,
                width: { xs: '100%', md: 'auto' },
                fontSize: { xs: '1rem', md: 'inherit' },
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                },
              }}
            >
              Login
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                handleLinkClick();
                router.push('/signup');
              }}
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                py: 1.2,
                width: { xs: '100%', md: 'auto' },
                fontSize: { xs: '1rem', md: 'inherit' },
                boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  boxShadow: '0 6px 20px 0 rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              Sign Up
            </Button>
          </Box>
        </>
      )}
    </Box>
  )
}

export default Navigation
