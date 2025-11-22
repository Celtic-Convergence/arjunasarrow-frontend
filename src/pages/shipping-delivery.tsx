import React from 'react'
import { NextPageWithLayout } from '@/interfaces/layout'
import { MainLayout } from '@/components/layout'
import { Container, Typography, Paper } from '@mui/material'

const ShippingDelivery: NextPageWithLayout = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'primary.main', mb: 4 }}>
          Shipping & Delivery Policy
        </Typography>
        
        <Typography variant="body1" paragraph>
          Last updated on Nov 19 2025
        </Typography>

        <Typography variant="body1" paragraph>
          For International buyers, orders are shipped and delivered through registered international courier companies and/or International speed post only. For domestic buyers, orders are shipped through registered domestic courier companies and /or speed post only.
        </Typography>

        <Typography variant="body1" paragraph>
          Orders are shipped within <strong>Not Applicable</strong> or as per the delivery date agreed at the time of order confirmation and delivering of the shipment subject to Courier Company / post office norms.
        </Typography>

        <Typography variant="body1" paragraph>
          ARCHANA SINGH is not liable for any delay in delivery by the courier company / postal authorities and only guarantees to hand over the consignment to the courier company or postal authorities within <strong>Not Applicable</strong> from the date of the order and payment or as per the delivery date agreed at the time of order confirmation.
        </Typography>

        <Typography variant="body1" paragraph>
          Delivery of all orders will be to the address provided by the buyer. Delivery of our services will be confirmed on your mail ID as specified during registration.
        </Typography>

        <Typography variant="body1" paragraph>
          For any issues in utilizing our services you may contact our helpdesk on <strong>9417916509</strong> or <strong>arjunasarrowldh@gmail.com</strong>
        </Typography>
      </Paper>
    </Container>
  )
}

ShippingDelivery.getLayout = (page) => <MainLayout>{page}</MainLayout>

export default ShippingDelivery
