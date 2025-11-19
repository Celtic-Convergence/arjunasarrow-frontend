import React, { useState } from 'react'
import { NextPageWithLayout } from '@/interfaces/layout'
import { MainLayout } from '@/components/layout'
import { AuthGuard } from '@/components/auth/AuthGuard'
import Head from 'next/head'
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button,
  Chip
} from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import { useSignOut } from '@/hooks/useSignOut'
import { useAuth } from '@/contexts/AuthContext'
import { TabPanel } from '@/components/dashboard/common/TabPanel'
import { DashboardTabs } from '@/components/dashboard/DashboardTabs'
import { CoursesTab } from '@/components/dashboard/tabs/CoursesTab'
import { NotificationsTab } from '@/components/dashboard/tabs/NotificationsTab'
import { UsersTab } from '@/components/dashboard/tabs/UsersTab'
import { GroupsTab } from '@/components/dashboard/tabs/GroupsTab'
import { InviteUserDialog } from '@/components/dashboard/dialogs/InviteUserDialog'
import { UserDetailsDialog } from '@/components/dashboard/dialogs/UserDetailsDialog'
import { GroupManagementDialog } from '@/components/dashboard/dialogs/GroupManagementDialog'
import { NotificationDialog } from '@/components/dashboard/dialogs/NotificationDialog'
import { DeleteNotificationDialog } from '@/components/dashboard/dialogs/DeleteNotificationDialog'
import { ManageAttachmentsDialog } from '@/components/dashboard/dialogs/ManageAttachmentsDialog'
import { CreateBookDialog } from '@/components/dashboard/dialogs/CreateBookDialog'
import { CreateChapterDialog } from '@/components/dashboard/dialogs/CreateChapterDialog'
import { useNotificationManagement } from '@/hooks/dashboard/useNotificationManagement'
import { useCourses } from '@/hooks/dashboard/useCourses'
import { useUsers } from '@/hooks/dashboard/useUsers'
import { useGroups } from '@/hooks/dashboard/useGroups'
import { useNotifications } from '@/hooks/dashboard/useNotifications'
import { User, Notification } from '@/components/dashboard/types'

