import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Box,
  Typography,
  Grid,
  Button,
  Skeleton,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Divider,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import WarningIcon from '@mui/icons-material/Warning'
import GroupIcon from '@mui/icons-material/Group'
import BlockIcon from '@mui/icons-material/Block'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import PreviewIcon from '@mui/icons-material/Preview'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import PersonIcon from '@mui/icons-material/Person'
import { GroupCard } from '../groups/GroupCard'
import { GroupStatus, BatchMigrateRequest, BatchMigrateResult } from '@/hooks/dashboard/useGroups'

interface Group {
  groupName: string;
  description?: string;
  createdAt: string;
  userCount: number;
}

interface User {
  username: string;
  email?: string;
  givenName?: string;
  familyName?: string;
  status: string;
  enabled: boolean;
  groups?: string[];
}

interface GroupsTabProps {
  groups: Group[]
  loading: boolean
  error: string | null
  onRefresh: () => void
  onGroupClick: (group: Group) => void
  getGroupStatus: (groupName: string) => Promise<GroupStatus>
  updateGroupStatus: (groupName: string, status: 'ACTIVE' | 'INACTIVE') => Promise<GroupStatus>
  batchMigrate: (request: BatchMigrateRequest) => Promise<BatchMigrateResult>
}

interface GroupUsersDialogProps {
  open: boolean
  group: Group | null
  users: User[]
  loading: boolean
  onClose: () => void
}

