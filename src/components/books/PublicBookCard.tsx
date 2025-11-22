import React, { useState } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Skeleton,
} from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import { parseCourseTag, formatPrice } from '@/utils/bookUtils'
import { GuestPurchaseDialog } from '@/components/dashboard/dialogs/GuestPurchaseDialog'
import { PurchaseSuccessDialog } from '@/components/dashboard/dialogs/PurchaseSuccessDialog'

interface PublicBookCardProps {
  bookId: string
  title: string
  description?: string
  price: number
  currency: string
  eligibleCourses: string[]
  courseId?: string // Optional: for purchase flow
}

/**
 * PublicBookCard Component
 * 
 * Displays a book card on the public books page.
 * Shows title, description, course tags, price, and buy button.
 * Opens GuestPurchaseDialog on "Buy Now" click.
 */
export const PublicBookCard: React.FC<PublicBookCardProps> = ({
  bookId,
  title,
  description,
  price,
  currency,
  eligibleCourses,
  courseId = '', // Default to empty string if not provided
}) => {
  const [guestDialogOpen, setGuestDialogOpen] = useState(false)
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)

  // Parse course tags (skip PAID_USER)
  const courseTags = eligibleCourses
    .map(parseCourseTag)
    .filter((tag): tag is string => tag !== null)

  return (
    <>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 12px 28px rgba(102, 126, 234, 0.15)',
            borderColor: 'rgba(102, 126, 234, 0.3)',
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          {/* Book Icon */}
          <Box
            sx={{
              display: 'inline-flex',
              p: 2,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              mb: 2,
            }}
          >
            <MenuBookIcon sx={{ fontSize: 32, color: 'white' }} />
          </Box>

          {/* Title */}
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 700,
              mb: 2,
              minHeight: 64,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              color: 'text.primary',
            }}
          >
            {title}
          </Typography>

          {/* Description */}
          {description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                minHeight: 60,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {description}
            </Typography>
          )}

          {/* Course Tags */}
          {courseTags.length > 0 && (
            <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {courseTags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    borderRadius: 2,
                  }}
                />
              ))}
            </Box>
          )}

          {/* Price */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {formatPrice(price)}
            </Typography>
          </Box>

          {/* Buy Button */}
          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={<ShoppingCartIcon />}
            onClick={() => setGuestDialogOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: 600,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a3d94 100%)',
                boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            Buy Now
          </Button>
        </CardContent>
      </Card>

      {/* Guest Purchase Dialog */}
      <GuestPurchaseDialog
        open={guestDialogOpen}
        onClose={() => setGuestDialogOpen(false)}
        bookId={bookId}
        courseId={courseId}
        bookTitle={title}
        price={price}
        currency={currency}
        onPurchaseSuccess={() => {
          setGuestDialogOpen(false)
          setSuccessDialogOpen(true)
        }}
      />

      {/* Purchase Success Dialog */}
      <PurchaseSuccessDialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        email=""
        isGuestPurchase={true}
      />
    </>
  )
}

/**
 * Skeleton loader for PublicBookCard
 */
export const PublicBookCardSkeleton: React.FC = () => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Skeleton variant="rounded" width={64} height={64} sx={{ mb: 2, borderRadius: 2 }} />
        <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 1 }} />
        <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 2, width: '60%' }} />
        <Skeleton variant="text" sx={{ fontSize: '0.875rem', mb: 0.5 }} />
        <Skeleton variant="text" sx={{ fontSize: '0.875rem', mb: 0.5 }} />
        <Skeleton variant="text" sx={{ fontSize: '0.875rem', mb: 2, width: '80%' }} />
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rounded" width={100} height={24} sx={{ borderRadius: 2 }} />
        </Box>
        <Skeleton variant="text" sx={{ fontSize: '2rem', mb: 2, width: '40%' }} />
        <Skeleton variant="rounded" width="100%" height={48} sx={{ borderRadius: 2 }} />
      </CardContent>
    </Card>
  )
}
