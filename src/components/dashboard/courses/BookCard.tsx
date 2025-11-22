import React from 'react'
import {
  Card,
  CardContent,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Fade,
  Skeleton,
  Chip
} from '@mui/material'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import AddIcon from '@mui/icons-material/Add'
import LockIcon from '@mui/icons-material/Lock'
import { BookWithChapters } from '../types'
import { Chapter } from '@/types/database.types'
import { EditableTitle } from '../common/EditableTitle'
import { useAuth } from '@/contexts/AuthContext'
import { PurchaseButton } from '../common/PurchaseButton'

interface BookCardProps {
  book: BookWithChapters
  _courseId: string
  expanded: boolean
  onExpandChange: () => void
  onChapterClick: (chapter: Chapter) => void
  loading?: boolean
  isAdmin?: boolean
  onUpdateBookTitle?: (bookId: string, title: string) => Promise<void>
  onUpdateChapterTitle?: (chapterId: string, title: string) => Promise<void>
  onAddChapter?: () => void
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  _courseId,
  expanded,
  onExpandChange,
  onChapterClick,
  loading = false,
  isAdmin = false,
  onUpdateBookTitle,
  onUpdateChapterTitle,
  onAddChapter
}) => {
  const { user: _user } = useAuth()
  
  // Check if book is locked (paid only and user doesn't have access)
  const isLocked = book.accessType === 'PAID_ONLY' && !book.hasAccess
  
  if (loading) {
    return <BookSkeleton />
  }

  return (
    <Fade in={true} timeout={500}>
      <Card 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          height: '100%',
          mb: 3,
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <CardContent sx={{ flex: '1 0 auto', p: 4, pb: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 3,
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                }}
              >
                <MenuBookIcon sx={{ fontSize: 28, color: 'white' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                {isAdmin && onUpdateBookTitle ? (
                  <EditableTitle
                    title={book.title}
                    variant="h5"
                    onSave={(newTitle) => onUpdateBookTitle(book.id, newTitle)}
                    disabled={!isAdmin}
                  />
                ) : (
                  <Typography 
                    component="div" 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 700,
                      color: 'rgba(0, 0, 0, 0.87)',
                      lineHeight: 1.2
                    }}
                  >
                    {book.title}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              mb: 0,
              p: 2,
              borderRadius: '8px 8px 0 0',
              bgcolor: 'rgba(102, 126, 234, 0.05)',
              border: '1px solid rgba(102, 126, 234, 0.1)',
              borderBottom: 'none'
            }}>
              <AutoStoriesIcon sx={{ color: '#667eea', fontSize: 20 }} />
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600,
                  color: 'rgba(0, 0, 0, 0.7)'
                }}
              >
                {book.chapters.length} Chapter{book.chapters.length !== 1 ? 's' : ''} Available
              </Typography>
            </Box>
          </CardContent>

          <Box sx={{ px: 4, pb: 4, pt: 0, position: 'relative', minHeight: isLocked ? '400px' : 'auto' }}>
            {/* Lock Overlay for Paid Content */}
            {isLocked && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(247, 248, 255, 0.98) 100%)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  borderRadius: '0 0 16px 16px',
                  p: 4,
                  border: '2px dashed rgba(102, 126, 234, 0.25)',
                  borderTop: 'none',
                  boxShadow: 'inset 0 0 60px rgba(102, 126, 234, 0.03)',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    mb: 2.5,
                    boxShadow: '0 12px 32px rgba(102, 126, 234, 0.4)',
                  }}
                >
                  <LockIcon sx={{ fontSize: 36, color: 'white' }} />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1.5,
                    textAlign: 'center',
                  }}
                >
                  Premium Content
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(0, 0, 0, 0.65)',
                    mb: 4,
                    textAlign: 'center',
                    maxWidth: 340,
                    lineHeight: 1.6,
                  }}
                >
                  Purchase this note to unlock all chapters and exclusive content
                </Typography>
                <Box sx={{ width: '100%', maxWidth: 280 }}>
                  <PurchaseButton
                    bookId={book.id}
                    courseId={book.course_id}
                    bookTitle={book.title}
                    price={book.price || 0}
                    currency={book.currency || 'INR'}
                    size="large"
                    fullWidth
                  />
                </Box>
              </Box>
            )}

            <Accordion 
              expanded={expanded} 
              onChange={onExpandChange}
              disabled={isLocked}
              sx={{ 
                boxShadow: 'none', 
                '&:before': { display: 'none' },
                borderRadius: '0 0 8px 8px',
                border: '1px solid rgba(102, 126, 234, 0.1)',
                borderTop: 'none',
                overflow: 'hidden',
                filter: isLocked ? 'blur(4px)' : 'none',
                pointerEvents: isLocked ? 'none' : 'auto',
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: '#667eea' }} />}
                sx={{ 
                  backgroundColor: 'rgba(102, 126, 234, 0.05)',
                  borderRadius: 0,
                  minHeight: 48,
                  '&.Mui-expanded': {
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                  },
                  '& .MuiAccordionSummary-content': {
                    margin: '12px 0',
                  }
                }}
              >
                <Typography sx={{ 
                  fontWeight: 600,
                  color: 'rgba(0, 0, 0, 0.87)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <MenuBookIcon sx={{ fontSize: 20, color: '#667eea', mr: 1 }} />
                  View Chapters
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <List sx={{ py: 0 }}>
                  {book.chapters.map((chapter, index) => (
                    <ListItem 
                      key={chapter.id} 
                      disablePadding
                      sx={{
                        borderTop: index > 0 ? '1px solid rgba(0, 0, 0, 0.08)' : 'none',
                      }}
                    >
                      <ListItemButton 
                        onClick={(e) => {
                          // Don't navigate if clicking on the editable title area
                          const target = e.target as HTMLElement
                          if (target.closest('button') || target.closest('input')) {
                            return
                          }
                          onChapterClick(chapter)
                        }}
                        sx={{
                          py: { xs: 1.5, sm: 2 },
                          px: { xs: 2, sm: 3 },
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            '& .MuiListItemText-primary': {
                              color: '#667eea',
                            },
                            '& .MuiListItemIcon-root': {
                              color: '#667eea',
                              transform: 'translateX(4px)',
                            }
                          }
                        }}
                      >
                        <ListItemIcon sx={{ 
                          minWidth: { xs: 30, sm: 40 },
                          transition: 'all 0.2s ease-in-out',
                        }}>
                          <ChevronRightIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                        </ListItemIcon>
                        {isAdmin && onUpdateChapterTitle ? (
                          <Box sx={{ 
                            flex: 1, 
                            mr: 1,
                            overflow: 'hidden'
                          }}>
                            <EditableTitle
                              title={chapter.title}
                              variant="body1"
                              onSave={(newTitle) => onUpdateChapterTitle(chapter.id, newTitle)}
                              disabled={!isAdmin}
                            />
                          </Box>
                        ) : (
                          <ListItemText 
                            primary={chapter.title}
                            primaryTypographyProps={{
                              fontWeight: 500,
                              sx: { 
                                transition: 'color 0.2s ease-in-out',
                                fontSize: { xs: '0.875rem', sm: '1rem' }
                              }
                            }}
                          />
                        )}
                        {chapter.status === 'published' && (
                          <Chip
                            label="Published"
                            size="small"
                            sx={{
                              backgroundColor: 'rgba(16, 185, 129, 0.1)',
                              color: '#059669',
                              fontWeight: 600,
                              fontSize: { xs: '0.65rem', sm: '0.7rem' },
                              height: { xs: 18, sm: 20 },
                              ml: { xs: 0.5, sm: 1 }
                            }}
                          />
                        )}
                      </ListItemButton>
                    </ListItem>
                  ))}
                  {isAdmin && onAddChapter && (
                    <ListItem disablePadding sx={{ borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
                      <ListItemButton
                        onClick={onAddChapter}
                        sx={{
                          py: { xs: 1.5, sm: 2 },
                          px: { xs: 2, sm: 3 },
                          transition: 'all 0.2s ease-in-out',
                          backgroundColor: 'rgba(102, 126, 234, 0.05)',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.15)',
                            '& .MuiListItemText-primary': {
                              color: '#667eea',
                            },
                            '& .MuiListItemIcon-root': {
                              color: '#667eea',
                              transform: 'rotate(90deg)',
                            }
                          }
                        }}
                      >
                        <ListItemIcon sx={{ 
                          minWidth: { xs: 30, sm: 40 },
                          transition: 'all 0.2s ease-in-out',
                          color: '#667eea'
                        }}>
                          <AddIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Add New Chapter"
                          primaryTypographyProps={{
                            fontWeight: 600,
                            color: '#667eea',
                            sx: { 
                              transition: 'color 0.2s ease-in-out',
                              fontSize: { xs: '0.875rem', sm: '1rem' }
                            }
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  )}
                </List>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Box>
      </Card>
    </Fade>
  )
}

const BookSkeleton: React.FC = () => {
  return (
    <Card sx={{ 
      borderRadius: 4, 
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
      mb: 3,
      overflow: 'hidden',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
      }
    }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
          <Skeleton 
            variant="rounded" 
            width={60} 
            height={60} 
            sx={{ 
              mr: 3,
              borderRadius: 3
            }} 
          />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 1, width: '70%' }} />
          </Box>
        </Box>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          mb: 3,
          p: 2,
          borderRadius: 2,
          bgcolor: 'rgba(102, 126, 234, 0.05)',
          border: '1px solid rgba(102, 126, 234, 0.1)'
        }}>
          <Skeleton variant="circular" width={20} height={20} />
          <Skeleton variant="text" sx={{ fontSize: '0.875rem', width: '40%' }} />
        </Box>
        <Skeleton variant="rounded" width="100%" height={56} sx={{ borderRadius: 2 }} />
      </CardContent>
    </Card>
  )
}