import React, { useState, useCallback } from 'react'
import { NextPageWithLayout } from '@/interfaces/layout'
import { MainLayout } from '@/components/layout'
import Head from 'next/head'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import { StyledButton } from '@/components/styled-button'
import Grid from '@mui/material/Grid'
import Link from 'next/link'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import { resetPassword } from '@/lib/cognitoClient'
import InputAdornment from '@mui/material/InputAdornment'
import EmailIcon from '@mui/icons-material/Email'
import Image from 'next/image'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

const ForgotPassword: NextPageWithLayout = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    
    // Prevent duplicate submissions
    if (loading) return
    
    setError('')
    setLoading(true)

    try {
      const { error } = await resetPassword(email)

      if (error) {
        throw error
      }

      setSuccess(true)
    } catch (error: unknown) {
      const err = error as Error
      
      // Check for rate-limiting error messages
      if (err.message?.toLowerCase().includes('rate limit') || 
          err.message?.toLowerCase().includes('too many requests') ||
          err.message?.toLowerCase().includes('try again later')) {
        setError('Too many password reset attempts. Please wait a few minutes before trying again.')
      } 
      // Check for server errors (500 status codes)
      else if (err.message?.toLowerCase().includes('internal server error') || 
               err.message?.toLowerCase().includes('500') || 
               err.message?.toLowerCase().includes('server error')) {
        setError('We&apos;re experiencing technical difficulties. Please try again later or contact support if the problem persists.')
      }
      // Network errors
      else if (err.message?.toLowerCase().includes('network') || 
               err.message?.toLowerCase().includes('connection') || 
               err.message?.toLowerCase().includes('offline')) {
        setError('Please check your internet connection and try again.')
      }
      // Default error case
      else {
        setError(err.message || 'Failed to send password reset email')
      }
    } finally {
      setLoading(false)
    }
  }, [email, loading]);

  return (
    <>
      <Head>
        <title>Forgot Password | Economics E-Learning Portal</title>
        <meta 
          name="description" 
          content="Reset your password for the economics e-learning portal. Get back access to your account."
        />
      </Head>
      <Box 
        sx={{ 
          py: 10, 
          backgroundColor: 'background.default',
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Container maxWidth="md">
          <Grid container spacing={4} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box sx={{ position: 'relative', height: '450px', borderRadius: 3, overflow: 'hidden', boxShadow: 5 }}>
                <Image 
                  src="/images/e-learning-portal/hero.png" 
                  alt="Economics E-Learning" 
                  layout="fill" 
                  objectFit="cover"
                />
                <Box sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  bottom: 0, 
                  backgroundColor: 'rgba(18, 124, 113, 0.75)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 4 
                }}>
                  <Typography variant="h3" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
                    Password Recovery
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'white', textAlign: 'center', mb: 4 }}>
                    We&apos;ll send you a link to reset your password and get back to learning economics.
                  </Typography>
                  <Link href="/login" passHref>
                    <StyledButton 
                      color="secondary" 
                      size="large" 
                      variant="contained"
                      startIcon={<ArrowBackIcon />}
                    >
                      Back to Login
                    </StyledButton>
                  </Link>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: 5, p: { xs: 2, sm: 3 } }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography component="h1" variant="h4" align="center" sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
                    Forgot Password
                  </Typography>
                  
                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}
                  
                  {success ? (
                    <>
                      <Alert severity="success" sx={{ mb: 3 }}>
                        Password reset code has been sent to your email!
                      </Alert>
                      <Typography variant="body2" sx={{ mb: 3 }}>
                        Please check your inbox for a 6-digit verification code. If you don&apos;t see the email, check your spam folder.
                      </Typography>
                      <Link href="/reset-password" passHref>
                        <StyledButton
                          variant="contained"
                          color="primary"
                          size="large"
                          sx={{ width: '100%', mt: 2 }}
                        >
                          Enter Reset Code
                        </StyledButton>
                      </Link>
                      <Link href="/login" passHref>
                        <StyledButton
                          variant="outlined"
                          color="primary"
                          size="large"
                          sx={{ width: '100%', mt: 2 }}
                          startIcon={<ArrowBackIcon />}
                        >
                          Return to Login
                        </StyledButton>
                      </Link>
                    </>
                  ) : (
                    <Box component="form" onSubmit={handleSubmit}>
                      <Typography variant="body2" sx={{ mb: 3 }}>
                        Enter your email address and we&apos;ll send you a link to reset your password.
                      </Typography>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ mb: 2 }}
                      />
                      
                      <StyledButton
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        sx={{ width: '100%', mt: 3, mb: 2 }}
                        disabled={loading}
                      >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
                      </StyledButton>
                      
                      <Divider sx={{ my: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          OR
                        </Typography>
                      </Divider>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Link href="/login" passHref>
                            <Typography component="a" variant="body2" sx={{ color: 'primary.main', textAlign: 'center', display: 'block' }}>
                              Back to Login
                            </Typography>
                          </Link>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Link href="/" passHref>
                            <Typography component="a" variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', display: 'block' }}>
                              Return to Home Page
                            </Typography>
                          </Link>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  )
}

ForgotPassword.getLayout = (page) => <MainLayout>{page}</MainLayout>

export default ForgotPassword 