const Dashboard: NextPageWithLayout = () => {
  const { signOut } = useSignOut()
  const { user } = useAuth()
  const [tabValue, setTabValue] = useState(0)

  // Use custom hooks
  const { 
    coursesWithContent, 
    loadingCourses, 
    loadingError, 
    isAdmin,
    createBook,
    updateBookTitle,
    createChapter,
    updateChapterTitle
  } = useCourses(user)
  const { 
    users, 
    loadingUsers, 
    usersError, 
    studentCount,
    loadUsers,
    getUserDetails,
    inviteUser,
    updateUserDetails,
    resetUserPassword,
    setTemporaryPassword
  } = useUsers(user, isAdmin)
  const { 
    availableGroups,
    loadingGroups,
    groupError,
    loadAvailableGroups,
    addUserToGroup,
    removeUserFromGroup,
    loadGroupsData,
    loadGroupUsers
  } = useGroups()
  const [loadingGroupUsers, setLoadingGroupUsers] = useState(false)
  
  // Notification state - initialize with empty string
  const [selectedNotificationCourseId, setSelectedNotificationCourseId] = useState<string>('')
  
  // Derive the actual course ID for notifications
  const notificationCourseId = selectedNotificationCourseId || (coursesWithContent.length > 0 ? coursesWithContent[0].id : '')

  // State for available classes and boards for filtering
  const [availableClasses, setAvailableClasses] = useState<string[]>([])
  const [availableBoards, setAvailableBoards] = useState<string[]>([])

  const {
    notifications,
    loadingNotifications,
    notificationsError,
    notificationsPagination,
    refreshing,
    lastRefresh,
    handleAttachmentDownload,
    handleRefreshNotifications,
    handleLoadMore
  } = useNotifications(user, tabValue, notificationCourseId, isAdmin)

  // Notification management hook
  const {
    getUploadUrls,
    createNotification,
    updateNotification,
    deleteNotification,
    removeAllAttachments,
    removeAttachment
  } = useNotificationManagement()

  // Dialog states
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteFormData, setInviteFormData] = useState({
    email: '',
    givenName: '',
    familyName: '',
    groupName: ''
  })
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)

  // User details dialog
  const [userDetailsOpen, setUserDetailsOpen] = useState(false)
  const [selectedUserDetails, setSelectedUserDetails] = useState<User | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editFormData, setEditFormData] = useState({
    email: '',
    givenName: '',
    familyName: ''
  })
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  // Group management dialog
  const [groupDialogOpen, setGroupDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState('')
  const [groupLoading, setGroupLoading] = useState(false)

  // Groups tab state
  const [groupsData, setGroupsData] = useState<any[]>([])
  const [loadingGroupsData, setLoadingGroupsData] = useState(false)
  const [groupsDataError, setGroupsDataError] = useState<string | null>(null)
  const [selectedGroupDetails, setSelectedGroupDetails] = useState<any | null>(null)
  const [groupUsersData, setGroupUsersData] = useState<any[]>([])

  // Notification dialog states
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [deleteNotificationDialogOpen, setDeleteNotificationDialogOpen] = useState(false)
  const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null)
  const [manageAttachmentsDialogOpen, setManageAttachmentsDialogOpen] = useState(false)
  const [notificationForAttachments, setNotificationForAttachments] = useState<Notification | null>(null)

  // Book and Chapter dialog states
  const [createBookDialogOpen, setCreateBookDialogOpen] = useState(false)
  const [createBookCourseId, setCreateBookCourseId] = useState<string>('')
  const [createChapterDialogOpen, setCreateChapterDialogOpen] = useState(false)
  const [createChapterCourseId, setCreateChapterCourseId] = useState<string>('')
  const [createChapterBookId, setCreateChapterBookId] = useState<string>('')

  const handleSignOut = async (): Promise<void> => {
    await signOut()
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setTabValue(newValue)
  }

  // User management handlers
  const handleInviteUser = async (): Promise<void> => {
    setInviteLoading(true)
    setInviteError(null)
    try {
      await inviteUser(inviteFormData)
      setInviteDialogOpen(false)
      setInviteFormData({ email: '', givenName: '', familyName: '', groupName: '' })
      alert('User invited successfully!')
    } catch (error) {
      setInviteError(error instanceof Error ? error.message : 'Failed to invite user')
    } finally {
      setInviteLoading(false)
    }
  }

  const handleGetUserDetails = async (username: string): Promise<void> => {
    const userDetails = await getUserDetails(username)
    if (userDetails) {
      setSelectedUserDetails(userDetails)
      setEditFormData({
        email: userDetails.email || '',
        givenName: userDetails.givenName || '',
        familyName: userDetails.familyName || ''
      })
      setUserDetailsOpen(true)
    }
  }

  const handleUpdateUserDetails = async (): Promise<void> => {
    if (!selectedUserDetails) return
    setUpdateLoading(true)
    setUpdateError(null)
    try {
      await updateUserDetails(selectedUserDetails.username, editFormData)
      setEditMode(false)
      await loadUsers()
      alert('User details updated successfully!')
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : 'Failed to update user')
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleResetPassword = async (user: User): Promise<void> => {
    if (confirm(`Reset password for ${user.email || user.username}?`)) {
      try {
        await resetUserPassword(user.username)
        alert('Password reset successfully!')
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to reset password')
      }
    }
  }

  const handleSetTempPassword = async (password: string): Promise<void> => {
    if (!selectedUserDetails) return
    try {
      await setTemporaryPassword(selectedUserDetails.username, password)
      alert('Temporary password set successfully!')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to set temporary password')
    }
  }

  // Group management handlers
  const handleAddUserToGroup = async (): Promise<void> => {
    if (!selectedUserDetails || !selectedGroup) return
    setGroupLoading(true)
    try {
      // First, remove user from all existing groups
      if (selectedUserDetails.groups && selectedUserDetails.groups.length > 0) {
        for (const existingGroup of selectedUserDetails.groups) {
          try {
            await removeUserFromGroup(selectedUserDetails.username, existingGroup)
          } catch (error) {
            console.error(`Failed to remove user from group ${existingGroup}:`, error)
          }
        }
      }
      
      // Then add user to the new group
      await addUserToGroup(selectedUserDetails.username, selectedGroup)
      await handleGetUserDetails(selectedUserDetails.username)
      setGroupDialogOpen(false)
      setSelectedGroup('')
      alert(`User successfully moved to group ${selectedGroup}`)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add user to group')
    } finally {
      setGroupLoading(false)
    }
  }

  const handleRemoveUserFromGroup = async (groupName: string): Promise<void> => {
    if (!selectedUserDetails) return
    setGroupLoading(true)
    try {
      await removeUserFromGroup(selectedUserDetails.username, groupName)
      await handleGetUserDetails(selectedUserDetails.username)
      alert(`User successfully removed from group ${groupName}`)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to remove user from group')
    } finally {
      setGroupLoading(false)
    }
  }

  // Groups tab handlers
  const handleLoadGroupsData = async (): Promise<void> => {
    setLoadingGroupsData(true)
    setGroupsDataError(null)
    try {
      const groups = await loadGroupsData()
      setGroupsData(groups)
    } catch (error) {
      setGroupsDataError(error instanceof Error ? error.message : 'Failed to load groups')
    } finally {
      setLoadingGroupsData(false)
    }
  }

  // Notification handlers
  const handleCreateNotification = (): void => {
    setSelectedNotification(null)
    setNotificationDialogOpen(true)
  }

  const handleEditNotification = (notification: Notification): void => {
    setSelectedNotification(notification)
    setNotificationDialogOpen(true)
  }

  const handleDeleteNotification = (notification: Notification): void => {
    setNotificationToDelete(notification)
    setDeleteNotificationDialogOpen(true)
  }

  const handleManageAttachments = (notification: Notification): void => {
    setNotificationForAttachments(notification)
    setManageAttachmentsDialogOpen(true)
  }

  const handleSaveNotification = async (data: any): Promise<void> => {
    try {
      if (selectedNotification) {
        // Update existing notification (only content and priority)
        await updateNotification(selectedNotification.notificationId, {
          title: data.title,
          content: data.content,
          priority: data.priority
        })
      } else {
        // Create new notification
        await createNotification(data)
      }
      // Refresh notifications
      await handleRefreshNotifications()
      setNotificationDialogOpen(false)
      setSelectedNotification(null)
    } catch (error) {
      console.error('Save notification error:', error)
      throw error
    }
  }

  const handleConfirmDeleteNotification = async (): Promise<void> => {
    if (!notificationToDelete) return
    
    try {
      await deleteNotification(notificationToDelete.notificationId)
      // Close dialog immediately on success
      setDeleteNotificationDialogOpen(false)
      setNotificationToDelete(null)
      // Refresh notifications after dialog is closed
      await handleRefreshNotifications()
    } catch (error) {
      console.error('Delete notification error:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete notification')
    }
  }

  const handleDeleteAllAttachments = async (): Promise<void> => {
    if (!notificationForAttachments) return
    
    try {
      const updatedNotification = await removeAllAttachments(notificationForAttachments.notificationId)
      // Update the notification to show no attachments
      setNotificationForAttachments(updatedNotification)
      await handleRefreshNotifications()
      // Close dialog since there are no more attachments
      setManageAttachmentsDialogOpen(false)
    } catch (error) {
      throw error
    }
  }

  const handleDeleteSingleAttachment = async (attachmentId: string): Promise<void> => {
    if (!notificationForAttachments) return
    
    try {
      const updatedNotification = await removeAttachment(notificationForAttachments.notificationId, attachmentId)
      
      // Check if there are any attachments left
      if (!updatedNotification.attachments || updatedNotification.attachments.length === 0) {
        // Close dialog if no attachments remain
        setManageAttachmentsDialogOpen(false)
        setNotificationForAttachments(null)
      } else {
        // Update the notification in dialog with the response
        setNotificationForAttachments(updatedNotification)
      }
      
      // Also refresh the main list
      await handleRefreshNotifications()
    } catch (error) {
      throw error
    }
  }

  const handleGroupClick = async (group: any): Promise<void> => {
    setSelectedGroupDetails(group)
    setLoadingGroupUsers(true)
    try {
      const users = await loadGroupUsers(group.groupName)
      setGroupUsersData(users)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to load group users')
    } finally {
      setLoadingGroupUsers(false)
    }
  }

  // Load groups data when tab changes
  React.useEffect(() => {
    if (tabValue === 3 && isAdmin && groupsData.length === 0) {
      handleLoadGroupsData()
    }
  }, [tabValue, isAdmin])
  
  // Set default notification course when courses are loaded
  React.useEffect(() => {
    // Courses effect triggered
    if (coursesWithContent.length > 0 && !selectedNotificationCourseId) {
      // For admin, set the first course; for non-admin, they only have one course
      const courseId = coursesWithContent[0].id
      // Setting default notification course
      setSelectedNotificationCourseId(courseId)
    }
  }, [coursesWithContent, selectedNotificationCourseId])

  // Book and Chapter management handlers
  const handleOpenCreateBookDialog = (courseId: string): void => {
    setCreateBookCourseId(courseId)
    setCreateBookDialogOpen(true)
  }

  const handleOpenCreateChapterDialog = (courseId: string, bookId: string): void => {
    setCreateChapterCourseId(courseId)
    setCreateChapterBookId(bookId)
    setCreateChapterDialogOpen(true)
  }

  const handleCreateBook = async (title: string): Promise<void> => {
    try {
      await createBook(createBookCourseId, title)
      setCreateBookDialogOpen(false)
      setCreateBookCourseId('')
    } catch (error) {
      throw error
    }
  }

  const handleCreateChapter = async (title: string): Promise<void> => {
    try {
      await createChapter(createChapterCourseId, createChapterBookId, title)
      setCreateChapterDialogOpen(false)
      setCreateChapterCourseId('')
      setCreateChapterBookId('')
    } catch (error) {
      throw error
    }
  }

  // Effect to extract classes and boards from courses
  React.useEffect(() => {
    if (coursesWithContent && coursesWithContent.length > 0) {
      const classes = new Set<string>()
      const boards = new Set<string>()
      coursesWithContent.forEach(course => {
        // Assuming course.id or course.name is in the format "CLASS_BOARD"
        // Let's assume it's course.id as it's used for notificationCourseId
        const parts = course.id.split('_')
        if (parts.length === 2) {
          classes.add(parts[0])
          boards.add(parts[1])
        } else if (parts.length === 1 && parts[0] !== '') {
          // Handle cases where there might be only a class or board, or malformed id.
          // For now, we might assume it's a class if only one part.
          // Or, decide on a convention. Let's assume if only one part, it's a class and no specific board.
          // This logic might need refinement based on actual data variability.
          classes.add(parts[0]);
        }
      })
      setAvailableClasses(Array.from(classes))
      setAvailableBoards(Array.from(boards))
    }
  }, [coursesWithContent])

  return (
    <>
      <Head>
        <title>{isAdmin ? 'Admin Dashboard' : 'Dashboard'} | Economics E-Learning Portal</title>
        <meta 
          name="description" 
          content={isAdmin 
            ? "Admin dashboard for managing economics e-learning courses and content."
            : "Access your economics e-learning dashboard. View courses, progress, and learning materials."
          }
        />
      </Head>
      <Box sx={{ py: 6, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          
          {/* Header Section */}
          <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                <Typography 
                  variant="h3" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' }
                  }}
                >
                  {`Hi ${user?.attributes?.['given_name'] || user?.email || 'Student'}, welcome back!`}
                </Typography>
                {isAdmin && (
                  <Chip
                    icon={<AdminPanelSettingsIcon />}
                    label="Admin"
                    color="primary"
                    sx={{
                      backgroundColor: '#667eea',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      '& .MuiChip-icon': {
                        color: 'inherit'
                      }
                    }}
                  />
                )}
              </Box>
              {isAdmin && (
                <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                  You have access to all courses and administrative features
                </Typography>
              )}
            </Box>
            <Button 
              variant="outlined" 
              startIcon={<LogoutIcon />}
              onClick={handleSignOut}
              sx={{ 
                whiteSpace: 'nowrap',
                borderColor: '#4c51bf',
                color: '#4c51bf',
                '&:hover': {
                  borderColor: '#4c51bf',
                  backgroundColor: 'rgba(76, 81, 191, 0.08)',
                }
              }}
            >
              Sign Out
            </Button>
          </Box>

          {/* Main Content */}
          <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, position: 'relative', zIndex: 1 }}>
            <DashboardTabs 
              isAdmin={isAdmin}
              tabValue={tabValue}
              onTabChange={handleTabChange}
            />
            
            <TabPanel value={tabValue} index={0}>
              <CoursesTab
                courses={coursesWithContent}
                loading={loadingCourses}
                error={loadingError}
                isAdmin={isAdmin}
                studentCount={studentCount}
                availableClasses={availableClasses}
                availableBoards={availableBoards}
                onUpdateBookTitle={updateBookTitle}
                onUpdateChapterTitle={updateChapterTitle}
                onCreateBook={handleOpenCreateBookDialog}
                onCreateChapter={handleOpenCreateChapterDialog}
              />
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <NotificationsTab
                notifications={notifications}
                loading={loadingNotifications}
                error={notificationsError}
                pagination={notificationsPagination}
                lastRefresh={lastRefresh}
                refreshing={refreshing}
                onRefresh={handleRefreshNotifications}
                onLoadMore={handleLoadMore}
                onAttachmentDownload={handleAttachmentDownload}
                isAdmin={isAdmin}
                courses={coursesWithContent}
                selectedCourseId={notificationCourseId}
                onCourseChange={setSelectedNotificationCourseId}
                onCreateNotification={handleCreateNotification}
                onEditNotification={handleEditNotification}
                onDeleteNotification={handleDeleteNotification}
                onManageAttachments={handleManageAttachments}
              />
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              {isAdmin ? (
                <UsersTab
                  users={users}
                  loading={loadingUsers}
                  error={usersError}
                  onRefresh={loadUsers}
                  onInviteUser={() => setInviteDialogOpen(true)}
                  onUserClick={(user) => handleGetUserDetails(user.username)}
                  onUserEdit={(user) => {
                    handleGetUserDetails(user.username)
                    setEditMode(true)
                  }}
                  onUserResetPassword={handleResetPassword}
                />
              ) : null}
            </TabPanel>
            
            <TabPanel value={tabValue} index={3}>
              {isAdmin ? (
                <GroupsTab
                  groups={groupsData}
                  loading={loadingGroupsData}
                  error={groupsDataError}
                  onRefresh={handleLoadGroupsData}
                  onGroupClick={handleGroupClick}
                  selectedGroup={selectedGroupDetails}
                  groupUsers={groupUsersData}
                  loadingGroupUsers={loadingGroupUsers}
                  onGroupDialogClose={() => {
                    setSelectedGroupDetails(null)
                    setGroupUsersData([])
                  }}
                />
              ) : null}
            </TabPanel>
          </Paper>
        </Container>
      </Box>

      {/* Dialogs */}
      <InviteUserDialog
        open={inviteDialogOpen}
        onClose={() => {
          setInviteDialogOpen(false)
          setInviteFormData({ email: '', givenName: '', familyName: '', groupName: '' })
          setInviteError(null)
        }}
        formData={inviteFormData}
        onFormChange={setInviteFormData}
        onInvite={handleInviteUser}
        loading={inviteLoading}
        error={inviteError}
        courses={coursesWithContent}
      />

      <UserDetailsDialog
        open={userDetailsOpen}
        user={selectedUserDetails}
        editMode={editMode}
        editFormData={editFormData}
        updateError={updateError}
        updateLoading={updateLoading}
        onClose={() => {
          setUserDetailsOpen(false)
          setSelectedUserDetails(null)
          setEditMode(false)
          setEditFormData({ email: '', givenName: '', familyName: '' })
          setUpdateError(null)
        }}
        onEditModeToggle={() => setEditMode(true)}
        onEditFormChange={setEditFormData}
        onUpdateUser={handleUpdateUserDetails}
        onResetPassword={() => {
          if (selectedUserDetails) {
            handleResetPassword(selectedUserDetails)
          }
        }}
        onSetTempPassword={() => {
          // You would need to implement a temp password dialog here
          const password = prompt('Enter temporary password:')
          if (password) {
            handleSetTempPassword(password)
          }
        }}
        onManageGroups={() => {
          loadAvailableGroups()
          setGroupDialogOpen(true)
        }}
      />

      <GroupManagementDialog
        open={groupDialogOpen}
        user={selectedUserDetails}
        availableGroups={availableGroups || []}
        selectedGroup={selectedGroup}
        loading={groupLoading}
        loadingGroups={loadingGroups}
        error={groupError}
        onClose={() => {
          setGroupDialogOpen(false)
          setSelectedGroup('')
        }}
        onGroupSelect={setSelectedGroup}
        onAddToGroup={handleAddUserToGroup}
        onRemoveFromGroup={handleRemoveUserFromGroup}
      />

      {/* Notification Dialogs */}
      <NotificationDialog
        open={notificationDialogOpen}
        onClose={() => {
          setNotificationDialogOpen(false)
          setSelectedNotification(null)
        }}
        notification={selectedNotification}
        courseId={notificationCourseId}
        onSave={handleSaveNotification}
        onUploadAttachments={getUploadUrls}
      />

      <DeleteNotificationDialog
        open={deleteNotificationDialogOpen}
        onClose={() => {
          setDeleteNotificationDialogOpen(false)
          setNotificationToDelete(null)
        }}
        notification={notificationToDelete}
        onConfirm={handleConfirmDeleteNotification}
      />

      <ManageAttachmentsDialog
        open={manageAttachmentsDialogOpen}
        onClose={() => {
          setManageAttachmentsDialogOpen(false)
          setNotificationForAttachments(null)
        }}
        notification={notificationForAttachments}
        onDeleteAll={handleDeleteAllAttachments}
        onDeleteSingle={handleDeleteSingleAttachment}
        onDownload={handleAttachmentDownload}
      />

      {/* Book and Chapter Management Dialogs */}
      <CreateBookDialog
        open={createBookDialogOpen}
        onClose={() => {
          setCreateBookDialogOpen(false)
          setCreateBookCourseId('')
        }}
        courseId={createBookCourseId}
        courseName={coursesWithContent.find(c => c.id === createBookCourseId)?.name || ''}
        onCreateBook={handleCreateBook}
        existingBooksCount={coursesWithContent.find(c => c.id === createBookCourseId)?.books.length || 0}
      />

      <CreateChapterDialog
        open={createChapterDialogOpen}
        onClose={() => {
          setCreateChapterDialogOpen(false)
          setCreateChapterCourseId('')
          setCreateChapterBookId('')
        }}
        courseId={createChapterCourseId}
        bookId={createChapterBookId}
        bookTitle={
          coursesWithContent
            .find(c => c.id === createChapterCourseId)
            ?.books.find(b => b.id === createChapterBookId)?.title || ''
        }
        onCreateChapter={handleCreateChapter}
        existingChaptersCount={
          coursesWithContent
            .find(c => c.id === createChapterCourseId)
            ?.books.find(b => b.id === createChapterBookId)?.chapters.length || 0
        }
      />
    </>
  )
}

const DashboardWithAuth: NextPageWithLayout = () => {
  return (
    <AuthGuard requireAuth={true}>
      <Dashboard />
    </AuthGuard>
  )
}

DashboardWithAuth.getLayout = (page) => <MainLayout isAuthenticated={true} theme="dashboard">{page}</MainLayout>

export default DashboardWithAuth