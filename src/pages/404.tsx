import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { NextPageWithLayout } from '@/interfaces/layout'
import { MainLayout } from '@/components/layout'
import Head from 'next/head'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import { StyledButton } from '@/components/styled-button'
import HomeIcon from '@mui/icons-material/Home'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

const Custom404: NextPageWithLayout = () => {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [_, setIs404] = useState(false)

  useEffect(() => {
    // Get the current pathname from the browser
    const pathname = window.location.pathname
    
    // Check if we're on a valid route that should be handled by client-side routing
    const validRoutes = [
      '/dashboard',
      '/profile',
      '/change-password',
      '/login',
      '/signup',
      '/forgot-password',
      '/reset-password',
      '/e-learning-portal',
      '/payment'
    ]
    
    // Check if it's a chapter route
    const isChapterRoute = pathname.startsWith('/chapter/')
    
    // Check if it's a valid static route or dynamic route
    const isValidRoute = validRoutes.some(route => pathname.startsWith(route)) || 
                        isChapterRoute ||
                        pathname === '/'
    
    if (isValidRoute) {
      // For valid routes, use client-side routing to navigate
      // This ensures the app properly loads with all its JavaScript
      router.replace(pathname + window.location.search)
    } else {
      // For invalid routes, show 404 error
      setIsChecking(false)
      setIs404(true)
    }
  }, [router])

  // Show loading state while checking
  if (isChecking) {
    return (
      <>
        <Head>
          <title>Loading... | Economics E-Learning Portal</title>
        </Head>
        
        <Box sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: 'background.default' 
        }}>
          <Container maxWidth="sm">
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={60} sx={{ mb: 3, color: '#4c51bf' }} />
              <Typography variant="h5" component="h1" gutterBottom>
                Loading application...
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Please wait while we redirect you to the requested page.
              </Typography>
            </Box>
          </Container>
        </Box>
      </>
    )
  }

  // Show 404 error
  return (
    <>
      <Head>
        <title>404 - Page Not Found | Economics E-Learning Portal</title>
        <meta 
          name="description" 
          content="The page you are looking for could not be found."
        />
      </Head>
      
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'background.default' 
      }}>
        <Container maxWidth="sm">
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h1" 
              component="h1" 
              sx={{ 
                fontSize: '120px', 
                fontWeight: 'bold',
                color: 'primary.main',
                mb: 2
              }}
            >
              404
            </Typography>
            <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3 }}>
              Page Not Found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>
              Sorry, the page you are looking for doesn&apos;t exist or has been moved. 
              Please check the URL or navigate back to a valid page.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <StyledButton
                variant="contained"
                color="primary"
                size="large"
                startIcon={<ArrowBackIcon />}
                onClick={() => router.back()}
              >
                Go Back
              </StyledButton>
              <StyledButton
                variant="outlined"
                color="primary"
                size="large"
                startIcon={<HomeIcon />}
                onClick={() => router.push('/')}
              >
                Go to Homepage
              </StyledButton>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  )
}

Custom404.getLayout = (page) => <MainLayout>{page}</MainLayout>

export default Custom404