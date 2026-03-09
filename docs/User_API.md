### 18. List Users (Admin)

#### `GET /v1/admin/users`
**Access**: Admin Only (JWT required + Admin group)
**Description**: List all users from Cognito User Pool with their details

**Request**: None required

**Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
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
        "status": "FORCE_CHANGE_PASSWORD",
        "enabled": true,
        "createdAt": "2025-01-15T11:45:00.000Z",
        "lastModified": "2025-01-15T11:45:00.000Z",
        "givenName": "Jane",
        "familyName": "Smith"
      },
      {
        "username": "admin.user@example.com",
        "email": "admin.user@example.com",
        "status": "CONFIRMED",
        "enabled": true,
        "createdAt": "2024-12-01T08:00:00.000Z",
        "lastModified": "2025-01-01T10:30:00.000Z"
      }
    ],
    "count": 3
  },
  "timestamp": "2025-01-15T16:30:25.456Z"
}
```

**Response Schema**:
- `users` (array): Array of user objects from Cognito User Pool
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
- `count` (number): Total number of users returned

**Important Notes**:
- **Admin Only**: Only users in `Admin` Cognito group can list users
- **No Pagination**: Returns all users from the user pool (up to Cognito's default limit)
- **Optional Fields**: `email`, `givenName`, and `familyName` may not be present for all users
- **Real-time Data**: Fetches current data directly from Cognito User Pool

**User Status Guide**:
- **CONFIRMED**: User can sign in normally
- **FORCE_CHANGE_PASSWORD**: New user who must set a permanent password
- **UNCONFIRMED**: User created but hasn't confirmed their account
- **RESET_REQUIRED**: User needs to reset their password

---

### 19. Invite User (Admin)

#### `POST /v1/admin/users`
**Access**: Admin Only (JWT required + Admin group)
**Description**: Create a new user in Cognito User Pool and assign them to a group

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "givenName": "Alice",
  "familyName": "Johnson",
  "groupName": "2025_XI_CBSE"
}
```

**Request Body Schema**:
- `email` (string, required): User's email address (1-320 characters, valid email format)
- `givenName` (string, required): User's first name (1-100 characters)
- `familyName` (string, required): User's last name (1-100 characters)
- `groupName` (string, required): Cognito group to assign user to (1-128 characters, alphanumeric/underscore/hyphen only)

**Response** (`201 Created`):
```json
{
  "success": true,
  "data": {
    "username": "newuser@example.com",
    "email": "newuser@example.com",
    "status": "FORCE_CHANGE_PASSWORD",
    "givenName": "Alice",
    "familyName": "Johnson",
    "groupName": "2025_XI_CBSE"
  },
  "timestamp": "2025-01-15T16:35:42.123Z"
}
```

**Response Schema**:
- `username` (string): Created user's username (typically same as email)
- `email` (string): User's email address
- `status` (string): Initial user status (always `FORCE_CHANGE_PASSWORD` for new users)
- `givenName` (string): User's first name
- `familyName` (string): User's last name
- `groupName` (string): Cognito group the user was assigned to

**Validation Rules**:
- **Email Format**: Must be a valid email address
- **Name Validation**: Given and family names must be 1-100 characters
- **Group Validation**: Group must exist in the Cognito User Pool
- **Unique Email**: Email address must not already exist in the user pool

**Important Notes**:
- **Admin Only**: Only users in `Admin` Cognito group can invite users
- **Auto-Generated Passwords**: Cognito automatically generates secure temporary passwords
- **Email Not Verified**: New users start with `email_verified: false`
- **No Welcome Email**: Invitation emails are suppressed (`MessageAction: SUPPRESS`)
- **Group Assignment**: User is automatically added to the specified group
- **First Sign-in**: Users must change their password on first sign-in
- **Group Validation**: Endpoint validates that the specified group exists before creating the user

**User Workflow**:
1. Admin creates user via API
2. Admin obtains temporary password from Cognito (outside of API response for security)
3. Admin shares temporary password with user through secure channel
4. User signs in with email and temporary password
5. User is forced to set a new permanent password
6. User gains access to course content based on their assigned group

**Error Responses**:

**400 Bad Request - Validation Error**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Group '2025_INVALID' does not exist in the user pool"
  },
  "timestamp": "2025-01-15T16:35:42.123Z"
}
```

**400 Bad Request - Invalid Email**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format"
  },
  "timestamp": "2025-01-15T16:35:42.123Z"
}
```

