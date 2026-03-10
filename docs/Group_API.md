---

### 25. Add User to Group (Admin)

#### `PUT /v1/admin/users/{userId}/groups/{groupName}`
**Access**: Admin Only (JWT required + Admin group)
**Description**: Add a user to a specific Cognito group. This grants the user permissions associated with that group. **Important**: Users can only belong to one group at a time - attempting to add a user who is already in another group will result in an error.

**URL Parameters**:
- `userId` (string, required): Target user identifier (username or email)
- `groupName` (string, required): Name of the Cognito group to add user to

**Request**: None required

**Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "username": "john.doe@example.com",
    "groupName": "2025_XI_CBSE",
    "message": "User successfully added to group '2025_XI_CBSE'",
    "addedAt": "2025-01-15T17:25:30.456Z"
  },
  "timestamp": "2025-01-15T17:25:30.456Z"
}
```

**Response Schema**:
- `username` (string): Username of the user who was added to the group
- `groupName` (string): Name of the group the user was added to
- `message` (string): Confirmation message
- `addedAt` (string): ISO timestamp when the user was added to the group

**Group Name Validation**:
- **Format**: 1-128 characters containing only letters, numbers, underscores, and hyphens
- **Existence**: Group must exist in the Cognito User Pool
- **Examples**: `2025_XI_CBSE`, `Admin`, `premium-users`, `test_group`

**Single Group Constraint**:
- **One Group Per User**: Each user can only belong to one Cognito group at a time
- **Validation Check**: System verifies user is not already in any group before adding
- **Required Workflow**: To move a user to a different group, first remove them from their current group using `DELETE /v1/admin/users/{userId}/groups/{groupName}`, then add them to the new group

**Important Notes**:
- **Admin Only**: Only users in `Admin` Cognito group can manage group memberships
- **Single Group Policy**: Users cannot be members of multiple groups simultaneously
- **Immediate Effect**: User gains group permissions immediately
- **Group Validation**: Both user and group existence are verified before operation
- **Access Control**: Group membership determines what courses/content users can access
- **Pre-assignment Check**: System validates user is not already in any group before assignment

**Use Cases**:
- Enroll student in a new course (add to course group)
- Grant admin privileges (add to Admin group)
- Provide access to premium content (add to premium group)
- Assign users to specific cohorts or batches
- Move users between different access levels (after removing from current group)

**Workflow for Moving Users Between Groups**:
1. Remove user from current group: `DELETE /v1/admin/users/{userId}/groups/{currentGroup}`
2. Add user to new group: `PUT /v1/admin/users/{userId}/groups/{newGroup}`

**Error Responses**:

**400 Bad Request - Invalid Group Name**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Group name must be 1-128 characters and contain only letters, numbers, underscores, and hyphens"
  },
  "timestamp": "2025-01-15T17:25:30.456Z"
}
```

**400 Bad Request - User Already in Group**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "User 'john.doe@example.com' is already a member of group(s): 2025_XII_CBSE. Users can only belong to one group at a time. Please remove the user from their current group before adding them to a new one."
  },
  "timestamp": "2025-01-15T17:25:30.456Z"
}
```

**404 Not Found - User**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "User 'nonexistent@example.com' not found"
  },
  "timestamp": "2025-01-15T17:25:30.456Z"
}
```

**404 Not Found - Group**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Group '2025_INVALID_COURSE' does not exist in the user pool"
  },
  "timestamp": "2025-01-15T17:25:30.456Z"
}
```

**403 Forbidden**:
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Access denied: This endpoint requires admin privileges. Please contact your administrator if you believe you should have access to this feature."
  },
  "timestamp": "2025-01-15T17:25:30.456Z"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "USER_POOL_ID environment variable not configured"
  },
  "timestamp": "2025-01-15T17:25:30.456Z"
}
```

---

### 26. Remove User from Group (Admin)

#### `DELETE /v1/admin/users/{userId}/groups/{groupName}`
**Access**: Admin Only (JWT required + Admin group)
**Description**: Remove a user from a specific Cognito group. This revokes the permissions associated with that group.

