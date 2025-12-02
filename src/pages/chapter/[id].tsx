import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { NextPageWithLayout } from '@/interfaces/layout'
import { MainLayout } from '@/components/layout'
import { AuthGuard } from '@/components/auth/AuthGuard'
import Head from 'next/head'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Paper from '@mui/material/Paper'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from 'next/link'
import HomeIcon from '@mui/icons-material/Home'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import { getSession } from '@/lib/cognitoClient'
import { useAuth } from '@/contexts/AuthContext'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo'
import Divider from '@mui/material/Divider'
import Skeleton from '@mui/material/Skeleton'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton'
import Chip from '@mui/material/Chip'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import HdIcon from '@mui/icons-material/Hd'
import SdIcon from '@mui/icons-material/Sd'
import SettingsIcon from '@mui/icons-material/Settings'
import PDFViewer from '@/components/content/PDFViewer'
import MobilePDFViewer from '@/components/content/MobilePDFViewer'
import SecureVideoPlayer from '@/components/content/SecureVideoPlayer'
import { useIsMobile } from '@/hooks/useIsMobile'
import { ResourceManagement } from '@/components/chapter/ResourceManagement'
import { UploadResourceDialog } from '@/components/chapter/UploadResourceDialog'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

interface ChapterPageProps {
  error?: string
}

interface ChapterApiResponse {
  chapterId: string
  title: string
  bookId: string
  courseId: string
  order: number
  canUpload: boolean
  isAdmin: boolean
  resources?: {
    pdfs?: PdfResource[]
    videos?: VideoResource[]
  }
  uploadConfig?: {
    allowedFormats: string[]
    maxFileSizes: {
      pdf: number
      video: number
    }
    existingFiles: {
      pdfs: ExistingFile[]
      videos: ExistingFile[]
    }
  }
}

interface PdfResource {
  id: string
  filename: string
  signedUrl: string
}

interface VideoResource {
  id: string
  filename: string
  quality: string
  signedUrl: string
}

interface ExistingFile {
  id: string
  filename: string
  uploadedAt: string
  quality?: string
}

