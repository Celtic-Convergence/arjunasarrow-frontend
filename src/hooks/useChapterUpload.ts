import { useState, useCallback } from 'react'
import { useApiClient } from './dashboard/useApiClient'

interface FileToUpload {
  file: File
  fileName: string
  fileSize: number
  contentType: string
  quality?: '720p' | '480p' | '360p'
}

interface UploadUrl {
  fileId: string
  fileName: string
  uploadUrl: string
  s3Key: string
  expiresIn: number
}

interface CompletedFile {
  fileId: string
  fileName: string
  s3Key: string
  contentType: string
  quality?: string
}

export const useChapterUpload = (): {
  uploadFiles: (chapterId: string, files: FileToUpload[], onProgress?: (fileId: string, progress: number) => void) => Promise<boolean>
  deleteResource: (chapterId: string, resourceId: string) => Promise<void>
  toggleResourceVisibility: (chapterId: string, resourceId: string, visible: boolean) => Promise<{ resourceId: string; visible: boolean; filename: string; type: string }>
  uploading: boolean
  uploadProgress: { [key: string]: number }
  error: string | null
  setError: (error: string | null) => void
} => {
  const { apiCall } = useApiClient()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [error, setError] = useState<string | null>(null)

  // Generate upload URLs
  const generateUploadUrls = useCallback(async (chapterId: string, files: FileToUpload[]) => {
    try {
      const response = await apiCall('/upload', {
        method: 'POST',
        body: JSON.stringify({
          chapterId,
          files: files.map(f => ({
            fileName: f.fileName,
            fileSize: f.fileSize,
            contentType: f.contentType,
            ...(f.quality && { quality: f.quality })
          }))
        })
      })

      return response.data as {
        uploadId: string
        urls: UploadUrl[]
      }
    } catch (error) {
      console.error('Error generating upload URLs:', error)
      throw error
    }
  }, [apiCall])

  // Upload file to S3
  const uploadFileToS3 = useCallback(async (
    file: File,
    uploadUrl: string,
    fileId: string,
    onProgress?: (progress: number) => void
  ) => {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(prev => ({ ...prev, [fileId]: progress }))
          onProgress?.(progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadProgress(prev => ({ ...prev, [fileId]: 100 }))
          resolve()
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'))
      })

      xhr.open('PUT', uploadUrl)
      xhr.setRequestHeader('Content-Type', file.type)
      xhr.send(file)
    })
  }, [])

  // Complete upload
  const completeUpload = useCallback(async (
    uploadId: string,
    chapterId: string,
    completedFiles: CompletedFile[]
  ) => {
    try {
      await apiCall(`/upload/${uploadId}/complete`, {
        method: 'POST',
        body: JSON.stringify({
          chapterId,
          completedFiles
        })
      })
    } catch (error) {
      console.error('Error completing upload:', error)
      throw error
    }
  }, [apiCall])

  // Delete resource
  const deleteResource = useCallback(async (chapterId: string, resourceId: string) => {
    try {
      const response = await apiCall(`/chapters/${chapterId}/resources/${resourceId}`, {
        method: 'DELETE'
      })
      return response.data
    } catch (error) {
      console.error('Error deleting resource:', error)
      throw error
    }
  }, [apiCall])

  // Toggle resource visibility
  const toggleResourceVisibility = useCallback(async (chapterId: string, resourceId: string, visible: boolean) => {
    try {
      const response = await apiCall(`/chapters/${chapterId}/resources/${resourceId}/visibility`, {
        method: 'PATCH',
        body: JSON.stringify({ visible })
      })
      return response.data
    } catch (error) {
      console.error('Error toggling resource visibility:', error)
      throw error
    }
  }, [apiCall])

  // Main upload function
  const uploadFiles = useCallback(async (
    chapterId: string,
    files: FileToUpload[],
    onProgress?: (fileId: string, progress: number) => void
  ) => {
    setUploading(true)
    setError(null)
    setUploadProgress({})

    try {
      // Step 1: Generate upload URLs
      const { uploadId, urls } = await generateUploadUrls(chapterId, files)

      // Step 2: Upload files to S3
      const uploadPromises = urls.map(async (url, index) => {
        const file = files[index].file
        await uploadFileToS3(
          file,
          url.uploadUrl,
          url.fileId,
          (progress) => onProgress?.(url.fileId, progress)
        )
        return {
          fileId: url.fileId,
          fileName: url.fileName,
          s3Key: url.s3Key,
          contentType: files[index].contentType,
          ...(files[index].quality && { quality: files[index].quality })
        }
      })

      const completedFiles = await Promise.all(uploadPromises)

      // Step 3: Complete upload
      await completeUpload(uploadId, chapterId, completedFiles)

      setUploadProgress({})
      return true
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
      return false
    } finally {
      setUploading(false)
    }
  }, [generateUploadUrls, uploadFileToS3, completeUpload])

  return {
    uploadFiles,
    deleteResource,
    toggleResourceVisibility,
    uploading,
    uploadProgress,
    error,
    setError
  }
}