**URL Parameters**:
- `userId` (string, required): Target user identifier (username or email)
- `groupName` (string, required): Name of the Cognito group to remove user from

**Request**: None required

**Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "username": "john.doe@example.com",
    "groupName": "2025_XI_CBSE",
    "message": "User successfully removed from group '2025_XI_CBSE'",
    "removedAt": "2025-01-15T17:30:45.789Z"
  },
  "timestamp": "2025-01-15T17:30:45.789Z"
}
```

**Response Schema**:
- `username` (string): Username of the user who was removed from the group
- `groupName` (string): Name of the group the user was removed from
- `message` (string): Confirmation message
- `removedAt` (string): ISO timestamp when the user was removed from the group

**Group Name Validation**:
- **Format**: 1-128 characters containing only letters, numbers, underscores, and hyphens
- **Existence**: Group must exist in the Cognito User Pool
- **Membership**: User must currently be a member of the group

**Important Notes**:
- **Admin Only**: Only users in `Admin` Cognito group can manage group memberships
- **Membership Verification**: Endpoint verifies user is actually in the group before removal
- **Immediate Effect**: User loses group permissions immediately
- **Access Revocation**: Removing from course groups revokes access to course content
- **Security**: Useful for revoking access when users change plans or leave

**Use Cases**:
- Remove student from course when enrollment ends
- Revoke admin privileges (remove from Admin group)
- Downgrade from premium to basic access
- Remove users from expired cohorts or batches
- Security incident response (immediate access revocation)

**Security Considerations**:
- **Course Access**: Removing from course groups immediately blocks content access
- **Admin Privileges**: Removing from Admin group revokes all administrative capabilities
- **Token Validity**: Existing JWT tokens remain valid until expiration, but new permissions apply to new tokens

**Error Responses**:

**400 Bad Request - Invalid Group Name**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Group name must be 1-128 characters and contain only letters, numbers, underscores, and hyphens"
  },
  "timestamp": "2025-01-15T17:30:45.789Z"
}
```

**404 Not Found - User**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "User 'nonexistent@example.com' not found"
  },
  "timestamp": "2025-01-15T17:30:45.789Z"
}
```

**404 Not Found - Group**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Group '2025_INVALID_COURSE' does not exist in the user pool"
  },
  "timestamp": "2025-01-15T17:30:45.789Z"
}
```

**404 Not Found - Not Member**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "User 'john.doe@example.com' is not a member of group '2025_XI_CBSE'"
  },
  "timestamp": "2025-01-15T17:30:45.789Z"
}
```

**403 Forbidden**:
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Access denied: This endpoint requires admin privileges. Please contact your administrator if you believe you should have access to this feature."
  },
  "timestamp": "2025-01-15T17:30:45.789Z"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "USER_POOL_ID environment variable not configured"
  },
  "timestamp": "2025-01-15T17:30:45.789Z"
}
```

---

### 27. List All Groups (Admin)

#### `GET /v1/admin/groups`
**Access**: Admin Only (JWT required + Admin group)
**Description**: List all groups from Cognito User Pool with their details and metadata

**Request**: None required

**Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "groups": [
      {
        "groupName": "Admin",
        "description": "Administrative users with full system access",
        "precedence": 1,
        "createdAt": "2024-12-01T08:00:00.000Z",
        "lastModified": "2024-12-15T10:30:00.000Z",
        "roleArn": "arn:aws:iam::123456789012:role/AdminRole"
      },
      {
        "groupName": "2025_XI_CBSE",
        "description": "Class XI CBSE students for 2025 batch",
        "precedence": 10,
        "createdAt": "2024-11-01T12:00:00.000Z",
        "lastModified": "2025-01-10T14:22:00.000Z"
      },
      {
        "groupName": "2025_XII_CBSE",
        "description": "Class XII CBSE students for 2025 batch",
        "precedence": 10,
        "createdAt": "2024-11-01T12:00:00.000Z",
        "lastModified": "2025-01-10T14:22:00.000Z"
      },
      {
        "groupName": "premium_users",
        "description": "Users with premium content access",
        "precedence": 5,
        "createdAt": "2024-10-15T09:30:00.000Z",
        "lastModified": "2025-01-05T16:45:00.000Z"
      }
    ],
    "count": 4
  },
  "timestamp": "2025-01-15T17:40:15.456Z"
}
```

**Response Schema**:
- `groups` (array): Array of group objects from Cognito User Pool
  - `groupName` (string): Unique group identifier
  - `description` (string, optional): Human-readable group description
  - `precedence` (number, optional): Group precedence for priority ordering (lower = higher priority)
  - `createdAt` (string): ISO timestamp when group was created
  - `lastModified` (string): ISO timestamp when group was last modified
  - `roleArn` (string, optional): AWS IAM role ARN associated with the group
- `count` (number): Total number of groups returned

**Important Notes**:
- **Admin Only**: Only users in `Admin` Cognito group can list groups
- **Complete Metadata**: Returns all group properties including optional fields
- **No Pagination**: Returns all groups from the user pool
- **Real-time Data**: Fetches current data directly from Cognito User Pool
- **Group Precedence**: Lower numbers indicate higher priority groups

**Use Cases**:
- Display available groups in admin dashboard
- Group management interface
- User assignment workflows
- System configuration and auditing

**Error Responses**:

**403 Forbidden**:
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Access denied: This endpoint requires admin privileges. Please contact your administrator if you believe you should have access to this feature."
  },
  "timestamp": "2025-01-15T17:40:15.456Z"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "USER_POOL_ID environment variable not configured"
  },
  "timestamp": "2025-01-15T17:40:15.456Z"
}
```

---

### 28. Get Group Details (Admin)

#### `GET /v1/admin/groups/{groupName}`
**Access**: Admin Only (JWT required + Admin group)
**Description**: Get detailed information about a specific group from Cognito User Pool

**URL Parameters**:
- `groupName` (string, required): Name of the group to retrieve details for

**Request**: None required

**Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "groupName": "2025_XI_CBSE",
    "description": "Class XI CBSE students for 2025 batch",
    "precedence": 10,
    "createdAt": "2024-11-01T12:00:00.000Z",
    "lastModified": "2025-01-10T14:22:00.000Z"
  },
  "timestamp": "2025-01-15T17:45:30.789Z"
}
```

**Response Schema**:
- `groupName` (string): Unique group identifier
- `description` (string, optional): Human-readable group description
- `precedence` (number, optional): Group precedence for priority ordering
- `createdAt` (string): ISO timestamp when group was created
- `lastModified` (string): ISO timestamp when group was last modified
- `roleArn` (string, optional): AWS IAM role ARN associated with the group

**Group Name Validation**:
- **Format**: 1-128 characters containing only letters, numbers, underscores, and hyphens
- **Examples**: `Admin`, `2025_XI_CBSE`, `premium-users`, `test_group`

**Important Notes**:
- **Admin Only**: Only users in `Admin` Cognito group can get group details
- **Complete Information**: Returns all available group metadata
- **Real-time Data**: Fetches current data directly from Cognito User Pool
- **Optional Fields**: `description`, `precedence`, and `roleArn` may not be present for all groups

**Use Cases**:
- Group configuration management
- Audit group settings and permissions
- Display group information in admin interface
- Validate group existence before operations

**Error Responses**:

**400 Bad Request - Invalid Group Name**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Group name must be 1-128 characters and contain only letters, numbers, underscores, and hyphens"
  },
  "timestamp": "2025-01-15T17:45:30.789Z"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Group '2025_INVALID_COURSE' not found"
  },
  "timestamp": "2025-01-15T17:45:30.789Z"
}
```

