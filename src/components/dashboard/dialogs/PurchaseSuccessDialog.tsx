import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  LinearProgress,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import LoginIcon from '@mui/icons-material/Login'
import CloseIcon from '@mui/icons-material/Close'
import { useRouter } from 'next/router'

interface PurchaseSuccessDialogProps {
  open: boolean
  onClose: () => void
  email: string
  isGuestPurchase: boolean
}

/**
 * PurchaseSuccessDialog Component
 * 
 * Displays success message after successful payment.
 * 
 * For Guest Users:
 * - Shows account creation confirmation
 * - Displays email where credentials were sent
 * - Auto-redirects to login after 5 seconds
 * - Shows countdown timer
 * 
 * For Authenticated Users:
 * - Shows simple success message
 * - Book unlocked immediately
 * - Auto-redirects to dashboard after 5 seconds
 */
export const PurchaseSuccessDialog: React.FC<PurchaseSuccessDialogProps> = ({
  open,
  onClose,
  email,
  isGuestPurchase,
}) => {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!open) return

    // Reset countdown and progress when dialog opens
    setCountdown(5)
    setProgress(0)

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          handleRedirect()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2 // Increment by 2% every 100ms (5 seconds = 100%)
      })
    }, 100)

    // Cleanup on unmount
    return () => {
      clearInterval(countdownInterval)
      clearInterval(progressInterval)
    }
  }, [open])

  /**
   * Handles redirect based on user type
   */
  const handleRedirect = (): void => {
    if (isGuestPurchase) {
      router.push('/login')
    } else {
      router.push('/dashboard')
    }
    onClose()
  }

  /**
   * Handles manual close (cancels auto-redirect)
   */
  const handleManualClose = (): void => {
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleManualClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
        },
      }}
    >
      {/* Progress Bar */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 4,
          bgcolor: 'rgba(102, 126, 234, 0.1)',
          '& .MuiLinearProgress-bar': {
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          },
        }}
      />

      <DialogContent sx={{ textAlign: 'center', py: 6, px: 4 }}>
        {/* Success Icon */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            mb: 3,
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
            animation: 'successPulse 2s ease-in-out infinite',
            '@keyframes successPulse': {
              '0%, 100%': {
                transform: 'scale(1)',
              },
              '50%': {
                transform: 'scale(1.05)',
              },
            },
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 60, color: 'white' }} />
        </Box>

        {/* Title */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Purchase Successful! 🎉
        </Typography>

        {/* Message for Guest Users */}
        {isGuestPurchase ? (
          <>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
              Your Account Has Been Created!
            </Typography>
            <Typography variant="body1" sx={{ mb: 1, color: 'text.secondary' }}>
              Check your email at
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 700,
                color: '#667eea',
                mb: 2,
                fontSize: '1.1rem',
              }}
            >
              {email}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              You&lsquo;ll receive login credentials and password reset instructions.
              Your purchased note will be available in your dashboard.
            </Typography>

            {/* Countdown Message */}
            <Box
              sx={{
                mb: 3,
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(102, 126, 234, 0.05)',
                border: '1px solid rgba(102, 126, 234, 0.2)',
              }}
            >
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Redirecting to login page in{' '}
                <Typography
                  component="span"
                  sx={{
                    fontWeight: 700,
                    color: '#667eea',
                    fontSize: '1.2rem',
                  }}
                >
                  {countdown}
                </Typography>{' '}
                second{countdown !== 1 ? 's' : ''}...
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<LoginIcon />}
                onClick={handleRedirect}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontWeight: 600,
                  px: 4,
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3d94 100%)',
                  },
                }}
              >
                Go to Login Now
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={handleManualClose}
                sx={{
                  borderColor: '#667eea',
                  color: '#667eea',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#5568d3',
                    bgcolor: 'rgba(102, 126, 234, 0.05)',
                  },
                }}
              >
                Close
              </Button>
            </Box>
          </>
        ) : (
          /* Message for Authenticated Users */
          <>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
              Payment Completed Successfully!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              Your note is now unlocked and available in your dashboard.
              You can start reading immediately!
            </Typography>

            {/* Countdown Message */}
            <Box
              sx={{
                mb: 3,
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(102, 126, 234, 0.05)',
                border: '1px solid rgba(102, 126, 234, 0.2)',
              }}
            >
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Redirecting to dashboard in{' '}
                <Typography
                  component="span"
                  sx={{
                    fontWeight: 700,
                    color: '#667eea',
                    fontSize: '1.2rem',
                  }}
                >
                  {countdown}
                </Typography>{' '}
                second{countdown !== 1 ? 's' : ''}...
              </Typography>
            </Box>

            {/* Action Button */}
            <Button
              variant="contained"
              size="large"
              startIcon={<CloseIcon />}
              onClick={handleManualClose}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: 600,
                px: 4,
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #6a3d94 100%)',
                },
              }}
            >
              Close
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
