import React, { useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Skeleton,
  Card,
  CardContent
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import { CourseCard, CourseStatistics, BookCard } from '../courses'
import { CourseWithBooks } from '../types'
import { useRouter } from 'next/router'

interface CoursesTabProps {
  courses: CourseWithBooks[]
  loading: boolean
  error: string | null
  isAdmin: boolean
  studentCount: number
  availableClasses: string[]
  availableBoards: string[]
  onUpdateBookTitle?: (courseId: string, bookId: string, title: string) => Promise<void>
  onUpdateChapterTitle?: (courseId: string, bookId: string, chapterId: string, title: string) => Promise<void>
  onCreateBook?: (courseId: string) => void
  onCreateChapter?: (courseId: string, bookId: string) => void
}

export const CoursesTab: React.FC<CoursesTabProps> = ({
  courses,
  loading,
  error,
  isAdmin,
  studentCount,
  availableClasses,
  availableBoards,
  onUpdateBookTitle,
  onUpdateChapterTitle,
  onCreateBook,
  onCreateChapter
}) => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [filterBoard, setFilterBoard] = useState<string>('all')
  const [filterClass, setFilterClass] = useState<string>('all')
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false)

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase())
    // const matchesBoard = filterBoard === 'all' || course.board === filterBoard
    // const matchesClass = filterClass === 'all' || course.class === filterClass
    // Updated filter logic to use course.id for board/class matching
    const courseIdParts = course.id.split('_');
    const courseClass = courseIdParts[0];
    const courseBoard = courseIdParts.length > 1 ? courseIdParts[1] : 'all'; // Default to 'all' if no board specified

    const matchesBoard = filterBoard === 'all' || courseBoard === filterBoard;
    const matchesClass = filterClass === 'all' || courseClass === filterClass;

    return matchesSearch && matchesBoard && matchesClass
  })

  // Get unique boards and classes - Now using props
  // const uniqueBoards = Array.from(new Set(courses.map(c => c.board).filter(Boolean)))
  // const uniqueClasses = Array.from(new Set(courses.map(c => c.class).filter(Boolean)))

  const selectedCourse = courses.find(c => c.id === selectedCourseId)

  const handleCourseSelection = (courseId: string): void => {
    setSelectedCourseId(courseId)
  }

  const handleAccordionChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordion(isExpanded ? panel : false)
  }

  const navigateToChapter = (chapterId: string): void => {
    router.push(`/chapter/${chapterId}`)
  }

  if (loading) {
    return (
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} lg={4} key={i}>
              <Card sx={{ borderRadius: 4 }}>
                <CardContent sx={{ p: 3 }}>
                  <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 1 }} />
                  <Skeleton variant="text" sx={{ width: '60%' }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    )
  }

  // For non-admin users, show the first (and only) course
  if (!isAdmin) {
    const userCourse = courses.length > 0 ? courses[0] : null
    
    if (!userCourse) {
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No course assigned. Please contact your administrator.
          </Typography>
        </Box>
      )
    }
    
    return (
      <Box sx={{ mt: 4 }}>
        <Box sx={{ 
          mb: 4, 
          p: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
        }}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
            {userCourse.name}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {userCourse.books.length} Note{userCourse.books.length !== 1 ? 's' : ''} Available
          </Typography>
        </Box>
        
        {userCourse.books
          .sort((a, b) => {
            // Sort: unlocked books first, then locked books
            const aLocked = a.accessType === 'PAID_ONLY' && !a.hasAccess
            const bLocked = b.accessType === 'PAID_ONLY' && !b.hasAccess
            if (aLocked === bLocked) return a.order - b.order // Keep original order within same lock status
            return aLocked ? 1 : -1 // Unlocked (false) comes before locked (true)
          })
          .map((book) => (
            <BookCard
              key={book.id}
              book={book}
              _courseId={userCourse.id}
              expanded={expandedAccordion === `book-${book.id}`}
              onExpandChange={() => handleAccordionChange(`book-${book.id}`)(null as any, !expandedAccordion)}
              onChapterClick={(chapter) => navigateToChapter(chapter.id)}
            />
          ))}
      </Box>
    )
  }

  return (
    <Box sx={{ mt: 4 }}>
      {/* Admin Course Management */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ borderRadius: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'rgba(0, 0, 0, 0.4)' }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchQuery('')}
                      edge="end"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Board</InputLabel>
              <Select
                value={filterBoard}
                onChange={(e) => setFilterBoard(e.target.value)}
                label="Board"
              >
                <MenuItem value="all">All Boards</MenuItem>
                {availableBoards.map(board => (
                  <MenuItem key={board} value={board}>{board}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Class</InputLabel>
              <Select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                label="Class"
              >
                <MenuItem value="all">All Classes</MenuItem>
                {availableClasses.map(cls => (
                  <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Course Statistics */}
      <CourseStatistics courses={filteredCourses} studentCount={studentCount} />

      {/* Selected Course Details */}
      {selectedCourse && (
        <>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => setSelectedCourseId(null)}
            variant="contained"
            sx={{ 
              mb: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #68429e 100%)',
              }
            }}
          >
            Back to All Courses
          </Button>
          <Box sx={{ 
            mb: 4, 
            p: 4,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
              {selectedCourse.name}
            </Typography>
          </Box>
          
          {selectedCourse.books
            .sort((a, b) => {
              // Sort: unlocked books first, then locked books
              const aLocked = a.accessType === 'PAID_ONLY' && !a.hasAccess
              const bLocked = b.accessType === 'PAID_ONLY' && !b.hasAccess
              if (aLocked === bLocked) return a.order - b.order // Keep original order within same lock status
              return aLocked ? 1 : -1 // Unlocked (false) comes before locked (true)
            })
            .map((book) => (
              <BookCard
                key={book.id}
                book={book}
                _courseId={selectedCourse.id}
                expanded={expandedAccordion === `book-${book.id}`}
              onExpandChange={() => handleAccordionChange(`book-${book.id}`)(null as any, !expandedAccordion)}
              onChapterClick={(chapter) => navigateToChapter(chapter.id)}
              isAdmin={isAdmin}
              onUpdateBookTitle={onUpdateBookTitle ? (bookId, title) => onUpdateBookTitle(selectedCourse.id, bookId, title) : undefined}
              onUpdateChapterTitle={onUpdateChapterTitle ? (chapterId, title) => onUpdateChapterTitle(selectedCourse.id, book.id, chapterId, title) : undefined}
              onAddChapter={onCreateChapter ? () => onCreateChapter(selectedCourse.id, book.id) : undefined}
            />
          ))}
          
          {isAdmin && onCreateBook && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => onCreateBook(selectedCourse.id)}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #68429e 100%)',
                  },
                  py: 1.5,
                  px: 4,
                  borderRadius: 3,
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
              >
                Add New Book
              </Button>
            </Box>
          )}
        </>
      )}

      {/* Courses Grid */}
      {!selectedCourse && (
        <Grid container spacing={3}>
          {filteredCourses.length === 0 ? (
            <Grid item xs={12}>
              <Box sx={{ 
                textAlign: 'center', 
                py: 8,
                px: 4,
                borderRadius: 4,
                border: '2px dashed rgba(0, 0, 0, 0.1)',
                bgcolor: 'rgba(102, 126, 234, 0.02)'
              }}>
                <SearchIcon sx={{ fontSize: 64, color: 'rgba(0, 0, 0, 0.3)', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                  No courses found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search query
                </Typography>
              </Box>
            </Grid>
          ) : (
            filteredCourses.map((course) => (
              <Grid item xs={12} sm={6} lg={4} key={course.id}>
                <CourseCard
                  course={course}
                  isSelected={selectedCourseId === course.id}
                  onClick={() => handleCourseSelection(course.id)}
                />
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Box>
  )
}