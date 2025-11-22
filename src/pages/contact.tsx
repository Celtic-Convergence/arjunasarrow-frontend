import React from 'react'
import { NextPageWithLayout } from '@/interfaces/layout'
import { MainLayout } from '@/components/layout'
import { Box, Container, Typography, Paper } from '@mui/material'

const ContactUs: NextPageWithLayout = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'primary.main', mb: 4 }}>
          Contact Us
        </Typography>
        
        <Typography variant="body1" paragraph>
          Last updated on Nov 19 2025
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 3 }}>
            You may contact us using the information below:
          </Typography>
          
          <Box sx={{ mt: 2, ml: 2 }}>
            <Typography variant="body1" paragraph>
              <strong>Merchant Legal entity name:</strong> ARCHANA SINGH
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Registered Address:</strong> 1254 MIG, 32 Sec, Chandigarh Road Ludhiana PUNJAB 141010
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Operational Address:</strong> 1254 MIG, 32 Sec, Chandigarh Road Ludhiana PUNJAB 141010
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Telephone No:</strong> 9417916509
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>E-Mail ID:</strong> arjunasarrowldh@gmail.com
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}

ContactUs.getLayout = (page) => <MainLayout>{page}</MainLayout>

export default ContactUs
