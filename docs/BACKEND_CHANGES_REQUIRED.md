# Backend Changes Required for Public Books Page

## Overview
The frontend now has a public books page (`/books`) where guest users can browse and purchase PAID_ONLY books. This requires backend changes to support:
1. A public API endpoint to fetch books without authentication
2. A `description` field in the Book model for marketing content

---

## 1. Database Schema Update

### Add `description` Field to Book Table

**Field Specification:**
- **Field Name:** `description`
- **Type:** String
- **Required:** No (optional)
- **Max Length:** 500 characters (recommended)
- **Purpose:** Display on public books page for marketing/explanation

**DynamoDB Update (if using DynamoDB):**
```python
# Add to Book item schema
{
    "id": "string",
    "courseId": "string",
    "title": "string",
    "description": "string",  # NEW FIELD (optional)
    "order": "number",
    "status": "string",
    "accessType": "string",
    "price": "number",
    "currency": "string",
    "eligibleCourses": ["string"],
    "chapters": [...],
    "createdAt": "string",
    "updatedAt": "string"
}
```

**PostgreSQL/MySQL Update (if using relational DB):**
```sql
ALTER TABLE books 
ADD COLUMN description VARCHAR(500) NULL;
```

---

## 2. API Changes

### A. Update Existing Endpoint: POST /v1/course/{courseId}/books

**Current Request Body:**
```json
{
  "title": "string",
  "order": "number",
  "accessType": "COURSE_DEFAULT" | "PAID_ONLY",
  "price": "number",
  "currency": "string",
  "eligibleCourses": ["string"]
}
```

**Updated Request Body (add description):**
```json
{
  "title": "string",
  "description": "string",  // NEW - Optional field
  "order": "number",
  "accessType": "COURSE_DEFAULT" | "PAID_ONLY",
  "price": "number",
  "currency": "string",
  "eligibleCourses": ["string"]
}
```

**Implementation Notes:**
- Accept `description` in request body (optional)
- Validate: Max 500 characters if provided
- Store in Book record
- Return description in response

---

### B. Create New Endpoint: GET /v1/books/public

**Purpose:** Allow unauthenticated users to browse PAID_ONLY books

**Authentication:** ❌ **NONE REQUIRED** (public endpoint)

**Query Parameters:**
None required (optional: pagination in future)

**Request Example:**
```bash
GET https://api.arjunasarrow.com/v1/books/public
# No Authorization header required
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "books": [
      {
        "bookId": "book-123",
        "title": "UPSC Prelims 2025 - Complete Guide",
        "description": "Comprehensive preparation material for UPSC Prelims examination covering all topics with practice questions and previous year papers.",
        "order": 1,
        "chapters": [],
        "accessType": "PAID_ONLY",
        "price": 99900,
        "currency": "INR",
        "eligibleCourses": ["2025_UPSC_PRELIMS", "2025_UPSC_MAINS", "PAID_USER"],
        "courseId": "XII_CBSE"
      },
      {
        "bookId": "book-789",
        "title": "Class XII Physics - Board Exam Special",
        "description": "Complete physics guide for Class XII board exams with solved examples, diagrams, and important questions.",
        "order": 2,
        "chapters": [],
        "accessType": "PAID_ONLY",
        "price": 49900,
        "currency": "INR",
        "eligibleCourses": ["2025_XII_CBSE", "2025_XII_ICSE", "PAID_USER"],
        "courseId": "XII_ICSE"
      }
    ]
  }
}
```

**Error Responses:**
```json
{
  "success": false,
  "error": {
    "message": "Internal server error",
    "code": "INTERNAL_ERROR"
  }
}
```

**Implementation Requirements:**

1. **Filtering Logic:**
   ```python
   # Pseudo-code
   def get_public_books():
       # Query books table
       books = query_books(
           filter_expression: "accessType = 'PAID_ONLY'",
           status: "published"  # Only show published books
       )
       return books
   ```

2. **Security Considerations:**
   - ✅ **Include:** bookId, title, description, order, accessType, price, currency, eligibleCourses, courseId
   - ⚠️ **Include but empty:** `chapters` array (return as empty array `[]` for security)
   - ❌ **Exclude chapter content:** Do NOT include chapter resources, URLs, or content structure
   - ❌ **Exclude:** `createdAt`, `updatedAt` (not needed for public display)
   - ❌ **Exclude:** `status` field (internal use only)

