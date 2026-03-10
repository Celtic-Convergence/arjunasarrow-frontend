# 📱 Purchase Feature - Implementation Guide

**Backend Status**: ✅ Production Ready  
**Frontend Status**: ⏳ Not Started  
**API Base (Dev)**: `https://dev-api.arjunasarrow.in`  
**API Base (Prod)**: `https://api.arjunasarrow.in`

---

## 🎯 Quick Overview

Add paid book purchase via Razorpay with two flows:
1. **Authenticated**: Logged-in users → Direct payment
2. **Guest**: Anonymous users → Name/Email/Mobile → Payment → Auto account creation

---

## 📋 Required Components

### 1. BookCard Updates (Existing File)
**File**: `src/components/dashboard/courses/BookCard.tsx`

**Add**:
- Check `book.accessType === 'PAID_ONLY'` 
- Show lock overlay with blur effect if user doesn't have access
- Add "Buy Now" button
- Use `useAuth()` to detect auth state

### 2. GuestPurchaseDialog (New)
**File**: `src/components/dashboard/dialogs/GuestPurchaseDialog.tsx`

**Pattern**: Copy from `InviteUserDialog.tsx`

**Fields**:
- Name (TextField, min 2 chars, required)
- Email (TextField, email validation, required)
- Mobile (TextField + Select, E.164 format: `^\+[1-9]\d{1,14}$`, optional)
  - Use existing `countryCodes` from `src/data/countryCodes.ts`
  - Use existing `phoneValidationRules` from `src/utils/phoneValidation.ts`

**API Call**: `POST /api/v1/purchases/initiate-guest` (no JWT)

### 3. PurchaseButton (New)
**File**: `src/components/dashboard/common/PurchaseButton.tsx`

**Logic**:
```typescript
const { isAuthenticated } = useAuth();
const handleBuyNow = () => {
  if (isAuthenticated) {
    // Call /api/v1/purchases/initiate with JWT
    initiatePurchase();
  } else {
    // Show GuestPurchaseDialog
    setGuestDialogOpen(true);
  }
};
```

### 4. PurchaseSuccessDialog (New)
**File**: `src/components/dashboard/dialogs/PurchaseSuccessDialog.tsx`

**Content**:
- ✅ Success icon
- "Check email **{email}** for login instructions"
- "Go to Login" button → `/login`
- Auto-redirect to `/` after 5 seconds

---

## 🔌 API Integration

### Get Book Data (Step 0)
```typescript
// Existing endpoint - already implemented in useCourses
const { apiCall } = useApiClient();
const response = await apiCall('/course');

// Each book now has:
// - accessType: 'COURSE_DEFAULT' | 'PAID_ONLY'
// - price: number (paise: 99900 = ₹999)
// - currency: 'INR'
// - eligibleCourses: string[]
```

**📚 Dashboard Book Visibility Rules:**

The `/course` endpoint **automatically filters** books before returning them. The backend only returns books the user is eligible to see:

**Example Response** (for XII_CBSE user):
```json
GET /api/v1/course
→ Returns: [
  { "bookId": "math-textbook", "accessType": "COURSE_DEFAULT" },
  { "bookId": "premium-guide", "accessType": "PAID_ONLY", "eligibleCourses": ["XII_CBSE", "PAID_USER"] }
]
→ Hides: { "bookId": "commerce-book", "eligibleCourses": ["XII_COMMERCE", "PAID_USER"] }
```

**Backend Filtering Logic:**

1. **COURSE_DEFAULT books**: 
   - ✅ Only visible if user is enrolled in that specific course (e.g., XII_CBSE user sees XII_CBSE default books)
   - ❌ Hidden from: Users in other courses, PAID_USER-only users, anonymous users

2. **PAID_ONLY books**:
   - ✅ Visible if user's courseId is in `eligibleCourses` array (e.g., XII_CBSE user sees books with `eligibleCourses: ["XII_CBSE", ...]`)
   - ✅ Visible if user is in `PAID_USER` group (books purchased grant `2025_PAID_USER` enrollment)
   - ✅ Visible to anonymous users (all PAID_ONLY books shown for purchase)
   - ❌ Hidden from: Users whose course is NOT in `eligibleCourses` (e.g., XI_CBSE user cannot see XII_CBSE paid books)

**Example Scenarios:**

| User Type | Course Groups | Sees on Dashboard |
|-----------|--------------|-------------------|
| **Rajesh** (enrolled in XII_CBSE) | `2025_XII_CBSE` | XII_CBSE default books + PAID_ONLY books with XII_CBSE in eligibleCourses |
| **Priya** (bought a book as guest) | `2025_PAID_USER` | ALL PAID_ONLY books (no default books) |
| **Amit** (enrolled in XI_CBSE) | `2025_XI_CBSE` | XI_CBSE default books + PAID_ONLY books with XI_CBSE in eligibleCourses |
| **Anonymous** (not logged in) | None | ALL PAID_ONLY books only (can preview & purchase) |

