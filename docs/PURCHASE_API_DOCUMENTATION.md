# 💳 Purchase API - Technical Reference

> 💡 **For Quick Start**: See `PURCHASE_IMPLEMENTATION.md` first  
> This document: Complete API specifications for reference

**Backend**: ✅ Production Ready  
**Base URL**: `https://dev-api.arjunasarrow.in/api/v1`

---

## 📋 API Endpoints Summary

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `GET /course` | JWT | Get book data with purchase info |
| `POST /purchases/initiate` | JWT | Authenticated user purchase |
| `POST /purchases/initiate-guest` | Public | Guest user purchase |
| `POST /webhooks/payment` | Public | Razorpay webhook (internal) |

---

## 🔑 Book Model & Purchase Eligibility

### Book Data Structure

```typescript
// Response from GET /api/v1/course
interface CourseResponse {
  courseId: string;
  title: string;
  description: string;
  books: Book[];
  isAdmin: boolean;
}

interface Book {
  bookId: string;
  title: string;
  order: number;
  chapters: ChapterSummary[];
  
  // Purchase-related fields (available in API response)
  accessType?: 'COURSE_DEFAULT' | 'PAID_ONLY';
  price?: number;           // Amount in paise (99900 = ₹999)
  currency?: string;        // Default: "INR"
  eligibleCourses?: string[]; // e.g., ["XII_CBSE", "XII_ICSE", "PAID_USER"]
}
```

**Example API Call**:
```typescript
const response = await fetch('https://your-api.com/api/v1/course', {
  headers: {
    'Authorization': `Bearer ${jwtToken}`
  }
});
const data: CourseResponse = await response.json();

// Now you have all books with purchase information
data.books.forEach(book => {
  console.log(book.bookId, book.accessType, book.price);
});
```

### Access Type Logic

| AccessType | Who Can See? | Needs Purchase? | Notes |
|------------|-------------|-----------------|-------|
| `COURSE_DEFAULT` | Only enrolled course members | ❌ No | Free for that course |
| `PAID_ONLY` | Anyone in `EligibleCourses` OR guests | ✅ Yes | Always includes "PAID_USER" |

### Frontend Implementation

```typescript
// Helper: Check if book requires purchase
function isBookPurchasable(book: Book, userCourseId?: string): boolean {
  if (book.AccessType === 'COURSE_DEFAULT') {
    return false; // Free for enrolled users
  }
  
  // PAID_ONLY books
  if (book.AccessType === 'PAID_ONLY') {
    if (!userCourseId) return true; // Guest users always need to purchase
    
    // Check if user's course grants access
    const hasAccess = book.EligibleCourses?.includes(userCourseId) 
                   || book.EligibleCourses?.includes('PAID_USER');
    
    return !hasAccess; // Needs purchase if no access
  }
  
  return false;
}

// Helper: Format price for display
function formatBookPrice(priceInPaise?: number): string {
  if (!priceInPaise) return 'Free';
  const rupees = priceInPaise / 100;
  return `₹${rupees.toLocaleString('en-IN')}`;
}

// Example: Book Card Component
function BookCard({ book, userCourseId }: Props) {
  const needsPurchase = isBookPurchasable(book, userCourseId);
  const displayPrice = formatBookPrice(book.Price);
  
  return (
    <div className="book-card">
      <h3>{book.title}</h3>
      <span className="price">{displayPrice}</span>
      
      {needsPurchase ? (
        <PurchaseButton 
          bookId={book.bookId}
          courseId={book.EligibleCourses?.[0] || 'XII_CBSE'}
          amount={book.Price!}
          currency={book.Currency || 'INR'}
        />
      ) : (
        <button onClick={() => navigate(`/books/${book.bookId}`)}>
          Open Book
        </button>
      )}
    </div>
  );
}
```

**Key Implementation Notes:**

