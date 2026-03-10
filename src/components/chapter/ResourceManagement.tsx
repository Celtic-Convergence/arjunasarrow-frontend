import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Divider,
  Alert,
  Tooltip,
  useTheme,
  useMediaQuery,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  CircularProgress
} from '@mui/material'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo'
import DeleteIcon from '@mui/icons-material/Delete'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { useChapterUpload } from '@/hooks/useChapterUpload'

interface ExistingFile {
  id: string
  filename: string
  uploadedAt: string
  quality?: string
  visible?: boolean
}

interface ResourceManagementProps {
  isAdmin: boolean
  chapterId: string
  existingFiles?: {
    pdfs: ExistingFile[]
    videos: ExistingFile[]
  }
  onUploadClick: () => void
  onResourcesChange: () => void
}

export const ResourceManagement: React.FC<ResourceManagementProps> = ({
  isAdmin,
  chapterId,
  existingFiles,
  onUploadClick,
  onResourcesChange
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resourceToDelete, setResourceToDelete] = useState<{ id: string; filename: string; type: 'pdf' | 'video' } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [speedDialOpen, setSpeedDialOpen] = useState(false)
  const [togglingVisibility, setTogglingVisibility] = useState<Set<string>>(new Set())
  const [visibilityError, setVisibilityError] = useState<string | null>(null)
  const [localVisibility, setLocalVisibility] = useState<Record<string, boolean>>({})

  const { deleteResource, toggleResourceVisibility } = useChapterUpload()

  const handleDeleteClick = (resource: ExistingFile, type: 'pdf' | 'video'): void => {
    setResourceToDelete({
      id: resource.id,
      filename: resource.filename,
      type
    })
    setDeleteDialogOpen(true)
    setDeleteError(null)
  }

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!resourceToDelete) return

    setDeleting(true)
    setDeleteError(null)

    try {
      await deleteResource(chapterId, resourceToDelete.id)
      setDeleteDialogOpen(false)
      setResourceToDelete(null)
      // Reload the entire page to clear cached PDFs
      window.location.reload()
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete resource')
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = (): void => {
    setDeleteDialogOpen(false)
    setResourceToDelete(null)
    setDeleteError(null)
  }

  const getResourceVisibility = (resource: ExistingFile): boolean => {
    if (resource.id in localVisibility) return localVisibility[resource.id]
    return resource.visible !== false
  }

  const handleToggleVisibility = async (resource: ExistingFile): Promise<void> => {
    const currentVisible = getResourceVisibility(resource)
    const newVisible = !currentVisible

    // Prevent concurrent toggles on the same resource
    if (togglingVisibility.has(resource.id)) return

    // Optimistic update
    setLocalVisibility(prev => ({ ...prev, [resource.id]: newVisible }))
    setTogglingVisibility(prev => new Set(prev).add(resource.id))
    setVisibilityError(null)

    try {
      await toggleResourceVisibility(chapterId, resource.id, newVisible)
      onResourcesChange()
    } catch (error) {
      // Revert on failure
      setLocalVisibility(prev => ({ ...prev, [resource.id]: currentVisible }))
      setVisibilityError(`Failed to ${newVisible ? 'show' : 'hide'} "${resource.filename}"`)
    } finally {
      setTogglingVisibility(prev => {
        const next = new Set(prev)
        next.delete(resource.id)
        return next
      })
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  if (!isAdmin || !existingFiles) {
    return null
  }

  const totalResources = (existingFiles.pdfs?.length || 0) + (existingFiles.videos?.length || 0)

  return (
    <>
      <Card sx={{ 
        mb: 3,
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
        backdropFilter: 'blur(10px)',
      }}>
        <CardContent>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3,
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AdminPanelSettingsIcon sx={{ color: '#667eea' }} />
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                Resource Management
              </Typography>
              <Chip 
                label={`${totalResources} files`} 
                size="small" 
                sx={{ 
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  color: '#667eea',
                  fontWeight: 600
                }} 
              />
            </Box>
            {!isMobile && (
              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                onClick={onUploadClick}
                sx={{
                  backgroundColor: '#667eea',
                  '&:hover': {
                    backgroundColor: '#5a67d8'
                  }
                }}
              >
                Upload Resources
              </Button>
            )}
          </Box>

          {visibilityError && (
            <Alert
              severity="error"
              onClose={() => setVisibilityError(null)}
              sx={{ mb: 2 }}
            >
              {visibilityError}
            </Alert>
          )}

          {totalResources === 0 ? (
            <Alert 
              severity="info" 
              action={
                <Button 
                  color="inherit" 
                  size="small"
                  onClick={onUploadClick}
                >
                  Upload Now
                </Button>
              }
            >
              No resources uploaded yet. Click to add PDFs or videos.
            </Alert>
          ) : (
            <>
              {/* PDF Resources */}
              {existingFiles.pdfs && existingFiles.pdfs.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      mb: 1, 
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <PictureAsPdfIcon fontSize="small" />
                    PDF Documents ({existingFiles.pdfs.length})
                  </Typography>
                  <List sx={{ 
                    bgcolor: 'background.paper', 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    {existingFiles.pdfs.map((pdf, index) => {
                      const isVisible = getResourceVisibility(pdf)
                      const isToggling = togglingVisibility.has(pdf.id)
                      return (
                        <React.Fragment key={pdf.id}>
                          {index > 0 && <Divider />}
                          <ListItem sx={{
                            py: { xs: 1, sm: 1.5 },
                            opacity: isVisible ? 1 : 0.6,
                            transition: 'opacity 0.2s ease',
                            '@media (prefers-reduced-motion: reduce)': {
                              transition: 'none'
                            }
                          }}>
                            <ListItemIcon>
                              <PictureAsPdfIcon color={isVisible ? 'error' : 'disabled'} />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography
                                    variant="body2"
                                    noWrap
                                    sx={{
                                      maxWidth: { xs: 100, sm: 250, md: 350 },
                                      fontWeight: 500
                                    }}
                                  >
                                    {pdf.filename}
                                  </Typography>
                                  {!isVisible && (
                                    <Chip
                                      label="Hidden"
                                      size="small"
                                      sx={{
                                        backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                        color: 'error.main',
                                        fontWeight: 600,
                                        height: 20
                                      }}
                                    />
                                  )}
                                </Box>
                              }
                              secondary={
                                <Typography variant="caption" color="text.secondary">
                                  Uploaded {formatDate(pdf.uploadedAt)}
                                </Typography>
                              }
                            />
                            <ListItemSecondaryAction>
                              <Tooltip title={isVisible ? 'Hide from students' : 'Show to students'}>
                                <span>
                                  <IconButton
                                    onClick={() => handleToggleVisibility(pdf)}
                                    size="small"
                                    disabled={isToggling}
                                    aria-label={isVisible ? `Hide ${pdf.filename} from students` : `Show ${pdf.filename} to students`}
                                    sx={{
                                      mr: 0.5,
                                      color: isVisible ? 'success.main' : 'text.disabled',
                                      '&:hover': {
                                        backgroundColor: isVisible ? 'rgba(46, 125, 50, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                                      }
                                    }}
                                  >
                                    {isToggling ? (
                                      <CircularProgress size={20} />
                                    ) : isVisible ? (
                                      <VisibilityIcon />
                                    ) : (
                                      <VisibilityOffIcon />
                                    )}
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title={`Delete ${pdf.filename}`}>
                                <IconButton
                                  edge="end"
                                  aria-label={`Delete ${pdf.filename}`}
                                  onClick={() => handleDeleteClick(pdf, 'pdf')}
                                  size="small"
                                  sx={{
                                    color: 'error.main',
                                    '&:hover': {
                                      backgroundColor: 'error.lighter'
                                    }
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </ListItemSecondaryAction>
                          </ListItem>
                        </React.Fragment>
                      )
                    })}
                  </List>
                </Box>
              )}

              {/* Video Resources */}
              {existingFiles.videos && existingFiles.videos.length > 0 && (
                <Box>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      mb: 1, 
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <OndemandVideoIcon fontSize="small" />
                    Video Lectures ({existingFiles.videos.length})
                  </Typography>
                  <List sx={{ 
                    bgcolor: 'background.paper', 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    {existingFiles.videos.map((video, index) => {
                      const isVisible = getResourceVisibility(video)
                      const isToggling = togglingVisibility.has(video.id)
                      return (
                        <React.Fragment key={video.id}>
                          {index > 0 && <Divider />}
                          <ListItem sx={{
                            py: { xs: 1, sm: 1.5 },
                            opacity: isVisible ? 1 : 0.6,
                            transition: 'opacity 0.2s ease',
                            '@media (prefers-reduced-motion: reduce)': {
                              transition: 'none'
                            }
                          }}>
                            <ListItemIcon>
                              <OndemandVideoIcon color={isVisible ? 'primary' : 'disabled'} />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography
                                    variant="body2"
                                    noWrap
                                    sx={{
                                      maxWidth: { xs: 80, sm: 200, md: 300 },
                                      fontWeight: 500
                                    }}
                                  >
                                    {video.filename}
                                  </Typography>
                                  {video.quality && (
                                    <Chip
                                      label={video.quality}
                                      size="small"
                                      sx={{
                                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                        color: '#667eea',
                                        fontWeight: 600,
                                        height: 20
                                      }}
                                    />
                                  )}
                                  {!isVisible && (
                                    <Chip
                                      label="Hidden"
                                      size="small"
                                      sx={{
                                        backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                        color: 'error.main',
                                        fontWeight: 600,
                                        height: 20
                                      }}
                                    />
                                  )}
                                </Box>
                              }
                              secondary={
                                <Typography variant="caption" color="text.secondary">
                                  Uploaded {formatDate(video.uploadedAt)}
                                </Typography>
                              }
                            />
                            <ListItemSecondaryAction>
                              <Tooltip title={isVisible ? 'Hide from students' : 'Show to students'}>
                                <span>
                                  <IconButton
                                    onClick={() => handleToggleVisibility(video)}
                                    size="small"
                                    disabled={isToggling}
                                    aria-label={isVisible ? `Hide ${video.filename} from students` : `Show ${video.filename} to students`}
                                    sx={{
                                      mr: 0.5,
                                      color: isVisible ? 'success.main' : 'text.disabled',
                                      '&:hover': {
                                        backgroundColor: isVisible ? 'rgba(46, 125, 50, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                                      }
                                    }}
                                  >
                                    {isToggling ? (
                                      <CircularProgress size={20} />
                                    ) : isVisible ? (
                                      <VisibilityIcon />
                                    ) : (
                                      <VisibilityOffIcon />
                                    )}
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title={`Delete ${video.filename}`}>
                                <IconButton
                                  edge="end"
                                  aria-label={`Delete ${video.filename}`}
                                  onClick={() => handleDeleteClick(video, 'video')}
                                  size="small"
                                  sx={{
                                    color: 'error.main',
                                    '&:hover': {
                                      backgroundColor: 'error.lighter'
                                    }
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </ListItemSecondaryAction>
                          </ListItem>
                        </React.Fragment>
                      )
                    })}
                  </List>
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Mobile Floating Action Button */}
      {isMobile && (
        <SpeedDial
          ariaLabel="Resource actions"
          sx={{ 
            position: 'fixed', 
            bottom: 16, 
            right: 16,
            '& .MuiSpeedDial-fab': {
              backgroundColor: '#667eea',
              '&:hover': {
                backgroundColor: '#5a67d8'
              }
            }
          }}
          icon={<SpeedDialIcon />}
          onClose={() => setSpeedDialOpen(false)}
          onOpen={() => setSpeedDialOpen(true)}
          open={speedDialOpen}
        >
          <SpeedDialAction
            icon={<CloudUploadIcon />}
            tooltipTitle="Upload Resources"
            onClick={() => {
              setSpeedDialOpen(false)
              onUploadClick()
            }}
          />
        </SpeedDial>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Resource</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete &quot;{resourceToDelete?.filename}&quot;? 
            This action cannot be undone.
          </DialogContentText>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting && <CircularProgress size={20} />}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}