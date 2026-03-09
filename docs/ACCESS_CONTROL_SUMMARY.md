# Book Access Control - Implementation Summary

## 🎯 Business Model (Updated)

### Eligibility-Based Access:
- **PAID_ONLY books** → Have `EligibleCourses` field (always includes `"PAID_USER"`)
- **COURSE_DEFAULT books** → Only visible to that specific course's enrolled users

### EligibleCourses Pattern:
All PAID_ONLY books MUST have `EligibleCourses` array:
```json
{
  "EligibleCourses": ["XII_CBSE", "XII_ICSE", "PAID_USER"]
}
```

**Visibility Rules:**
- **Course user** (e.g., XII_CBSE): Sees book if their course is in `EligibleCourses`
- **PAID_USER member**: Sees ALL books (because `"PAID_USER"` is always included)
- **Anonymous**: Can see and buy ALL books (purchase grants `PAID_USER` membership)

---

## 🛒 Purchase Flow Overview

### Anonymous Users (Non-Registered):
- **Where**: `/books` page - Public catalog of all PAID_ONLY books
- **How to Purchase**:
  1. Browse available books on `/books` page
  2. Click "Buy Now" button on any book card
  3. Fill guest purchase form (name, email, mobile)
  4. Complete payment via Razorpay
  5. After purchase: Book access granted + Cognito account created
  6. Receive email with login credentials
  7. Login to access purchased book in dashboard

### Registered Users (Course-Enrolled):
- **Where**: `/dashboard` page - Personalized course dashboard
- **What They See**:
  - **COURSE_DEFAULT books**: Free books included with course enrollment (unlocked)
  - **PAID_ONLY books**: Premium books eligible for their course (locked with purchase button)
- **How to Purchase**:
  1. View locked book in dashboard (shows lock overlay)
  2. Click "Buy Now" button on lock overlay
  3. Complete payment via Razorpay (pre-filled details)
  4. Dashboard auto-refreshes after payment
  5. Book unlocks immediately - chapters become accessible

### Post-Purchase Access:
- **Anonymous buyers**: Automatically added to `PAID_USER` group → Can access purchased book
- **Registered buyers**: Access granted directly → Book unlocks in their dashboard
- **All purchases**: Tracked in `user-access` table with `PURCHASED` source

---

## 🔍 Implementation Changes Needed

### ✅ Already Implemented (Task 1 - Services):
1. **CognitoService** - User creation, group management
2. **UserAccessService** - Access grants, checks, revocation
3. **PurchaseService** - Razorpay integration, order management

### 📝 Still TODO:

#### **Frontend Display Logic** (React/Next.js):
```typescript
// Pseudo-code for book catalog display
const displayBooks = (allBooks, userGroups, userAccessibleBookIds) => {
  // Extract user's course ID (e.g., "XII_CBSE" from "2025_XII_CBSE")
  const userCourseId = extractCourseId(userGroups); // "XII_CBSE" | null
  const isPaidUser = userGroups.includes('2025_PAID_USER');
  const isAnonymous = !userGroups || userGroups.length === 0;
  
  return allBooks.filter(book => {
    // COURSE_DEFAULT: Show only if user is in that specific course
    if (book.AccessType === 'COURSE_DEFAULT') {
      const bookCourseId = extractCourseIdFromPK(book.PK); // "XII_CBSE"
      return userCourseId === bookCourseId;
    }
    
    // PAID_ONLY: Check EligibleCourses
    if (book.AccessType === 'PAID_ONLY') {
      const eligibleCourses = book.EligibleCourses || [];
      
      // Anonymous users can see all PAID_ONLY books
      if (isAnonymous) {
        return true;
      }
      
      // PAID_USER members can see all PAID_ONLY books
      if (isPaidUser && eligibleCourses.includes('PAID_USER')) {
        return true;
      }
      
      // Course users can see if their course is eligible
      if (userCourseId && eligibleCourses.includes(userCourseId)) {
        return true;
      }
      
      return false;
    }
    
    return false;
  }).map(book => ({
    ...book,
    isLocked: !userAccessibleBookIds.includes(book.id)
  }));
};
```

#### **Backend API Changes**:

1. **GET /v1/courses/{courseId}** (already exists):
   - **Current**: Returns all books in course
   - **Update**: Filter by user's accessible books from `user-access` table
   - **Logic**:
     ```typescript
     // Pseudo-code
     const allBooks = await getCourseBooks(courseId);
     const userAccessibleBookIds = await UserAccessService.getUserAccessibleBooks(username);
     
     const filteredBooks = allBooks.map(book => ({
       ...book,
       isAccessible: book.AccessType === 'COURSE_DEFAULT' 
         ? isUserInCourseGroup(username, courseId)
         : userAccessibleBookIds.includes(book.id)
     }));
     ```

2. **POST /v1/purchase/initiate** (NEW - authenticated):
   - Validate user is logged in
   - Validate bookId exists and is PAID_ONLY
   - Call `PurchaseService.createOrder()`
   - Return Razorpay order details

