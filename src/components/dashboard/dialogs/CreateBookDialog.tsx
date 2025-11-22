import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Autocomplete,
  InputAdornment
} from '@mui/material'

interface CreateBookDialogProps {
  open: boolean
  onClose: () => void
  courseId: string
  courseName: string
  onCreateBook: (bookData: CreateBookData) => Promise<void>
  existingBooksCount: number
}

export interface CreateBookData {
  title: string
  description?: string
  order?: number
  accessType: 'COURSE_DEFAULT' | 'PAID_ONLY'
  price?: number // Price in rupees (will be converted to paise)
  currency?: string
  eligibleCourses?: string[]
}

// Common course options for eligibility
const COURSE_OPTIONS = [
  'XI_CBSE', 'XI_ICSE', 'XI_STATE',
  'XII_CBSE', 'XII_ICSE', 'XII_STATE',
  'PAID_USER'
]

export const CreateBookDialog: React.FC<CreateBookDialogProps> = ({
  open,
  onClose,
  courseId,
  courseName,
  onCreateBook,
  existingBooksCount: _existingBooksCount
}) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [accessType, setAccessType] = useState<'COURSE_DEFAULT' | 'PAID_ONLY'>('COURSE_DEFAULT')
  const [price, setPrice] = useState('')
  const [eligibleCourses, setEligibleCourses] = useState<string[]>(['PAID_USER'])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClose = (): void => {
    if (!loading) {
      setTitle('')
      setDescription('')
      setAccessType('COURSE_DEFAULT')
      setPrice('')
      setEligibleCourses(['PAID_USER'])
      setError(null)
      onClose()
    }
  }

  const handleCreate = async (): Promise<void> => {
    // Validation
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('Book title is required')
      return
    }
    if (trimmedTitle.length > 200) {
      setError('Book title must be 200 characters or less')
      return
    }

    // Validate price for PAID_ONLY books
    if (accessType === 'PAID_ONLY') {
      if (!price || parseFloat(price) <= 0) {
        setError('Price is required for paid books and must be greater than 0')
        return
      }
      if (eligibleCourses.length === 0) {
        setError('At least one eligible course is required for paid books')
        return
      }
      // Ensure PAID_USER is always included
      if (!eligibleCourses.includes('PAID_USER')) {
        setError('PAID_USER must be included in eligible courses')
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      const bookData: CreateBookData = {
        title: trimmedTitle,
        accessType
      }

      // Add description if provided
      const trimmedDescription = description.trim()
      if (trimmedDescription) {
        bookData.description = trimmedDescription
      }

      // Add purchase-related fields only for PAID_ONLY books
      if (accessType === 'PAID_ONLY') {
        bookData.price = Math.round(parseFloat(price) * 100) // Convert rupees to paise
        bookData.currency = 'INR'
        bookData.eligibleCourses = eligibleCourses
      }

      await onCreateBook(bookData)
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create book')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleCreate()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          Create New Book
        </Typography>
        <Typography variant="body2" color="text.secondary">
          in {courseName}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <TextField
            label="Book Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            required
            autoFocus
            placeholder="e.g., Organic Chemistry"
            inputProps={{
              maxLength: 200
            }}
            helperText={`${title.length}/200 characters`}
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            placeholder="Brief description of this book (optional - shown on public books page)"
            inputProps={{
              maxLength: 500
            }}
            helperText={`${description.length}/500 characters - This will be displayed on the public books page for guest users`}
          />

          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ mb: 1 }}>
              Access Type *
            </FormLabel>
            <RadioGroup
              value={accessType}
              onChange={(e) => setAccessType(e.target.value as 'COURSE_DEFAULT' | 'PAID_ONLY')}
            >
              <FormControlLabel
                value="COURSE_DEFAULT"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1">Course Default (Free)</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Included with course enrollment - auto-granted to all students in {courseName}
                    </Typography>
                  </Box>
                }
                disabled={loading}
              />
              <FormControlLabel
                value="PAID_ONLY"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1">Paid Only</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Requires individual purchase - available to eligible courses
                    </Typography>
                  </Box>
                }
                disabled={loading}
              />
            </RadioGroup>
          </FormControl>

          {accessType === 'PAID_ONLY' && (
            <>
              <TextField
                label="Price"
                fullWidth
                value={price}
                onChange={(e) => {
                  // Only allow numbers and decimal point
                  const value = e.target.value
                  if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                    setPrice(value)
                  }
                }}
                disabled={loading}
                required
                type="text"
                placeholder="999"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>
                }}
                helperText="Enter price in rupees (e.g., 999 for ₹999)"
              />

              <FormControl fullWidth>
                <FormLabel sx={{ mb: 1 }}>
                  Eligible Courses * (Who can see and purchase this book)
                </FormLabel>
                <Autocomplete
                  multiple
                  options={COURSE_OPTIONS}
                  value={eligibleCourses}
                  onChange={(_event, newValue) => {
                    // Always include PAID_USER
                    const uniqueValues = Array.from(new Set([...newValue, 'PAID_USER']))
                    setEligibleCourses(uniqueValues)
                  }}
                  disabled={loading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select courses"
                      helperText="PAID_USER is always included (required)"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index })
                      return (
                        <Chip
                          key={key}
                          label={option}
                          {...tagProps}
                          disabled={option === 'PAID_USER' || loading}
                          color={option === 'PAID_USER' ? 'primary' : 'default'}
                        />
                      )
                    })
                  }
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  💡 Add course from where book is created (e.g., {courseId}) to make it visible to those students
                </Typography>
              </FormControl>
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          disabled={loading || !title.trim()}
          variant="contained"
          sx={{
            backgroundColor: '#667eea',
            '&:hover': {
              backgroundColor: '#5a67d8'
            }
          }}
        >
          Create Book
        </Button>
      </DialogActions>
    </Dialog>
  )
}