✅ **Prices are in paise** (smallest currency unit): ₹999 = 99900 paise  
✅ **Guest users see all PAID_ONLY books** (purchase grants "PAID_USER" access)  
✅ **COURSE_DEFAULT books never show purchase UI** (only visible to enrolled users)  
✅ **EligibleCourses array determines access**: Check if user's courseId is in array  
✅ **After purchase, user gets "PAID_USER" course enrollment** (grants access to all PAID_ONLY books)

---

## 🔐 Authentication

- **Authenticated Endpoints**: Require JWT token in `Authorization: Bearer <token>` header
- **Public Endpoints**: No authentication required (guest purchases, webhooks)

---

## 📍 API Endpoints

### 1. Initiate Authenticated Purchase

#### `POST /api/v1/purchases/initiate`

**Access**: 🔒 Protected (JWT required)  
**Purpose**: Create Razorpay order for logged-in users

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "bookId": "advanced_accountancy",
  "courseId": "XII_CBSE"
}
```

**Field Validations**:
- `bookId`: Required, string, non-empty
- `courseId`: Required, string, non-empty

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "orderId": "ORD-1732024567890-abc123",
    "razorpayOrderId": "order_NHqZ1xWvKj9aVb",
    "amount": 99900,
    "currency": "INR",
    "keyId": "rzp_live_xxxxxxxxxx"
  },
  "timestamp": "2025-11-19T10:30:00.000Z"
}
```

**Response Fields**:
- `orderId`: Internal order ID (for tracking)
- `razorpayOrderId`: Pass to Razorpay checkout modal
- `amount`: Price in paise (99900 = ₹999)
- `currency`: Always "INR"
- `keyId`: Razorpay public key for frontend

**Error Responses**:

**400 Bad Request** - Invalid input:
```json
{
  "success": false,
  "error": {
    "message": "Request body is required",
    "code": "VALIDATION_ERROR"
  },
  "timestamp": "2025-11-19T10:30:00.000Z"
}
```

**400 Bad Request** - Already owns book:
```json
{
  "success": false,
  "error": {
    "message": "You already own this book",
    "code": "VALIDATION_ERROR"
  },
  "timestamp": "2025-11-19T10:30:00.000Z"
}
```

**400 Bad Request** - Book not for sale:
```json
{
  "success": false,
  "error": {
    "message": "Book is not available for purchase",
    "code": "VALIDATION_ERROR"
  },
  "timestamp": "2025-11-19T10:30:00.000Z"
}
```

**401 Unauthorized** - Missing/invalid JWT:
```json
{
  "success": false,
  "error": {
    "message": "Unauthorized",
    "code": "UNAUTHORIZED"
  },
  "timestamp": "2025-11-19T10:30:00.000Z"
}
```

**404 Not Found** - Book doesn't exist:
```json
{
  "success": false,
  "error": {
    "message": "Book not found: XII_CBSE/advanced_accountancy",
    "code": "NOT_FOUND"
  },
  "timestamp": "2025-11-19T10:30:00.000Z"
}
```

**500 Internal Server Error** - Server error:
```json
{
  "success": false,
  "error": {
    "message": "Failed to initiate purchase",
    "code": "INTERNAL_ERROR"
  },
  "timestamp": "2025-11-19T10:30:00.000Z"
}
```

---

### 2. Initiate Guest Purchase

#### `POST /api/v1/purchases/initiate-guest`

**Access**: 🌐 Public (No JWT required)  
**Purpose**: Create Razorpay order for anonymous users

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "bookId": "advanced_accountancy",
  "courseId": "XII_CBSE",
  "guestName": "Priya Sharma",
  "guestEmail": "priya.sharma@example.com",
  "guestMobile": "+919876543210"
}
```

**Field Validations**:
- `bookId`: Required, string, non-empty
- `courseId`: Required, string, non-empty
- `guestName`: Required, string, min 2 characters
- `guestEmail`: Required, valid email format (RFC 5322)
- `guestMobile`: Optional, must be E.164 format if provided (e.g., `+919876543210`)

**Mobile Number Format (E.164)**:
- **Pattern**: `^\+[1-9]\d{1,14}$`
- **Examples**: 
  - India: `+919876543210`
  - USA: `+12025551234`
  - UK: `+442071234567`
- **Invalid**: `9876543210` (missing +), `+91 98765 43210` (spaces), `+91-9876543210` (dashes)

**Success Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "orderId": "ORD-1732024567890-xyz789",
    "razorpayOrderId": "order_NHqZ1xWvKj9aVb",
    "amount": 99900,
    "currency": "INR",
    "keyId": "rzp_live_xxxxxxxxxx",
    "prefill": {
      "name": "Priya Sharma",
      "email": "priya.sharma@example.com",
      "contact": "+919876543210"
    }
  },
  "timestamp": "2025-11-19T10:30:00.000Z"
}
```

