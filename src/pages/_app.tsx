import React, { FC } from 'react'
import Head from 'next/head'
import type { AppProps } from 'next/app'
import { CssBaseline } from '@mui/material'
import { EmotionCache } from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { createEmotionCache } from '@/utils'
import { MUIProvider } from '@/providers'
import 'slick-carousel/slick/slick.css'
import '@/styles/globals.css'
import '@/styles/react-slick.css'
import { NextPageWithLayout } from '@/interfaces/layout'
import Script from 'next/script'
import '@/lib/amplifyConfig'
import { AuthProvider } from '@/contexts/AuthContext'

const isProd = process.env.NODE_ENV === 'production'
const GA_ID = process.env.NEXT_PUBLIC_GA_ID


// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

type AppPropsWithLayout = AppProps & {
  emotionCache: EmotionCache
  Component: NextPageWithLayout
}

const App: FC<AppPropsWithLayout> = (props: AppPropsWithLayout) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout || ((page) => page)

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>Arjuna&apos;s Arrow</title>
      </Head>
      <MUIProvider>
        <AuthProvider>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          {getLayout(<Component {...pageProps} />)}
        </AuthProvider>
      </MUIProvider>
      
      {/* Razorpay SDK for payment processing */}
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      {/* Google Analytics - Only load in production */}
      {isProd && GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </>
      )}
    </CacheProvider>
  )
}

export default App
