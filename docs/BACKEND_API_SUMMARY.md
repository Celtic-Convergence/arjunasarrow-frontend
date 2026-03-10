# Backend API Summary - Public Books Feature

## ✅ Current Backend Implementation

Based on the user's shared API structure, here's what the backend currently returns:

---

## 1. Create Book API (Admin)

### Endpoint
```
POST /api/v1/admin/courses/{courseId}/books
Authorization: Bearer <admin-token>
```

### Request Body
```json
{
  "title": "UPSC Prelims 2025 Guide",
  "description": "Comprehensive prep material with practice questions and previous papers.",
  "accessType": "PAID_ONLY",
  "price": 99900,
  "currency": "INR",
  "eligibleCourses": ["2025_UPSC_PRELIMS", "PAID_USER"]
}
```

### Notes
- ✅ Already accepts `description` field
- ✅ Supports `accessType`, `price`, `currency`, `eligibleCourses`
- Path includes `{courseId}` as route parameter (e.g., `XII_CBSE`)

---

## 2. Public Books API (Guest Users)

### Endpoint
```
GET /api/v1/books/public
No Authorization Required
```

### Response Structure
```json
{
  "success": true,
  "data": {
    "books": [
      {
        "bookId": "upsc-guide-123",
        "title": "UPSC Prelims 2025 Guide",
        "description": "Comprehensive prep material...",
        "order": 1,
        "chapters": [],
        "accessType": "PAID_ONLY",
        "price": 99900,
        "currency": "INR",
        "eligibleCourses": ["2025_UPSC_PRELIMS", "PAID_USER"],
        "courseId": "XII_CBSE"
      }
    ]
  }
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `bookId` | string | ✅ Yes | Unique book identifier |
| `title` | string | ✅ Yes | Book title |
| `description` | string | ❌ No | Book description (marketing content) |
| `order` | number | ✅ Yes | Display order |
| `chapters` | array | ✅ Yes | **MUST be empty array `[]`** for security |
| `accessType` | string | ✅ Yes | Always `"PAID_ONLY"` for public books |
| `price` | number | ✅ Yes | Price in paise (99900 = ₹999) |
| `currency` | string | ✅ Yes | Currency code (e.g., `"INR"`) |
| `eligibleCourses` | array | ✅ Yes | Course tags (e.g., `["2025_UPSC_PRELIMS", "PAID_USER"]`) |
| `courseId` | string | ✅ Yes | Parent course ID (e.g., `"XII_CBSE"`) - needed for purchase flow |

---

## 3. Frontend Integration

### API Base URL
The frontend uses environment variable:
```
NEXT_PUBLIC_API_BASE_URL=https://api.arjunasarrow.com
```

### Full Endpoint Path
```
GET https://api.arjunasarrow.com/api/v1/books/public
```

### TypeScript Interface (Frontend)
```typescript
interface PublicBook {
  bookId: string
  title: string
  description?: string
  order: number
  chapters: any[] // Always empty
  accessType: 'PAID_ONLY'
  price: number
  currency: string
  eligibleCourses: string[]
  courseId?: string
}
```

---

## 4. Security Requirements

### ⚠️ CRITICAL: Chapter Data Protection

The `chapters` array MUST be empty in the public API response:

```json
{
  "chapters": []  // ✅ Correct - empty array
}
```

**❌ NEVER expose:**
```json
{
  "chapters": [  // ❌ WRONG - exposes content structure
    {
      "id": "chapter-1",
      "title": "Introduction",
      "resources": [...]  // Security risk!
    }
  ]
}
```

### Why Empty Chapters?
- Prevents unauthorized access to content structure
- Hides resource URLs (videos, PDFs, etc.)
- Maintains security for paid content
- Guest users should only see book metadata for purchase decision

---

## 5. Frontend Display Logic

### Course Tag Parsing
Frontend converts course tags to user-friendly format:

| Raw Tag | Displayed As |
|---------|--------------|
| `2025_UPSC_PRELIMS` | `UPSC Prelims` |
| `2025_XII_CBSE` | `XII CBSE` |
| `PAID_USER` | *(hidden - not displayed)* |

### Price Formatting
Frontend converts paise to rupees:
- `99900` paise → `₹999.00`
- `49900` paise → `₹499.00`

---

## 6. Purchase Flow

When guest user clicks "Buy Now":

1. **Frontend** opens `GuestPurchaseDialog`
2. **User** enters: name, email, mobile number
3. **Frontend** calls: `POST /api/v1/purchases/initiate-guest`
   - Requires: `bookId`, `courseId`, name, email, mobile
4. **Backend** creates Razorpay order and returns order details
5. **Frontend** opens Razorpay payment modal
6. **Payment** processed through Razorpay
7. **Success** shows `PurchaseSuccessDialog` with redirect

### Why courseId is Required?
The `courseId` field is needed for the purchase API:
```
POST /api/v1/purchases/initiate-guest
{
  "bookId": "upsc-guide-123",
  "courseId": "XII_CBSE",  // Required for backend logic
  "name": "...",
  "email": "...",
  "mobile": "..."
}
```

---

## 7. Testing Checklist

### Backend Testing
- [ ] Create book with description via admin API
- [ ] Verify description is stored in database
- [ ] Public API returns only PAID_ONLY books
- [ ] Public API returns empty chapters array
- [ ] Public API includes courseId field
- [ ] Public API works without authentication
- [ ] Public API handles no books gracefully

### Frontend Testing
- [ ] Navigate to `/books` page
- [ ] Verify books load and display correctly
- [ ] Check description displays (if provided)
- [ ] Verify course tags parse correctly
- [ ] Check price formats as ₹XXX.XX
- [ ] Test "Buy Now" button opens dialog
- [ ] Test guest purchase flow end-to-end
- [ ] Verify responsive design (mobile/tablet/desktop)

---

## 8. Environment Variables

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_BASE_URL=https://api.arjunasarrow.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
```

