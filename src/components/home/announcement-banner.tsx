import React, { useState } from 'react'
import { Box, Container, Typography, IconButton, Button } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Announcement Banner Component
 * 
 * Displays a prominent banner at the top of unauthenticated pages to announce new features.
 * Only visible to non-authenticated users.
 * Includes close button (dismissible with localStorage persistence).
 */
export const AnnouncementBanner: React.FC = () => {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [isVisible, setIsVisible] = useState(() => {
    // Check if user has dismissed the banner (persists across sessions)
    if (typeof window !== 'undefined') {
      return localStorage.getItem('announcement-banner-dismissed') !== 'true'
    }
    return true
  })

  const handleClose = (): void => {
    setIsVisible(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('announcement-banner-dismissed', 'true')
    }
  }

  const handleExploreBooks = (): void => {
    router.push('/notes')
  }

  // Don't show for authenticated users
  if (isAuthenticated || !isVisible) return null

  return (
    <Box
      sx={{
        bgcolor: '#127C71',
        color: 'white',
        py: 2,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(18, 124, 113, 0.15)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.03) 10px, rgba(255, 255, 255, 0.03) 20px)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Icon + Message */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1.5, md: 2 },
              flex: 1,
              minWidth: 0, // Allow text truncation
            }}
          >
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                flexShrink: 0,
              }}
            >
              <AutoStoriesIcon sx={{ fontSize: 24 }} />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                }}
              >
                <Box
                  component="span"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.25)',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    display: { xs: 'none', md: 'inline-block' },
                  }}
                >
                  NEW
                </Box>
                <span>
                  Premium Study Notes Now Available! 
                  <Box
                    component="span"
                    sx={{
                      display: { xs: 'none', md: 'inline' },
                      ml: 1,
                      fontWeight: 400,
                      opacity: 0.95,
                    }}
                  >
                    Get instant access to comprehensive notes &amp; practice materials
                  </Box>
                </span>
              </Typography>
            </Box>
          </Box>

          {/* CTA Button */}
          <Button
            variant="contained"
            size="small"
            onClick={handleExploreBooks}
            endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
            sx={{
              bgcolor: 'white',
              color: '#127C71',
              fontWeight: 600,
              fontSize: { xs: '0.75rem', md: '0.875rem' },
              px: { xs: 1.5, md: 2 },
              py: { xs: 0.75, md: 1 },
              borderRadius: 2,
              textTransform: 'none',
              flexShrink: 0,
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Explore Notes
          </Button>

          {/* Close Button */}
          <IconButton
            size="small"
            onClick={handleClose}
            sx={{
              color: 'white',
              opacity: 0.8,
              flexShrink: 0,
              ml: { xs: 0, md: 1 },
              '&:hover': {
                opacity: 1,
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
            aria-label="Close announcement"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Container>
    </Box>
  )
}
