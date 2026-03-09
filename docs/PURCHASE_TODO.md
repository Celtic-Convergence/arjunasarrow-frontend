# 📝 Purchase Feature - Implementation Checklist

**Status**: ⏳ Not Started  
**Estimated Time**: 2-3 days  
**Reference**: See `PURCHASE_IMPLEMENTATION.md` for detailed implementation guide

---

## 🎯 Phase 1: Setup & Configuration

### Environment Setup
- [x] Update `.env.dev` and `env.prod` file
- [x] Get Razorpay test key from backend team
- [x] Add `NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx`
- [x] Create `.env.production` file
- [x] Add `NEXT_PUBLIC_API_URL=https://api.arjunasarrow.in`
- [x] Get Razorpay live key from backend team
- [x] Add `NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx`

### Razorpay SDK Integration
- [x] Open `src/pages/_app.tsx`
- [x] Import `Script` from `next/script`
- [x] Add Razorpay SDK script tag: `<Script src="https://checkout.razorpay.com/v1/checkout.js" />`
- [x] Test script loads in browser console (`window.Razorpay` should exist)

---

## 🎯 Phase 2: Core Components

### 0. Type Definitions & Book Creation (Prerequisites)
**Files**: `src/types/database.types.ts`, `src/components/dashboard/dialogs/CreateBookDialog.tsx`, `src/hooks/dashboard/useCourses.ts`

- [x] Add `accessType` field to Book interface ('COURSE_DEFAULT' | 'PAID_ONLY')
- [x] Add `price` field (number in paise)
- [x] Add `currency` field (string, e.g., 'INR')
- [x] Add `eligibleCourses` field (string array)
- [x] Add `hasAccess` field (boolean - whether user can access the book)
- [x] Update CreateBookDialog with access type selector (radio buttons)
- [x] Add price input field (visible only for PAID_ONLY books)
- [x] Add eligible courses multi-select (Autocomplete with chips)
- [x] Add validation: price required for PAID_ONLY, PAID_USER always included
- [x] Update createBook hook to accept book data object instead of just title
- [x] Update dashboard.tsx handleCreateBook to pass full book data

### 1. Update BookCard Component ✅ COMPLETED
**File**: `src/components/dashboard/courses/BookCard.tsx`

**Type Updates**:
- [x] Import `useAuth` hook from `@/contexts/AuthContext`
- [x] Import `LockIcon` and `ShoppingCartIcon` from `@mui/icons-material`
- [x] Import `Button` from `@mui/material`

**Component Logic**:
- [x] Add `const { user } = useAuth()` inside component
- [x] Calculate locked state: `const isLocked = book.accessType === 'PAID_ONLY' && !book.hasAccess`
- [x] Add conditional lock overlay (wrap Accordion section)
- [x] Disable accordion when locked with `disabled={isLocked}`
- [x] Apply blur effect on chapters: `filter: blur(4px)`

**Lock Overlay UI**:
- [x] Add MUI `Box` with absolute positioning (z-index: 10)
- [x] Semi-transparent overlay with backdrop blur: `backdropFilter: 'blur(4px)'`
- [x] Center lock icon (80px circular gradient background)
- [x] Box shadow on lock icon for depth
- [x] Display "Premium Content" text with gradient background
- [x] Show descriptive text about premium content
- [x] Show price (rupees): `₹{(book.price / 100).toFixed(2)}`
- [x] Add "Buy Now" button with ShoppingCartIcon
- [x] Button with gradient background and hover effects
- [x] Button hover transform and shadow animation
- [x] Added placeholder onClick handler (logs to console)
- [x] Pointer events disabled on blurred content

### 2. Create PurchaseButton Component ✅ COMPLETED
**File**: `src/components/dashboard/common/PurchaseButton.tsx`

**Props Interface**:
- [x] Define props: `bookId`, `courseId`, `price`, `currency`, `bookTitle`, `onPurchaseSuccess`, `variant`, `size`, `fullWidth`
- [x] Add TypeScript interface with optional callback and styling props

