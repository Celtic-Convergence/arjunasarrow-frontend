import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Skeleton,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import RefreshIcon from '@mui/icons-material/Refresh'
import GroupIcon from '@mui/icons-material/Group'
import WarningIcon from '@mui/icons-material/Warning'
import FilterListIcon from '@mui/icons-material/FilterList'
import { UserCard } from '../users/UserCard'
import { UserStatistics } from '../users/UserStatistics'
import { User } from '../types'

interface UsersTabProps {
  users: User[]
  loading: boolean
  error: string | null
  availableGroups: string[]
  loadGroupUsers: (groupName: string) => Promise<User[]>
  onRefresh: () => void
  onInviteUser: () => void
  onUserClick: (user: User) => void
  onUserEdit: (user: User) => void
  onUserResetPassword: (user: User) => void
}

export const UsersTab: React.FC<UsersTabProps> = ({
  users,
  loading,
  error,
  availableGroups,
  loadGroupUsers,
  onRefresh,
  onInviteUser,
  onUserClick,
  onUserEdit,
  onUserResetPassword
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [groupUsers, setGroupUsers] = useState<User[]>([])
  const [loadingGroupUsers, setLoadingGroupUsers] = useState(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    return (): void => { mountedRef.current = false }
  }, [])

  // Fetch users for the selected group from the API
  useEffect(() => {
    if (!selectedGroup) {
      setGroupUsers([])
      return
    }

    let cancelled = false
    const fetchGroupUsers = async (): Promise<void> => {
      setLoadingGroupUsers(true)
      try {
        const fetchedUsers = await loadGroupUsers(selectedGroup)
        if (!cancelled && mountedRef.current) {
          setGroupUsers(fetchedUsers)
        }
      } catch {
        if (!cancelled && mountedRef.current) {
          setGroupUsers([])
        }
      } finally {
        if (!cancelled && mountedRef.current) {
          setLoadingGroupUsers(false)
        }
      }
    }

    fetchGroupUsers()
    return (): void => { cancelled = true }
  }, [selectedGroup, loadGroupUsers])

  // Use group-fetched users when a group is selected, otherwise use all users
  const baseUsers = selectedGroup ? groupUsers : users

  // Apply search filter on top
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return baseUsers

    const searchLower = searchQuery.toLowerCase()
    return baseUsers.filter(user =>
      user.username.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.givenName?.toLowerCase().includes(searchLower) ||
      user.familyName?.toLowerCase().includes(searchLower) ||
      user.status.toLowerCase().includes(searchLower)
    )
  }, [baseUsers, searchQuery])

  const hasActiveFilters = Boolean(searchQuery || selectedGroup)

  const clearAllFilters = (): void => {
    setSearchQuery('')
    setSelectedGroup('')
  }

  if (loading && users.length === 0) {
    return (
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card sx={{ 
                borderRadius: 4,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Skeleton variant="circular" width={48} height={48} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" sx={{ fontSize: '1.1rem', width: '70%', mb: 0.5 }} />
                      <Skeleton variant="text" sx={{ fontSize: '0.875rem', width: '50%' }} />
                    </Box>
                  </Box>
                  <Skeleton variant="text" sx={{ fontSize: '0.875rem', width: '40%' }} />
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
      <Box sx={{ 
        textAlign: 'center', 
        py: 8,
        px: 4,
        borderRadius: 4,
        border: '2px dashed rgba(220, 38, 38, 0.2)',
        bgcolor: 'rgba(220, 38, 38, 0.05)'
      }}>
        <WarningIcon sx={{ fontSize: 64, color: 'rgba(220, 38, 38, 0.5)', mb: 2 }} />
        <Typography variant="h6" color="error" sx={{ mb: 1, fontWeight: 600 }}>
          Failed to Load Users
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {error}
        </Typography>
        <Button
          variant="outlined"
          onClick={onRefresh}
          sx={{
            borderColor: '#4c51bf',
            color: '#4c51bf',
            '&:hover': {
              borderColor: '#4c51bf',
              backgroundColor: 'rgba(76, 81, 191, 0.08)',
            }
          }}
        >
          Try Again
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ mt: 4 }}>
      {/* Search, Filter, and Actions Bar */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search users by name, email, or status..."
              inputProps={{ 'aria-label': 'Search users by name, email, or status' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                      aria-label="Clear search"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                  }
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="medium">
              <InputLabel id="group-filter-label">Filter by Group</InputLabel>
              <Select
                labelId="group-filter-label"
                value={selectedGroup}
                label="Filter by Group"
                onChange={(e) => setSelectedGroup(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListIcon aria-hidden="true" sx={{ color: 'rgba(0, 0, 0, 0.4)', ml: 0.5 }} />
                  </InputAdornment>
                }
                endAdornment={selectedGroup && (
                  <InputAdornment position="end" sx={{ mr: 2 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedGroup('')
                      }}
                      aria-label="Clear group filter"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )}
                sx={{
                  borderRadius: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                  }
                }}
              >
                <MenuItem value="">
                  <em>All Groups</em>
                </MenuItem>
                {availableGroups.map(group => (
                  <MenuItem key={group} value={group}>
                    {group}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                sx={{
                  backgroundColor: '#667eea',
                  '&:hover': {
                    backgroundColor: '#5a67d8',
                  },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3
                }}
                onClick={onInviteUser}
              >
                Invite User
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={onRefresh}
                sx={{
                  borderColor: '#4c51bf',
                  color: '#4c51bf',
                  '&:hover': {
                    borderColor: '#4c51bf',
                    backgroundColor: 'rgba(76, 81, 191, 0.08)',
                  },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Refresh
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* User Statistics */}
      <UserStatistics users={users} />

      {/* Filter Results Summary */}
      {hasActiveFilters && (
        <Box
          role="status"
          aria-live="polite"
          sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}
        >
          <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
            Showing {filteredUsers.length} of {users.length} users
          </Typography>
          {selectedGroup && (
            <Chip
              label={selectedGroup}
              size="small"
              icon={<GroupIcon sx={{ fontSize: 14 }} />}
              onDelete={() => setSelectedGroup('')}
              aria-label={`Filtering by group: ${selectedGroup}. Press delete to remove filter.`}
              sx={{
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                color: '#667eea',
                fontWeight: 600,
                '& .MuiChip-deleteIcon': { color: '#667eea' }
              }}
            />
          )}
          <Button
            size="small"
            startIcon={<ClearIcon />}
            onClick={clearAllFilters}
            sx={{
              color: '#4c51bf',
              '&:hover': {
                backgroundColor: 'rgba(76, 81, 191, 0.08)',
              }
            }}
          >
            Clear All Filters
          </Button>
        </Box>
      )}

      {/* Users Grid */}
      {loadingGroupUsers ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Skeleton variant="circular" width={48} height={48} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" sx={{ fontSize: '1.1rem', width: '70%', mb: 0.5 }} />
                      <Skeleton variant="text" sx={{ fontSize: '0.875rem', width: '50%' }} />
                    </Box>
                  </Box>
                  <Skeleton variant="text" sx={{ fontSize: '0.875rem', width: '40%' }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : filteredUsers.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          px: 4,
          borderRadius: 4,
          border: '2px dashed rgba(0, 0, 0, 0.1)',
          bgcolor: 'rgba(102, 126, 234, 0.02)'
        }}>
          <GroupIcon sx={{ fontSize: 64, color: 'rgba(0, 0, 0, 0.3)', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
            No users found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {hasActiveFilters ? 'Try adjusting your search or filter' : 'Invite users to get started'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredUsers.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user.username}>
              <UserCard
                user={user}
                onClick={() => onUserClick(user)}
                onEdit={(e) => {
                  e.stopPropagation()
                  onUserEdit(user)
                }}
                onResetPassword={(e) => {
                  e.stopPropagation()
                  onUserResetPassword(user)
                }}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}