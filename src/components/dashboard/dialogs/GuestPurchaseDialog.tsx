import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import { countryCodes } from '@/data/countryCodes'
import { phoneValidationRules } from '@/utils/phoneValidation'
import { useRouter } from 'next/router'

interface GuestPurchaseDialogProps {
  open: boolean
  onClose: () => void
  bookId: string
  courseId: string
  price: number
  currency: string
  bookTitle: string
  onPurchaseSuccess?: () => void
}

interface InitiateGuestPurchaseResponse {
  orderId: string
  razorpayOrderId: string
  amount: number
}

/**
 * GuestPurchaseDialog Component
 * 
 * Allows non-authenticated users to purchase books by collecting:
 * - Name (required, min 2 characters)
 * - Email (required, valid email format)
 * - Country Code + Mobile Number (optional, E.164 format validation)
 * 
 * Creates temporary Cognito account and initiates Razorpay payment.
 */
export const GuestPurchaseDialog: React.FC<GuestPurchaseDialogProps> = ({
  open,
  onClose,
  bookId,
  courseId,
  price,
  currency: _currency,
  bookTitle,
  onPurchaseSuccess,
}) => {
  const router = useRouter()
  
  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [countryCode, setCountryCode] = useState('+91') // Default to India
  const [mobile, setMobile] = useState('')
  
  // Error state
  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [mobileError, setMobileError] = useState('')
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  /**
   * Validates name field
   */
  const validateName = (value: string): boolean => {
    if (!value || value.trim().length < 2) {
      setNameError('Name must be at least 2 characters')
      return false
    }
    setNameError('')
    return true
  }

  /**
   * Validates email field
   */
  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!value || !emailRegex.test(value)) {
      setEmailError('Invalid email format')
      return false
    }
    setEmailError('')
    return true
  }

  /**
   * Validates mobile number based on country code
   */
  const validateMobile = (value: string, code: string): boolean => {
    // Mobile is optional, so empty is valid
    if (!value || value.trim().length === 0) {
      setMobileError('')
      return true
    }

    // Get validation rule for country code
    const rule = phoneValidationRules[code] || phoneValidationRules.default
    
    // Check if mobile matches the pattern
    if (!rule.regex.test(value)) {
      setMobileError(rule.errorMessage)
      return false
    }

    setMobileError('')
    return true
  }

  /**
   * Validates full E.164 format
   */
  const validateE164Format = (fullNumber: string): boolean => {
    const e164Regex = /^\+[1-9]\d{1,14}$/
    if (!e164Regex.test(fullNumber)) {
      setMobileError('Mobile must be in E.164 format (e.g., +919876543210)')
      return false
    }
    return true
  }

  /**
   * Opens Razorpay payment modal with prefilled data
   */
  const openRazorpay = (orderData: InitiateGuestPurchaseResponse): void => {
    if (typeof window === 'undefined' || !window.Razorpay) {
      setApiError('Payment system not loaded. Please refresh the page.')
      setLoading(false)
      return
    }

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    
    if (!razorpayKey) {
      setApiError('Payment configuration error. Please contact support.')
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
        name: name,
        email: email,
        contact: mobile ? `${countryCode}${mobile}` : undefined,
      },
      theme: {
        color: '#667eea',
      },
      handler: async (response: RazorpaySuccessResponse) => {
        // Payment successful
        console.log('Guest payment successful:', response)
        setLoading(false)
        onClose()
        
        // Show success dialog with email confirmation
        if (onPurchaseSuccess) {
          onPurchaseSuccess()
        }
      },
      modal: {
        ondismiss: () => {
          setLoading(false)
        },
      },
    }

    try {
      const rzp = new window.Razorpay(options)
      
      rzp.on('payment.failed', (response: any) => {
        console.error('Guest payment failed:', response)
        setLoading(false)
        setApiError(response.error?.description || 'Payment failed. Please try again.')
      })

      rzp.open()
    } catch (error) {
      console.error('Error opening Razorpay:', error)
      setLoading(false)
      setApiError('Failed to open payment modal. Please try again.')
    }
  }

  /**
   * Handles form submission
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setApiError(null)

    // Validate all fields
    const isNameValid = validateName(name)
    const isEmailValid = validateEmail(email)
    const isMobileValid = validateMobile(mobile, countryCode)

    if (!isNameValid || !isEmailValid || !isMobileValid) {
      return
    }

    // Validate E.164 format if mobile provided
    let fullMobile = ''
    if (mobile && mobile.trim().length > 0) {
      fullMobile = `${countryCode}${mobile}`
      if (!validateE164Format(fullMobile)) {
        return
      }
    }

    setLoading(true)

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      if (!apiBaseUrl) {
        throw new Error('API base URL not configured')
      }

      const url = apiBaseUrl.endsWith('/v1') 
        ? `${apiBaseUrl}/purchase/initiate-guest`
        : `${apiBaseUrl}/v1/purchase/initiate-guest`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId,
          courseId,
          guestName: name.trim(),
          guestEmail: email.trim().toLowerCase(),
          guestMobile: fullMobile || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // Handle specific error cases
        if (errorData.error?.message?.includes('Account exists')) {
          setApiError('An account with this email already exists. Please login instead.')
          setLoading(false)
          // Redirect to login after 3 seconds
          setTimeout(() => {
            onClose()
            router.push('/login')
          }, 3000)
          return
        }
        
        if (errorData.error?.message?.includes('already own')) {
          setApiError('You already own this note. Please login to access it.')
          setLoading(false)
          // Redirect to login after 3 seconds
          setTimeout(() => {
            onClose()
            router.push('/login')
          }, 3000)
          return
        }

        if (errorData.error?.message?.includes('Invalid email')) {
          setEmailError('Invalid email format')
          setLoading(false)
          return
        }

        if (errorData.error?.message?.includes('E.164 format')) {
          setMobileError('Mobile number must be in E.164 format')
          setLoading(false)
          return
        }

        throw new Error(errorData.error?.message || `Request failed: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success || !data.data) {
        throw new Error(data.error?.message || 'Failed to initiate purchase')
      }

      // Open Razorpay with prefilled guest data
      openRazorpay(data.data)
    } catch (error: any) {
      console.error('Error initiating guest purchase:', error)
      setLoading(false)
      setApiError(error.message || 'Failed to initiate purchase. Please try again.')
    }
  }

  /**
   * Handles dialog close
   */
  const handleClose = (): void => {
    if (!loading) {
      // Reset form
      setName('')
      setEmail('')
      setMobile('')
      setCountryCode('+91')
      setNameError('')
      setEmailError('')
      setMobileError('')
      setApiError(null)
      onClose()
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <ShoppingCartIcon />
        Complete Your Purchase
      </DialogTitle>
      
      <DialogContent sx={{ mt: 3 }}>
        {/* Book Details */}
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 2,
            bgcolor: 'rgba(102, 126, 234, 0.05)',
            border: '1px solid rgba(102, 126, 234, 0.2)',
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Note Title
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {bookTitle}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#667eea' }}>
            ₹{(price / 100).toFixed(2)}
          </Typography>
        </Box>

        {/* API Error Alert */}
        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit}>
          {/* Name Field */}
          <TextField
            fullWidth
            required
            label="Full Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (nameError) validateName(e.target.value)
            }}
            onBlur={(e) => validateName(e.target.value)}
            error={!!nameError}
            helperText={nameError || 'Minimum 2 characters'}
            disabled={loading}
            margin="dense"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: '#667eea' }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {/* Email Field */}
          <TextField
            fullWidth
            required
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (emailError) validateEmail(e.target.value)
            }}
            onBlur={(e) => validateEmail(e.target.value)}
            error={!!emailError}
            helperText={emailError || 'You will receive login credentials at this email'}
            disabled={loading}
            margin="dense"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: '#667eea' }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {/* Mobile Number Section */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, mt: 2 }}>
            Mobile Number (Optional)
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {/* Country Code Select */}
            <FormControl sx={{ minWidth: 140 }} disabled={loading}>
              <InputLabel>Code</InputLabel>
              <Select
                value={countryCode}
                onChange={(e) => {
                  setCountryCode(e.target.value)
                  if (mobile) validateMobile(mobile, e.target.value)
                }}
                label="Code"
              >
                {countryCodes.map((country) => (
                  <MenuItem key={country.value} value={country.value}>
                    {country.flag} {country.value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Mobile Number Field */}
            <TextField
              fullWidth
              label="Mobile Number"
              value={mobile}
              onChange={(e) => {
                // Only allow digits
                const value = e.target.value.replace(/\D/g, '')
                setMobile(value)
                if (mobileError) validateMobile(value, countryCode)
              }}
              onBlur={(e) => validateMobile(e.target.value, countryCode)}
              error={!!mobileError}
              helperText={mobileError || 'Format: 9876543210 (without country code)'}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Info Box */}
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Note:</strong> A temporary account will be created with your email. 
              You&lsquo;ll receive login credentials after successful payment.
            </Typography>
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          sx={{ textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !name || !email}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ShoppingCartIcon />}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 600,
            px: 3,
            textTransform: 'none',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #6a3d94 100%)',
            },
            '&:disabled': {
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.5) 0%, rgba(118, 75, 162, 0.5) 100%)',
              color: 'rgba(255, 255, 255, 0.7)',
            },
          }}
        >
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
