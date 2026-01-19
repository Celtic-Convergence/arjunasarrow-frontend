import React, { useState, useCallback } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
  FormControl,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
  Paper,
  CircularProgress,
  SelectChangeEvent
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import { useChapterUpload } from '@/hooks/useChapterUpload'

interface UploadResourceDialogProps {
  open: boolean
  onClose: () => void
  chapterId: string
  chapterTitle: string
  onUploadComplete: () => void
  uploadConfig?: {
    allowedFormats: string[]
    maxFileSizes: {
      pdf: number
      video: number
    }
  }
}

interface FileWithQuality {
  file: File
  quality?: '720p' | '480p' | '360p'
  id: string
  uploadProgress?: number
  uploadStatus?: 'pending' | 'uploading' | 'completed' | 'error'
  isVideo?: boolean
  baseVideoName?: string
}

export const UploadResourceDialog: React.FC<UploadResourceDialogProps> = ({
  open,
  onClose,
  chapterId,
  chapterTitle,
  onUploadComplete,
  uploadConfig
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [files, setFiles] = useState<FileWithQuality[]>([])
  const [dragActive, setDragActive] = useState(false)
  const { uploadFiles, uploading, uploadProgress: _uploadProgress, error, setError } = useChapterUpload()

  const handleDrag = useCallback((e: React.DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const validateFile = useCallback((file: File): string | null => {
    const maxSizePdf = (uploadConfig?.maxFileSizes?.pdf || 25) * 1024 * 1024
    const maxSizeVideo = (uploadConfig?.maxFileSizes?.video || 2048) * 1024 * 1024

    if (file.type === 'application/pdf') {
      if (file.size > maxSizePdf) {
        return `PDF file size must be less than ${uploadConfig?.maxFileSizes?.pdf || 25}MB`
      }
    } else if (file.type === 'video/mp4') {
      if (file.size > maxSizeVideo) {
        return `Video file size must be less than ${uploadConfig?.maxFileSizes?.video || 2048}MB`
      }
    } else {
      return 'Only PDF and MP4 files are allowed'
    }

    return null
  }, [uploadConfig?.maxFileSizes?.pdf, uploadConfig?.maxFileSizes?.video])

  const handleFiles = useCallback((newFiles: File[]): void => {
    const validFiles: FileWithQuality[] = []
    const errors: string[] = []

    // Check current files
    const currentPdfCount = files.filter(f => f.file.type === 'application/pdf').length
    const currentVideoBaseNames = [...new Set(files.filter(f => f.isVideo).map(f => f.baseVideoName))]
    
    newFiles.forEach(file => {
      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
        return
      }
      
      const isPdf = file.type === 'application/pdf'
      const isVideo = file.type === 'video/mp4'
      
      // Check if we already have a PDF
      if (isPdf && currentPdfCount > 0) {
        errors.push('Only one PDF file is allowed per upload')
        return
      }
      
      // Extract base video name and quality (remove quality suffix)
      let baseVideoName = ''
      let detectedQuality: '720p' | '480p' | '360p' | undefined = undefined
      
      if (isVideo) {
        // Check if filename contains quality
        const qualityMatch = file.name.match(/[-_](720p|480p|360p)\.(mp4|MP4)$/i)
        if (qualityMatch) {
          detectedQuality = qualityMatch[1].toLowerCase() as '720p' | '480p' | '360p'
        }
        
        // Remove common quality suffixes and extension
        baseVideoName = file.name
          .replace(/[-_](720p|480p|360p)\.(mp4|MP4)$/i, '')
          .replace(/\.(mp4|MP4)$/i, '')
        
        // Check if we already have a different video
        if (currentVideoBaseNames.length > 0 && !currentVideoBaseNames.includes(baseVideoName)) {
          errors.push('Only one video (with multiple qualities) is allowed per upload')
          return
        }
      }
      
      validFiles.push({
        file,
        id: `${file.name}-${Date.now()}`,
        uploadStatus: 'pending',
        isVideo,
        baseVideoName: isVideo ? baseVideoName : undefined,
        quality: isVideo ? (detectedQuality || '720p') : undefined // Use detected quality or default to 720p
      })
    })

    if (errors.length > 0) {
      setError(errors.join('\n'))
    }

    // Check for duplicate qualities in the same video
    const videoQualities = [...files, ...validFiles]
      .filter(f => f.isVideo)
      .map(f => f.quality)
    
    const duplicateQualities = videoQualities.filter((q, index) => videoQualities.indexOf(q) !== index)
    if (duplicateQualities.length > 0) {
      const msg = `Duplicate video quality detected: ${duplicateQualities.join(', ')}. Each quality can only be uploaded once.`
      setError(error ? `${error}\n${msg}` : msg)
      
      // Remove files with duplicate qualities from validFiles
      const filteredFiles = validFiles.filter(f => {
        if (!f.isVideo) return true
        const existingQualities = files.filter(ef => ef.isVideo).map(ef => ef.quality)
        return !existingQualities.includes(f.quality)
      })
      setFiles(prev => [...prev, ...filteredFiles])
    } else {
      setFiles(prev => [...prev, ...validFiles])
    }
  }, [files, error, validateFile, setError])

  const handleDrop = useCallback((e: React.DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }, [handleFiles])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleRemoveFile = (id: string): void => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const handleQualityChange = (id: string, quality: '720p' | '480p' | '360p'): void => {
    // Check if this quality already exists for videos
    const fileToChange = files.find(f => f.id === id)
    if (!fileToChange?.isVideo) {
      setFiles(prev => prev.map(f => 
        f.id === id ? { ...f, quality } : f
      ))
      return
    }
    
    const existingQualities = files
      .filter(f => f.isVideo && f.id !== id)
      .map(f => f.quality)
    
    if (existingQualities.includes(quality)) {
      setError(`Quality ${quality} is already selected for another video file`)
      return
    }
    
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, quality } : f
    ))
  }

  const handleUpload = async (): Promise<void> => {
    if (files.length === 0) return

    // For videos with same base name, ensure they have the same filename format
    const filesToUpload = files.map(f => {
      let fileName = f.file.name
      
      // For videos, standardize the filename to include quality
      if (f.isVideo && f.baseVideoName && f.quality) {
        const extension = f.file.name.split('.').pop() || 'mp4'
        // Check if filename already has quality suffix
        if (!fileName.includes(f.quality)) {
          fileName = `${f.baseVideoName}-${f.quality}.${extension}`
        }
      }
      
      return {
        file: f.file,
        fileName,
        fileSize: f.file.size,
        contentType: f.file.type,
        quality: f.file.type === 'video/mp4' ? (f.quality || '720p') : undefined
      }
    })

    // Update file statuses
    setFiles(prev => prev.map(f => ({ ...f, uploadStatus: 'uploading' })))

    const success = await uploadFiles(
      chapterId,
      filesToUpload,
      (fileId, progress) => {
        // Update progress for individual files
        const fileIndex = files.findIndex(f => f.id === fileId)
        if (fileIndex !== -1) {
          setFiles(prev => {
            const newFiles = [...prev]
            newFiles[fileIndex].uploadProgress = progress
            if (progress === 100) {
              newFiles[fileIndex].uploadStatus = 'completed'
            }
            return newFiles
          })
        }
      }
    )

    if (success) {
      onUploadComplete()
      handleClose()
    } else {
      // Mark files as error
      setFiles(prev => prev.map(f => ({ 
        ...f, 
        uploadStatus: f.uploadStatus === 'completed' ? 'completed' : 'error' 
      })))
    }
  }

  const handleClose = (): void => {
    if (!uploading) {
      setFiles([])
      setError(null)
      onClose()
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: { 
          borderRadius: isMobile ? 0 : 3,
          maxHeight: isMobile ? '100%' : '90vh'
        }
      }}
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          Upload Resources
        </Typography>
        <Typography variant="body2" color="text.secondary">
          for {chapterTitle}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pb: 0 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {error && (
            <Alert 
              severity="error" 
              onClose={() => setError(null)}
              sx={{ whiteSpace: 'pre-line' }}
            >
              {error}
            </Alert>
          )}

          {/* Drop zone */}
          <Paper
            sx={{
              p: { xs: 3, sm: 4 },
              border: '2px dashed',
              borderColor: dragActive ? 'primary.main' : 'divider',
              borderRadius: 2,
              bgcolor: dragActive ? 'action.hover' : 'background.default',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover'
              }
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input
              id="file-upload"
              type="file"
              multiple
              accept=".pdf,video/mp4"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
            <CloudUploadIcon 
              sx={{ 
                fontSize: { xs: 48, sm: 64 }, 
                color: 'primary.main', 
                mb: 2 
              }} 
            />
            <Typography variant="h6" gutterBottom>
              {isMobile ? 'Tap to upload' : 'Drag & drop files here'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              or click to browse
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Chip
                icon={<PictureAsPdfIcon />}
                label={`PDF (max ${uploadConfig?.maxFileSizes?.pdf || 25}MB)`}
                variant="outlined"
                size="small"
              />
              <Chip
                icon={<OndemandVideoIcon />}
                label={`MP4 (max ${uploadConfig?.maxFileSizes?.video || 2048}MB)`}
                variant="outlined"
                size="small"
              />
            </Box>
          </Paper>

          {/* File list */}
          {files.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Files to upload ({files.length})
                {files.some(f => f.isVideo) && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    • Video: {files.find(f => f.isVideo)?.baseVideoName}
                  </Typography>
                )}
              </Typography>
              <List sx={{ 
                bgcolor: 'background.paper', 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                maxHeight: { xs: 300, sm: 400 },
                overflow: 'auto'
              }}>
                {files.map((fileItem, index) => (
                  <React.Fragment key={fileItem.id}>
                    {index > 0 && <Divider />}
                    <ListItem
                      secondaryAction={
                        !uploading && (
                          <IconButton 
                            edge="end" 
                            onClick={() => handleRemoveFile(fileItem.id)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        )
                      }
                      sx={{ py: { xs: 1.5, sm: 2 } }}
                    >
                      <ListItemIcon>
                        {fileItem.uploadStatus === 'completed' ? (
                          <CheckCircleIcon color="success" />
                        ) : fileItem.uploadStatus === 'error' ? (
                          <ErrorIcon color="error" />
                        ) : fileItem.file.type === 'application/pdf' ? (
                          <PictureAsPdfIcon color="primary" />
                        ) : (
                          <OndemandVideoIcon color="primary" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" noWrap sx={{ maxWidth: { xs: 150, sm: 300 } }}>
                              {fileItem.file.name}
                            </Typography>
                            {fileItem.file.type === 'video/mp4' && (
                              <FormControl size="small" sx={{ minWidth: 80 }}>
                                <Select
                                  value={fileItem.quality || '720p'}
                                  onChange={(e: SelectChangeEvent) => handleQualityChange(fileItem.id, e.target.value as '720p' | '480p' | '360p')}
                                  size="small"
                                  disabled={uploading}
                                  sx={{ height: 24, fontSize: '0.75rem' }}
                                >
                                  <MenuItem value="720p">720p</MenuItem>
                                  <MenuItem value="480p">480p</MenuItem>
                                  <MenuItem value="360p">360p</MenuItem>
                                </Select>
                              </FormControl>
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {formatFileSize(fileItem.file.size)}
                            </Typography>
                            {fileItem.uploadStatus === 'uploading' && (
                              <LinearProgress 
                                variant="determinate" 
                                value={fileItem.uploadProgress || 0} 
                                sx={{ mt: 1, height: 4, borderRadius: 2 }}
                              />
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}

          {/* Upload Summary */}
          {files.length > 0 && (
            <Paper sx={{ p: 2, bgcolor: 'rgba(102, 126, 234, 0.05)', border: '1px solid rgba(102, 126, 234, 0.2)' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Upload Summary</Typography>
              {files.filter(f => !f.isVideo).length > 0 && (
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <PictureAsPdfIcon fontSize="small" color="primary" />
                  PDF: {files.find(f => !f.isVideo)?.file.name}
                </Typography>
              )}
              {files.some(f => f.isVideo) && (
                <Box>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <OndemandVideoIcon fontSize="small" color="primary" />
                    Video: {files.find(f => f.isVideo)?.baseVideoName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                    Qualities: {files.filter(f => f.isVideo).map(f => f.quality).join(', ')}
                  </Typography>
                </Box>
              )}
            </Paper>
          )}
          
          {uploadConfig && (
            <Alert severity="info" icon={false}>
              <Typography variant="caption">
                <strong>Allowed formats:</strong> PDF, MP4<br />
                <strong>Limits:</strong> 1 PDF and 1 video per upload<br />
                <strong>Video qualities:</strong> Upload different quality versions (720p, 480p, 360p) of the same video<br />
                <strong>Tip:</strong> Name your video files consistently (e.g., lecture-720p.mp4, lecture-480p.mp4)
              </Typography>
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={uploading}
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          variant="contained"
          startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          sx={{
            backgroundColor: '#667eea',
            '&:hover': {
              backgroundColor: '#5a67d8'
            }
          }}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}