**Response Fields**:
- `prefill`: Use to pre-populate Razorpay checkout form

**Error Responses**:

**400 Bad Request** - Invalid email format:
```json
{
  "success": false,
  "error": {
    "message": "Invalid email format",
    "code": "VALIDATION_ERROR"
  },
  "timestamp": "2025-11-19T10:30:00.000Z"
}
```

**400 Bad Request** - Invalid mobile format:
```json
{
  "success": false,
  "error": {
    "message": "Mobile number must be in E.164 format (e.g., +919876543210)",
    "code": "VALIDATION_ERROR"
  },
  "timestamp": "2025-11-19T10:30:00.000Z"
}
```

**400 Bad Request** - Email already exists + owns book:
```json
{
  "success": false,
  "error": {
    "message": "You already own this book. Please login to access.",
    "code": "VALIDATION_ERROR"
  },
  "timestamp": "2025-11-19T10:30:00.000Z"
}
```

**400 Bad Request** - Email already exists + doesn't own book:
```json
{
  "success": false,
  "error": {
    "message": "Account exists with this email. Please login to continue.",
    "code": "VALIDATION_ERROR"
  },
  "timestamp": "2025-11-19T10:30:00.000Z"
}
```

**404 Not Found** - Book doesn't exist:
```json
{
  "success": false,
  "error": {
    "message": "Book not found: XII_CBSE/advanced_accountancy",
    "code": "NOT_FOUND"
  },
  "timestamp": "2025-11-19T10:30:00.000Z"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "error": {
    "message": "Failed to initiate guest purchase",
    "code": "INTERNAL_ERROR"
  },
  "timestamp": "2025-11-19T10:30:00.000Z"
}
```

---

### 3. Payment Webhook (Internal - Razorpay Only)

#### `POST /api/v1/webhooks/payment`

**Access**: 🌐 Public (Razorpay webhook signature verified)  
**Purpose**: Process payment confirmation from Razorpay

⚠️ **Note**: This endpoint is called by Razorpay servers, not by frontend.

**Headers** (from Razorpay):
```
x-razorpay-signature: <hmac_sha256_signature>
Content-Type: application/json
```

**Webhook Payload** (from Razorpay):
```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_NHqZ1xWvKj9aVb",
        "order_id": "order_NHqZ1xWvKj9aVb",
        "amount": 99900,
        "currency": "INR",
        "status": "captured",
        "email": "priya.sharma@example.com"
      }
    }
  }
}
```

**Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "message": "Payment processed successfully"
  },
  "timestamp": "2025-11-19T10:30:00.000Z"
}
```

**Webhook Behavior**:
- ✅ **Idempotent**: Safe to call multiple times for same payment
- ✅ **Always returns 200**: Prevents Razorpay retries
- 🔐 **Signature Verified**: HMAC SHA256 validation
- 👤 **User Creation**: Creates Cognito user for guest purchases
- 📧 **Email Sent**: Automatic password reset email via Cognito
- 🎫 **Access Granted**: Adds book to user's access list

---

## 🎨 Frontend Integration Guide

### 1. Install Razorpay SDK

Add to your `_app.tsx` or layout:
```tsx
import Script from 'next/script';

export default function App() {
  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      {/* Your app */}
    </>
  );
}
```

### 2. Authenticated Purchase Flow

```typescript
// hooks/usePurchase.ts
import { useApiClient } from './useApiClient';

