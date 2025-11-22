import React from 'react'
import { NextPageWithLayout } from '@/interfaces/layout'
import { MainLayout } from '@/components/layout'
import { Container, Typography, Paper, Box } from '@mui/material'

const PrivacyPolicy: NextPageWithLayout = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'primary.main', mb: 4 }}>
          Privacy Policy
        </Typography>
        
        <Typography variant="body1" paragraph>
          Last updated on Nov 19 2025
        </Typography>

        <Typography variant="body1" paragraph>
          This privacy policy sets out how ARCHANA SINGH uses and protects any information that you give ARCHANA SINGH when you visit their website and/or agree to purchase from them.
        </Typography>

        <Typography variant="body1" paragraph>
          ARCHANA SINGH is committed to ensuring that your privacy is protected. Should we ask you to provide certain information by which you can be identified when using this website, and then you can be assured that it will only be used in accordance with this privacy statement.
        </Typography>

        <Typography variant="body1" paragraph>
          ARCHANA SINGH may change this policy from time to time by updating this page. You should check this page from time to time to ensure that you adhere to these changes.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 4 }}>
          We may collect the following information:
        </Typography>
        
        <Box sx={{ ml: 2 }}>
          <Typography variant="body1" paragraph>• Name</Typography>
          <Typography variant="body1" paragraph>• Contact information including email address</Typography>
          <Typography variant="body1" paragraph>• Demographic information such as postcode, preferences and interests, if required</Typography>
          <Typography variant="body1" paragraph>• Other information relevant to customer surveys and/or offers</Typography>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 4 }}>
          What we do with the information we gather
        </Typography>

        <Typography variant="body1" paragraph>
          We require this information to understand your needs and provide you with a better service, and in particular for the following reasons:
        </Typography>

        <Box sx={{ ml: 2 }}>
          <Typography variant="body1" paragraph>• Internal record keeping.</Typography>
          <Typography variant="body1" paragraph>• We may use the information to improve our products and services.</Typography>
          <Typography variant="body1" paragraph>• We may periodically send promotional emails about new products, special offers or other information which we think you may find interesting using the email address which you have provided.</Typography>
          <Typography variant="body1" paragraph>• From time to time, we may also use your information to contact you for market research purposes. We may contact you by email, phone, fax or mail. We may use the information to customise the website according to your interests.</Typography>
        </Box>

        <Typography variant="body1" paragraph>
          We are committed to ensuring that your information is secure. In order to prevent unauthorised access or disclosure we have put in suitable measures.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 4 }}>
          How we use cookies
        </Typography>

        <Typography variant="body1" paragraph>
          A cookie is a small file which asks permission to be placed on your computer&apos;s hard drive. Once you agree, the file is added and the cookie helps analyze web traffic or lets you know when you visit a particular site. Cookies allow web applications to respond to you as an individual. The web application can tailor its operations to your needs, likes and dislikes by gathering and remembering information about your preferences.
        </Typography>

        <Typography variant="body1" paragraph>
          We use traffic log cookies to identify which pages are being used. This helps us analyze data about webpage traffic and improve our website in order to tailor it to customer needs. We only use this information for statistical analysis purposes and then the data is removed from the system.
        </Typography>

        <Typography variant="body1" paragraph>
          Overall, cookies help us provide you with a better website, by enabling us to monitor which pages you find useful and which you do not. A cookie in no way gives us access to your computer or any information about you, other than the data you choose to share with us.
        </Typography>

        <Typography variant="body1" paragraph>
          You can choose to accept or decline cookies. Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer. This may prevent you from taking full advantage of the website.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 4 }}>
          Controlling your personal information
        </Typography>

        <Typography variant="body1" paragraph>
          You may choose to restrict the collection or use of your personal information in the following ways:
        </Typography>

        <Box sx={{ ml: 2 }}>
          <Typography variant="body1" paragraph>
            • Whenever you are asked to fill in a form on the website, look for the box that you can click to indicate that you do not want the information to be used by anybody for direct marketing purposes
          </Typography>
          <Typography variant="body1" paragraph>
            • If you have previously agreed to us using your personal information for direct marketing purposes, you may change your mind at any time by writing to or emailing us at arjunasarrowldh@gmail.com
          </Typography>
        </Box>

        <Typography variant="body1" paragraph>
          We will not sell, distribute or lease your personal information to third parties unless we have your permission or are required by law to do so. We may use your personal information to send you promotional information about third parties which we think you may find interesting if you tell us that you wish this to happen.
        </Typography>

        <Typography variant="body1" paragraph>
          If you believe that any information we are holding on you is incorrect or incomplete, please write to 1254 MIG, 32 Sec, Chandigarh Road Ludhiana PUNJAB 141010 or contact us at 9417916509 or arjunasarrowldh@gmail.com as soon as possible. We will promptly correct any information found to be incorrect.
        </Typography>
      </Paper>
    </Container>
  )
}

PrivacyPolicy.getLayout = (page) => <MainLayout>{page}</MainLayout>

export default PrivacyPolicy
