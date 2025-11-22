import React, { FC, useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Logo } from '@/components/logo'
import { Navigation } from '@/components/navigation'
import { useTheme } from '@mui/material/styles'
import { Menu, Close } from '@mui/icons-material'
import Drawer from '@mui/material/Drawer'
import { styled } from '@mui/material/styles'
import { useRouter } from 'next/router'

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: '85%',
    maxWidth: '320px',
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(3),
    paddingTop: theme.spacing(10),
    boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  '& .MuiBackdrop-root': {
    backdropFilter: 'blur(4px)',
  },
}))

const MenuButton = styled(IconButton)(() => ({
  backgroundColor: 'rgba(0, 0, 0, 0.04)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
}))

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  backgroundColor: 'rgba(0, 0, 0, 0.04)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
}))

interface HeaderProps {
  isAuthenticated?: boolean
  theme?: string
}

const Header: FC<HeaderProps> = ({ isAuthenticated = false, theme }) => {
  const router = useRouter()
  const [visibleMenu, setVisibleMenu] = useState<boolean>(false)
  const [isScrolled, setIsScrolled] = useState<boolean>(false)
  const { breakpoints } = useTheme()
  const matchMobileView = useMediaQuery(breakpoints.down('md'))

  const handleCloseMenu = (): void => {
    setVisibleMenu(false)
  }

  useEffect(() => {
    const handleScroll = (): void => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <Box 
      sx={{ 
        backgroundColor: 'background.paper',
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        boxShadow: isScrolled ? '0px 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
        transition: 'box-shadow 0.3s ease'
      }}
    >
      <Container sx={{ py: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box
            sx={{ 
              cursor: 'pointer',
              textDecoration: 'none',
              color: 'inherit'
            }}
            onClick={() => router.push(isAuthenticated ? '/dashboard' : '/')}
          >
            <Logo theme={theme} />
          </Box>
          <Box sx={{ ml: 'auto', display: { xs: 'inline-flex', md: 'none' } }}>
            <MenuButton onClick={() => setVisibleMenu(!visibleMenu)}>
              <Menu />
            </MenuButton>
          </Box>
          
          {/* Desktop Navigation */}
          {!matchMobileView && (
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: 'row',
              }}
            >
              <Box /> {/* Magic space for desktop */}
              <Navigation theme={theme} />
            </Box>
          )}
          
          {/* Mobile Navigation Drawer */}
          <StyledDrawer
            anchor="right"
            open={visibleMenu && matchMobileView}
            onClose={handleCloseMenu}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiBackdrop-root': {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              },
            }}
          >
            <CloseButton onClick={handleCloseMenu}>
              <Close />
            </CloseButton>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                width: '100%',
              }}
            >
              <Navigation isMobile={true} onCloseMenu={handleCloseMenu} theme={theme} />
            </Box>
          </StyledDrawer>
        </Box>
      </Container>
    </Box>
  )
}

export default Header