3. **Performance:**
   - Add index on `accessType` field for efficient filtering
   - Consider caching this endpoint (books don't change frequently)
   - Implement pagination if book count exceeds 50

4. **CORS Configuration:**
   - Allow all origins for this public endpoint
   - Or specifically allow your frontend domain

---

## 3. Implementation Checklist

### Database Layer
- [ ] Add `description` field to Book table/schema
- [ ] Create/update migration script (if using migrations)
- [ ] Add index on `accessType` field (if not exists)
- [ ] Test schema changes in development environment

### API Layer - Create Book
- [ ] Update createBook handler to accept `description` parameter
- [ ] Add validation: max 500 characters
- [ ] Store description in database
- [ ] Update response to include description
- [ ] Test with both authenticated and guest purchases

### API Layer - Public Books Endpoint
- [ ] Create new route: GET /v1/books/public
- [ ] Implement filtering: accessType = 'PAID_ONLY' AND status = 'published'
- [ ] Exclude `chapters` array from response (SECURITY)
- [ ] Add CORS headers for public access
- [ ] Implement error handling
- [ ] Add logging for monitoring
- [ ] Consider rate limiting (prevent abuse)

### Testing
- [ ] Test description field in createBook API
- [ ] Test public books endpoint without auth token
- [ ] Verify chapters are NOT exposed in public endpoint
- [ ] Test with empty/null description values
- [ ] Test with very long descriptions (500+ chars)
- [ ] Load test public endpoint (handle 100+ concurrent requests)

### Documentation
- [ ] Update API documentation with public endpoint
- [ ] Update Book model documentation with description field
- [ ] Add example curl commands
- [ ] Document rate limiting policies (if implemented)

---

## 4. Example Implementation (Python/FastAPI)

```python
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel, Field

router = APIRouter()

class PublicBook(BaseModel):
    id: str
    courseId: str
    title: str
    description: Optional[str] = None
    price: int  # in paise
    currency: str
    eligibleCourses: List[str]

class PublicBooksResponse(BaseModel):
    success: bool
    data: dict

@router.get("/v1/books/public", response_model=PublicBooksResponse)
async def get_public_books():
    """
    Public endpoint to fetch all PAID_ONLY books.
    No authentication required.
    """
    try:
        # Query books from database
        books = await db.query_books(
            filter_expression="accessType = :access_type AND #status = :status",
            expression_attribute_names={"#status": "status"},
            expression_attribute_values={
                ":access_type": "PAID_ONLY",
                ":status": "published"
            }
        )
        
        # Transform to public format (empty chapters array for security)
        public_books = []
        for book in books:
            public_books.append({
                "bookId": book["id"],
                "title": book["title"],
                "description": book.get("description"),  # Optional field
                "order": book.get("order", 0),
                "chapters": [],  # Always empty for security
                "accessType": book["accessType"],
                "price": book["price"],
                "currency": book.get("currency", "INR"),
                "eligibleCourses": book.get("eligibleCourses", ["PAID_USER"]),
                "courseId": book.get("courseId", "")  # Needed for purchase flow
            })
        
        return {
            "success": True,
            "data": {
                "books": public_books
            }
        }
    
    except Exception as e:
        logger.error(f"Error fetching public books: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch books"
        )

# Update createBook to accept description
class CreateBookRequest(BaseModel):
    title: str = Field(..., max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    order: Optional[int] = None
    accessType: str = Field(..., regex="^(COURSE_DEFAULT|PAID_ONLY)$")
    price: Optional[int] = None
    currency: Optional[str] = "INR"
    eligibleCourses: Optional[List[str]] = None

@router.post("/v1/course/{courseId}/books")
async def create_book(courseId: str, request: CreateBookRequest):
    book_data = {
        "title": request.title,
        "accessType": request.accessType,
        # ... other fields
    }
    
    # Add description if provided
    if request.description:
        book_data["description"] = request.description
    
    # ... rest of implementation
```

---

## 5. Example Implementation (Node.js/Express)

```javascript
const express = require('express');
const router = express.Router();

// Public books endpoint (no auth middleware)
router.get('/v1/books/public', async (req, res) => {
  try {
    // Query books from DynamoDB/database
    const params = {
      TableName: 'Books',
      FilterExpression: 'accessType = :accessType AND #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':accessType': 'PAID_ONLY',
        ':status': 'published'
      }
    };
    
    const result = await dynamodb.scan(params).promise();
    
    // Transform to public format (empty chapters array for security)
    const publicBooks = result.Items.map(book => ({
      bookId: book.id,
      title: book.title,
      description: book.description || null,
      order: book.order || 0,
      chapters: [], // Always empty for security
      accessType: book.accessType,
      price: book.price,
      currency: book.currency || 'INR',
      eligibleCourses: book.eligibleCourses || ['PAID_USER'],
      courseId: book.courseId || ''
    }));
    
    res.json({
      success: true,
      data: {
        books: publicBooks
      }
    });
  } catch (error) {
    console.error('Error fetching public books:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch books',
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

// Update createBook to accept description
router.post('/v1/course/:courseId/books', authMiddleware, async (req, res) => {
  const { title, description, accessType, price, currency, eligibleCourses } = req.body;
  
  // Validate description length
  if (description && description.length > 500) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Description must be 500 characters or less',
        code: 'VALIDATION_ERROR'
      }
    });
  }
  
  const bookData = {
    id: generateId(),
    courseId: req.params.courseId,
    title,
    accessType,
    // ... other fields
  };
  
  // Add description if provided
  if (description) {
    bookData.description = description;
  }
  
  // ... rest of implementation
});

module.exports = router;
```

---

## 6. Security Considerations

### Critical: Do NOT Expose Chapter Data
The public endpoint MUST NOT return the `chapters` array. This would expose:
- Content structure
- Resource URLs
- Internal organization

**Correct Response:**
```json
{
  "id": "book-123",
  "title": "UPSC Guide",
  "description": "...",
  "price": 99900
}
```

**❌ NEVER Return:**
```json
{
  "id": "book-123",
  "chapters": [  // ❌ DON'T EXPOSE THIS
    {
      "id": "chapter-1",
      "title": "Introduction",
      "resources": [...]  // ❌ SECURITY RISK
    }
  ]
}
```

### Rate Limiting
Consider adding rate limiting to prevent abuse:
```javascript
// Example with express-rate-limit
const rateLimit = require('express-rate-limit');

const publicBooksLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many requests, please try again later'
});

router.get('/v1/books/public', publicBooksLimiter, async (req, res) => {
  // ... implementation
});
```

---

## 7. Frontend Integration Points

The frontend is already configured to call:
- **Endpoint:** `GET /v1/books/public`
- **File:** `src/hooks/usePublicBooks.ts`
- **Base URL:** Uses `NEXT_PUBLIC_API_BASE_URL` environment variable

Once backend changes are deployed, the frontend will automatically work.

---

## 8. Testing Commands

### Test Public Books Endpoint
```bash
# Should work without auth token
curl https://api.arjunasarrow.com/v1/books/public

# Expected: List of PAID_ONLY books with descriptions
```

### Test Create Book with Description
```bash
curl -X POST https://api.arjunasarrow.com/v1/course/course-123/books \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Book",
    "description": "This is a test book description",
    "accessType": "PAID_ONLY",
    "price": 99900,
    "currency": "INR",
    "eligibleCourses": ["2025_UPSC_PRELIMS", "PAID_USER"]
  }'

# Expected: Book created with description field
```

---

## 9. Deployment Steps

1. **Development Environment:**
   - Apply database schema changes
   - Deploy backend code changes
   - Test public endpoint manually
   - Verify chapters are not exposed

2. **Staging Environment:**
   - Repeat development steps
   - Run automated tests
   - Test frontend integration
   - Load test public endpoint

3. **Production Environment:**
   - Schedule maintenance window (if needed for DB changes)
   - Apply database migration
   - Deploy backend code
   - Monitor error rates
   - Verify frontend integration
   - Update API documentation

---

## 10. Monitoring

After deployment, monitor:
- Request count to /v1/books/public
- Response times
- Error rates
- Cache hit rates (if caching implemented)
- Unusual traffic patterns (potential abuse)

---

## Summary

**Backend Changes Required:**
1. ✅ Add `description` field to Book table (optional, max 500 chars)
2. ✅ Update POST /v1/course/{courseId}/books to accept description
3. ✅ Create GET /v1/books/public endpoint (no auth)
4. ✅ Filter: accessType = 'PAID_ONLY' AND status = 'published'
5. ✅ Exclude chapters from public response (SECURITY)
6. ✅ Add rate limiting (recommended)
7. ✅ Test thoroughly before production deployment

**Expected Timeline:**
- Database changes: 30 minutes
- API implementation: 2-3 hours
- Testing: 1-2 hours
- Documentation: 30 minutes
- **Total: 4-6 hours**

**Priority:** HIGH (required for public books page to function)
