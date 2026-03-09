import { useState, useCallback } from 'react'
import { useApiClient } from './useApiClient'

export interface GroupStatus {
  groupName: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string | null
  updatedAt: string | null
  deactivatedAt: string | null
}

export interface MigrationFailure {
  username: string
  step: 'remove' | 'add' | 'grant'
  error: string
}

export interface MigrationUserInfo {
  username: string
  email?: string
  status: string
  enabled: boolean
  givenName?: string
  familyName?: string
}

export interface BatchMigrateResult {
  sourceGroup: string
  targetGroup: string
  dryRun: boolean
  sourceDeactivated: boolean
  deactivationError?: string
  totalUsers: number
  migrated: number
  failed: number
  failures: MigrationFailure[]
  users?: MigrationUserInfo[]
}

export interface BatchMigrateRequest {
  sourceGroup: string
  targetGroup: string
  deactivateSource?: boolean
  dryRun?: boolean
}

export const useGroups = (): {
  availableGroups: string[] | null
  loadingGroups: boolean
  groupError: string | null
  loadAvailableGroups: () => Promise<void>
  addUserToGroup: (userId: string, groupName: string) => Promise<any>
  removeUserFromGroup: (userId: string, groupName: string) => Promise<any>
  loadGroupsData: () => Promise<any>
  loadGroupUsers: (groupName: string) => Promise<any>
  getGroupStatus: (groupName: string) => Promise<GroupStatus>
  updateGroupStatus: (groupName: string, status: 'ACTIVE' | 'INACTIVE') => Promise<GroupStatus>
  batchMigrate: (request: BatchMigrateRequest) => Promise<BatchMigrateResult>
} => {
  const { apiCall } = useApiClient()
  const [availableGroups, setAvailableGroups] = useState<string[]>([])
  const [loadingGroups, setLoadingGroups] = useState(false)
  const [groupError, setGroupError] = useState<string | null>(null)

  const loadAvailableGroups = useCallback(async (): Promise<void> => {
    setLoadingGroups(true)
    setGroupError(null)
    
    try {
      const apiResponse = await apiCall('/admin/groups')
      const { groups } = apiResponse.data
      // Extract group names
      const groupNames = groups.map((g: any) => g.groupName)
      setAvailableGroups(groupNames)
    } catch (error) {
      console.error('Error loading groups:', error)
      setGroupError(error instanceof Error ? error.message : 'Failed to load groups')
    } finally {
      setLoadingGroups(false)
    }
  }, [apiCall])

  const addUserToGroup = useCallback(async (userId: string, groupName: string) => {
    const apiResponse = await apiCall(
      `/admin/users/${encodeURIComponent(userId)}/groups/${encodeURIComponent(groupName)}`,
      { method: 'PUT' }
    )
    return apiResponse
  }, [apiCall])

  const removeUserFromGroup = useCallback(async (userId: string, groupName: string) => {
    const apiResponse = await apiCall(
      `/admin/users/${encodeURIComponent(userId)}/groups/${encodeURIComponent(groupName)}`,
      { method: 'DELETE' }
    )
    return apiResponse
  }, [apiCall])

  const loadGroupsData = useCallback(async () => {
    const apiResponse = await apiCall('/admin/groups')
    return apiResponse.data.groups
  }, [apiCall])

  const loadGroupUsers = useCallback(async (groupName: string) => {
    const apiResponse = await apiCall(`/admin/groups/${encodeURIComponent(groupName)}/users`)
    return apiResponse.data.users
  }, [apiCall])

  const getGroupStatus = useCallback(async (groupName: string): Promise<GroupStatus> => {
    const apiResponse = await apiCall(`/admin/groups/${encodeURIComponent(groupName)}/status`)
    return apiResponse.data
  }, [apiCall])

  const updateGroupStatus = useCallback(async (groupName: string, status: 'ACTIVE' | 'INACTIVE'): Promise<GroupStatus> => {
    const apiResponse = await apiCall(
      `/admin/groups/${encodeURIComponent(groupName)}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status })
      }
    )
    return apiResponse.data
  }, [apiCall])

  const batchMigrate = useCallback(async (request: BatchMigrateRequest): Promise<BatchMigrateResult> => {
    const apiResponse = await apiCall('/admin/migrate-batch', {
      method: 'POST',
      body: JSON.stringify(request)
    })
    return apiResponse.data
  }, [apiCall])

  return {
    availableGroups,
    loadingGroups,
    groupError,
    loadAvailableGroups,
    addUserToGroup,
    removeUserFromGroup,
    loadGroupsData,
    loadGroupUsers,
    getGroupStatus,
    updateGroupStatus,
    batchMigrate
  }
}