**403 Forbidden**:
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Access denied: This endpoint requires admin privileges. Please contact your administrator if you believe you should have access to this feature."
  },
  "timestamp": "2025-01-15T17:45:30.789Z"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "USER_POOL_ID environment variable not configured"
  },
  "timestamp": "2025-01-15T17:45:30.789Z"
}
```

---

### 29. Get Group Users (Admin)

#### `GET /v1/admin/groups/{groupName}/users`
**Access**: Admin Only (JWT required + Admin group)
**Description**: Get all users that belong to a specific group from Cognito User Pool with their details

**URL Parameters**:
- `groupName` (string, required): Name of the group to get users from

**Request**: None required

**Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "groupName": "2025_XI_CBSE",
    "users": [
      {
        "username": "john.doe@example.com",
        "email": "john.doe@example.com",
        "status": "CONFIRMED",
        "enabled": true,
        "createdAt": "2025-01-10T09:30:00.000Z",
        "lastModified": "2025-01-12T14:22:00.000Z",
        "givenName": "John",
        "familyName": "Doe"
      },
      {
        "username": "jane.smith@example.com",
        "email": "jane.smith@example.com",
        "status": "CONFIRMED",
        "enabled": true,
        "createdAt": "2025-01-08T11:15:00.000Z",
        "lastModified": "2025-01-08T11:15:00.000Z",
        "givenName": "Jane",
        "familyName": "Smith"
      },
      {
        "username": "student@example.com",
        "email": "student@example.com",
        "status": "FORCE_CHANGE_PASSWORD",
        "enabled": true,
        "createdAt": "2025-01-15T16:00:00.000Z",
        "lastModified": "2025-01-15T16:00:00.000Z"
      }
    ],
    "count": 3
  },
  "timestamp": "2025-01-15T17:50:45.123Z"
}
```

**Response Schema**:
- `groupName` (string): Name of the group being queried
- `users` (array): Array of user objects in the group
  - `username` (string): User's username (typically email address)
  - `email` (string, optional): User's email address
  - `status` (string): Cognito user status
    - `CONFIRMED`: User has been confirmed and can sign in
    - `FORCE_CHANGE_PASSWORD`: User must change password on first sign-in
    - `UNCONFIRMED`: User account created but not confirmed
    - `RESET_REQUIRED`: User must reset password
  - `enabled` (boolean): Whether the user account is enabled
  - `createdAt` (string): ISO timestamp when user was created
  - `lastModified` (string): ISO timestamp when user was last modified
  - `givenName` (string, optional): User's first name
  - `familyName` (string, optional): User's last name
- `count` (number): Total number of users in the group

**Group Name Validation**:
- **Format**: 1-128 characters containing only letters, numbers, underscores, and hyphens
- **Existence**: Group must exist in the Cognito User Pool

**Important Notes**:
- **Admin Only**: Only users in `Admin` Cognito group can get group users
- **Complete User Data**: Returns full user profiles for all group members
- **Real-time Data**: Fetches current data directly from Cognito User Pool
- **Optional Fields**: `email`, `givenName`, and `familyName` may not be present for all users
- **Group Validation**: Verifies group exists before attempting to list users

**Use Cases**:
- View all students enrolled in a specific course
- Audit group membership
- Bulk operations on group members
- Generate class rosters or student lists
- Administrative oversight of user distribution

**Performance Considerations**:
- **Large Groups**: Response time increases with group size
- **No Pagination**: Returns all users in the group
- **Memory Usage**: Large groups may result in substantial response payloads

**Error Responses**:

**400 Bad Request - Invalid Group Name**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Group name must be 1-128 characters and contain only letters, numbers, underscores, and hyphens"
  },
  "timestamp": "2025-01-15T17:50:45.123Z"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Group '2025_INVALID_COURSE' not found"
  },
  "timestamp": "2025-01-15T17:50:45.123Z"
}
```

**403 Forbidden**:
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Access denied: This endpoint requires admin privileges. Please contact your administrator if you believe you should have access to this feature."
  },
  "timestamp": "2025-01-15T17:50:45.123Z"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "USER_POOL_ID environment variable not configured"
  },
  "timestamp": "2025-01-15T17:50:45.123Z"
}
```