**400 Bad Request - User Exists**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "User with email 'existing@example.com' already exists"
  },
  "timestamp": "2025-01-15T16:35:42.123Z"
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
  "timestamp": "2025-01-15T16:35:42.123Z"
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
  "timestamp": "2025-01-15T16:35:42.123Z"
}
```

---

### 20. Get User Details (Admin)

#### `GET /v1/admin/users/{userId}`
**Access**: Admin Only (JWT required + Admin group)
**Description**: Get detailed information about a specific user from Cognito User Pool including their group memberships

**URL Parameters**:
- `userId` (string, required): Target user identifier (username or email)

**Request**: None required

**Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "username": "john.doe@example.com",
    "email": "john.doe@example.com",
    "status": "CONFIRMED",
    "enabled": true,
    "createdAt": "2025-01-10T09:30:00.000Z",
    "lastModified": "2025-01-12T14:22:00.000Z",
    "givenName": "John",
    "familyName": "Doe",
    "groups": ["2025_XI_CBSE", "premium_users"]
  },
  "timestamp": "2025-01-15T16:45:30.456Z"
}
```

**Response Schema**:
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
- `groups` (array): List of Cognito groups the user belongs to

**Important Notes**:
- **Admin Only**: Only users in `Admin` Cognito group can get user details
- **Optional Fields**: `email`, `givenName`, and `familyName` may not be present for all users
- **Real-time Data**: Fetches current data directly from Cognito User Pool
- **Group Information**: Includes complete list of user's group memberships

**Error Responses**:

**404 Not Found**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "User 'nonexistent@example.com' not found"
  },
  "timestamp": "2025-01-15T16:45:30.456Z"
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
  "timestamp": "2025-01-15T16:45:30.456Z"
}
```

---

### 21. Update User Details (Admin)

#### `PATCH /v1/admin/users/{userId}`
**Access**: Admin Only (JWT required + Admin group)
**Description**: Update user details in Cognito User Pool. Supports partial updates - only provided fields will be modified.

**URL Parameters**:
- `userId` (string, required): Target user identifier (username or email)

**Request Body**:
```json
{
  "email": "updated.email@example.com",
  "givenName": "UpdatedFirstName",
  "familyName": "UpdatedLastName"
}
```

**Request Body Schema**:
- `email` (string, optional): User's new email address (valid email format required)
- `givenName` (string, optional): User's new first name (1-100 characters)
- `familyName` (string, optional): User's new last name (1-100 characters)

**Request Body Rules**:
- **At least one field required**: Must provide at least one field to update
- **Partial updates supported**: Only provided fields will be modified
- **Email validation**: Must be valid email format if provided
- **Name validation**: Names cannot be empty and must be ≤100 characters

**Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "username": "john.doe@example.com",
    "email": "updated.email@example.com",
    "givenName": "UpdatedFirstName",
    "familyName": "UpdatedLastName",
    "updatedAt": "2025-01-15T16:50:15.789Z"
  },
  "timestamp": "2025-01-15T16:50:15.789Z"
}
```

**Response Schema**:
- `username` (string): User's username (unchanged)
- `email` (string, optional): Updated email address (only if provided in request)
- `givenName` (string, optional): Updated first name (only if provided in request)
- `familyName` (string, optional): Updated last name (only if provided in request)
- `updatedAt` (string): ISO timestamp when the update was performed

**Important Notes**:
- **Admin Only**: Only users in `Admin` Cognito group can update user details
- **Partial Updates**: Only fields provided in request body will be updated
- **Username Immutable**: Username cannot be changed and will remain the same
- **Email Verification**: Updated email addresses start as unverified in Cognito
- **Atomic Operation**: All provided updates are applied together or none at all

**Error Responses**:

**400 Bad Request - No Fields**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

## 🔐 User Access Control

### Regular Users
- **JWT Groups**: `2025_{COURSE_ID}` (e.g., `2025_XI_CBSE`)
- **Access**: Single assigned course only
- **Permissions**: Read-only access to ACTIVE/PUBLISHED content
- **Group Membership**: Can only belong to one group at a time

### Admin Users  
- **JWT Groups**: `Admin`
- **Access**: All courses and content
- **Permissions**: Full read/write access including DRAFT/INACTIVE content, file uploads
- **Group Membership**: Can only belong to one group at a time

### Group Membership Constraints
- **Single Group Policy**: All users (regular and admin) can only be members of one Cognito group at a time
- **Enforcement**: System validates and prevents multiple group memberships
- **Migration**: To move users between groups, remove from current group first, then add to new group

---

## 📝 Implementation Notes

### File Upload Flow
1. **Phase 1**: Call `POST /v1/upload/` to get presigned URLs
2. **Phase 2**: Upload files directly to S3 using presigned URLs  
3. **Phase 3**: Call `POST /v1/upload/{uploadId}/complete` to finalize

### Content Visibility
- **Regular Users**: Only see ACTIVE/PUBLISHED content
- **Admin Users**: See all content regardless of status

### Rate Limits
- **Development**: 100 requests/second, burst 200
- **Production**: 2000 requests/second, burst 4000

### Request Size Limits
- **JSON Body**: 6MB maximum
- **File Upload**: 25MB (PDF), 2GB (Video)

