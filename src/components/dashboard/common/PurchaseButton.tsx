import React, { useState } from 'react'
import { Button, Snackbar, Alert, CircularProgress } from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { useAuth } from '@/contexts/AuthContext'
import { useApiClient } from '@/hooks/dashboard/useApiClient'

interface PurchaseButtonProps {
  bookId: string
  courseId: string
  price: number
  currency: string
  bookTitle: string
  onPurchaseSuccess?: () => void
  variant?: 'contained' | 'outlined' | 'text'
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
}

interface InitiatePurchaseResponse {
  orderId: string
  razorpayOrderId: string
  amount: number
}

/**
 * PurchaseButton Component
 * 
 * Handles book purchase flow for authenticated users.
 * Opens Razorpay payment modal and processes payment callbacks.
 * 
 * For guest users, this component should be wrapped in logic that
 * opens GuestPurchaseDialog instead.
 */
export const PurchaseButton: React.FC<PurchaseButtonProps> = ({
  bookId,
  courseId,
  price,
  currency: _currency,
  bookTitle,
  onPurchaseSuccess: _onPurchaseSuccess,
  variant = 'contained',
  size = 'medium',
  fullWidth = false,
}) => {
  const { user, isAuthenticated } = useAuth()
  const { apiCall } = useApiClient()
  
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error' | 'warning' | 'info'
  }>({
    open: false,
    message: '',
    severity: 'info',
  })

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info'): void => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCloseSnackbar = (_event?: React.SyntheticEvent | Event, reason?: string): void => {
    if (reason === 'clickaway') {
      return
    }
    setSnackbar((prev) => ({ ...prev, open: false }))
  }

  /**
   * Opens Razorpay payment modal
   * @param orderData - Order details from backend
   */
  const openRazorpay = (orderData: InitiatePurchaseResponse): void => {
    // Check if Razorpay SDK is loaded
    if (typeof window === 'undefined' || !window.Razorpay) {
      showSnackbar('Payment system not loaded. Please refresh the page.', 'error')
      setLoading(false)
      return
    }

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    
    if (!razorpayKey) {
      showSnackbar('Payment configuration error. Please contact support.', 'error')
      setLoading(false)
      return
    }

    const options: RazorpayOptions = {
      key: razorpayKey,
      amount: orderData.amount,
      currency: 'INR',
      name: 'Arjunas Arrow',
      description: `Purchase: ${bookTitle}`,
      order_id: orderData.razorpayOrderId,
      prefill: {
        name: user?.username || '',
        email: user?.username || '', // Username is email in Cognito
      },
      theme: {
        color: '#667eea', // Brand purple color
      },
      handler: async (response: RazorpaySuccessResponse): Promise<void> => {
        // Payment successful
        console.log('Payment successful:', response)
        setLoading(false)
        showSnackbar('Payment successful! Refreshing dashboard...', 'success')
        
        // Reload dashboard to update book access
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      },
      modal: {
        ondismiss: (): void => {
          // User closed the modal without completing payment
          setLoading(false)
          showSnackbar('Payment cancelled', 'info')
        },
      },
    }

    try {
      const rzp = new window.Razorpay(options)
      
      // Handle payment failure
      rzp.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response)
        setLoading(false)
        showSnackbar(
          response.error?.description || 'Payment failed. Please try again.',
          'error'
        )
      })

      rzp.open()
    } catch (error) {
      console.error('Error opening Razorpay:', error)
      setLoading(false)
      showSnackbar('Failed to open payment modal. Please try again.', 'error')
    }
  }

  /**
   * Initiates purchase for authenticated user
   * Calls backend API to create Razorpay order
   */
  const initiatePurchase = async (): Promise<void> => {
    if (!isAuthenticated) {
      showSnackbar('Please login to purchase', 'warning')
      return
    }

    setLoading(true)

    try {
      const response = await apiCall<InitiatePurchaseResponse>('/purchase/initiate', {
        method: 'POST',
        body: JSON.stringify({
          bookId,
          courseId,
        }),
      })

      if (response.success && response.data) {
        openRazorpay(response.data)
      } else {
        throw new Error(response.error?.message || 'Failed to initiate purchase')
      }
    } catch (error: any) {
      console.error('Error initiating purchase:', error)
      setLoading(false)
      
      // Handle specific error cases
      if (error.message?.includes('already own')) {
        showSnackbar('You already own this book', 'info')
      } else if (error.message?.includes('Invalid book')) {
        showSnackbar('Book not found or unavailable', 'error')
      } else {
        showSnackbar(
          error.message || 'Failed to initiate purchase. Please try again.',
          'error'
        )
      }
    }
  }

  const handleBuyNow = (): void => {
    if (!isAuthenticated) {
      // This should not happen as BookCard handles guest flow separately
      showSnackbar('Please login to purchase', 'warning')
      return
    }

    initiatePurchase()
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ShoppingCartIcon />}
        disabled={loading}
        onClick={handleBuyNow}
        sx={{
          background: variant === 'contained' 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : undefined,
          color: variant === 'contained' ? 'white' : '#667eea',
          fontWeight: 600,
          textTransform: 'none',
          borderColor: variant === 'outlined' ? '#667eea' : undefined,
          boxShadow: variant === 'contained' 
            ? '0 4px 16px rgba(102, 126, 234, 0.4)'
            : undefined,
          '&:hover': {
            background: variant === 'contained'
              ? 'linear-gradient(135deg, #5568d3 0%, #6a3d94 100%)'
              : variant === 'outlined'
              ? 'rgba(102, 126, 234, 0.08)'
              : undefined,
            borderColor: variant === 'outlined' ? '#5568d3' : undefined,
            boxShadow: variant === 'contained'
              ? '0 6px 20px rgba(102, 126, 234, 0.5)'
              : undefined,
            transform: 'translateY(-2px)',
          },
          '&:disabled': {
            background: variant === 'contained'
              ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.5) 0%, rgba(118, 75, 162, 0.5) 100%)'
              : undefined,
            color: variant === 'contained' ? 'rgba(255, 255, 255, 0.7)' : undefined,
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {loading ? 'Processing...' : `Buy Now - ₹${(price / 100).toFixed(2)}`}
      </Button>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}