### Backend
No changes needed if already configured for:
- Razorpay integration
- DynamoDB/database access
- CORS for public endpoints

---

## 9. CORS Configuration

The public books endpoint MUST allow cross-origin requests:

```javascript
// Example CORS headers for /api/v1/books/public
{
  "Access-Control-Allow-Origin": "*",  // Or specific domain
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
}
```

---

## 10. Response Examples

### Success Response (Books Found)
```json
{
  "success": true,
  "data": {
    "books": [
      {
        "bookId": "book-1",
        "title": "Book Title 1",
        "description": "Description here",
        "order": 1,
        "chapters": [],
        "accessType": "PAID_ONLY",
        "price": 99900,
        "currency": "INR",
        "eligibleCourses": ["2025_UPSC", "PAID_USER"],
        "courseId": "UPSC"
      }
    ]
  }
}
```

### Success Response (No Books)
```json
{
  "success": true,
  "data": {
    "books": []
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Internal server error",
    "code": "INTERNAL_ERROR"
  }
}
```

---

## 11. Quick Reference

### Frontend Files Modified
- ✅ `src/types/database.types.ts` - Added description, bookId, chapters fields
- ✅ `src/hooks/usePublicBooks.ts` - Fetches public books
- ✅ `src/components/books/PublicBookCard.tsx` - Displays book card
- ✅ `src/pages/books.tsx` - Public books page
- ✅ `src/utils/bookUtils.ts` - Helper functions
- ✅ `src/components/dashboard/dialogs/CreateBookDialog.tsx` - Added description field

### Backend Requirements
- ✅ Accept `description` in create book API
- ✅ Create public endpoint: `GET /api/v1/books/public`
- ✅ Filter: `accessType = PAID_ONLY`
- ✅ Return: `bookId`, `title`, `description`, `order`, empty `chapters`, `accessType`, `price`, `currency`, `eligibleCourses`, `courseId`
- ✅ No authentication required
- ✅ Enable CORS for public access

---

## Summary

The frontend is **100% complete** and ready to integrate with the backend API once the public endpoint is deployed. The API structure shown by the user matches what we've built, with the key requirement being:

**Return `courseId` in the public books response** - this is needed for the purchase flow to work correctly.

All other fields match the expected backend response structure!