const GroupUsersDialog: React.FC<GroupUsersDialogProps> = ({
  open,
  group,
  users,
  loading,
  onClose
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="group-users-dialog-title"
    >
      <DialogTitle id="group-users-dialog-title" sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontWeight: 700
      }}>
        {group?.groupName} - Group Members
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : users.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <GroupIcon sx={{ fontSize: 64, color: 'rgba(0, 0, 0, 0.3)', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No users in this group
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {users.map((user) => (
              <Grid item xs={12} sm={6} key={user.username}>
                <Card sx={{
                  borderRadius: 2,
                  border: '1px solid rgba(0, 0, 0, 0.1)'
                }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: user.enabled
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Typography sx={{ color: 'white', fontWeight: 700 }}>
                          {(user.givenName?.[0] || user.email?.[0] || user.username[0]).toUpperCase()}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {user.givenName && user.familyName
                            ? `${user.givenName} ${user.familyName}`
                            : user.email || user.username}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'rgba(0, 0, 0, 0.6)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {user.email || user.username}
                        </Typography>
                      </Box>
                      <Chip
                        label={user.status.replace(/_/g, ' ')}
                        size="small"
                        sx={{
                          backgroundColor:
                            user.status === 'CONFIRMED' ? 'rgba(16, 185, 129, 0.1)' :
                            user.status === 'FORCE_CHANGE_PASSWORD' ? 'rgba(245, 158, 11, 0.1)' :
                            'rgba(239, 68, 68, 0.1)',
                          color:
                            user.status === 'CONFIRMED' ? '#059669' :
                            user.status === 'FORCE_CHANGE_PASSWORD' ? '#d97706' :
                            '#dc2626',
                          fontWeight: 600,
                          fontSize: '0.65rem',
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

/** Confirmation dialog for status changes */
const StatusConfirmDialog: React.FC<{
  open: boolean
  groupName: string
  newStatus: 'ACTIVE' | 'INACTIVE'
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}> = ({ open, groupName, newStatus, loading, onConfirm, onCancel }) => {
  const isDeactivating = newStatus === 'INACTIVE'

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      maxWidth="sm"
      fullWidth
      aria-labelledby="status-confirm-title"
      aria-describedby="status-confirm-description"
    >
      <DialogTitle
        id="status-confirm-title"
        sx={{
          background: isDeactivating
            ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'
            : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          color: 'white',
          fontWeight: 700
        }}
      >
        {isDeactivating ? 'Deactivate Group' : 'Reactivate Group'}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }} id="status-confirm-description">
        {isDeactivating ? (
          <>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This will immediately revoke access for all students in this group.
            </Alert>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Are you sure you want to deactivate <strong>{groupName}</strong>?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Students enrolled in this group will no longer be able to access course content.
              This can be reversed by reactivating the group.
            </Typography>
          </>
        ) : (
          <>
            <Alert severity="info" sx={{ mb: 2 }}>
              This will restore access for all students in this group.
            </Alert>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Are you sure you want to reactivate <strong>{groupName}</strong>?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Students enrolled in this group will regain access to their course content.
            </Typography>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : isDeactivating ? <BlockIcon /> : undefined}
          sx={{
            backgroundColor: isDeactivating ? '#dc2626' : '#059669',
            '&:hover': {
              backgroundColor: isDeactivating ? '#b91c1c' : '#047857',
            }
          }}
        >
          {loading
            ? 'Processing...'
            : isDeactivating ? 'Deactivate' : 'Reactivate'
          }
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export const GroupsTab: React.FC<GroupsTabProps & {
  selectedGroup: Group | null
  groupUsers: User[]
  loadingGroupUsers: boolean
  onGroupDialogClose: () => void
}> = ({
  groups,
  loading,
  error,
  onRefresh,
  onGroupClick,
  getGroupStatus,
  updateGroupStatus,
  batchMigrate,
  selectedGroup,
  groupUsers,
  loadingGroupUsers,
  onGroupDialogClose
}) => {
  // Group status state: map of groupName -> status
  const [groupStatuses, setGroupStatuses] = useState<Record<string, 'ACTIVE' | 'INACTIVE'>>({})
  const [statusLoadingMap, setStatusLoadingMap] = useState<Record<string, boolean>>({})

  // Migration state
  const [migrationExpanded, setMigrationExpanded] = useState(false)
  const [sourceGroup, setSourceGroup] = useState('')
  const [targetGroup, setTargetGroup] = useState('')
  const [deactivateSource, setDeactivateSource] = useState(false)
  const [migrationLoading, setMigrationLoading] = useState(false)
  const [dryRunResult, setDryRunResult] = useState<BatchMigrateResult | null>(null)
  const [migrationResult, setMigrationResult] = useState<BatchMigrateResult | null>(null)
  const [migrationConfirmOpen, setMigrationConfirmOpen] = useState(false)

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    groupName: string
    newStatus: 'ACTIVE' | 'INACTIVE'
  }>({ open: false, groupName: '', newStatus: 'ACTIVE' })
  const [confirmLoading, setConfirmLoading] = useState(false)

  // Snackbar for error/success messages
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({ open: false, message: '', severity: 'success' })

  // Track mounted state for async operations
  const mountedRef = useRef(true)
  useEffect(() => {
    return () => { mountedRef.current = false }
  }, [])

  // Load group statuses when groups data changes
  const loadGroupStatuses = useCallback(async () => {
    if (groups.length === 0) return

    const nonAdminGroups = groups.filter(g => g.groupName !== 'Admin')
    if (nonAdminGroups.length === 0) return

    // Set all as loading
    const loadingState: Record<string, boolean> = {}
    nonAdminGroups.forEach(g => { loadingState[g.groupName] = true })
    setStatusLoadingMap(loadingState)

    // Fetch statuses in parallel
    const results = await Promise.allSettled(
      nonAdminGroups.map(async (g) => {
        const status = await getGroupStatus(g.groupName)
        return { groupName: g.groupName, status: status.status }
      })
    )

    if (!mountedRef.current) return

    const statuses: Record<string, 'ACTIVE' | 'INACTIVE'> = {}
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        statuses[result.value.groupName] = result.value.status
      }
    })
    // Merge with existing statuses to avoid overwriting user toggles
    setGroupStatuses(prev => ({ ...prev, ...statuses }))
    setStatusLoadingMap({})
  }, [groups, getGroupStatus])

  useEffect(() => {
    if (groups.length > 0) {
      loadGroupStatuses()
    }
  }, [groups, loadGroupStatuses])

  const handleStatusToggle = (groupName: string, newStatus: 'ACTIVE' | 'INACTIVE'): void => {
    setConfirmDialog({ open: true, groupName, newStatus })
  }

  const handleConfirmStatusChange = async (): Promise<void> => {
    const { groupName, newStatus } = confirmDialog
    setConfirmLoading(true)
    setStatusLoadingMap(prev => ({ ...prev, [groupName]: true }))

    try {
      const result = await updateGroupStatus(groupName, newStatus)
      if (mountedRef.current) {
        setGroupStatuses(prev => ({ ...prev, [groupName]: result.status }))
        setConfirmDialog({ open: false, groupName: '', newStatus: 'ACTIVE' })
        setSnackbar({
          open: true,
          message: `Group "${groupName}" ${result.status === 'ACTIVE' ? 'reactivated' : 'deactivated'} successfully`,
          severity: 'success'
        })
      }
    } catch (err) {
      if (mountedRef.current) {
        setSnackbar({
          open: true,
          message: err instanceof Error ? err.message : 'Failed to update group status',
          severity: 'error'
        })
      }
    } finally {
      if (mountedRef.current) {
        setConfirmLoading(false)
        setStatusLoadingMap(prev => ({ ...prev, [groupName]: false }))
      }
    }
  }

  // Filter to course groups only (exclude Admin and PAID_USER)
  const courseGroups = groups.filter(g =>
    g.groupName !== 'Admin' && !g.groupName.endsWith('_PAID_USER')
  )

  const handleDryRun = async (): Promise<void> => {
    if (!sourceGroup || !targetGroup) return
    setMigrationLoading(true)
    setDryRunResult(null)
    setMigrationResult(null)
    try {
      const result = await batchMigrate({
        sourceGroup,
        targetGroup,
        deactivateSource,
        dryRun: true
      })
      if (mountedRef.current) {
        setDryRunResult(result)
      }
    } catch (err) {
      if (mountedRef.current) {
        setSnackbar({
          open: true,
          message: err instanceof Error ? err.message : 'Failed to preview migration',
          severity: 'error'
        })
      }
    } finally {
      if (mountedRef.current) {
        setMigrationLoading(false)
      }
    }
  }

  const handleExecuteMigration = async (): Promise<void> => {
    setMigrationLoading(true)
    setMigrationResult(null)
    try {
      const result = await batchMigrate({
        sourceGroup,
        targetGroup,
        deactivateSource,
        dryRun: false
      })
      if (mountedRef.current) {
        setMigrationConfirmOpen(false)
        setMigrationResult(result)
        setDryRunResult(null)
        setSnackbar({
          open: true,
          message: result.failed === 0
            ? `Successfully migrated ${result.migrated} users`
            : `Migrated ${result.migrated} users with ${result.failed} failures`,
          severity: result.failed === 0 ? 'success' : 'error'
        })
        // Refresh groups data and statuses, then reset form
        onRefresh()
        resetMigrationForm()
      }
    } catch (err) {
      if (mountedRef.current) {
        setMigrationConfirmOpen(false)
        setSnackbar({
          open: true,
          message: err instanceof Error ? err.message : 'Migration failed',
          severity: 'error'
        })
      }
    } finally {
      if (mountedRef.current) {
        setMigrationLoading(false)
      }
    }
  }

  const resetMigrationForm = (): void => {
    setSourceGroup('')
    setTargetGroup('')
    setDeactivateSource(false)
    setDryRunResult(null)
    setMigrationResult(null)
  }

  if (loading && groups.length === 0) {
    return (
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card sx={{
                borderRadius: 4,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Skeleton variant="text" sx={{ fontSize: '1.5rem', width: '70%', mb: 1 }} />
                  <Skeleton variant="text" sx={{ fontSize: '0.875rem', width: '50%', mb: 2 }} />
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
          Failed to Load Groups
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
      {/* Groups Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Group Management
        </Typography>
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
            }
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* Year-End Migration Section */}
      <Card sx={{
        mb: 4,
        borderRadius: 3,
        border: '1px solid rgba(102, 126, 234, 0.15)',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'
      }}>
        <Box
          component="button"
          onClick={() => setMigrationExpanded(!migrationExpanded)}
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2.5,
            border: 'none',
            bgcolor: 'transparent',
            cursor: 'pointer',
            '&:focus-visible': {
              outline: '2px solid #667eea',
              outlineOffset: -2,
              borderRadius: 3
            }
          }}
          aria-expanded={migrationExpanded}
          aria-controls="migration-section"
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <SwapHorizIcon sx={{ color: '#667eea' }} />
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
              Year-End Migration
            </Typography>
          </Box>
          {migrationExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Box>

        <Collapse in={migrationExpanded} id="migration-section">
          <Divider />
          <CardContent sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Move all students from one group to another (e.g., promote XI to XII).
              Use dry run to preview before executing.
            </Typography>

            {/* Source and Target Group Selectors */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={5}>
                <FormControl fullWidth size="small">
                  <InputLabel id="source-group-label">Source Group</InputLabel>
                  <Select
                    labelId="source-group-label"
                    value={sourceGroup}
                    label="Source Group"
                    onChange={(e) => {
                      setSourceGroup(e.target.value)
                      setDryRunResult(null)
                      setMigrationResult(null)
                    }}
                    disabled={migrationLoading}
                  >
                    {courseGroups
                      .filter(g => g.groupName !== targetGroup)
                      .map(g => (
                        <MenuItem key={g.groupName} value={g.groupName}>
                          {g.groupName}
                        </MenuItem>
                      ))
                    }
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SwapHorizIcon aria-hidden="true" sx={{ color: 'rgba(0, 0, 0, 0.3)', fontSize: 28 }} />
              </Grid>
              <Grid item xs={12} sm={5}>
                <FormControl fullWidth size="small">
                  <InputLabel id="target-group-label">Target Group</InputLabel>
                  <Select
                    labelId="target-group-label"
                    value={targetGroup}
                    label="Target Group"
                    onChange={(e) => {
                      setTargetGroup(e.target.value)
                      setDryRunResult(null)
                      setMigrationResult(null)
                    }}
                    disabled={migrationLoading}
                  >
                    {courseGroups
                      .filter(g => g.groupName !== sourceGroup)
                      .map(g => (
                        <MenuItem key={g.groupName} value={g.groupName}>
                          {g.groupName}
                        </MenuItem>
                      ))
                    }
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Deactivate Source Checkbox */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={deactivateSource}
                  onChange={(e) => {
                    setDeactivateSource(e.target.checked)
                    setDryRunResult(null)
                    setMigrationResult(null)
                  }}
                  disabled={migrationLoading}
                  sx={{ '&.Mui-checked': { color: '#667eea' } }}
                />
              }
              label={
                <Typography variant="body2">
                  Deactivate source group after migration
                </Typography>
              }
              sx={{ mb: 2 }}
            />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={migrationLoading && !migrationConfirmOpen ? <CircularProgress size={16} /> : <PreviewIcon />}
                onClick={handleDryRun}
                disabled={!sourceGroup || !targetGroup || migrationLoading}
                sx={{
                  borderColor: '#667eea',
                  color: '#667eea',
                  '&:hover': {
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.08)'
                  }
                }}
              >
                Dry Run (Preview)
              </Button>
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={() => setMigrationConfirmOpen(true)}
                disabled={!sourceGroup || !targetGroup || migrationLoading || !dryRunResult}
                sx={{
                  backgroundColor: '#667eea',
                  '&:hover': { backgroundColor: '#5a6fd6' }
                }}
              >
                Execute Migration
              </Button>
              {(dryRunResult || migrationResult) && (
                <Button
                  variant="text"
                  onClick={resetMigrationForm}
                  disabled={migrationLoading}
                  sx={{ color: 'rgba(0, 0, 0, 0.5)' }}
                >
                  Reset
                </Button>
              )}
            </Box>

            {/* Results Area — announced to screen readers */}
            <Box aria-live="polite" aria-atomic="false">
            {/* Dry Run Preview */}
            {dryRunResult && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Dry Run Preview: {dryRunResult.totalUsers} user{dryRunResult.totalUsers !== 1 ? 's' : ''} would be migrated
                </Typography>
                {dryRunResult.users && dryRunResult.users.length > 0 && (
                  <List dense disablePadding sx={{ mt: 1 }}>
                    {dryRunResult.users.map(user => (
                      <ListItem key={user.username} disablePadding sx={{ py: 0.25 }}>
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <PersonIcon sx={{ fontSize: 16, color: 'rgba(0, 0, 0, 0.4)' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            user.givenName && user.familyName
                              ? `${user.givenName} ${user.familyName}`
                              : user.email || user.username
                          }
                          secondary={user.email !== user.username ? user.email : undefined}
                          primaryTypographyProps={{ variant: 'body2', fontSize: '0.8rem' }}
                          secondaryTypographyProps={{ variant: 'caption', fontSize: '0.7rem' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
                {dryRunResult.totalUsers === 0 && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    No users found in the source group.
                  </Typography>
                )}
              </Alert>
            )}

            {/* Migration Results */}
            {migrationResult && (
              <Alert
                severity={migrationResult.failed === 0 ? 'success' : 'warning'}
                sx={{ mb: 2 }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Migration Complete
                </Typography>
                <Box sx={{ display: 'flex', gap: 3, mb: 1, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CheckCircleIcon sx={{ fontSize: 16, color: '#059669' }} />
                    <Typography variant="body2">Migrated: {migrationResult.migrated}</Typography>
                  </Box>
                  {migrationResult.failed > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ErrorIcon sx={{ fontSize: 16, color: '#dc2626' }} />
                      <Typography variant="body2">Failed: {migrationResult.failed}</Typography>
                    </Box>
                  )}
                  <Typography variant="body2">
                    Total: {migrationResult.totalUsers}
                  </Typography>
                </Box>
                {migrationResult.sourceDeactivated && (
                  <Typography variant="body2" sx={{ color: '#d97706' }}>
                    Source group &quot;{migrationResult.sourceGroup}&quot; has been deactivated.
                  </Typography>
                )}
                {migrationResult.deactivationError && (
                  <Typography variant="body2" sx={{ color: '#dc2626' }}>
                    Deactivation failed: {migrationResult.deactivationError}
                  </Typography>
                )}
                {migrationResult.failures.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Failed users:
                    </Typography>
                    <List dense disablePadding>
                      {migrationResult.failures.map((f, i) => (
                        <ListItem key={`${f.username}-${i}`} disablePadding sx={{ py: 0.25 }}>
                          <ListItemIcon sx={{ minWidth: 28 }}>
                            <ErrorIcon sx={{ fontSize: 14, color: '#dc2626' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={`${f.username} (step: ${f.step})`}
                            secondary={f.error}
                            primaryTypographyProps={{ variant: 'body2', fontSize: '0.8rem' }}
                            secondaryTypographyProps={{ variant: 'caption', fontSize: '0.7rem', color: '#dc2626' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Alert>
            )}
            </Box>
          </CardContent>
        </Collapse>
      </Card>

      {/* Migration Confirmation Dialog */}
      <Dialog
        open={migrationConfirmOpen}
        onClose={migrationLoading ? undefined : () => setMigrationConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
        aria-labelledby="migration-confirm-title"
        aria-describedby="migration-confirm-description"
      >
        <DialogTitle
          id="migration-confirm-title"
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 700
          }}
        >
          Confirm Migration
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }} id="migration-confirm-description">
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action will move all users from the source group to the target group.
            This cannot be undone automatically.
          </Alert>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Migrate all users from <strong>{sourceGroup}</strong> to <strong>{targetGroup}</strong>
          </Typography>
          {dryRunResult && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {dryRunResult.totalUsers} user{dryRunResult.totalUsers !== 1 ? 's' : ''} will be moved.
            </Typography>
          )}
          {deactivateSource && (
            <Typography variant="body2" sx={{ color: '#d97706' }}>
              The source group &quot;{sourceGroup}&quot; will be deactivated after migration.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setMigrationConfirmOpen(false)} disabled={migrationLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleExecuteMigration}
            disabled={migrationLoading}
            startIcon={migrationLoading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <PlayArrowIcon />}
            sx={{
              backgroundColor: '#667eea',
              '&:hover': { backgroundColor: '#5a6fd6' }
            }}
          >
            {migrationLoading ? 'Migrating...' : 'Execute Migration'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Groups Grid */}
      <Grid container spacing={3}>
        {groups.map((group) => (
          <Grid item xs={12} sm={6} md={4} key={group.groupName}>
            <GroupCard
              group={group}
              onClick={() => onGroupClick(group)}
              groupStatus={group.groupName === 'Admin' ? undefined : groupStatuses[group.groupName] ?? null}
              statusLoading={statusLoadingMap[group.groupName] ?? false}
              onStatusToggle={handleStatusToggle}
            />
          </Grid>
        ))}
      </Grid>

      {/* Group Users Dialog */}
      <GroupUsersDialog
        open={!!selectedGroup}
        group={selectedGroup}
        users={groupUsers}
        loading={loadingGroupUsers}
        onClose={onGroupDialogClose}
      />

      {/* Status Confirmation Dialog */}
      <StatusConfirmDialog
        open={confirmDialog.open}
        groupName={confirmDialog.groupName}
        newStatus={confirmDialog.newStatus}
        loading={confirmLoading}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setConfirmDialog({ open: false, groupName: '', newStatus: 'ACTIVE' })}
      />

      {/* Status change feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
