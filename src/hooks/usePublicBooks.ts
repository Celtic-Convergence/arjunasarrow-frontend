import { useState, useEffect } from 'react'

interface PublicBook {
  bookId: string
  title: string
  description?: string
  order: number
  chapters: any[] // Empty array for security
  accessType: 'PAID_ONLY'
  price: number
  currency: string
  eligibleCourses: string[]
  courseId?: string // May be needed for purchase flow
}

/**
 * Hook to fetch public books (PAID_ONLY) without authentication
 * 
 * This hook calls the public API endpoint to get books available for purchase.
 * No JWT token required.
 */

export const usePublicBooks = (): { books: PublicBook[]; loading: boolean; error: string | null } => {
  const [books, setBooks] = useState<PublicBook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPublicBooks = async (): Promise<void> => {
      setLoading(true)
      setError(null)

      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
        if (!apiBaseUrl) {
          throw new Error('API base URL not configured')
        }

        const url = apiBaseUrl.endsWith('/v1')
          ? `${apiBaseUrl}/books/public`
          : `${apiBaseUrl}/v1/books/public`

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch books: ${response.statusText}`)
        }

        const data = await response.json()

        if (!data.success || !data.data) {
          throw new Error(data.error?.message || 'Failed to fetch books')
        }

        // Backend should return array of books
        setBooks(data.data.books || [])
      } catch (err: any) {
        console.error('Error fetching public books:', err)
        setError(err.message || 'Failed to load books')
        setBooks([])
      } finally {
        setLoading(false)
      }
    }

    fetchPublicBooks()
  }, [])

  return { books, loading, error }
}
