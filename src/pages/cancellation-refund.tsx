import React from 'react'
import { NextPageWithLayout } from '@/interfaces/layout'
import { MainLayout } from '@/components/layout'
import { Container, Typography, Paper, Box } from '@mui/material'

const CancellationRefund: NextPageWithLayout = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'primary.main', mb: 4 }}>
          Cancellation & Refund Policy
        </Typography>
        
        <Typography variant="body1" paragraph>
          Last updated on Nov 19 2025
        </Typography>

        <Typography variant="body1" paragraph>
          ARCHANA SINGH believes in helping its customers as far as possible, and has therefore a liberal cancellation policy. Under this policy:
        </Typography>

        <Box sx={{ ml: 2, mt: 3 }}>
          <Typography variant="body1" paragraph>
            • Cancellations will be considered only if the request is made within <strong>Not Applicable</strong> of placing the order. However, the cancellation request may not be entertained if the orders have been communicated to the vendors/merchants and they have initiated the process of shipping them.
          </Typography>

          <Typography variant="body1" paragraph>
            • ARCHANA SINGH does not accept cancellation requests for perishable items like flowers, eatables etc. However, refund/replacement can be made if the customer establishes that the quality of product delivered is not good.
          </Typography>

          <Typography variant="body1" paragraph>
            • In case of receipt of damaged or defective items please report the same to our Customer Service team. The request will, however, be entertained once the merchant has checked and determined the same at his own end. This should be reported within <strong>Not Applicable</strong> of receipt of the products.
          </Typography>

          <Typography variant="body1" paragraph>
            • In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within <strong>Not Applicable</strong> of receiving the product. The Customer Service Team after looking into your complaint will take an appropriate decision.
          </Typography>

          <Typography variant="body1" paragraph>
            • In case of complaints regarding products that come with a warranty from manufacturers, please refer the issue to them.
          </Typography>

          <Typography variant="body1" paragraph>
            • In case of any Refunds approved by the ARCHANA SINGH, it&apos;ll take <strong>Not Applicable</strong> for the refund to be processed to the end customer.
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}

CancellationRefund.getLayout = (page) => <MainLayout>{page}</MainLayout>

export default CancellationRefund
