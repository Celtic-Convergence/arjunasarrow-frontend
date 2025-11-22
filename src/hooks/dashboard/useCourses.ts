import { useState, useCallback, useEffect } from 'react'
import { useApiClient } from './useApiClient'
import { CourseWithBooks } from '@/components/dashboard/types'

export const useCourses = (user: any): {
  coursesWithContent: CourseWithBooks[]
  loadingCourses: boolean
  loadingError: string | null
  isAdmin: boolean
  loadCourseData: () => Promise<void>
  createBook: (courseId: string, bookData: { 
    title: string
    order?: number
    accessType?: 'COURSE_DEFAULT' | 'PAID_ONLY'
    price?: number
    currency?: string
    eligibleCourses?: string[]
  }) => Promise<any>
  updateBookTitle: (courseId: string, bookId: string, title: string) => Promise<any>
  createChapter: (courseId: string, bookId: string, title: string, order?: number) => Promise<any>
  updateChapterTitle: (courseId: string, bookId: string, chapterId: string, title: string) => Promise<any>
} => {
  const { apiCall } = useApiClient()
  const [coursesWithContent, setCoursesWithContent] = useState<CourseWithBooks[]>([])
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const loadCourseData = useCallback(async (): Promise<void> => {
    setLoadingCourses(true)
    setLoadingError(null)
    
    try {
      const apiResponse = await apiCall('/course')
      // API response received
      
      const courseData = apiResponse.data
      
      // Handle different response structures based on user type
      let transformedCourses: CourseWithBooks[] = []
      
      if (courseData.isAdmin && courseData.courses) {
        // Admin user response - array of courses
        setIsAdmin(true)
        transformedCourses = courseData.courses.map((course: any) => ({
          id: course.courseId,
          name: course.title,
          description: course.description || '',
          board: course.board || '',
          class: course.class || '',
          cover_image_url: course.coverImageUrl || null,
          created_at: course.createdAt || new Date().toISOString(),
          updated_at: course.updatedAt || new Date().toISOString(),
          books: course.books?.map((book: any) => ({
            id: book.bookId,
            title: book.title,
            description: book.description || '',
            course_id: book.courseId || course.courseId,
            created_at: book.createdAt || new Date().toISOString(),
            updated_at: book.updatedAt || new Date().toISOString(),
            // Purchase-related fields
            accessType: book.accessType,
            price: book.price,
            currency: book.currency,
            eligibleCourses: book.eligibleCourses,
            hasAccess: book.hasAccess,
            order: book.order || 0,
            chapters: book.chapters?.map((chapter: any) => ({
              id: chapter.chapterId,
              title: chapter.title,
              description: chapter.description || '',
              book_id: book.bookId,
              created_at: chapter.createdAt || new Date().toISOString(),
              updated_at: chapter.updatedAt || new Date().toISOString(),
              content: chapter.content || [],
              status: chapter.status || 'draft',
              display_order: chapter.displayOrder || 0
            })) || []
          })) || [],
          progress: 0
        }))
      } else if (courseData.courseId) {
        // Single course response for non-admin users
        transformedCourses = [{
          id: courseData.courseId,
          name: courseData.title,
          description: courseData.description || '',
          board: courseData.board || '',
          class: courseData.class || '',
          cover_image_url: courseData.coverImageUrl || null,
          created_at: courseData.createdAt || new Date().toISOString(),
          updated_at: courseData.updatedAt || new Date().toISOString(),
          books: courseData.books?.map((book: any) => ({
            id: book.bookId,
            title: book.title,
            description: book.description || '',
            course_id: book.courseId || courseData.courseId,
            created_at: book.createdAt || new Date().toISOString(),
            updated_at: book.updatedAt || new Date().toISOString(),
            // Purchase-related fields
            accessType: book.accessType,
            price: book.price,
            currency: book.currency,
            eligibleCourses: book.eligibleCourses,
            hasAccess: book.hasAccess,
            order: book.order || 0,
            chapters: book.chapters?.map((chapter: any) => ({
              id: chapter.chapterId,
              title: chapter.title,
              description: chapter.description || '',
              book_id: book.bookId,
              created_at: chapter.createdAt || new Date().toISOString(),
              updated_at: chapter.updatedAt || new Date().toISOString(),
              content: chapter.content || [],
              status: chapter.status || 'draft',
              display_order: chapter.displayOrder || 0
            })) || []
          })) || [],
          progress: 0
        }]
      }
      
      setCoursesWithContent(transformedCourses)
    } catch (error) {
      // Error loading course data
      setLoadingError(error instanceof Error ? error.message : 'Failed to load course data')
    } finally {
      setLoadingCourses(false)
    }
  }, [apiCall])

  useEffect(() => {
    if (user) {
      loadCourseData()
    }
  }, [user, loadCourseData])

  // Create a new book
  const createBook = useCallback(async (
    courseId: string, 
    bookData: { 
      title: string
      order?: number
      accessType?: 'COURSE_DEFAULT' | 'PAID_ONLY'
      price?: number
      currency?: string
      eligibleCourses?: string[]
    }
  ) => {
    try {
      const response = await apiCall(`/courses/${courseId}/books`, {
        method: 'POST',
        body: JSON.stringify(bookData)
      })
      
      // Reload course data to get updated structure
      await loadCourseData()
      
      return response.data
    } catch (error) {
      // Error creating book
      throw error
    }
  }, [apiCall, loadCourseData])

  // Update book title
  const updateBookTitle = useCallback(async (courseId: string, bookId: string, title: string) => {
    try {
      const response = await apiCall(`/courses/${courseId}/books/${bookId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title })
      })
      
      // Reload course data to get updated structure
      await loadCourseData()
      
      return response.data
    } catch (error) {
      // Error updating book title
      throw error
    }
  }, [apiCall, loadCourseData])

  // Create a new chapter
  const createChapter = useCallback(async (courseId: string, bookId: string, title: string, order?: number) => {
    try {
      const response = await apiCall(`/courses/${courseId}/books/${bookId}/chapters`, {
        method: 'POST',
        body: JSON.stringify({ title, order })
      })
      
      // Reload course data to get updated structure
      await loadCourseData()
      
      return response.data
    } catch (error) {
      // Error creating chapter
      throw error
    }
  }, [apiCall, loadCourseData])

  // Update chapter title
  const updateChapterTitle = useCallback(async (courseId: string, bookId: string, chapterId: string, title: string) => {
    try {
      const response = await apiCall(`/courses/${courseId}/books/${bookId}/chapters/${chapterId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title })
      })
      
      // Reload course data to get updated structure
      await loadCourseData()
      
      return response.data
    } catch (error) {
      // Error updating chapter title
      throw error
    }
  }, [apiCall, loadCourseData])

  return {
    coursesWithContent,
    loadingCourses,
    loadingError,
    isAdmin,
    loadCourseData,
    createBook,
    updateBookTitle,
    createChapter,
    updateChapterTitle
  }
}