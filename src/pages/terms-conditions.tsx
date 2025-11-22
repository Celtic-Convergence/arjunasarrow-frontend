import React from 'react'
import { NextPageWithLayout } from '@/interfaces/layout'
import { MainLayout } from '@/components/layout'
import { Container, Typography, Paper, Box } from '@mui/material'

const TermsConditions: NextPageWithLayout = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'primary.main', mb: 4 }}>
          Terms & Conditions
        </Typography>
        
        <Typography variant="body1" paragraph>
          Last updated on Nov 19 2025
        </Typography>

        <Typography variant="body1" paragraph>
          For the purpose of these Terms and Conditions, The term &quot;we&quot;, &quot;us&quot;, &quot;our&quot; used anywhere on this page shall mean ARCHANA SINGH, whose registered/operational office is 1254 MIG, 32 Sec, Chandigarh Road Ludhiana PUNJAB 141010. &quot;you&quot;, &quot;your&quot;, &quot;user&quot;, &quot;visitor&quot; shall mean any natural or legal person who is visiting our website and/or agreed to purchase from us.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 4 }}>
          Your use of the website and/or purchase from us are governed by following Terms and Conditions:
        </Typography>

        <Box sx={{ ml: 2, mt: 3 }}>
          <Typography variant="body1" paragraph>
            • The content of the pages of this website is subject to change without notice.
          </Typography>

          <Typography variant="body1" paragraph>
            • Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials found or offered on this website for any particular purpose. You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.
          </Typography>

          <Typography variant="body1" paragraph>
            • Your use of any information or materials on our website and/or product pages is entirely at your own risk, for which we shall not be liable. It shall be your own responsibility to ensure that any products, services or information available through our website and/or product pages meet your specific requirements.
          </Typography>

          <Typography variant="body1" paragraph>
            • Our website contains material which is owned by or licensed to us. This material includes, but are not limited to, the design, layout, look, appearance and graphics. Reproduction is prohibited other than in accordance with the copyright notice, which forms part of these terms and conditions.
          </Typography>

          <Typography variant="body1" paragraph>
            • All trademarks reproduced in our website which are not the property of, or licensed to, the operator are acknowledged on the website.
          </Typography>

          <Typography variant="body1" paragraph>
            • Unauthorized use of information provided by us shall give rise to a claim for damages and/or be a criminal offense.
          </Typography>

          <Typography variant="body1" paragraph>
            • From time to time our website may also include links to other websites. These links are provided for your convenience to provide further information.
          </Typography>

          <Typography variant="body1" paragraph>
            • You may not create a link to our website from another website or document without ARCHANA SINGH&apos;s prior written consent.
          </Typography>

          <Typography variant="body1" paragraph>
            • Any dispute arising out of use of our website and/or purchase with us and/or any engagement with us is subject to the laws of India.
          </Typography>

          <Typography variant="body1" paragraph>
            • We, shall be under no liability whatsoever in respect of any loss or damage arising directly or indirectly out of the decline of authorization for any Transaction, on Account of the Cardholder having exceeded the preset limit mutually agreed by us with our acquiring bank from time to time.
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}

TermsConditions.getLayout = (page) => <MainLayout>{page}</MainLayout>

export default TermsConditions
