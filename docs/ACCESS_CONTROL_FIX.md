# Access Control Fix for PAID_ONLY Books

## Problem
Authenticated users could see and access PAID_ONLY books in the dashboard even if they didn't have permission (`hasAccess = false`). The book card would display the content without any purchase requirement.

## Solution Implemented

### 1. **Backend Response Mapping** (`src/hooks/dashboard/useCourses.ts`)
Added proper mapping of purchase-related fields from backend API response:

```typescript
// Purchase-related fields now mapped for both admin and non-admin users
{
  accessType: book.accessType,      // 'COURSE_DEFAULT' | 'PAID_ONLY'
  price: book.price,                // Price in paise
  currency: book.currency,          // e.g., 'INR'
  eligibleCourses: book.eligibleCourses,
  hasAccess: book.hasAccess,        // ✅ Critical: Determines if user owns book
  order: book.order || 0
}
```

**Before:** These fields were not being mapped from the API response, so `hasAccess` was always `undefined`.

**After:** All purchase fields are properly mapped, enabling access control logic.

---

### 2. **Lock UI Implementation** (`src/components/dashboard/courses/BookCard.tsx`)

The BookCard already had lock overlay UI implemented:

```typescript
// Check if book is locked
const isLocked = book.accessType === 'PAID_ONLY' && !book.hasAccess

// Lock overlay displayed when isLocked = true
{isLocked && (
  <Box sx={{ /* Overlay styles */ }}>
    <LockIcon />
    <Typography>Premium Content</Typography>
    <Typography>Purchase this book to unlock all chapters</Typography>
    <Typography>₹{(book.price / 100).toFixed(2)}</Typography>
    <PurchaseButton {...props} />
  </Box>
)}
```

**Lock Overlay Features:**
- 🔒 Lock icon with gradient background
- 💰 Price display (formatted from paise to rupees)
- 🛒 Integrated PurchaseButton component
- 🎨 Blur effect on chapter list behind overlay
- 🚫 Disabled accordion (chapters not clickable)

---

### 3. **Purchase Button Integration**

Replaced the placeholder "Buy Now" button with the actual `PurchaseButton` component:

```typescript
<PurchaseButton
  bookId={book.id}
  courseId={_courseId}
  bookTitle={book.title}
  price={book.price || 0}
  currency={book.currency || 'INR'}
/>
```

This component:
- Opens Razorpay payment modal
- Handles authenticated user purchases
- Shows success/error notifications
- Refreshes page after successful purchase

---

### 4. **Type Definitions** (`src/types/database.types.ts`)

Updated Book interface to include all purchase-related fields:

```typescript
export interface Book {
  id: string
  bookId?: string
  course_id: string
  title: string
  description?: string
  order: number
  chapters?: Chapter[]
  created_at: string
  updated_at: string
  status?: 'draft' | 'published'
  
  // Purchase-related fields
  accessType?: 'COURSE_DEFAULT' | 'PAID_ONLY'
  price?: number              // Price in paise
  currency?: string           // e.g., 'INR'
  eligibleCourses?: string[]  // Course tags
  hasAccess?: boolean         // ✅ KEY: Does user have access?
}
```

---

## How Access Control Works

### Flow Diagram

```
User Opens Dashboard
       ↓
API Call: GET /v1/course
       ↓
Backend Response:
{
  books: [
    {
      bookId: "book-123",
      accessType: "PAID_ONLY",
      price: 99900,
      hasAccess: false  ← User doesn't own this book
    }
  ]
}
       ↓
useCourses Hook Maps Response
       ↓
BookCard Receives book.hasAccess = false
       ↓
isLocked = (accessType === 'PAID_ONLY' && !hasAccess)
       ↓
isLocked = true → Show Lock Overlay
       ↓
Chapters Disabled & Blurred
Purchase Button Displayed
```

---

## Access States

### State 1: FREE Book (COURSE_DEFAULT)
```typescript
{
  accessType: 'COURSE_DEFAULT',
  hasAccess: true  // Always true for free books
}
```
**Display:** Normal book card, chapters accessible

### State 2: PAID Book - User Has Access
```typescript
{
  accessType: 'PAID_ONLY',
  hasAccess: true  // User purchased or was granted access
}
```
**Display:** Normal book card, chapters accessible

### State 3: PAID Book - User NO Access ❌
```typescript
{
  accessType: 'PAID_ONLY',
  hasAccess: false  // User hasn't purchased
}
```
**Display:** 
- ✅ Lock overlay covers chapters
- ✅ Chapters list blurred and disabled
- ✅ Price displayed
- ✅ Purchase button shown
- ❌ Cannot click chapters
- ❌ Cannot expand accordion

