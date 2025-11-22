import React, { useState } from 'react'
import { NextPageWithLayout } from '@/interfaces/layout'
import { MainLayout } from '@/components/layout'
import Head from 'next/head'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import { StyledButton } from '@/components/styled-button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import InputAdornment from '@mui/material/InputAdornment'
import LockIcon from '@mui/icons-material/Lock'
import CircularProgress from '@mui/material/CircularProgress'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import { updatePassword, signIn } from '@/lib/cognitoClient'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { confirmSignIn } from 'aws-amplify/auth'

// No props needed for this component

const ChangePassword: NextPageWithLayout = () => {
  const router = useRouter()
  const { user: _currentUser, isLoading } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  // Check if this is a first-time user who needs to change password
  const isFirstTimeUser = router.query.firstTime === 'true'

  // Authentication is handled by AuthGuard

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setError('')
    
    // Validate input
    if (currentPassword === newPassword) {
      setError('New password cannot be the same as your current password')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    setLoading(true)

    try {
      if (isFirstTimeUser) {
        // For first-time users, we need to complete the NEW_PASSWORD_REQUIRED challenge
        const tempEmail = sessionStorage.getItem('tempEmail')
        if (!tempEmail) {
          throw new Error('Session expired. Please login again.')
        }
        
        // First sign in to get the challenge
        const signInResult = await signIn(tempEmail, currentPassword)
        
        if (signInResult.data?.session && typeof signInResult.data.session === 'object') {
          const session = signInResult.data.session as any
          
          // Complete the NEW_PASSWORD_REQUIRED challenge
          if (session.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
            await confirmSignIn({ challengeResponse: newPassword })
            setSuccess(true)
            
            // Clear session storage
            sessionStorage.removeItem('tempEmail')
            
            // Redirect to dashboard after successful password change
            setTimeout(() => {
              window.location.href = '/dashboard'
            }, 2000)
          }
        } else {
          throw new Error('Invalid temporary password')
        }
      } else {
        // Regular password update for existing users
        const { error: updateError, success } = await updatePassword(currentPassword, newPassword)
        
        if (updateError) {
          throw updateError
        }
        
        if (success) {
          setSuccess(true)
          
          // Clear form
          setCurrentPassword('')
          setNewPassword('')
          setConfirmPassword('')
        } else {
          throw new Error('Failed to update password')
        }
      }
    } catch (error: unknown) {
      const err = error as Error
      const errorMessage = err.message || 'Failed to update password'
      
      // Map Cognito error messages to user-friendly messages
      if (errorMessage.includes('Incorrect username or password') || 
          errorMessage.includes('NotAuthorizedException')) {
        setError('The current password you entered is incorrect. Please try again.')
      } else if (errorMessage.includes('Password does not conform to policy') ||
                 errorMessage.includes('InvalidPasswordException')) {
        setError('Your new password does not meet the security requirements. Please ensure it has at least one uppercase letter, one lowercase letter, and one number.')
      } else if (errorMessage.includes('LimitExceededException')) {
        setError('Too many attempts. Please wait a few minutes and try again.')
      } else if (errorMessage.includes('UserNotFoundException')) {
        setError('User account not found. Please contact support.')
      } else if (errorMessage.includes('Session expired')) {
        setError('Your session has expired. Please log in again.')
      } else if (errorMessage.includes('Invalid temporary password')) {
        setError('The temporary password you entered is incorrect. Please check your email for the correct temporary password.')
      } else if (errorMessage.includes('Network')) {
        setError('Network error. Please check your internet connection and try again.')
      } else {
        // For any other errors, provide a generic but helpful message
        setError('Unable to change password. Please verify your current password and try again.')
      }
      
      console.error('Password change error:', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ py: 12, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <CircularProgress size={60} sx={{ mb: 2, color: '#4c51bf' }} />
            <Typography variant="h6">Loading...</Typography>
          </Box>
        </Container>
      </Box>
    )
  }

  return (
    <>
      <Head>
        <title>Change Password | Economics E-Learning Portal</title>
        <meta 
          name="description" 
          content="Change your account password securely in the economics e-learning portal."
        />
      </Head>
      <Box sx={{ py: 6, backgroundColor: 'background.default' }}>
        <Container maxWidth="sm">
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 4 }}>
            {isFirstTimeUser ? 'Set Your New Password' : 'Change Password'}
          </Typography>
          
          {isFirstTimeUser && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Welcome! Please set a new password to access your account. Your password must be at least 8 characters long.
            </Alert>
          )}
          
          <Card sx={{ 
            borderRadius: 4, 
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
            backdropFilter: 'blur(10px)',
            p: { xs: 2, sm: 3 } 
          }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  {isFirstTimeUser 
                    ? 'Your password has been successfully set! Redirecting to dashboard...' 
                    : 'Your password has been successfully updated!'}
                </Alert>
              )}
              
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="currentPassword"
                  label={isFirstTimeUser ? "Temporary Password" : "Current Password"}
                  type="password"
                  id="currentPassword"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <VpnKeyIcon sx={{ color: '#4c51bf' }} />
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
                  type="password"
                  id="newPassword"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#4c51bf' }} />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Password must be at least 8 characters long"
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: confirmPassword === newPassword && newPassword ? '#10b981' : '#4c51bf' }} />
                      </InputAdornment>
                    ),
                  }}
                  error={confirmPassword !== '' && confirmPassword !== newPassword}
                  helperText={confirmPassword !== '' && confirmPassword !== newPassword ? 'Passwords do not match' : ''}
                  sx={{ mb: 2 }}
                />
                
                <StyledButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ 
                    width: '100%', 
                    mt: 3, 
                    mb: 2,
                    background: 'linear-gradient(135deg, #4c51bf 0%, #667eea 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #3b3f8f 0%, #5570e8 100%)',
                    }
                  }}
                  disabled={loading || success}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Update Password'}
                </StyledButton>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </>
  )
}


ChangePassword.getLayout = (page) => <MainLayout isAuthenticated={true} theme="dashboard">{page}</MainLayout>

export default ChangePassword 