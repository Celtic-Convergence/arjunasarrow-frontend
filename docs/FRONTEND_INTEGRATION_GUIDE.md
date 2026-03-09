# 📱 Frontend Integration Guide - Purchase Feature

> ⚠️ **DEPRECATED**: This document has been replaced by **`PURCHASE_IMPLEMENTATION.md`**  
> Use the new concise guide for implementation.

**Kept for historical reference only.**

---

---

**[Remaining content omitted for brevity - see `PURCHASE_IMPLEMENTATION.md` for current guide]**

---

## 🎯 What You Need to Build

### 1. Components

#### `GuestPurchaseDialog` (New)
- **Purpose**: Form for anonymous users to enter details before payment
- **Fields**:
  - Name (min 2 chars, required)
  - Email (validated, required)
  - Mobile (E.164 format, optional)
- **API Call**: `POST /api/v1/purchases/initiate-guest` (no JWT needed)
- **Sample Code**: See `PURCHASE_API_DOCUMENTATION.md` Section 3

#### `PurchaseButton` (New)
- **Purpose**: "Buy Now" button for authenticated users
- **Behavior**: 
  - Check if user is logged in (useAuth)
  - If yes: Direct Razorpay modal
  - If no: Open GuestPurchaseDialog
- **API Call**: `POST /api/v1/purchases/initiate` (JWT required)
- **Sample Code**: See `PURCHASE_API_DOCUMENTATION.md` Section 2

#### `PurchaseSuccessDialog` (New)
- **Purpose**: Show success message after payment
- **Content**:
  - ✅ Success icon
  - "Check your email **{email}** for login instructions"
  - "Go to Login" button
  - Auto-redirect after 5 seconds
- **Trigger**: After Razorpay `handler` callback

#### `MobileInput` (New)
- **Purpose**: Country code + number input
- **Validation**: E.164 format regex `^\+[1-9]\d{1,14}$`
- **Format**: Concatenate `countryCode + number` → `+919876543210`
- **Sample Code**: See `PURCHASE_API_DOCUMENTATION.md` Section 4

#### `BookCard` (Update Existing)
- **Add**:
  - Lock overlay for PAID_ONLY books without access
  - "Buy Now" button
  - Blur effect on locked content
- **Behavior**: Click "Buy Now" → Check auth → Open appropriate flow

---

## 🔌 API Integration

### Authenticated Purchase Flow

```typescript
// 1. User clicks "Buy Now" (logged in)
const response = await apiClient.post('/api/v1/purchases/initiate', {
  bookId: 'advanced_accountancy',
  courseId: 'XII_CBSE'
});

// 2. Open Razorpay
const { razorpayOrderId, amount, keyId } = response.data.data;
const rzp = new Razorpay({
  key: keyId,
  amount: amount,
  order_id: razorpayOrderId,
  handler: (response) => {
    // 3. Payment success - refresh course data
    refreshCourseData();
    showSuccessMessage();
  }
});
rzp.open();
```

### Guest Purchase Flow

```typescript
// 1. User clicks "Buy Now" (not logged in)
// 2. Show GuestPurchaseDialog
// 3. User fills form and submits
const response = await axios.post('/api/v1/purchases/initiate-guest', {
  bookId: 'advanced_accountancy',
  courseId: 'XII_CBSE',
  guestName: 'Priya Sharma',
  guestEmail: 'priya@example.com',
  guestMobile: '+919876543210' // Optional
});

// 4. Open Razorpay (same as authenticated)
// 5. On success: Show PurchaseSuccessDialog with email
```

---

## ⚠️ Error Handling

### Pre-Payment Validation Errors

| Error | User Action |
|-------|-------------|
| "You already own this book" | Show message, don't proceed |
| "Account exists. Please login to continue." | Redirect to login page |
| "Book is not available for purchase" | Disable buy button |
| "Invalid email format" | Show inline validation error |
| "Mobile number must be in E.164 format" | Show format hint |

### Payment Flow Errors

| Error | User Action |
|-------|-------------|
| Network error | Show retry button |
| Payment failed (Razorpay) | Razorpay shows error modal |
| Server error (500) | Show "Contact support" message |

**Implementation**: See `PURCHASE_API_DOCUMENTATION.md` Section "Error Handling"

---

## 🧪 Testing Checklist

### Manual Testing

- [ ] **Authenticated User**:
  - [ ] Click "Buy Now" → Razorpay modal opens
  - [ ] Complete test payment → Book unlocks
  - [ ] Try buying same book again → Shows "already own" error

- [ ] **Guest User**:
  - [ ] Click "Buy Now" → Guest form appears
  - [ ] Fill form → Razorpay modal opens
  - [ ] Complete payment → Success dialog shows
  - [ ] Check email for login instructions

- [ ] **Mobile Validation**:
  - [ ] Test with +91 (India), +1 (USA), +44 (UK)
  - [ ] Test invalid: 9876543210 (no +)
  - [ ] Test invalid: +91 98765 43210 (spaces)

- [ ] **UI/UX**:
  - [ ] Lock icon shows on PAID_ONLY books
  - [ ] Blur effect on locked content
  - [ ] Buy button visible and styled correctly
  - [ ] Success dialog auto-redirects after 5s

### Edge Cases

- [ ] No internet → Show network error
- [ ] User closes Razorpay modal → No access granted (correct)
- [ ] Duplicate payment attempt → Backend blocks (already handled)
- [ ] Invalid email → Form validation catches
- [ ] Email exists + owns book → Backend blocks with message

---

## 🔧 Environment Setup

Add to your `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://dev-api.arjunasarrow.in
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
```

Get the Razorpay key from your backend team.

---

## 📦 Dependencies

Install Razorpay SDK in `_app.tsx`:

```tsx
import Script from 'next/script';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <Component {...pageProps} />
    </>
  );
}
```

---

## 🎨 UI/UX Notes

### BookCard Lock Overlay

```css
.locked-book {
  position: relative;
  filter: blur(2px);
  pointer-events: none;
}

.lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Buy Button

```jsx
<Button
  variant="contained"
  color="primary"
  startIcon={<ShoppingCartIcon />}
  onClick={handleBuyNow}
>
  Buy Now - ₹999
</Button>
```

---

## 🚀 Implementation Order

1. **Day 1**: Razorpay SDK setup + MobileInput component
2. **Day 2**: GuestPurchaseDialog + form validation
3. **Day 3**: PurchaseButton + authenticated flow
4. **Day 4**: BookCard updates + lock UI
5. **Day 5**: PurchaseSuccessDialog + error handling
6. **Day 6**: Testing + bug fixes

---

## 🆘 Support & References

- **API Docs**: `PURCHASE_API_DOCUMENTATION.md` (complete reference)
- **Business Logic**: `new_idea.md` (why this feature exists)
- **Backend Details**: `BACKEND_IMPLEMENTATION_PLAN.md` (if curious)

**Questions?** Check API docs first, then ask backend team.

---

**Good luck! The backend is ready and waiting for your integration.** 🚀
