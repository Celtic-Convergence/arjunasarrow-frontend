import React from 'react'
import {
  Card,
  CardActionArea,
  CardContent,
  Box,
  Typography,
  Chip,
  Switch,
  CircularProgress
} from '@mui/material'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import BlockIcon from '@mui/icons-material/Block'

interface GroupData {
  groupName: string
  description?: string
  createdAt: string
  userCount?: number
  precedence?: number
}

interface GroupCardProps {
  group: GroupData
  onClick: () => void
  /** undefined = admin/no status needed, null = not yet loaded, 'ACTIVE'/'INACTIVE' = loaded */
  groupStatus?: 'ACTIVE' | 'INACTIVE' | null
  statusLoading?: boolean
  onStatusToggle?: (groupName: string, newStatus: 'ACTIVE' | 'INACTIVE') => void
}

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  onClick,
  groupStatus,
  statusLoading,
  onStatusToggle
}) => {
  const isAdmin = group.groupName === 'Admin'
  const hasStatus = groupStatus === 'ACTIVE' || groupStatus === 'INACTIVE'
  const isInactive = groupStatus === 'INACTIVE'

  const handleToggleClick = (e: React.MouseEvent): void => {
    e.stopPropagation()
  }

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.stopPropagation()
    if (onStatusToggle && !isAdmin) {
      onStatusToggle(group.groupName, e.target.checked ? 'ACTIVE' : 'INACTIVE')
    }
  }

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 4,
        boxShadow: isInactive
          ? '0 8px 32px rgba(0, 0, 0, 0.04)'
          : '0 8px 32px rgba(0, 0, 0, 0.08)',
        border: isInactive
          ? '1px solid rgba(220, 38, 38, 0.15)'
          : '1px solid rgba(255, 255, 255, 0.2)',
        background: isInactive
          ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(250, 245, 245, 0.7) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isInactive ? 0.8 : 1,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: isInactive
            ? '0 16px 40px rgba(0, 0, 0, 0.06)'
            : '0 16px 40px rgba(0, 0, 0, 0.12)',
        }
      }}
    >
      <CardActionArea onClick={onClick} sx={{ height: '100%', alignItems: 'flex-start' }}>
        <CardContent sx={{ p: 3, width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: isAdmin
                  ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'
                  : isInactive
                    ? 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                flexShrink: 0
              }}
            >
              <AdminPanelSettingsIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  mb: 0.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: isInactive ? 'rgba(0, 0, 0, 0.58)' : 'inherit'
                }}
              >
                {group.groupName}
              </Typography>
              {group.description && (
                <Typography
                  variant="body2"
                  sx={{
                    color: isInactive ? 'rgba(0, 0, 0, 0.55)' : 'rgba(0, 0, 0, 0.6)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {group.description}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Status indicator and toggle — only when status is loaded */}
          {!isAdmin && hasStatus && (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1.5,
              py: 1,
              px: 1.5,
              borderRadius: 2,
              bgcolor: isInactive ? 'rgba(220, 38, 38, 0.04)' : 'rgba(5, 150, 105, 0.04)',
              border: `1px solid ${isInactive ? 'rgba(220, 38, 38, 0.1)' : 'rgba(5, 150, 105, 0.1)'}`,
            }}>
              <Chip
                icon={isInactive
                  ? <BlockIcon sx={{ fontSize: 14 }} />
                  : <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />
                }
                label={isInactive ? 'Inactive' : 'Active'}
                size="small"
                sx={{
                  backgroundColor: isInactive
                    ? 'rgba(220, 38, 38, 0.1)'
                    : 'rgba(5, 150, 105, 0.1)',
                  color: isInactive ? '#dc2626' : '#059669',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 24,
                  '& .MuiChip-icon': {
                    color: 'inherit'
                  }
                }}
              />
              <Box onClick={handleToggleClick} onMouseDown={(e) => e.stopPropagation()}>
                {statusLoading ? (
                  <CircularProgress size={20} sx={{ color: '#667eea' }} />
                ) : (
                  <Switch
                    checked={groupStatus === 'ACTIVE'}
                    onChange={handleToggleChange}
                    size="small"
                    inputProps={{
                      'aria-label': `Toggle ${group.groupName} status`
                    }}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#059669',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#059669',
                      },
                    }}
                  />
                )}
              </Box>
            </Box>
          )}

          {/* Loading indicator when status is being fetched initially */}
          {!isAdmin && groupStatus === null && statusLoading && (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1.5,
              py: 1,
              borderRadius: 2,
              bgcolor: 'rgba(0, 0, 0, 0.02)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
            }}>
              <CircularProgress size={16} sx={{ color: '#667eea', mr: 1 }} />
              <Typography variant="caption" sx={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                Loading status...
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {group.precedence !== undefined && (
              <Typography variant="caption" sx={{ color: isInactive ? 'rgba(0, 0, 0, 0.55)' : 'rgba(0, 0, 0, 0.6)' }}>
                Precedence: {group.precedence}
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: isInactive ? 'rgba(0, 0, 0, 0.55)' : 'rgba(0, 0, 0, 0.6)' }}>
              Created: {new Date(group.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