**Component Logic**:
- [x] Import `useAuth` hook
- [x] Get `isAuthenticated` and `user` state
- [x] Create state for loading: `const [loading, setLoading] = useState(false)`
- [x] Create state for snackbar notifications
- [x] Create `handleBuyNow` function (checks authentication)
- [x] Create `initiatePurchase` function (authenticated flow):
  - [x] Import `useApiClient` hook
  - [x] Call `POST /purchases/initiate` with `{ bookId, courseId }`
  - [x] Handle response: `{ razorpayOrderId, amount, keyId, currency }`
  - [x] Call `openRazorpay()` with response data
  - [x] Handle specific errors (already owned, invalid book)
- [x] Create `openRazorpay` function:
  - [x] Check if `window.Razorpay` exists (SDK loaded check)
  - [x] Create Razorpay options object with brand theming
  - [x] Add payment success handler with callback
  - [x] Add payment failure handler with error display
  - [x] Add modal dismiss handler
  - [x] Initialize Razorpay: `new window.Razorpay(options)`
  - [x] Call `rzp.open()`
- [x] Add error handling with MUI Snackbar and Alert
- [x] Render MUI Button with loading state and CircularProgress
- [x] Display formatted price: `Buy Now - ₹{(price / 100).toFixed(2)}`
- [x] Add gradient background and hover effects
- [x] Add disabled state styling
- [x] Integrate ShoppingCartIcon