---

**Generated on**: $(date)  
**API Version**: v1  
**Documentation Version**: 1.0 

---

### 23. Reset User Password (Admin)

#### `POST /v1/admin/users/{userId}/password/reset`
**Access**: Admin Only (JWT required + Admin group)
**Description**: Reset a user's password, forcing them to set a new password on next sign-in. This invalidates their current password and sets their status to FORCE_CHANGE_PASSWORD.

**URL Parameters**:
- `userId` (string, required): Target user identifier (username or email)

**Request**: None required

**Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "username": "john.doe@example.com",
    "message": "Password reset successfully. User will need to set a new password on next sign-in.",
    "resetAt": "2025-01-15T17:10:30.456Z"
  },
  "timestamp": "2025-01-15T17:10:30.456Z"
}
```

**Response Schema**:
- `username` (string): Username of the user whose password was reset
- `message` (string): Confirmation message explaining next steps
- `resetAt` (string): ISO timestamp when the password reset was performed

**Important Notes**:
- **Admin Only**: Only users in `Admin` Cognito group can reset passwords
- **Immediate Effect**: User's current password becomes invalid immediately
- **Force Change**: User status changes to `FORCE_CHANGE_PASSWORD`
- **Next Sign-in**: User must set a new password when they next attempt to sign in
- **Security**: Admin cannot see the new password - user sets it themselves
- **Audit Trail**: All password reset operations are logged

**Use Cases**:
- User forgot their password and requests admin assistance
- Compromised account requiring immediate password invalidation
- New user onboarding when temporary password is not suitable
- Security incident requiring immediate access revocation

**Error Responses**:

**404 Not Found**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "User 'nonexistent@example.com' not found"
  },
  "timestamp": "2025-01-15T17:10:30.456Z"
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
  "timestamp": "2025-01-15T17:10:30.456Z"
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
  "timestamp": "2025-01-15T17:10:30.456Z"
}
```

---

### 24. Set Temporary Password (Admin)

#### `POST /v1/admin/users/{userId}/password/set-temporary`
**Access**: Admin Only (JWT required + Admin group)
**Description**: Set a specific temporary password for a user that they must change on next sign-in. Useful for providing users with a known password for initial access.

**URL Parameters**:
- `userId` (string, required): Target user identifier (username or email)

**Request Body**:
```json
{
  "temporaryPassword": "TempPass123!"
}
```

**Request Body Schema**:
- `temporaryPassword` (string, required): The temporary password to set for the user

**Password Requirements**:
- **Length**: 8-128 characters
- **Complexity**: Must contain at least one:
  - Lowercase letter (a-z)
  - Uppercase letter (A-Z)
  - Number (0-9)
  - Special character (!@#$%^&*(),.?":{}|<>)

**Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "username": "john.doe@example.com",
    "message": "Temporary password set successfully. User must change password on next sign-in.",
    "setAt": "2025-01-15T17:15:45.789Z"
  },
  "timestamp": "2025-01-15T17:15:45.789Z"
}
```

**Response Schema**:
- `username` (string): Username of the user whose password was set
- `message` (string): Confirmation message explaining next steps
- `setAt` (string): ISO timestamp when the temporary password was set

**Important Notes**:
- **Admin Only**: Only users in `Admin` Cognito group can set temporary passwords
- **Temporary Nature**: Password expires after first use and must be changed
- **Force Change**: User status changes to `FORCE_CHANGE_PASSWORD`
- **Known Password**: Unlike reset, admin provides the specific password
- **Secure Transmission**: Admin should share password through secure channels
- **One-time Use**: User must change password on first successful sign-in

**Use Cases**:
- New user onboarding with a known initial password
- Bulk user creation with standardized temporary passwords
- Emergency access when user needs immediate credentials
- Controlled password distribution for training or demo accounts

**Workflow Example**:
1. Admin sets temporary password via API
2. Admin securely shares password with user (email, phone, etc.)
3. User signs in with temporary password
4. Cognito forces user to set a new permanent password
5. User gains normal access with their chosen password

**Error Responses**:

**400 Bad Request - Missing Password**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "temporaryPassword is required and must be a string"
  },
  "timestamp": "2025-01-15T17:15:45.789Z"
}
```

**400 Bad Request - Password Too Short**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Temporary password must be at least 8 characters long"
  },
  "timestamp": "2025-01-15T17:15:45.789Z"
}
```

**400 Bad Request - Password Complexity**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Temporary password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
  },
  "timestamp": "2025-01-15T17:15:45.789Z"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "User 'nonexistent@example.com' not found"
  },
  "timestamp": "2025-01-15T17:15:45.789Z"
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
  "timestamp": "2025-01-15T17:15:45.789Z"
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
  "timestamp": "2025-01-15T17:15:45.789Z"
}
```