import React from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { MainLayout } from '@/components/layout'

interface ErrorPageProps {
  statusCode: number
  hasGetInitialPropsRun?: boolean
  err?: Error
}

const ErrorPage: NextPage<ErrorPageProps> = ({ statusCode }) => {
  const router = useRouter()

  return (
    <MainLayout>
      <Head>
        <title>
          {statusCode === 404 ? 'Page Not Found' : `Error ${statusCode}`} | Economics E-Learning Portal
        </title>
      </Head>
      
      <Box sx={{ 
        minHeight: '80vh', 
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
                fontSize: '6rem', 
                fontWeight: 700,
                color: '#4c51bf',
                mb: 2
              }}
            >
              {statusCode || '500'}
            </Typography>
            <Typography variant="h4" component="h2" gutterBottom>
              {statusCode === 404 ? 'Page Not Found' : 'An Error Occurred'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {statusCode === 404 
                ? "The page you're looking for doesn't exist or has been moved."
                : 'Sorry, something went wrong. Please try again later.'}
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => router.push('/')}
              sx={{ 
                backgroundColor: '#4c51bf',
                '&:hover': {
                  backgroundColor: '#667eea'
                }
              }}
            >
              Go to Homepage
            </Button>
          </Box>
        </Container>
      </Box>
    </MainLayout>
  )
}

ErrorPage.getInitialProps = ({ res, err }): ErrorPageProps => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode: statusCode || 500 }
}

export default ErrorPage