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
import { confirmResetPassword } from '@/lib/cognitoClient'
import InputAdornment from '@mui/material/InputAdornment'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import PasswordIcon from '@mui/icons-material/Password'
import Image from 'next/image'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import { useRouter } from 'next/router'
import IconButton from '@mui/material/IconButton'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

const ResetPassword: NextPageWithLayout = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    
    // Prevent duplicate submissions
    if (loading) return
    
    setError('')
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    // Validate password strength
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }
    
    setLoading(true)

    try {
      const { error } = await confirmResetPassword(email, otp, newPassword)

      if (error) {
        throw error
      }

      // Success - redirect to login with success message
      router.push('/login?reset=success')
    } catch (error: unknown) {
      const err = error as Error
      
      // Check for specific error messages
      if (err.message?.toLowerCase().includes('invalid verification code') || 
          err.message?.toLowerCase().includes('invalid code')) {
        setError('Invalid verification code. Please check your email for the correct code.')
      } 
      else if (err.message?.toLowerCase().includes('expired')) {
        setError('Verification code has expired. Please request a new password reset.')
      }
      else if (err.message?.toLowerCase().includes('password')) {
        setError('Password does not meet requirements. Use at least 8 characters with a mix of uppercase, lowercase, numbers, and symbols.')
      }
      else if (err.message?.toLowerCase().includes('user')) {
        setError('User not found. Please check your email address.')
      }
      // Default error case
      else {
        setError(err.message || 'Failed to reset password')
      }
    } finally {
      setLoading(false)
    }
  }, [email, otp, newPassword, confirmPassword, loading, router]);

  const handleClickShowPassword = (): void => {
    setShowPassword(!showPassword)
  }

  const handleClickShowConfirmPassword = (): void => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  return (
    <>
      <Head>
        <title>Reset Password | Economics E-Learning Portal</title>
        <meta 
          name="description" 
          content="Reset your password using the verification code sent to your email."
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
              <Box sx={{ position: 'relative', height: '550px', borderRadius: 3, overflow: 'hidden', boxShadow: 5 }}>
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
                    Create New Password
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'white', textAlign: 'center', mb: 4 }}>
                    Enter the verification code from your email and create a new secure password.
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: 5, p: { xs: 2, sm: 3 } }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography component="h1" variant="h4" align="center" sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
                    Reset Password
                  </Typography>
                  
                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}
                  
                  <Box component="form" onSubmit={handleSubmit}>
                    <Typography variant="body2" sx={{ mb: 3 }}>
                      Enter the 6-digit verification code sent to your email and create a new password.
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
                    
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="otp"
                      label="Verification Code"
                      name="otp"
                      autoComplete="one-time-code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      disabled={loading}
                      placeholder="123456"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="newPassword"
                      label="New Password"
                      type={showPassword ? 'text' : 'password'}
                      id="newPassword"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PasswordIcon color="primary" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2 }}
                    />
                    
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="confirmPassword"
                      label="Confirm New Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PasswordIcon color="primary" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowConfirmPassword}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
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
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                    </StyledButton>
                    
                    <Divider sx={{ my: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        OR
                      </Typography>
                    </Divider>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Link href="/forgot-password" passHref>
                          <Typography component="a" variant="body2" sx={{ color: 'primary.main', textAlign: 'center', display: 'block' }}>
                            Request New Code
                          </Typography>
                        </Link>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Link href="/login" passHref>
                          <Typography component="a" variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', display: 'block' }}>
                            Back to Login
                          </Typography>
                        </Link>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  )
}

ResetPassword.getLayout = (page) => <MainLayout>{page}</MainLayout>

export default ResetPassword