3. **POST /v1/purchase/initiate-guest** (NEW - public):
   - Validate email, name, mobile (E.164)
   - Check if book is PAID_ONLY
   - Call `PurchaseService.createOrder()`
   - Return Razorpay order details

4. **POST /v1/webhooks/payment** (NEW - public):
   - Verify webhook signature with `PurchaseService.verifyWebhookSignature()`
   - Process payment with `PurchaseService.processPaymentWebhook()`
   - If payment successful:
     - Grant access: `UserAccessService.grantAccess()`
     - Create Cognito user (if guest): `CognitoService.createGuestUser()`
     - Add to group: `CognitoService.addUserToGroup(username, '2025_PAID_USER')`

---

## 🗄️ Database Access Patterns

### Query: "Get user's accessible books"
```typescript
// UserAccessService.getUserAccessibleBooks(username)
// Returns: ['book1', 'book2', 'book3']

// Usage in CourseService
const userBooks = await UserAccessService.getUserAccessibleBooks(username);
const allCourseBooks = await getCourseBooks(courseId);

const accessibleBooks = allCourseBooks.filter(book => 
  book.AccessType === 'COURSE_DEFAULT' 
    ? isUserInCourseGroup(username, courseId)
    : userBooks.includes(book.id)
);
```

### Query: "Check if user has access to specific book"
```typescript
// UserAccessService.hasAccess(username, bookId)
// Returns: boolean

// Usage before serving chapter content
const hasAccess = await UserAccessService.hasAccess(username, bookId);
if (!hasAccess) {
  throw new ForbiddenError('Purchase required');
}
```

---

## 🔐 Access Control Matrix

### XII_CBSE Book (EligibleCourses: ["XII_CBSE", "XII_ICSE", "PAID_USER"])

| User Type | Groups | COURSE_DEFAULT (XII_CBSE) | PAID_ONLY (XII_CBSE book) | PAID_ONLY (XI_CBSE book) |
|-----------|--------|---------------------------|---------------------------|--------------------------|
| Anonymous | - | ❌ Hidden | ✅ Visible (Locked) | ✅ Visible (Locked) |
| XII_CBSE Student | `2025_XII_CBSE` | ✅ Accessible | ✅ Visible (Locked) | ❌ Hidden |
| XI_CBSE Student | `2025_XI_CBSE` | ❌ Hidden | ❌ Hidden | ✅ Visible (Locked) |
| Paid User Only | `2025_PAID_USER` | ❌ Hidden | ✅ Visible (Locked) | ✅ Visible (Locked) |
| XII_CBSE + Paid | `2025_XII_CBSE` + `2025_PAID_USER` | ✅ Accessible | ✅ Visible/Accessible | ✅ Visible (Locked) |

---

## 🚀 Next Steps (Task 2-6 from BACKEND_IMPLEMENTATION_PLAN.md)

### Task 2: Create Validators (`src/validators/purchase-validators.ts`)
```typescript
export const validatePurchaseRequest = (body: any): void => {
  validateRequired(body.bookId, 'bookId');
  validateRequired(body.courseId, 'courseId');
  // ... more validations
};

export const validateGuestPurchaseRequest = (body: any): void => {
  validateRequired(body.email, 'email');
  validateEmail(body.email);
  validateRequired(body.name, 'name');
  validateRequired(body.mobile, 'mobile');
  validateE164Mobile(body.mobile); // +919876543210
  // ... more validations
};
```

### Task 3: Create Handlers
- `src/handlers/purchase/purchase-initiate-handler.ts` (authenticated)
- `src/handlers/purchase/purchase-initiate-guest-handler.ts` (public)
- `src/handlers/purchase/payment-webhook-handler.ts` (public)

### Task 4: Update Existing Files
- `src/handlers/api-handler.ts` - Add public route check
- `src/routing/router.ts` - Add `routePublicRequest()` method
- `src/services/course-service.ts` - Filter books by user access
- `src/types/api-types.ts` - Add purchase-related interfaces

### Task 5: Auto-Grant Logic
- When new COURSE_DEFAULT book created → Grant to all course users
- When user added to course group → Grant all COURSE_DEFAULT books

### Task 6: Helper Methods
- `CourseService.getBookDetails()` - Get book for purchase validation
- `AuthService.extractGroups()` - Parse JWT claims

---

## 📊 Migration Consideration

### Existing Users:
All existing course-enrolled users already have access to COURSE_DEFAULT books (migration script ran in Phase 1).

### New PAID_ONLY Books:
When you add a new PAID_ONLY book to the main table:
1. It becomes immediately visible to ALL users (frontend catalog)
2. Users must purchase to access content
3. No automatic grants needed

### New COURSE_DEFAULT Books:
When you add a new COURSE_DEFAULT book:
1. Run Task 5 auto-grant logic to give access to all enrolled users
2. Only visible to course-enrolled users
3. Hidden from anonymous/PAID_USER-only users
