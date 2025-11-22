import React from 'react'
import { Container, Grid, Typography, Box, Alert } from '@mui/material'
import { NextPageWithLayout } from '@/interfaces/layout'
import { MainLayout } from '@/components/layout'
import { PublicBookCard, PublicBookCardSkeleton } from '@/components/books'
import { usePublicBooks } from '@/hooks/usePublicBooks'
import MenuBookIcon from '@mui/icons-material/MenuBook'

/**
 * Public Books Page
 * 
 * Displays all PAID_ONLY books available for purchase.
 * No authentication required - accessible to all visitors.
 * 
 * Features:
 * - Grid layout of book cards
 * - Course tags displayed on each book
 * - Guest purchase flow (name, email, mobile)
 * - Responsive design (1, 2, 3, or 4 columns)
 */
const NotesPage: NextPageWithLayout = () => {
  const { books, loading, error } = usePublicBooks()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, rgba(102, 126, 234, 0.03) 0%, rgba(255, 255, 255, 1) 100%)',
        py: { xs: 6, md: 10 },
      }}
    >
      <Container maxWidth="lg">
        {/* Page Header */}
        <Box
          sx={{
            textAlign: 'center',
            mb: { xs: 4, md: 6 },
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              mb: 3,
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
            }}
          >
            <MenuBookIcon sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 800,
              mb: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            Available Notes
          </Typography>
          
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              maxWidth: 700,
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.25rem' },
              mb: 3,
            }}
          >
            Explore our collection of premium educational notes. 
            Purchase instantly and start learning today!
          </Typography>

          {/* Purchase Flow Info */}
          <Box
            sx={{
              maxWidth: 800,
              mx: 'auto',
              mt: 4,
              p: 3,
              borderRadius: 3,
              bgcolor: 'rgba(102, 126, 234, 0.05)',
              border: '1px solid rgba(102, 126, 234, 0.15)',
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: '#667eea',
                textAlign: 'center',
              }}
            >
              How to Buy &amp; Access Books
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                    📚 For New Users (No Account):
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    1. Click &quot;Buy Now&quot; on any book<br />
                    2. Enter your details (name, email, mobile)<br />
                    3. Complete secure payment via Razorpay<br />
                    4. Receive login credentials via email<br />
                    5. Login to access your purchased book
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                    🎓 For Registered Users (Have Account):
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    1. Login to your account<br />
                    2. Go to your Dashboard<br />
                    3. View books relevant to your course<br />
                    4. Purchase locked premium books<br />
                    5. Access unlocks instantly after payment
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* Error State */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4,
              borderRadius: 2,
            }}
          >
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                <PublicBookCardSkeleton />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Empty State */}
        {!loading && !error && books.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
            }}
          >
            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
              No books available at the moment
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Check back soon for new additions to our collection!
            </Typography>
          </Box>
        )}

        {/* Books Grid */}
        {!loading && !error && books.length > 0 && (
          <Grid container spacing={3}>
            {books.map((book) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={book.bookId}>
                <PublicBookCard
                  bookId={book.bookId}
                  title={book.title}
                  description={book.description}
                  price={book.price}
                  currency={book.currency}
                  eligibleCourses={book.eligibleCourses}
                  courseId={book.courseId}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Footer Info */}
        {!loading && !error && books.length > 0 && (
          <Box
            sx={{
              mt: 8,
              p: 3,
              borderRadius: 3,
              bgcolor: 'rgba(102, 126, 234, 0.05)',
              border: '1px solid rgba(102, 126, 234, 0.1)',
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              <strong>Secure Payment:</strong> All transactions are processed through Razorpay with industry-standard encryption. 
              After purchase, you&apos;ll receive instant access to your book and login credentials via email.
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  )
}

NotesPage.getLayout = (page) => <MainLayout>{page}</MainLayout>

export default NotesPage