export const usePurchase = () => {
  const apiClient = useApiClient();

  const initiatePurchase = async (bookId: string, courseId: string) => {
    try {
      // 1. Create order
      const response = await apiClient.post('/api/v1/purchases/initiate', {
        bookId,
        courseId
      });

      const { razorpayOrderId, amount, keyId } = response.data;

      // 2. Open Razorpay modal
      const options = {
        key: keyId,
        amount: amount,
        currency: "INR",
        name: "Arjunasarrow",
        description: "Book Purchase",
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          // 3. Payment successful
          console.log('Payment ID:', response.razorpay_payment_id);
          
          // 4. Refresh course data to show new access
          await refreshCourseData();
          
          // 5. Show success message
          showSuccessMessage('Book purchased successfully!');
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone
        },
        theme: {
          color: "#3399cc"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      if (error.response?.status === 400) {
        showErrorMessage(error.response.data.error.message);
      } else {
        showErrorMessage('Failed to initiate purchase');
      }
    }
  };

  return { initiatePurchase };
};
```

### 3. Guest Purchase Flow

```typescript
// components/GuestPurchaseDialog.tsx
import { useState } from 'react';
import axios from 'axios';

interface GuestPurchaseDialogProps {
  bookId: string;
  courseId: string;
  onClose: () => void;
}

export const GuestPurchaseDialog = ({ bookId, courseId, onClose }: GuestPurchaseDialogProps) => {
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestMobile: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1. Create order (no auth header)
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/purchases/initiate-guest`,
        {
          bookId,
          courseId,
          ...formData
        }
      );

      const { razorpayOrderId, amount, keyId, prefill } = response.data.data;

      // 2. Open Razorpay modal
      const options = {
        key: keyId,
        amount: amount,
        currency: "INR",
        name: "Arjunasarrow",
        description: "Book Purchase",
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          // 3. Payment successful
          console.log('Payment ID:', response.razorpay_payment_id);
          
          // 4. Show success dialog with email
          showSuccessDialog(formData.guestEmail);
          
          // 5. Close this dialog
          onClose();
        },
        prefill: prefill,
        theme: {
          color: "#3399cc"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      if (error.response?.status === 400) {
        alert(error.response.data.error.message);
      } else {
        alert('Failed to initiate purchase');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields for name, email, mobile */}
    </form>
  );
};
```

### 4. Mobile Number Input Component

```typescript
// components/MobileInput.tsx
import { useState } from 'react';

const countryCodes = [
  { code: '+91', country: 'India' },
  { code: '+1', country: 'USA' },
  { code: '+44', country: 'UK' },
  // ... more countries
];

export const MobileInput = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
  const [countryCode, setCountryCode] = useState('+91');
  const [number, setNumber] = useState('');

  const handleNumberChange = (num: string) => {
    setNumber(num);
    // Combine country code + number
    onChange(countryCode + num);
  };

  const validateMobile = (mobile: string): boolean => {
    // E.164 format: +[1-9]\d{1,14}
    return /^\+[1-9]\d{1,14}$/.test(mobile);
  };

  return (
    <div>
      <select 
        value={countryCode} 
        onChange={(e) => {
          setCountryCode(e.target.value);
          onChange(e.target.value + number);
        }}
      >
        {countryCodes.map(c => (
          <option key={c.code} value={c.code}>
            {c.country} ({c.code})
          </option>
        ))}
      </select>
      <input
        type="tel"
        value={number}
        onChange={(e) => handleNumberChange(e.target.value)}
        placeholder="9876543210"
      />
      {value && !validateMobile(value) && (
        <span style={{ color: 'red' }}>Invalid mobile format</span>
      )}
    </div>
  );
};
```

### 5. Success Dialog

```typescript
// components/PurchaseSuccessDialog.tsx
export const PurchaseSuccessDialog = ({ email }: { email: string }) => {
  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      window.location.href = '/';
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Dialog open={true}>
      <DialogContent>
        <CheckCircleIcon style={{ color: 'green', fontSize: 60 }} />
        <h2>Payment Successful!</h2>
        <p>
          Check your email <strong>{email}</strong> for login instructions.
        </p>
        <Button onClick={() => window.location.href = '/login'}>
          Go to Login
        </Button>
        <p style={{ color: '#666', fontSize: 12 }}>
          Redirecting to home in 5 seconds...
        </p>
      </DialogContent>
    </Dialog>
  );
};
```

---

## 🔍 Error Handling

### Common Error Patterns

```typescript
// utils/handlePurchaseError.ts
export const handlePurchaseError = (error: any) => {
  if (!error.response) {
    return 'Network error. Please check your connection.';
  }

  const status = error.response.status;
  const errorData = error.response.data.error;

  switch (status) {
    case 400:
      // Validation errors - show to user
      return errorData.message;
    
    case 401:
      // Not authenticated - redirect to login
      window.location.href = '/login';
      return 'Please login to continue';
    
    case 404:
      // Book not found
      return 'Book not available for purchase';
    
    case 500:
      // Server error - retry or contact support
      return 'Server error. Please try again or contact support.';
    
    default:
      return 'An unexpected error occurred';
  }
};
```

---

## 📊 Testing Checklist

### Pre-Payment Validation Tests

- [ ] **Authenticated User**:
  - [ ] User owns book → Shows "You already own this book"
  - [ ] User doesn't own book → Proceeds to payment

- [ ] **Guest User**:
  - [ ] Email exists + owns book → "You already own this book. Please login."
  - [ ] Email exists + doesn't own → "Account exists. Please login to continue."
  - [ ] Email doesn't exist → Proceeds to payment

### Payment Flow Tests

- [ ] **Razorpay Modal Opens**:
  - [ ] Pre-filled with user/guest details
  - [ ] Shows correct amount
  - [ ] Test mode shows test card options

- [ ] **Payment Success**:
  - [ ] Webhook received and processed
  - [ ] User created in Cognito (for guests)
  - [ ] Access granted in database
  - [ ] Success dialog shows with correct email

- [ ] **Payment Failure**:
  - [ ] Razorpay shows error
  - [ ] No access granted
  - [ ] User can retry

### Mobile Number Tests

- [ ] **Valid Formats**:
  - [ ] India: `+919876543210` ✅
  - [ ] USA: `+12025551234` ✅
  - [ ] UK: `+442071234567` ✅

- [ ] **Invalid Formats**:
  - [ ] Missing +: `919876543210` ❌
  - [ ] With spaces: `+91 9876 543210` ❌
  - [ ] With dashes: `+91-9876-543210` ❌

---

## 🔐 Security Considerations

1. **JWT Validation**: Backend validates JWT signature and expiration
2. **Webhook Signature**: HMAC SHA256 verification prevents fake webhooks
3. **Idempotency**: Duplicate payments don't create duplicate access
4. **Pre-Payment Checks**: Prevents duplicate purchases and accounts
5. **Secrets Management**: Razorpay keys stored in AWS Secrets Manager (never in frontend)

---

## 🚀 Environment Variables

Frontend needs:
```env
NEXT_PUBLIC_API_URL=https://api.arjunasarrow.in
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
```

Backend has (Lambda env vars):
```env
USER_ACCESS_TABLE=arjunasarrow-user-access-prod
PURCHASE_ORDERS_TABLE=arjunasarrow-purchase-orders-prod
RAZORPAY_SECRET_ARN=arn:aws:secretsmanager:ap-south-1:xxx:secret:arjunasarrow/prod/razorpay-xxx
USER_POOL_ID=ap-south-1_xxxxxxxxx
```

---

## 📞 Support

For issues:
1. Check CloudWatch logs for backend errors
2. Verify Razorpay dashboard for payment status
3. Check Cognito user pool for user creation
4. Verify DynamoDB tables for access grants

---

**Document Version**: 1.0  
**Last Updated**: November 19, 2025  
**Status**: ✅ Ready for Implementation