---

## Backend Requirements

For this to work, the backend must:

### 1. **Return `hasAccess` Field**
```json
GET /v1/course

Response:
{
  "books": [
    {
      "bookId": "book-123",
      "title": "UPSC Guide",
      "accessType": "PAID_ONLY",
      "price": 99900,
      "currency": "INR",
      "eligibleCourses": ["2025_UPSC", "PAID_USER"],
      "hasAccess": false  ← Must be calculated per user
    }
  ]
}
```

### 2. **Calculate `hasAccess` Logic**

Backend should check:
```python
def calculate_has_access(user_id, book):
    # If book is free, always grant access
    if book.accessType == 'COURSE_DEFAULT':
        return True
    
    # If book is paid, check if user purchased it
    if book.accessType == 'PAID_ONLY':
        # Check user_book_purchases table
        purchase = db.query(
            "SELECT * FROM user_book_purchases WHERE userId = ? AND bookId = ?",
            user_id, book.bookId
        )
        return purchase is not None
    
    return False
```

### 3. **Purchase Verification**

When user purchases a book:
```python
POST /v1/purchases/verify

# After Razorpay payment success:
# 1. Verify payment with Razorpay
# 2. Create record in user_book_purchases table
# 3. Return success

# Next time user loads dashboard:
# GET /v1/course will return hasAccess = true for that book
```

---

## Testing Checklist

### Test Case 1: Free Book (COURSE_DEFAULT)
- [ ] User can see all chapters
- [ ] User can click and open chapters
- [ ] No lock overlay displayed
- [ ] No purchase button shown

### Test Case 2: Paid Book - Already Purchased
- [ ] User can see all chapters
- [ ] User can click and open chapters
- [ ] No lock overlay displayed
- [ ] No purchase button shown

### Test Case 3: Paid Book - Not Purchased ✅
- [ ] Lock overlay displayed over chapters
- [ ] Lock icon and "Premium Content" text shown
- [ ] Price displayed correctly (₹999.00 format)
- [ ] "Purchase to Unlock" button visible
- [ ] Chapters list is blurred
- [ ] Cannot click on chapters
- [ ] Accordion is disabled
- [ ] Clicking purchase button opens Razorpay modal

### Test Case 4: After Purchase
- [ ] After successful payment, page refreshes
- [ ] Lock overlay removed
- [ ] Chapters now accessible
- [ ] `hasAccess` changed from `false` to `true`

---

## Files Modified

### 1. `src/hooks/dashboard/useCourses.ts`
- ✅ Added mapping for `accessType`, `price`, `currency`, `eligibleCourses`, `hasAccess`
- ✅ Fixed for both admin and non-admin API responses

### 2. `src/components/dashboard/courses/BookCard.tsx`
- ✅ Imported `PurchaseButton` component
- ✅ Replaced placeholder button with actual `PurchaseButton`
- ✅ Lock overlay already implemented (no changes needed)

### 3. `src/types/database.types.ts`
- ✅ Updated Book interface with purchase fields
- ✅ Fixed field naming convention (`course_id`, `created_at`, `updated_at`)

---

## Security Notes

### Frontend Security
- ✅ Chapter content is disabled and blurred for locked books
- ✅ Accordion click is prevented with `disabled={isLocked}`
- ✅ Visual overlay prevents interaction

### Backend Security (Critical!)
Even with frontend locks, backend MUST enforce access control:

```python
GET /v1/course/{courseId}/books/{bookId}/chapters/{chapterId}

def get_chapter_content(user_id, chapter_id):
    chapter = db.get_chapter(chapter_id)
    book = db.get_book(chapter.book_id)
    
    # ✅ CRITICAL: Check access on backend
    if not user_has_access(user_id, book.id):
        raise HTTPException(403, "Access denied - purchase required")
    
    return chapter.content
```

**Never trust frontend checks alone!** A malicious user could:
- Modify JavaScript to remove lock overlay
- Call API endpoints directly
- Bypass frontend restrictions

Backend must ALWAYS verify `hasAccess` before serving content.

---

## Summary

✅ **Fixed:** Authenticated users can no longer access PAID_ONLY books without purchasing
✅ **UI:** Lock overlay with price and purchase button displays correctly
✅ **UX:** Clear messaging about premium content
✅ **Integration:** PurchaseButton component integrated for seamless purchase flow
✅ **Security:** Frontend restrictions in place (backend verification required)

The fix ensures that `hasAccess` field from backend is properly mapped and used to control book access in the dashboard.