function TabPanel(props: TabPanelProps): JSX.Element {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`chapter-tabpanel-${index}`}
      aria-labelledby={`chapter-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  )
}

function a11yProps(index: number): { id: string; 'aria-controls': string } {
  return {
    id: `chapter-tab-${index}`,
    'aria-controls': `chapter-tabpanel-${index}`,
  }
}

const ChapterPage: NextPageWithLayout<ChapterPageProps> = () => {
  const [tabValue, setTabValue] = useState(0)
  const [contentType, setContentType] = useState<'pdf' | 'video'>('pdf')
  const [selectedContent, setSelectedContent] = useState<PdfResource | VideoResource | null>(null)
  const [_, setIsContentLoading] = useState(false)
  const [contentIsReady, setContentIsReady] = useState(false)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [serverError] = useState<string | null>(null)
  const [initialContentSelected, setInitialContentSelected] = useState(false)
  const [shouldLoadContent, setShouldLoadContent] = useState(false)
  const [chapterData, setChapterData] = useState<ChapterApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [qualityMenuAnchor, setQualityMenuAnchor] = useState<null | HTMLElement>(null)
  const [selectedVideoGroup, setSelectedVideoGroup] = useState<string | null>(null)
  const { user: currentUser, sessionToken } = useAuth()
  const { isMobile, isTablet } = useIsMobile()

  // Load chapter data when user is available
  useEffect(() => {
    if (!currentUser) return
    
    const loadChapterData = async (): Promise<void> => {
      try {
        setLoading(true)

        // Get chapter ID from URL, handling trailing slashes
        const pathParts = window.location.pathname.split('/').filter(part => part)
        const chapterId = pathParts[pathParts.length - 1]
        if (!chapterId || chapterId === 'chapter') {
          setLoadingError('Invalid chapter ID')
          return
        }

        // Use cached session token or get a fresh one
        let idToken = sessionToken
        
        if (!idToken) {
          const sessionResult = await getSession()
          if (sessionResult.error || !sessionResult.data.session) {
            setLoadingError('Authentication failed')
            return
          }
          idToken = (sessionResult.data.session as any)?.tokens?.idToken?.toString()
          if (!idToken) {
            setLoadingError('No valid authentication token found')
            return
          }
        }

        // Call the API
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
        if (!apiBaseUrl) {
          setLoadingError('API base URL not configured')
          return
        }

        const endpoint = apiBaseUrl.endsWith('/v1') ? `/chapters/${chapterId}` : `/v1/chapters/${chapterId}`
        const response = await fetch(`${apiBaseUrl}${endpoint}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          }
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch chapter: ${response.statusText}`)
        }

        const apiResponse = await response.json()
        if (!apiResponse.success) {
          throw new Error(apiResponse.error?.message || 'Failed to load chapter data')
        }

        setChapterData(apiResponse.data)
      } catch (error) {
        // Error loading chapter data
        setLoadingError(error instanceof Error ? error.message : 'Failed to load chapter data')
      } finally {
        setLoading(false)
      }
    }

    loadChapterData()
  }, [currentUser, sessionToken])

  // Refresh chapter data after upload or delete
  const refreshChapterData = useCallback(async () => {
    if (!currentUser) return
    
    try {
      const pathParts = window.location.pathname.split('/').filter(part => part)
      const chapterId = pathParts[pathParts.length - 1]
      if (!chapterId || chapterId === 'chapter') return

      let idToken = sessionToken
      if (!idToken) {
        const sessionResult = await getSession()
        if (sessionResult.error || !sessionResult.data.session) return
        idToken = (sessionResult.data.session as any)?.tokens?.idToken?.toString()
        if (!idToken) return
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      if (!apiBaseUrl) return

      const endpoint = apiBaseUrl.endsWith('/v1') ? `/chapters/${chapterId}` : `/v1/chapters/${chapterId}`
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch chapter: ${response.statusText}`)
      }

      const apiResponse = await response.json()
      if (!apiResponse.success) {
        throw new Error(apiResponse.error?.message || 'Failed to load chapter data')
      }

      setChapterData(apiResponse.data)
    } catch (error) {
      // Error refreshing chapter data
    }
  }, [currentUser, sessionToken])

  // Group content by type using useMemo to prevent unnecessary recalculations
  const pdfContents = useMemo(() => 
    chapterData?.resources?.pdfs || [], 
    [chapterData]
  )
  
  const videoContents = useMemo(() => 
    chapterData?.resources?.videos || [], 
    [chapterData]
  )

  // Group videos by filename (without quality suffix)
  const groupedVideos = useMemo(() => {
    const groups: { [key: string]: VideoResource[] } = {}
    
    videoContents.forEach(video => {
      // Extract base filename without quality suffix - handle multiple patterns
      let baseFilename = video.filename
        // Remove quality suffixes with different patterns
        .replace(/[-_](720p|480p|360p)\.(mp4|MP4)$/i, '') // test-720p.mp4 -> test
        .replace(/-(720p|480p|360p)$/i, '') // test-720p -> test
        .replace(/\.(mp4|MP4)$/i, '') // test.mp4 -> test
      
      // Also handle cases where quality is at the end without extension
      // test-360 -> test
      baseFilename = baseFilename.replace(/-(\d{3}p?)$/i, '')
      
      // Group videos by base filename
      
      if (!groups[baseFilename]) {
        groups[baseFilename] = []
      }
      groups[baseFilename].push(video)
    })
    
    // Sort each group by quality (highest first)
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => {
        const qualityOrder = { '720p': 3, '480p': 2, '360p': 1 }
        const aOrder = qualityOrder[a.quality as keyof typeof qualityOrder] || 0
        const bOrder = qualityOrder[b.quality as keyof typeof qualityOrder] || 0
        return bOrder - aOrder
      })
    })
    
    // Videos grouped successfully
    return groups
  }, [videoContents])

  useEffect(() => {
    // Select the first content item of the current type if none selected
    if (!initialContentSelected && ((contentType === 'pdf' && pdfContents.length > 0) || 
        (contentType === 'video' && videoContents.length > 0))) {
      
      const defaultContent = contentType === 'pdf' 
        ? pdfContents[0] 
        : Object.values(groupedVideos)[0]?.[0]; // Get highest quality of first video group
      
      if (defaultContent) {
        // Setting initial content
        setSelectedContent(defaultContent);
        setInitialContentSelected(true);
        // Delay content loading slightly to improve perceived performance
        setTimeout(() => {
          setShouldLoadContent(true);
          setIsContentLoading(true);
        }, 100);
      }
    }
  }, [contentType, pdfContents, videoContents, groupedVideos, initialContentSelected]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setTabValue(newValue)
    setContentType(newValue === 0 ? 'pdf' : 'video')
    setInitialContentSelected(false)
    setSelectedContent(null)
    setContentIsReady(false)
    setShouldLoadContent(false)
    setLoadingError(null) // Clear any previous errors
  }

  const handleContentSelect = (content: PdfResource | VideoResource): void => {
    // For videos, we need to check both id and quality to properly identify unique videos
    const isSameContent = selectedContent?.id === content.id && 
      ('quality' in content && 'quality' in selectedContent ? 
        selectedContent.quality === content.quality : true);
    
    if (isSameContent) return;
    
    // Selecting content
    setContentIsReady(false);
    setSelectedContent(content);
    // Immediate loading for user-selected content
    setShouldLoadContent(true);
    setIsContentLoading(true);
  }

  const handleQualityMenuOpen = (event: React.MouseEvent<HTMLElement>, videoGroup: string): void => {
    event.stopPropagation()
    setQualityMenuAnchor(event.currentTarget)
    setSelectedVideoGroup(videoGroup)
  }

  const handleQualityMenuClose = (): void => {
    setQualityMenuAnchor(null)
    setSelectedVideoGroup(null)
  }

  const handleQualitySelect = (video: VideoResource): void => {
    handleQualityMenuClose()
    handleContentSelect(video)
  }

  const getQualityIcon = (quality: string): React.ReactNode | null => {
    switch (quality) {
      case '720p':
        return <HdIcon sx={{ fontSize: 16 }} />
      case '480p':
      case '360p':
        return <SdIcon sx={{ fontSize: 16 }} />
      default:
        return null
    }
  }

  const getQualityLabel = (quality: string): string => {
    switch (quality) {
      case '720p':
        return 'HD 720p - Best Quality'
      case '480p':
        return 'SD 480p - Standard'
      case '360p':
        return 'SD 360p - Data Saver'
      default:
        return quality
    }
  }

  const handleContentError = useCallback((error: string): void => {
    // Content error occurred
    setLoadingError(error);
    setIsContentLoading(false);
  }, []);

  const updateContentProgress = useCallback(async (): Promise<void> => {
    if (!selectedContent || !currentUser) return
    
    try {
      // Progress tracking is handled by the server endpoints
      // Content accessed successfully
    } catch (err) {
      // Error updating progress
    }
  }, [selectedContent, currentUser]);

  const handleContentReady = useCallback((): void => {
    setIsContentLoading(false);
    setContentIsReady(true);
    updateContentProgress();
  }, [updateContentProgress]);

  // Render content list item skeletons
  const renderContentSkeletons = (): JSX.Element[] => {
    return Array(3).fill(0).map((_, index) => (
      <React.Fragment key={`skeleton-${index}`}>
        <ListItem disablePadding>
          <ListItemButton disabled>
            <ListItemIcon>
              <Skeleton variant="circular" width={24} height={24} />
            </ListItemIcon>
            <ListItemText 
              primary={<Skeleton variant="text" width="80%" />} 
              secondary={<Skeleton variant="text" width="40%" />} 
            />
          </ListItemButton>
        </ListItem>
        <Divider component="li" />
      </React.Fragment>
    ));
  };

  // Render content viewer skeleton
  const renderContentViewerSkeleton = (): JSX.Element => {
    return <LoadingSkeleton height={{ xs: 250, sm: 350, md: 500 }} />;
  };

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ py: 12, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <CircularProgress size={60} sx={{ mb: 2, color: '#4c51bf' }} />
            <Typography variant="h6">Loading chapter...</Typography>
          </Box>
        </Container>
      </Box>
    )
  }

  if (serverError || loadingError) {
    return (
      <Box sx={{ py: 12, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h1" align="center" color="error">
            {serverError || loadingError}
          </Typography>
        </Container>
      </Box>
    )
  }

  if (!chapterData) {
    return (
      <Box sx={{ py: 12, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h1" align="center">
            Chapter not found
          </Typography>
        </Container>
      </Box>
    )
  }

  return (
    <>
      <Head>
        <title>{chapterData.title} | Economics E-Learning Portal</title>
        <meta 
          name="description" 
          content={`Study materials for ${chapterData.title} - ${chapterData.bookId}`}
        />
      </Head>
      
      
      <Box sx={{ py: 6, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Breadcrumbs 
            aria-label="breadcrumb" 
            sx={{ 
              mb: 4,
              p: 2,
              borderRadius: 3,
              backgroundColor: 'rgba(76, 81, 191, 0.05)',
              border: '1px solid rgba(76, 81, 191, 0.1)',
              '& .MuiBreadcrumbs-separator': {
                color: 'rgba(76, 81, 191, 0.6)'
              }
            }}
          >
            <Link 
              href="/dashboard"
              passHref
              style={{ 
                textDecoration: 'none',
                color: 'rgba(76, 81, 191, 0.8)',
                display: 'flex',
                alignItems: 'center',
                fontWeight: 500,
                transition: 'color 0.2s ease',
              }}
            >
              <Typography
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  color: 'inherit',
                  '&:hover': {
                    color: '#4c51bf'
                  }
                }}
              >
                <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
                Dashboard
              </Typography>
            </Link>
            <Typography 
              color="text.primary" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 600,
                color: '#4c51bf'
              }}
            >
              <MenuBookIcon sx={{ mr: 0.5, fontSize: 20 }} />
              {chapterData?.title || 'Chapter'}
            </Typography>
          </Breadcrumbs>
          
          <Box sx={{ 
            mb: 4, 
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 4,
            background: 'linear-gradient(135deg, #4c51bf 0%, #667eea 100%)',
            color: 'white',
            boxShadow: '0 8px 32px rgba(76, 81, 191, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -50,
              right: -50,
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
            }
          }}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: { xs: 36, sm: 48 },
                    height: { xs: 36, sm: 48 },
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <AutoStoriesIcon sx={{ fontSize: { xs: 20, sm: 24 }, color: 'white' }} />
                </Box>
                <Box>
                  <Typography 
                    variant="h3" 
                    component="h1" 
                    sx={{ 
                      fontWeight: 700,
                      mb: 0.5,
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' }
                    }}
                  >
                    {chapterData?.title}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      opacity: 0.9,
                      fontWeight: 500
                    }}
                  >
                    Chapter {chapterData?.order} • Learning Materials
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
          
          {/* Resource Management for Admin Users */}
          {chapterData?.isAdmin && (
            <ResourceManagement
              isAdmin={true}
              chapterId={chapterData.chapterId}
              existingFiles={chapterData.uploadConfig?.existingFiles}
              onUploadClick={() => setUploadDialogOpen(true)}
              _onResourcesChange={refreshChapterData}
            />
          )}
          
          <Paper sx={{ width: '100%', mb: 2, borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)', border: '1px solid rgba(255, 255, 255, 0.2)', background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)', backdropFilter: 'blur(10px)' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'rgba(76, 81, 191, 0.1)' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="content type tabs"
                variant="fullWidth"
                sx={{
                  '.MuiTab-root': {
                    minHeight: { xs: '48px', sm: '64px' },
                    py: { xs: 1, sm: 2 },
                    color: 'rgba(76, 81, 191, 0.7)',
                    fontWeight: 600,
                    '&.Mui-selected': {
                      color: '#4c51bf',
                      background: 'linear-gradient(135deg, rgba(76, 81, 191, 0.05) 0%, rgba(102, 126, 234, 0.05) 100%)',
                    },
                    '&:hover': {
                      background: 'rgba(76, 81, 191, 0.04)',
                    }
                  },
                  '.MuiTabs-indicator': {
                    height: '3px',
                    background: 'linear-gradient(90deg, #4c51bf 0%, #667eea 100%)',
                    borderRadius: '2px',
                  }
                }}
              >
                <Tab 
                  label={`PDFs (${pdfContents.length})`} 
                  icon={<PictureAsPdfIcon />} 
                  {...a11yProps(0)} 
                  disabled={pdfContents.length === 0}
                  sx={{ 
                    flexDirection: { xs: 'row', sm: 'column' },
                    '& .MuiTab-iconWrapper': {
                      mr: { xs: 1, sm: 0 },
                      mb: { xs: 0, sm: 1 },
                    }
                  }}
                />
                <Tab 
                  label={`Videos (${Object.keys(groupedVideos).length})`} 
                  icon={<OndemandVideoIcon />} 
                  {...a11yProps(1)} 
                  disabled={videoContents.length === 0}
                  sx={{ 
                    flexDirection: { xs: 'row', sm: 'column' },
                    '& .MuiTab-iconWrapper': {
                      mr: { xs: 1, sm: 0 },
                      mb: { xs: 0, sm: 1 },
                    }
                  }}
                />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                {/* PDF content list */}
                <Grid item xs={12} md={4} sx={{ order: { xs: 1, md: 1 } }}>
                  <Card sx={{ 
                    height: '100%',
                    mb: { xs: 2, md: 0 },
                    borderRadius: 4,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 16px 40px rgba(0, 0, 0, 0.12)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #4c51bf 0%, #667eea 100%)',
                    }
                  }}>
                    <CardContent sx={{ pb: { xs: 2, md: 3 }, pt: 3 }}>
                      <Typography 
                        variant="h6" 
                        component="h2" 
                        sx={{ 
                          mb: 2,
                          position: { xs: 'sticky', md: 'static' },
                          top: { xs: 0, md: 'auto' },
                          backgroundColor: { xs: 'background.paper', md: 'transparent' },
                          zIndex: { xs: 1, md: 'auto' },
                          py: { xs: 1, md: 0 },
                          mx: { xs: -2, md: 0 },
                          px: { xs: 2, md: 0 },
                          fontWeight: 700,
                          color: 'rgba(0, 0, 0, 0.87)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #4c51bf 0%, #667eea 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(76, 81, 191, 0.3)',
                          }}
                        >
                          <PictureAsPdfIcon sx={{ fontSize: 18, color: 'white' }} />
                        </Box>
                        PDF Documents
                        <Typography 
                          variant="caption" 
                          component="div" 
                          sx={{ 
                            display: { xs: 'block', md: 'none' },
                            color: 'text.secondary',
                            fontWeight: 'normal',
                            mt: 0.5
                          }}
                        >
                          Select a document to view below
                        </Typography>
                      </Typography>
                      {pdfContents.length === 0 ? (
                        <Alert severity="info" sx={{ borderRadius: 3 }}>No PDF documents available</Alert>
                      ) : (
                        <List sx={{ 
                          maxHeight: { xs: '250px', sm: '300px', md: 'none' }, 
                          overflowY: 'auto',
                          '& .MuiListItemButton-root': {
                            borderRadius: 2,
                            mb: 1,
                            border: '1px solid rgba(76, 81, 191, 0.1)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              backgroundColor: 'rgba(76, 81, 191, 0.05)',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 12px rgba(76, 81, 191, 0.15)',
                            },
                            '&.Mui-selected': {
                              backgroundColor: 'rgba(76, 81, 191, 0.1)',
                              borderColor: '#4c51bf',
                              boxShadow: '0 4px 16px rgba(76, 81, 191, 0.2)',
                              '&:hover': {
                                backgroundColor: 'rgba(76, 81, 191, 0.12)',
                              }
                            }
                          }
                        }}>
                          {initialContentSelected ? pdfContents.map((content) => (
                            <React.Fragment key={content.id}>
                              <ListItem disablePadding>
                                <ListItemButton 
                                  selected={selectedContent?.id === content.id}
                                  onClick={() => handleContentSelect(content)}
                                  sx={{ py: { xs: 1.5, md: 1 } }}
                                >
                                  <ListItemIcon>
                                    <Box
                                      sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 2,
                                        background: selectedContent?.id === content.id 
                                          ? 'linear-gradient(135deg, #4c51bf 0%, #667eea 100%)'
                                          : 'rgba(76, 81, 191, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.3s ease',
                                      }}
                                    >
                                      <PictureAsPdfIcon 
                                        sx={{ 
                                          fontSize: 20, 
                                          color: selectedContent?.id === content.id ? 'white' : '#4c51bf'
                                        }} 
                                      />
                                    </Box>
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary={content.filename} 
                                    secondary="PDF Document"
                                    primaryTypographyProps={{
                                      noWrap: true,
                                      sx: { 
                                        maxWidth: { xs: '200px', sm: 'none' },
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        fontWeight: selectedContent?.id === content.id ? 700 : 600,
                                        color: selectedContent?.id === content.id ? '#4c51bf' : 'rgba(0, 0, 0, 0.87)'
                                      }
                                    }}
                                    secondaryTypographyProps={{
                                      sx: {
                                        color: selectedContent?.id === content.id ? 'rgba(76, 81, 191, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                                        fontWeight: 500
                                      }
                                    }}
                                  />
                                  {selectedContent?.id === content.id && (
                                    <Box
                                      sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #4c51bf 0%, #667eea 100%)',
                                        boxShadow: '0 2px 8px rgba(76, 81, 191, 0.4)',
                                      }}
                                    />
                                  )}
                                </ListItemButton>
                              </ListItem>
                            </React.Fragment>
                          )) : renderContentSkeletons()}
                        </List>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* PDF viewer */}
                <Grid item xs={12} md={8} sx={{ order: { xs: 2, md: 2 } }}>
                  {selectedContent && !('quality' in selectedContent) ? (
                    <>
                    <Alert 
                      severity="warning" 
                      variant="filled"
                      sx={{ 
                        mb: 2, 
                        borderRadius: 2,
                        bgcolor: '#ed6c02', // Darker orange for better visibility
                        color: '#fff',
                        '& .MuiAlert-icon': {
                          color: '#fff'
                        }
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        STRICT COPYRIGHT WARNING
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                        This content is digitally watermarked and monitored. Screenshots, screen recording, and unauthorized sharing are strictly prohibited. 
                        Any violation will result in <strong>immediate permanent account termination</strong> without refund and potential legal action.
                      </Typography>
                    </Alert>

                    <Box sx={{ 
                      borderRadius: 4,
                      overflow: 'hidden',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                      backdropFilter: 'blur(10px)',
                      height: { xs: '500px', sm: '600px', md: '600px' },
                      // Use viewport height in landscape mode for better mobile experience
                      '@media (orientation: landscape) and (max-width: 900px)': {
                        height: '70vh',
                        minHeight: '300px',
                      },
                      width: '100%',
                      position: 'relative'
                    }}>
                      {/* Key prop ensures component remounts when content changes */}
                      {(isMobile || isTablet) ? (
                        <MobilePDFViewer
                          key={`mobile-pdf-${selectedContent.id}`}
                          fileUrl={selectedContent.signedUrl}
                          title={selectedContent.filename}
                          onContentReady={handleContentReady}
                          user={currentUser}
                        />
                      ) : (
                        <PDFViewer
                          key={`desktop-pdf-${selectedContent.id}`}
                          fileUrl={selectedContent.signedUrl}
                          title={selectedContent.filename}
                          onContentReady={handleContentReady}
                          user={currentUser}
                        />
                      )}
                    </Box>
                    </>
                  ) : (
                    <Paper sx={{ 
                      p: 6, 
                      textAlign: 'center',
                      borderRadius: 4,
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                      backdropFilter: 'blur(10px)',
                      color: 'rgba(0, 0, 0, 0.6)'
                    }}>
                      <PictureAsPdfIcon sx={{ fontSize: 48, color: 'rgba(76, 81, 191, 0.3)', mb: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Select a PDF document to view</Typography>
                      <Typography variant="body2">Choose from the list on the left to start reading</Typography>
                    </Paper>
                  )}
                </Grid>
              </Grid>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                {/* Video content list */}
                <Grid item xs={12} md={4} sx={{ order: { xs: 1, md: 1 } }}>
                  <Card sx={{ 
                    height: '100%',
                    mb: { xs: 2, md: 0 },
                    borderRadius: 4,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 16px 40px rgba(0, 0, 0, 0.12)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #4c51bf 0%, #667eea 100%)',
                    }
                  }}>
                    <CardContent sx={{ pb: { xs: 2, md: 3 }, pt: 3 }}>
                      <Typography 
                        variant="h6" 
                        component="h2" 
                        sx={{ 
                          mb: 2,
                          position: { xs: 'sticky', md: 'static' },
                          top: { xs: 0, md: 'auto' },
                          backgroundColor: { xs: 'background.paper', md: 'transparent' },
                          zIndex: { xs: 1, md: 'auto' },
                          py: { xs: 1, md: 0 },
                          mx: { xs: -2, md: 0 },
                          px: { xs: 2, md: 0 },
                          fontWeight: 700,
                          color: 'rgba(0, 0, 0, 0.87)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #4c51bf 0%, #667eea 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(76, 81, 191, 0.3)',
                          }}
                        >
                          <OndemandVideoIcon sx={{ fontSize: 18, color: 'white' }} />
                        </Box>
                        Video Lectures
                        <Typography 
                          variant="caption" 
                          component="div" 
                          sx={{ 
                            display: { xs: 'block', md: 'none' },
                            color: 'text.secondary',
                            fontWeight: 'normal',
                            mt: 0.5
                          }}
                        >
                          Select a video to watch below
                        </Typography>
                      </Typography>
                      {videoContents.length === 0 ? (
                        <Alert severity="info" sx={{ borderRadius: 3 }}>No videos available</Alert>
                      ) : (
                        <List sx={{ 
                          maxHeight: { xs: '250px', sm: '300px', md: 'none' }, 
                          overflowY: 'auto',
                          '& .MuiListItemButton-root': {
                            borderRadius: 2,
                            mb: 1,
                            border: '1px solid rgba(76, 81, 191, 0.1)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              backgroundColor: 'rgba(76, 81, 191, 0.05)',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 12px rgba(76, 81, 191, 0.15)',
                            },
                            '&.Mui-selected': {
                              backgroundColor: 'rgba(76, 81, 191, 0.1)',
                              borderColor: '#4c51bf',
                              boxShadow: '0 4px 16px rgba(76, 81, 191, 0.2)',
                              '&:hover': {
                                backgroundColor: 'rgba(76, 81, 191, 0.12)',
                              }
                            }
                          }
                        }}>
                          {!initialContentSelected ? renderContentSkeletons() : (
                            Object.entries(groupedVideos).map(([baseFilename, videos], index) => {
                              // Find the currently selected video in this group, if any
                              const selectedVideoInGroup = videos.find(v => 
                                v.id === selectedContent?.id && 
                                ('quality' in selectedContent && 'quality' in v ? 
                                  v.quality === selectedContent.quality : false)
                              );
                              
                              // Default to highest quality if none selected
                              const videoToUse = selectedVideoInGroup || videos[0];
                              
                              // Check if any video in this group is selected
                              const isGroupSelected = videos.some(v => 
                                v.id === selectedContent?.id && 
                                ('quality' in selectedContent && 'quality' in v ? 
                                  v.quality === selectedContent.quality : false)
                              );
                              
                              return (
                                <React.Fragment key={`${baseFilename}-${index}`}>
                                  <ListItem disablePadding>
                                    <ListItemButton 
                                      selected={isGroupSelected}
                                      onClick={() => handleContentSelect(videoToUse)}
                                      sx={{ py: { xs: 1.5, md: 1 }, pr: 0.5 }}
                                    >
                                      <ListItemIcon>
                                        <Box
                                          sx={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 2,
                                            background: isGroupSelected
                                              ? 'linear-gradient(135deg, #4c51bf 0%, #667eea 100%)'
                                              : 'rgba(76, 81, 191, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.3s ease',
                                          }}
                                        >
                                          <OndemandVideoIcon 
                                            sx={{ 
                                              fontSize: 20, 
                                              color: isGroupSelected ? 'white' : '#4c51bf'
                                            }} 
                                          />
                                        </Box>
                                      </ListItemIcon>
                                      <ListItemText 
                                        primary={baseFilename} 
                                        secondary={
                                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {getQualityIcon(videoToUse.quality)}
                                            <Typography variant="caption" component="span">
                                              {videoToUse.quality} • {videos.length} {videos.length === 1 ? 'quality' : 'qualities'}
                                            </Typography>
                                          </span>
                                        }
                                        primaryTypographyProps={{
                                          noWrap: true,
                                          sx: { 
                                            maxWidth: { xs: '160px', sm: '200px' },
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            fontWeight: isGroupSelected ? 700 : 600,
                                            color: isGroupSelected ? '#4c51bf' : 'rgba(0, 0, 0, 0.87)'
                                          }
                                        }}
                                      />
                                      {videos.length > 1 && (
                                        <IconButton
                                          size="small"
                                          onClick={(e) => handleQualityMenuOpen(e, baseFilename)}
                                          sx={{ 
                                            ml: 'auto',
                                            color: isGroupSelected ? '#4c51bf' : 'rgba(0, 0, 0, 0.54)'
                                          }}
                                        >
                                          <SettingsIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                      )}
                                      {process.env.NODE_ENV === 'development' && (
                                        <Typography variant="caption" sx={{ ml: 1, color: 'red' }}>
                                          {videos.length} vids
                                        </Typography>
                                      )}
                                      {isGroupSelected && (
                                        <Box
                                          sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #4c51bf 0%, #667eea 100%)',
                                            boxShadow: '0 2px 8px rgba(76, 81, 191, 0.4)',
                                            ml: videos.length === 1 ? 'auto' : 1
                                          }}
                                        />
                                      )}
                                    </ListItemButton>
                                  </ListItem>
                                </React.Fragment>
                              );
                            })
                          )}
                        </List>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Video viewer */}
                <Grid item xs={12} md={8} sx={{ order: { xs: 2, md: 2 } }}>
                  {loadingError && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
                      {loadingError}
                    </Alert>
                  )}
                  
                  {!initialContentSelected ? (
                    renderContentViewerSkeleton()
                  ) : selectedContent && shouldLoadContent ? (
                    <Box 
                      sx={{ 
                        opacity: contentIsReady ? 1 : 0,
                        transition: 'opacity 0.3s ease-in-out',
                        minHeight: '500px',
                        borderRadius: 4,
                        overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                        backdropFilter: 'blur(10px)',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          background: 'linear-gradient(90deg, #4c51bf 0%, #667eea 100%)',
                          zIndex: 1,
                        }
                      }}
                    >
                      <Box sx={{ p: 2, position: 'relative' }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600, 
                            color: 'rgba(0, 0, 0, 0.87)',
                            mb: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: 1,
                              background: 'linear-gradient(135deg, #4c51bf 0%, #667eea 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <OndemandVideoIcon sx={{ fontSize: 14, color: 'white' }} />
                          </Box>
                          {selectedContent.filename}
                          {'quality' in selectedContent && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                              {getQualityIcon(selectedContent.quality)}
                              <Chip 
                                label={selectedContent.quality} 
                                size="small" 
                                sx={{ 
                                  backgroundColor: 'rgba(76, 81, 191, 0.1)',
                                  color: '#4c51bf',
                                  fontWeight: 600
                                }} 
                              />
                              <Typography variant="caption" color="text.secondary">
                                {isMobile ? '(Mobile optimized)' : '(High quality)'}
                              </Typography>
                            </Box>
                          )}
                        </Typography>
                        <SecureVideoPlayer
                          url={selectedContent.signedUrl}
                          onReady={handleContentReady}
                          onError={() => handleContentError('Failed to load video')}
                          userEmail={currentUser?.email || 'Protected Content'}
                        />
                      </Box>
                    </Box>
                  ) : (
                    <Paper sx={{ 
                      p: 6, 
                      textAlign: 'center',
                      borderRadius: 4,
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                      backdropFilter: 'blur(10px)',
                      color: 'rgba(0, 0, 0, 0.6)'
                    }}>
                      <OndemandVideoIcon sx={{ fontSize: 48, color: 'rgba(76, 81, 191, 0.3)', mb: 2 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Select a video to watch</Typography>
                      <Typography variant="body2">Choose from the list on the left to start learning</Typography>
                    </Paper>
                  )}
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </Container>
      </Box>
      
      {/* Upload Resource Dialog */}
      {chapterData && (
        <UploadResourceDialog
          open={uploadDialogOpen}
          onClose={() => setUploadDialogOpen(false)}
          chapterId={chapterData.chapterId}
          chapterTitle={chapterData.title}
          onUploadComplete={refreshChapterData}
          uploadConfig={chapterData.uploadConfig}
        />
      )}
      
      {/* Quality Selection Menu */}
      <Menu
        anchorEl={qualityMenuAnchor}
        open={Boolean(qualityMenuAnchor)}
        onClose={handleQualityMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <MenuItem disabled sx={{ opacity: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            Select Video Quality
          </Typography>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        {selectedVideoGroup && groupedVideos[selectedVideoGroup]?.map((video, index) => {
          // Check if this specific video is selected by comparing both id and quality
          const isSelected = selectedContent?.id === video.id && 
                            ('quality' in selectedContent && 'quality' in video ? 
                              selectedContent.quality === video.quality : false);
                              
          return (
            <MenuItem
              key={`${video.id}-${video.quality}-${index}`}
              onClick={() => handleQualitySelect(video)}
              selected={isSelected}
              sx={{
                py: 1.5,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(76, 81, 191, 0.08)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                {getQualityIcon(video.quality)}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: isSelected ? 600 : 500 }}>
                    {video.quality}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {getQualityLabel(video.quality).split(' - ')[1]}
                  </Typography>
                </Box>
                {isSelected && (
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: '#4c51bf',
                    }}
                  />
                )}
              </Box>
            </MenuItem>
          );
        })}
        <Divider sx={{ my: 0.5 }} />
        <MenuItem disabled sx={{ opacity: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {isMobile ? '360p recommended for mobile' : '720p recommended for desktop'}
          </Typography>
        </MenuItem>
      </Menu>
    </>
  )
}

const ChapterPageWithAuth: NextPageWithLayout = () => {
  return (
    <AuthGuard requireAuth={true}>
      <ChapterPage />
    </AuthGuard>
  )
}

ChapterPageWithAuth.getLayout = (page) => <MainLayout isAuthenticated={true} theme="dashboard">{page}</MainLayout>

export default ChapterPageWithAuth 