💡 **Key Point**: The backend filters books automatically based on user's course enrollment and `eligibleCourses`. The frontend just needs to:
1. Display whatever books the API returns
2. Check `accessType` to determine if a purchase UI is needed
3. The `/course` endpoint handles all visibility logic - no additional filtering required on frontend

### Authenticated Purchase
```typescript
const response = await apiClient.post('/api/v1/purchases/initiate', {
  bookId: 'advanced_accountancy',
  courseId: 'XII_CBSE'
});
const { razorpayOrderId, amount, keyId } = response.data.data;
// Open Razorpay (see below)
```

### Guest Purchase
```typescript
const response = await axios.post(
  `${process.env.NEXT_PUBLIC_API_URL}/api/v1/purchases/initiate-guest`,
  {
    bookId: 'advanced_accountancy',
    courseId: 'XII_CBSE',
    guestName: 'Priya Sharma',
    guestEmail: 'priya@example.com',
    guestMobile: '+919876543210' // Optional
  }
);
const { razorpayOrderId, amount, keyId, prefill } = response.data.data;
// Open Razorpay
```

---

## 💳 Razorpay Integration

### 1. Add SDK to _app.tsx
```tsx
import Script from 'next/script';

// Add inside return:
<Script src="https://checkout.razorpay.com/v1/checkout.js" />
```

### 2. Open Payment Modal
```typescript
const options = {
  key: keyId, // From API response
  amount: amount, // In paise
  currency: "INR",
  order_id: razorpayOrderId,
  handler: (response) => {
    // Payment successful
    console.log(response.razorpay_payment_id);
    // Refresh course data
    loadCourseData();
    // Show success dialog
    showSuccessDialog(email);
  },
  prefill: { name, email, contact }, // For guest purchases
  theme: { color: "#667eea" }
};

const rzp = new (window as any).Razorpay(options);
rzp.open();
```

---

## ⚠️ Error Handling

| Error Response | User Message |
|---------------|--------------|
| "You already own this book" | Show alert, don't open payment |
| "Account exists. Please login." | Redirect to `/login` |
| "Invalid email format" | Show inline form error |
| "Mobile number must be in E.164 format" | Show format hint: `+919876543210` |
| Network error | "Network error. Please try again." |

---

## 🧪 Testing Checklist

### Authenticated User
- [ ] Click "Buy Now" → Razorpay opens
- [ ] Complete payment → Book unlocks
- [ ] Try buying same book → Shows "already own" error

### Guest User
- [ ] Click "Buy Now" → Guest form appears
- [ ] Fill form → Razorpay opens
- [ ] Complete payment → Success dialog shows
- [ ] Check email for password reset

### Mobile Validation
- [ ] Test `+91`, `+1`, `+44`
- [ ] Reject `9876543210` (no +)
- [ ] Reject `+91 98765 43210` (spaces)

### UI/UX
- [ ] Lock icon on PAID_ONLY books
- [ ] Blur effect on locked content
- [ ] Success dialog auto-redirects

---

## 🔧 Environment Variables

```env
# .env.local (Development)
NEXT_PUBLIC_API_URL=https://dev-api.arjunasarrow.in
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx

# .env.production (Production)
NEXT_PUBLIC_API_URL=https://api.arjunasarrow.in
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
```

Get Razorpay keys from backend team.

---

## 📁 File Structure

```
src/
  components/
    dashboard/
      courses/
        BookCard.tsx          # UPDATE (add lock UI + buy button)
      dialogs/
        GuestPurchaseDialog.tsx    # NEW
        PurchaseSuccessDialog.tsx  # NEW
      common/
        PurchaseButton.tsx    # NEW
  hooks/
    dashboard/
      usePurchase.ts         # NEW (optional hook)
  pages/
    _app.tsx                 # UPDATE (add Razorpay script)
```

---

## 🚀 Implementation Steps

1. Add Razorpay script to `_app.tsx`
2. Create `GuestPurchaseDialog` (copy `InviteUserDialog` pattern)
3. Create `PurchaseButton` component
4. Update `BookCard`:
   - Add conditional lock overlay
   - Add buy button
   - Handle auth detection
5. Create `PurchaseSuccessDialog`
6. Test both flows thoroughly

**Estimated Time**: 2-3 days

---

## 📚 Full References

- **Complete API Specs**: See `PURCHASE_API_DOCUMENTATION.md`
- **Backend Architecture**: See `BACKEND_IMPLEMENTATION_PLAN.md` (reference only)
- **Business Requirements**: See `new_idea.md` (reference only)

---

**Backend is ready. Start building!** 🚀