**Additional Features**:
- [x] Created `src/types/razorpay.d.ts` for TypeScript definitions
- [x] Added Razorpay interface declarations (RazorpayOptions, RazorpaySuccessResponse)
- [x] Used Context7 MUI patterns for Snackbar and Alert
- [x] Added brand color theming (#667eea gradient)
- [x] Implemented auto-hide snackbar (6s duration)
- [x] Added clickaway prevention for snackbar
- [x] Proper error messages for different scenarios
- [x] Loading state with CircularProgress spinner
- [x] Button transitions and animations
- [x] JSDoc documentation comments

### 3. Create GuestPurchaseDialog Component ✅ COMPLETED
**File**: `src/components/dashboard/dialogs/GuestPurchaseDialog.tsx`

**Props**:
- [x] Define props: `open`, `onClose`, `bookId`, `courseId`, `price`, `currency`, `bookTitle`, `onPurchaseSuccess`

**Form Fields**:
- [x] Add Name field (TextField):
  - [x] Min 2 characters validation with `validateName()`
  - [x] Required field
  - [x] Error message: "Name must be at least 2 characters"
  - [x] PersonIcon input adornment
- [x] Add Email field (TextField):
  - [x] Email format validation with regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
  - [x] Required field
  - [x] Error message: "Invalid email format"
  - [x] EmailIcon input adornment
  - [x] Helper text: "You will receive login credentials at this email"
- [x] Add Country Code selector (Select):
  - [x] Import `countryCodes` from `src/data/countryCodes.ts`
  - [x] Map options with flags and labels
  - [x] Default to `+91` (India)
  - [x] 140px minimum width
- [x] Add Mobile Number field (TextField):
  - [x] Optional field (validation passes if empty)
  - [x] E.164 format validation: `/^\+[1-9]\d{1,14}$/`
  - [x] Import `phoneValidationRules` from `src/utils/phoneValidation.ts`
  - [x] Dynamic validation based on selected country code
  - [x] Helper text: "Format: 9876543210 (without country code)"
  - [x] PhoneIcon input adornment
  - [x] Only allows digits input

**Form Handling**:
- [x] Create state for form values: `name`, `email`, `countryCode`, `mobile`
- [x] Create state for errors: `nameError`, `emailError`, `mobileError`
- [x] Create state for UI: `loading`, `apiError`
- [x] Create `validateName()` function
- [x] Create `validateEmail()` function
- [x] Create `validateMobile()` function (country-specific)
- [x] Create `validateE164Format()` function
- [x] Create `handleSubmit` function:
  - [x] Validate all fields
  - [x] Concatenate country code + mobile (if provided)
  - [x] Call `POST /purchases/initiate-guest`
  - [x] Handle response: `{ razorpayOrderId, amount, keyId, prefill }`
  - [x] Call `openRazorpay()` with prefilled data
- [x] Create `openRazorpay` function (similar to PurchaseButton)
- [x] Add error handling for API errors:
  - [x] "Account exists. Please login." → Show message, redirect to login after 3s
  - [x] "You already own this book. Please login." → Show message, redirect to login after 3s
  - [x] "Invalid email format" → Show inline error
  - [x] "Mobile number must be in E.164 format" → Show inline error
  - [x] Generic errors → Show in Alert component

**UI/UX** (Context7 MUI verified):
- [x] Add Dialog title: "Complete Your Purchase" with ShoppingCartIcon
- [x] Gradient background on DialogTitle (#667eea to #764ba2)
- [x] Add book details display box (title, price)
- [x] Book details in purple-tinted box with border
- [x] Add loading state during API call
- [x] Add Cancel button
- [x] Add Submit button: "Proceed to Payment"
- [x] Disable submit button during loading or if name/email empty
- [x] Loading spinner (CircularProgress) in submit button
- [x] Info Alert: "A temporary account will be created..."
- [x] Form reset on dialog close
- [x] Prevent close during loading
- [x] Brand gradient styling on submit button
- [x] Real-time validation on blur
- [x] Re-validation on change if error exists
- [x] Only digits allowed in mobile field
- [x] useRouter for login redirect

### 4. Create PurchaseSuccessDialog Component ✅ COMPLETED
**File**: `src/components/dashboard/dialogs/PurchaseSuccessDialog.tsx`

**Props**:
- [x] Define props: `open`, `onClose`, `email`, `isGuestPurchase`

**Content**:
- [x] Add success icon (MUI `CheckCircleIcon` in green gradient)
- [x] 100x100px circular background with green gradient (#10b981 to #059669)
- [x] Pulse animation on success icon
- [x] Add title: "Purchase Successful! 🎉" with gradient text
- [x] Add message for guest users:
  - [x] "Your Account Has Been Created!"
  - [x] "Check your email at {email}" (email highlighted in purple)
  - [x] "You'll receive login credentials and password reset instructions"
  - [x] "Your purchased book will be available in your dashboard"
- [x] Add message for authenticated users:
  - [x] "Payment Completed Successfully!"
  - [x] "Your book is now unlocked and available in your dashboard"
  - [x] "You can start reading immediately!"
- [x] Add "Go to Login Now" button (for guest users)
- [x] Add "Close" button (for both user types)
- [x] Add auto-redirect logic:
  - [x] Use `setInterval` for countdown (1s intervals)
  - [x] Use `setInterval` for progress bar (100ms intervals)
  - [x] Redirect to `/login` for guests after 5s
  - [x] Redirect to `/dashboard` for authenticated users after 5s
  - [x] Clear intervals on component unmount
  - [x] Reset countdown on dialog open
- [x] LinearProgress bar at top (shows time remaining)
- [x] Gradient progress bar (#667eea to #764ba2)
- [x] Countdown display: "Redirecting in X seconds..."
- [x] Large countdown number (1.2rem, bold, purple)
- [x] Purple-tinted info box with border
- [x] Gradient buttons with hover effects
- [x] LoginIcon and CloseIcon
- [x] Progress bar animation (0-100% over 5 seconds)
- [x] Success icon pulse animation (CSS keyframes)
- [x] Manual close option (cancels auto-redirect)

---

## 🎯 Phase 3: Integration & Testing

### Payment Flow Testing

#### Authenticated User Flow
- [ ] Login as test user
- [ ] Navigate to dashboard
- [ ] Find a PAID_ONLY book (should show lock icon)
- [ ] Click "Buy Now" button
- [ ] Verify Razorpay modal opens
- [ ] Complete test payment
- [ ] Verify success message appears
- [ ] Verify book unlocks (lock overlay removed)
- [ ] Verify chapters are accessible
- [ ] Try buying same book again
- [ ] Verify error: "You already own this book"

#### Guest User Flow
- [ ] Logout (or use incognito window)
- [ ] Navigate to dashboard as guest
- [ ] Find a PAID_ONLY book
- [ ] Click "Buy Now" button
- [ ] Verify guest form appears
- [ ] Fill in details:
  - [ ] Name: Test User
  - [ ] Email: test@example.com (use real email for testing)
  - [ ] Mobile: +919876543210 (optional)
- [ ] Click "Proceed to Payment"
- [ ] Verify Razorpay modal opens with prefilled data
- [ ] Complete test payment
- [ ] Verify success dialog appears
- [ ] Verify email mentioned in success message
- [ ] Check email inbox for password reset link
- [ ] Verify auto-redirect to login page
- [ ] Login with email and new password
- [ ] Verify book is accessible

### Form Validation Testing

#### Name Field
- [ ] Try submitting with empty name → Shows error
- [ ] Try submitting with 1 character → Shows error
- [ ] Submit with 2+ characters → Passes validation

#### Email Field
- [ ] Try submitting with empty email → Shows error
- [ ] Try invalid formats:
  - [ ] `test` → Shows error
  - [ ] `test@` → Shows error
  - [ ] `test@domain` → Shows error
- [ ] Submit with valid email → Passes validation

#### Mobile Field
- [ ] Leave empty → Passes (optional field)
- [ ] Try invalid formats:
  - [ ] `9876543210` (no +) → Shows error
  - [ ] `+91 98765 43210` (spaces) → Shows error
  - [ ] `+91-9876543210` (dashes) → Shows error
- [ ] Try valid formats:
  - [ ] `+919876543210` → Passes
  - [ ] `+14155552671` → Passes
  - [ ] `+447911123456` → Passes

### Error Handling Testing

#### API Errors
- [ ] Test with existing user email in guest form
- [ ] Verify message: "Account exists. Please login."
- [ ] Verify redirect to login page
- [ ] Test purchasing already-owned book
- [ ] Verify message: "You already own this book"
- [ ] Test network error (disconnect internet)
- [ ] Verify message: "Network error. Please try again."

#### Payment Errors
- [ ] Cancel Razorpay modal
- [ ] Verify no success dialog appears
- [ ] Verify user can retry
- [ ] Test with declined test card (if available)
- [ ] Verify error handling

### UI/UX Testing

#### BookCard Updates
- [ ] Verify lock icon appears on PAID_ONLY books
- [ ] Verify blur effect on locked chapters
- [ ] Verify "Buy Now" button is prominent
- [ ] Verify purchased books show no lock
- [ ] Verify COURSE_DEFAULT books show no lock

#### Responsive Design
- [ ] Test on mobile (< 768px):
  - [ ] Guest form fits screen
  - [ ] Razorpay modal works
  - [ ] Success dialog displays correctly
- [ ] Test on tablet (768px - 1024px)
- [ ] Test on desktop (> 1024px)

#### Loading States
- [ ] Verify loading indicator during API calls
- [ ] Verify buttons disabled during loading
- [ ] Verify loading indicator during Razorpay initialization

### Data Refresh Testing
- [ ] Complete purchase
- [ ] Verify course data refreshes automatically
- [ ] Verify book access updates immediately
- [ ] Verify no page reload required
- [ ] Test refresh logic: `loadCourseData()` from `useCourses` hook

---

## 🎯 Phase 4: Code Quality & Documentation

### Code Review Checklist
- [ ] All TypeScript types properly defined
- [ ] No `any` types (use proper interfaces)
- [ ] All props documented with JSDoc comments
- [ ] Error boundaries added where needed
- [ ] Console logs removed (except for debugging)
- [ ] Comments added for complex logic
- [ ] Code follows existing project patterns
- [ ] MUI theme colors used consistently
- [ ] Accessibility attributes added (aria-labels, etc.)

### Performance Optimization
- [ ] Memoize expensive computations with `useMemo`
- [ ] Memoize callbacks with `useCallback`
- [ ] Lazy load Razorpay SDK if not already loaded
- [ ] Optimize re-renders (use React DevTools)

### Security Checklist
- [ ] Razorpay key stored in env variable (not hardcoded)
- [ ] API endpoints use correct base URL from env
- [ ] JWT tokens handled securely (httpOnly cookies or secure storage)
- [ ] No sensitive data logged to console
- [ ] Input sanitization for name/email fields
- [ ] CSRF protection (if applicable)

### Documentation Updates
- [ ] Update component exports in `index.ts` files
- [ ] Add JSDoc comments to new components
- [ ] Update `PURCHASE_IMPLEMENTATION.md` if any changes
- [ ] Document any deviations from original plan
- [ ] Add inline code comments for complex logic

---

## 🎯 Phase 5: Production Preparation

### Environment Configuration
- [ ] Verify `.env.local` has dev API URL
- [ ] Verify `.env.local` has test Razorpay key
- [ ] Verify `.env.production` has prod API URL
- [ ] Verify `.env.production` has live Razorpay key
- [ ] Add `.env*.local` to `.gitignore`
- [ ] Document env variables in README

### Build & Deploy Testing
- [ ] Run `npm run build:dev`
- [ ] Verify no build errors
- [ ] Verify no TypeScript errors
- [ ] Test production build locally
- [ ] Run `npm run build` (production)
- [ ] Verify no warnings
- [ ] Deploy to staging environment
- [ ] Test on staging with test Razorpay keys
- [ ] Get approval for production deployment

### Production Deployment
- [ ] Switch to production env variables
- [ ] Deploy to production
- [ ] Test with real Razorpay live keys
- [ ] Monitor error logs for 24 hours
- [ ] Test with small amount first (₹1 or ₹10)
- [ ] Verify webhook receives payment notifications
- [ ] Verify email delivery works
- [ ] Verify Cognito user creation works

---

## 🎯 Phase 6: Post-Launch Monitoring

### Monitoring Checklist
- [ ] Set up error tracking (Sentry, Bugsnag, etc.)
- [ ] Monitor Razorpay dashboard for payments
- [ ] Monitor CloudWatch logs for backend errors
- [ ] Check email delivery success rate
- [ ] Monitor user feedback/support tickets
- [ ] Track conversion rate (views → purchases)

### Analytics (Optional)
- [ ] Track "Buy Now" button clicks
- [ ] Track guest vs authenticated purchases
- [ ] Track payment success/failure rates
- [ ] Track most purchased books
- [ ] Track average purchase time (start → complete)

---

## 📊 Progress Summary

**Total Tasks**: 160+  
**Completed**: 90  
**In Progress**: 0  
**Blocked**: 0  

**Phase Status**:
- Phase 1 (Setup): ✅ Complete (7/7 tasks - 100%)
- Phase 2 (Components): ✅ Complete (83/83 tasks - 100%)
  - Task 0: ✅ Complete (11/11 - Type Definitions & Book Creation)
  - Task 1: ✅ Complete (23/23 - BookCard Lock UI)
  - Task 2: ✅ Complete (15/15 - PurchaseButton Component)
  - Task 3: ✅ Complete (30/30 - GuestPurchaseDialog)
  - Task 4: ✅ Complete (14/14 - PurchaseSuccessDialog)
- Phase 3 (Testing): ⏳ Not Started (35 tasks)
- Phase 4 (Quality): ⏳ Not Started (15 tasks)
- Phase 5 (Production): ⏳ Not Started (12 tasks)
- Phase 6 (Monitoring): ⏳ Not Started (8 tasks)

---

## 🚀 Quick Start Instructions

1. Start with Phase 1 (Setup & Configuration)
2. Complete tasks in order within each phase
3. Check off items as you complete them
4. Update progress summary regularly
5. Refer to `PURCHASE_IMPLEMENTATION.md` for code examples
6. Test each component thoroughly before moving to next phase

---

**Last Updated**: November 19, 2025  
**Estimated Completion**: TBD  
**Backend Status**: ✅ Ready  
**Frontend Status**: ⏳ In Progress
