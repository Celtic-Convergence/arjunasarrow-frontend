import React, { useState, useEffect, useCallback } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { styled } from '@mui/material/styles'
import { Content } from '@/types/database.types'
import dynamic from 'next/dynamic'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useAuth } from '@/contexts/AuthContext'

// Lazy load PDF viewers only when needed
const PDFViewer = dynamic(() => import('@/components/content/PDFViewer'), {
  ssr: false,
  loading: () => (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      height: '70vh',
      flexDirection: 'column',
      gap: 2
    }}>
      <CircularProgress />
      <Typography>Loading PDF viewer...</Typography>
    </Box>
  )
})

const MobilePDFViewer = dynamic(() => import('@/components/content/MobilePDFViewer'), {
  ssr: false,
  loading: () => (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      height: '85vh',
      flexDirection: 'column',
      gap: 2
    }}>
      <CircularProgress />
      <Typography>Loading mobile PDF viewer...</Typography>
    </Box>
  )
})

// Lazy load secure video player
const SecureVideoPlayer = dynamic(() => import('@/components/content/SecureVideoPlayer'), {
  ssr: false,
  loading: () => (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      height: '70vh',
      flexDirection: 'column',
      gap: 2
    }}>
      <CircularProgress />
      <Typography>Loading secure video player...</Typography>
    </Box>
  )
})


// Container for PDF content
const PdfContainer = styled('div')`
  position: relative;
  width: 100%;
  height: 70vh;
  
  @media (max-width: 768px) {
    height: 85vh;
  }
  
  @media (orientation: landscape) and (max-width: 900px) {
    height: 85vh;
  }
`


interface ContentPlayerProps {
  content: Content
  onError?: (error: string) => void
  onProgress?: () => void
  onReady?: () => void
}

const ContentPlayer: React.FC<ContentPlayerProps> = ({ 
  content, 
  onError,
  onProgress,
  onReady
}) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pdfUrl, setPdfUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const { isMobile, isTablet } = useIsMobile()
  const { user, isLoading: authLoading } = useAuth()

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage)
    setLoading(false)
    if (onError) onError(errorMessage)
  }, [onError])


  // Fetch video signed URL
  const fetchVideoUrl = useCallback(async (): Promise<void> => {
    try {
      const urlParams = new URLSearchParams(content.file_url.split('?')[1])
      const id = urlParams.get('id')
      const chapterId = urlParams.get('chapterId')

      if (!id || !chapterId) {
        handleError('Invalid content URL')
        return
      }

      // Get current domain to use for referer validation
      const currentDomain = window.location.origin
      
      // Include security headers to prevent unauthorized access
      const response = await fetch(`/api/content/serve-video?id=${id}&chapterId=${chapterId}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-Client-Origin': currentDomain,
          'X-Client-Referer': document.referrer || currentDomain
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        handleError(errorData.error || 'Failed to load video')
        return
      }

      const data = await response.json()
      setVideoUrl(data.url)
      setLoading(false)
      
      // Set a timer to refresh the URL before it expires
      // Most signed URLs expire within 5-15 minutes
      setTimeout(() => {
        if (document.visibilityState === 'visible') {
          // Only refresh if the page is visible
          fetchVideoUrl()
        }
      }, 4 * 60 * 1000) // Refresh every 4 minutes
      
    } catch (err) {
      handleError('Error loading video')
      console.error('Video fetch error:', err)
    }
  }, [content.file_url, handleError]);

  // Initialize content
  useEffect(() => {
    setLoading(true)
    setError('')
    setPdfUrl('')
    setVideoUrl('')

    if (content.content_type === 'pdf') {
      // For PDFs, use the API endpoint directly since it serves the PDF
      const urlParams = new URLSearchParams(content.file_url.split('?')[1])
      const id = urlParams.get('id')
      const chapterId = urlParams.get('chapterId')

      if (!id || !chapterId) {
        handleError('Invalid content URL')
        return
      }

      const directPdfUrl = `/api/content/serve-pdf?id=${id}&chapterId=${chapterId}`
      setPdfUrl(directPdfUrl)
      setLoading(false)
      if (onReady) onReady()
    } else if (content.content_type === 'video') {
      fetchVideoUrl()
    } else {
      setLoading(false)
    }

    if (onProgress) onProgress()
  }, [content.content_type, content.id, content.file_url, fetchVideoUrl, onProgress, onReady, handleError])

  const handleContentLoaded = useCallback(() => {
    setLoading(false);
    if (onReady) onReady();
  }, [onReady]);

  if (loading || authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>
          {authLoading ? 'Authenticating...' : `Loading ${content.content_type}...`}
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    )
  }

  // Render PDF content with mobile optimization
  if (content.content_type === 'pdf' && pdfUrl) {
    // Use MobilePDFViewer for mobile and tablet devices
    const PDFComponent = isMobile || isTablet ? MobilePDFViewer : PDFViewer;
    
    return (
      <PdfContainer>
        <PDFComponent 
          fileUrl={pdfUrl} 
          title={content.title || "PDF Document"}
          onContentReady={handleContentLoaded}
          user={user}
        />
      </PdfContainer>
    )
  }

  // Render video content with secure player
  if (content.content_type === 'video' && videoUrl) {
    return (
      <Box sx={{ width: '100%' }}>
        <SecureVideoPlayer
          url={videoUrl}
          onError={handleError}
          onReady={handleContentLoaded}
          userEmail={user?.email || 'Protected Content'}
        />
      </Box>
    )
  }

  return (
    <Alert severity="warning">
      Unsupported content type: {content.content_type}
    </Alert>
  )
}

export default ContentPlayer 