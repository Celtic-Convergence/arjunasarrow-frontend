import React from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import Grid from '@mui/material/Grid'
import NextLink from 'next/link'

interface FooterProps {
  theme?: string
}

const Footer = ({ theme }: FooterProps): JSX.Element => {
  const isDashboardTheme = theme === 'dashboard';
  const footerBg = isDashboardTheme 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : '#0D6A69';
  const textColor = '#ffffff';
  
  return (
    <Box 
      component="footer" 
      sx={{ 
        background: footerBg,
        py: 4, 
        color: textColor
      }}
    >
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: textColor }}>
                Arjuna&apos;s Arrow Economics
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: textColor }}>
                Empowering students with quality economics education since 2011
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: textColor }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link 
                component={NextLink} 
                href="/contact" 
                sx={{ 
                  color: textColor, 
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Contact Us
              </Link>
              <Link 
                component={NextLink} 
                href="/privacy-policy" 
                sx={{ 
                  color: textColor, 
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Privacy Policy
              </Link>
              <Link 
                component={NextLink} 
                href="/cancellation-refund" 
                sx={{ 
                  color: textColor, 
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Cancellation & Refund Policy
              </Link>
              <Link 
                component={NextLink} 
                href="/shipping-delivery" 
                sx={{ 
                  color: textColor, 
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Shipping & Delivery Policy
              </Link>
              <Link 
                component={NextLink} 
                href="/terms-conditions" 
                sx={{ 
                  color: textColor, 
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Terms & Conditions
              </Link>
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: `1px solid rgba(255, 255, 255, 0.2)` }}>
          <Typography variant="caption" display="block" sx={{ color: textColor }}>
            © {new Date().getFullYear()} Arjuna&apos;s Arrow. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer
