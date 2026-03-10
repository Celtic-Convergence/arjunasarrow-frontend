# 🚀 Arjunasarrow API Endpoints Documentation

Complete API reference with request/response formats for the Arjunasarrow e-learning platform.

## 📋 Base Information

- **Base URL**: `https://api.arjunasarrow.in` (prod) / `https://dev-api.arjunasarrow.in` (dev)
- **Authentication**: AWS Cognito JWT Bearer tokens
- **Content-Type**: `application/json`
- **CORS**: Enabled for authorized origins

## 🔐 Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📍 API Endpoints

### 1. Health Check

#### `GET /health`
**Access**: Public (No authentication required)
**Description**: Service health status

**Request**: None required

**Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "message": "Service is running normally",
    "environment": "prod"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

### 2. Get Course Data

#### `GET /v1/course`
**Access**: Protected (JWT required)
**Description**: Get course hierarchy
- **Regular Users**: Returns their enrolled course
- **Admin Users**: Returns array of all courses

**Request**: None required

**Response for Regular User** (`200 OK`):
```json
{
    "success": true,
    "data": {
        "courseId": "XI_CBSE",
        "title": "Class XI CBSE Foundation Course",
        "description": "Foundation course for CBSE Class XI students covering core subjects",
        "isAdmin": false,
        "books": [
            {
                "bookId": "organic-chemistry",
                "title": "Organic Chemistry",
                "order": 1,
                "chapters": [
                    {
                        "chapterId": "hydrocarbons-basics",
                        "title": "Hydrocarbons Basics",
                        "order": 1
                    },
                    {
                        "chapterId": "functional-groups",
                        "title": "Functional Groups",
                        "order": 2
                    }
                ]
            },
            {
                "bookId": "cell-biology",
                "title": "Cell Biology",
                "order": 2,
                "chapters": [
                    {
                        "chapterId": "cell-structure",
                        "title": "Cell Structure and Functions",
                        "order": 1
                    },
                    {
                        "chapterId": "cell-division",
                        "title": "Cell Division and Reproduction",
                        "order": 2
                    }
                ]
            }
        ]
    },
    "timestamp": "2025-05-28T21:04:36.192Z"
}
```

**Response for Admin User** (`200 OK`):
```json
{{
    "success": true,
    "data": {
        "courses": [
            {
                "courseId": "XI_CBSE",
                "title": "Class XI CBSE Foundation Course",
                "description": "Foundation course for CBSE Class XI students covering core subjects",
                "books": [
                    {
                        "bookId": "organic-chemistry",
                        "title": "Organic Chemistry",
                        "order": 1,
                        "chapters": [
                            {
                                "chapterId": "hydrocarbons-basics",
                                "title": "Hydrocarbons Basics",
                                "order": 1
                            },
                            {
                                "chapterId": "functional-groups",
                                "title": "Functional Groups",
                                "order": 2
                            }
                        ]
                    },
                    {
                        "bookId": "cell-biology",
                        "title": "Cell Biology",
                        "order": 2,
                        "chapters": [
                            {
                                "chapterId": "cell-structure",
                                "title": "Cell Structure and Functions",
                                "order": 1
                            },
                            {
                                "chapterId": "cell-division",
                                "title": "Cell Division and Reproduction",
                                "order": 2
                            }
                        ]
                    }
                ]
            },
            {
                "courseId": "XII_CBSE",
                "title": "Class XII CBSE Complete Course",
                "description": "Comprehensive CBSE Class XII curriculum covering all major subjects",
                "books": [
                    {
                        "bookId": "physics-fundamentals",
                        "title": "Physics Fundamentals",
                        "order": 1,
                        "chapters": [
                            {
                                "chapterId": "electromagnetism-basics",
                                "title": "Electromagnetism Basics",
                                "order": 1
                            },
                            {
                                "chapterId": "quantum-mechanics-intro",
                                "title": "Introduction to Quantum Mechanics",
                                "order": 2
                            }
                        ]
                    },
                    {
                        "bookId": "advanced-mathematics",
                        "title": "Advanced Mathematics",
                        "order": 2,
                        "chapters": [
                            {
                                "chapterId": "differential-calculus",
                                "title": "Differential Calculus",
                                "order": 1
                            },
                            {
                                "chapterId": "linear-algebra-fundamentals",
                                "title": "Linear Algebra Fundamentals",
                                "order": 2
                            }
                        ]
                    }
                ]
            }
        ],
        "isAdmin": true,
        "totalScanned": 14
    },
    "timestamp": "2025-05-28T21:23:56.563Z"
}
```

---

### 3. Get Chapter Details

#### `GET /v1/chapters/{chapterId}`
**Access**: Protected (JWT required)
**Description**: Get specific chapter with resources and time-limited signed URLs

**URL Parameters**:
- `chapterId` (string, required): Chapter identifier

**Request**: None required

**Response for Regular User** (`200 OK`):
```json
{
    "success": true,
    "data": {
        "chapterId": "hydrocarbons-basics",
        "title": "Hydrocarbons Basics",
        "bookId": "organic-chemistry",
        "courseId": "XI_CBSE",
        "order": 1,
        "canUpload": false,
        "isAdmin": false,
        "resources": {
            "pdfs": [
                {
                    "id": "pdf-hydro-001",
                    "filename": "hydrocarbon-structures.pdf",
                    "signedUrl": "https://d2g812ib16t6xm.cloudfront.net/courses/XI_CBSE/organic-chemistry/hydrocarbons-basics/pdfs/hydrocarbon-structures.pdf?Expires=1748473190&Key-Pair-Id=K22X5QEWHPT69I&Signature=EmeeiH4H1IxlEJoNhZU2VSXxcjTImyfRD-AmdWg51wmpdnZpwwysNSVWqdV7ZZHUK~fN7WA25FnwwROVek2rUGw7sNsenYtNKuxg2Dzqp9uj5VvD~4afaZI6VNMJW1yVqNhGwN35xVFV9iidpmofONPp7j5tUvvfXVI0ucqC~MTN8b-Q6G8FK2J2OWBBeNpZxnM281vfR2EgAVz~LDPj2CRaJzlSd9IwSt~z3-~c46dx7-g6cNF4E4b7kPoJV5QqztTj1TaBR6~w-49L8-hO21nGcYCRD1jVJIKRW9nZ7RZRqK2QZTfM8MbAKQFItDo3FhA5F6qcyWvJcZqT42wbSw__"
                },
                {
                    "id": "pdf-hydro-002",
                    "filename": "hydrocarbon-reactions.pdf",
                    "signedUrl": "https://d2g812ib16t6xm.cloudfront.net/courses/XI_CBSE/organic-chemistry/hydrocarbons-basics/pdfs/hydrocarbon-reactions.pdf?Expires=1748473190&Key-Pair-Id=K22X5QEWHPT69I&Signature=EAlxWVuJ9ETcuZOw0E~tC81Ck3TCONhujfPBCjDdDcsopJjGS8qXKl6L~LZtsM5FEtq0TGCQA0sX~ACZqjI4IXi1iQGB~wcYdjYh9a8dRSxKnhpE2jZyMcoW02I61zvycIjWLCNTFYujZAzhTRG7Qq~dJl0oNRTdDE0gEkStd-3Iv2SP98aTyKnX1SeXHMayWJolW5yFFWCiAZvYn8n9~J1qLbr1KUk136AFoirRSHdb4~LhiLhmM8gjgVqygNyXZlMtS0lzBav1-8CV9~-nlAcY0KUXZ~b6BeewwTltoV4iYZ5LQd4FKuLgl3St5MKcmfR2NHPN2kN6assudHpsrw__"
                }
            ],
            "videos": [
                {
                    "id": "vid-hydro-001",
                    "filename": "hydrocarbon-introduction.mp4",
                    "quality": "720p",
                    "signedUrl": "https://d2g812ib16t6xm.cloudfront.net/courses/XI_CBSE/organic-chemistry/hydrocarbons-basics/videos/hydrocarbon-introduction.mp4?Expires=1748478590&Key-Pair-Id=K22X5QEWHPT69I&Signature=e1L4PqbTUiDFrB3S92Knf6UbYXoo9lRdfi6laiyspykJkJ0j0y0WJkEpuebrN~szpyCXRuPQrNby7iL9vhYgJB1tHu1fpwIfJ2k7Mjmx8twb40sXWqA-BB9c8g4l3JgW8wGQtGDK2FSFuy6tqOCA0Bf2EDTxxHgZzFh1hya4vLOeYboZvbEzERYqeFHa5fTSlaKfwfpmfiyOuNaUZ6ljee0Ow3xF8AbeJkFdgZFbjoutN9Ramw-WrnQ5NPOzvWkMJkhL8-JWB5V8mSWjXRq90AjXaQ~PSLA3z-jEQb-8ixOxMFMhuMGoIDaRZixuy6PbzrYEvOHWe7q2gb-5BT-4wA__"
                },
                {
                    "id": "vid-hydro-002",
                    "filename": "hydrocarbon-lab-demo.mp4",
                    "quality": "720p",
                    "signedUrl": "https://d2g812ib16t6xm.cloudfront.net/courses/XI_CBSE/organic-chemistry/hydrocarbons-basics/videos/hydrocarbon-lab-demo.mp4?Expires=1748478590&Key-Pair-Id=K22X5QEWHPT69I&Signature=Nmg-WeZMps0yjU0qoYmBR9mWGuq2VHmihgeW98-P0jmIeV44GK0vA7Usi0JjEPYziZ11FKyeMdNitN7YgeQg2jATheIMzBXWCcrwg-BkmZsFhAp71dwAObAwYUXdOPk7vtda5aNRwx1JpXdsd1hx2fyLEVgx203NULyTHxuFOfEvKSIB6HVARVW9GdOYH438dgztz0TdQAZHMvnwqsmVMF2AKksumLLwsTRgB8wo~IXi4p6Jp53IAdyisseOpwOmdZObaFXW2yO~vMvper17BlqvdsU~A30j2jQga2-I4vysx4DaCLQ1nJj~7aL-61zZrfxaUKDmkyPC7rpk9RfWiw__"
                }
            ]
        }
    },
    "timestamp": "2025-05-28T22:29:50.325Z"
}
```

**Response for Admin User** (`200 OK`):
```json
{
    "success": true,
    "data": {
        "chapterId": "hydrocarbons-basics",
        "title": "Hydrocarbons Basics",
        "bookId": "organic-chemistry",
        "courseId": "XI_CBSE",
        "order": 1,
        "canUpload": true,
        "isAdmin": true,
        "uploadConfig": {
            "allowedFormats": [
                "application/pdf",
                "video/mp4"
            ],
            "maxFileSizes": {
                "pdf": 25,
                "video": 2048
            },
            "existingFiles": {
                "pdfs": [
                    {
                        "id": "pdf-hydro-001",
                        "filename": "hydrocarbon-structures.pdf",
                        "uploadedAt": "2024-01-01T11:04:00.000Z"
                    },
                    {
                        "id": "pdf-hydro-002",
                        "filename": "hydrocarbon-reactions.pdf",
                        "uploadedAt": "2024-01-01T11:05:00.000Z"
                    }
                ],
                "videos": [
                    {
                        "id": "vid-hydro-001",
                        "filename": "hydrocarbon-introduction.mp4",
                        "quality": "720p",
                        "uploadedAt": "2024-01-01T11:06:00.000Z"
                    },
                    {
                        "id": "vid-hydro-002",
                        "filename": "hydrocarbon-lab-demo.mp4",
                        "quality": "720p",
                        "uploadedAt": "2024-01-01T11:07:00.000Z"
                    }
                ]
            }
        },
        "resources": {
            "pdfs": [
                {
                    "id": "pdf-hydro-001",
                    "filename": "hydrocarbon-structures.pdf",
                    "signedUrl": "https://d2g812ib16t6xm.cloudfront.net/courses/XI_CBSE/organic-chemistry/hydrocarbons-basics/pdfs/hydrocarbon-structures.pdf?Expires=1748472805&Key-Pair-Id=K22X5QEWHPT69I&Signature=BaYh7dspy4NKJ1OvERQhLKOZc-65kSWn-3JEldAtsMGoURNZx87k1uRhylz3afIrOhBPwFnkygmT~ruPgKUcbdDKhPMMvp~QRq~QnGmyR0pT~mKzdN2KhkWyVdnC-j9pEnp9QpIzn70A42SMht-LRZeUbExtReCj6~75htrmf5LIuQtluBIPgCJg4V-OT4M5Dm30OXGfiuF1lMnMfRRfynzCdZE4vV4lwvRvm~ppqy3t6d-6ccvftR6wkj5V~XVcR6X7mEWHK8TjAHFr7K4hyxrNHk7G8QpBq09Y81lwy6pnCCsFqVapsavE0nofxuTt2kcBdirivoIKHiBMsBYQ1g__"
                },
                {
                    "id": "pdf-hydro-002",
                    "filename": "hydrocarbon-reactions.pdf",
                    "signedUrl": "https://d2g812ib16t6xm.cloudfront.net/courses/XI_CBSE/organic-chemistry/hydrocarbons-basics/pdfs/hydrocarbon-reactions.pdf?Expires=1748472805&Key-Pair-Id=K22X5QEWHPT69I&Signature=EjFMjQFDFh4kXFb7PAmr6xcvi6Zc0NPMaUUi3sDReLpY79oqFkYhRSi5H2SJfaxsHyWmGSkqTCKZTlmLAG-UOacyUkYUa7L7EQNVTkkWkkxH6OjrU31y8GVi17B7gYVUqNpl3GkyYDMeCSYu3HNmpsND-nVw7RJuWgtCmTZHcYYlprf8zQ1lyxOsOlSsghjGxPoKbJdEReLTZ8HrvEetFBEExnRaTKv31qvvubvIe3NI07TD5CeLXkRbfjhQxYvQQ7WDuIEKmv1RniSXjWtzWZXIQCBq~9pydutT17LhSWVtlihpmL0IZH8H79VEXZ0po~6~IjKnGDgTS0muC44GRQ__"
                }
            ],
            "videos": [
                {
                    "id": "vid-hydro-001",
                    "filename": "hydrocarbon-introduction.mp4",
                    "quality": "720p",
                    "signedUrl": "https://d2g812ib16t6xm.cloudfront.net/courses/XI_CBSE/organic-chemistry/hydrocarbons-basics/videos/hydrocarbon-introduction.mp4?Expires=1748478205&Key-Pair-Id=K22X5QEWHPT69I&Signature=HJRJ2ytlD4iQaK6XOTGYiC~1qh3QwWXiVW~zm4-E2bukG2XO9exd72nvSE2BZjnwLB9yc5wnLGiIdRpIjr2LLagFu~~U-osj7owoaAeSBr9ry2IZTd-MLu58wQ5u~pcT4XW4frrJ3dKjFVAzVHuv8OHB5k1hO8rvYK3mR0IDuFExKWGuZ6~I36iqzBQTdcPNHJOuZr-1-rFICHAQDEMlHPi0Iym3~yrJHp3oF5Xfq7UdNMA30V~4krhbHPDOfimJY79B5Yz8leNarQWwFm-t-~YtVqe2xHvHsg4L5i9LKiNjpBbQQGXQSUdadBglLnWtvOygbeTM54wM6~yMKH6d5A__"
                },
                {
                    "id": "vid-hydro-002",
                    "filename": "hydrocarbon-lab-demo.mp4",
                    "quality": "720p",
                    "signedUrl": "https://d2g812ib16t6xm.cloudfront.net/courses/XI_CBSE/organic-chemistry/hydrocarbons-basics/videos/hydrocarbon-lab-demo.mp4?Expires=1748478205&Key-Pair-Id=K22X5QEWHPT69I&Signature=U0XvUfRVivyaB7N1YUfpDBe0406irem3qhv-brODG8RK4tjiZDC5~ZB~xCekqmnaH3Nzk3-rYtGC~VB~DaYsYDy18xrfAolSXRNHtFeRpIziTkrPK~C32xx6YxsSi1akneA-YhK3sxJ35CVw7YYKKVKRzZhjAQ~bipFAJsY~pC9-f6qXmyZyAiRpamKALkJ82hK5zLXE121HMRN5qXqWRUTs8aCIdnBTsi5W~1wpk4jLwPzY6sR6PWOCC1eUWOp5dFVjzqhd~BhzMbpZJ416NJ6aT5JUCxmyw9QioZpj3Ng~a0vq9eo4plbzz6IZTQ1obXRoR7E2R2FN-bBhtQoSZA__"
                }
            ]
        }
    },
    "timestamp": "2025-01-15T14:22:15.789Z"
}
```

**Response Schema**:
- `chapterId` (string): Chapter identifier
- `title` (string): Chapter title
- `bookId` (string): Parent book identifier
- `courseId` (string): Parent course identifier  
- `order` (number): Display order within book
- `canUpload` (boolean): Whether user can upload files (admin only)
- `isAdmin` (boolean): Whether the user is an admin
- `resources` (object, optional): Available chapter resources with signed URLs
  - `pdfs` (array): PDF files with time-limited access
    - `id` (string): Unique file identifier
    - `filename` (string): Original filename
    - `signedUrl` (string): CloudFront signed URL (**30-minute expiration**)
  - `videos` (array): Video files with time-limited access
    - `id` (string): Unique file identifier
    - `filename` (string): Original filename
    - `quality` (string): Video quality (`720p`, `480p`, `360p`)
    - `signedUrl` (string): CloudFront signed URL (**2-hour expiration**)
- `uploadConfig` (object, admin only): File upload configuration and existing files

**Important Notes**:
- **Signed URL Expiration**:
  - PDF signed URLs expire after **30 minutes**
  - Video signed URLs expire after **2 hours**  
- **Security**: URLs are time-limited and tied to user authentication
- **Performance**: URLs are generated on-demand for each request
- **Graceful Degradation**: If signed URL generation fails, chapter data is still returned without `resources` field

---

### 4. Delete Chapter Resource

#### `DELETE /v1/chapters/{chapterId}/resources/{resourceId}`
**Access**: Admin Only (JWT required + Admin group)
**Description**: Delete a specific resource (PDF or video) from a chapter. Only removes metadata from DynamoDB - S3 files are preserved for lifecycle cleanup.

**URL Parameters**:
- `chapterId` (string, required): Chapter identifier
- `resourceId` (string, required): Resource identifier to delete

**Request**: None required

**Response** (`200 OK`):
```json
{
    "success": true,
    "data": {
        "chapterId": "hydrocarbons-basics",
        "title": "Hydrocarbons Basics",
        "bookId": "organic-chemistry",
        "courseId": "XI_CBSE",
        "order": 1,
        "canUpload": true,
        "isAdmin": true,
        "uploadConfig": {
            "allowedFormats": [
                "application/pdf",
                "video/mp4"
            ],
            "maxFileSizes": {
                "pdf": 25,
                "video": 2048
            },
            "existingFiles": {
                "pdfs": [
                    {
                        "id": "pdf-hydro-002",
                        "filename": "hydrocarbon-reactions.pdf",
                        "uploadedAt": "2024-01-01T11:05:00.000Z"
                    }
                ],
                "videos": [
                    {
                        "id": "vid-hydro-001",
                        "filename": "hydrocarbon-introduction.mp4",
                        "quality": "720p",
                        "uploadedAt": "2024-01-01T11:06:00.000Z"
                    },
                    {
                        "id": "vid-hydro-002",
                        "filename": "hydrocarbon-lab-demo.mp4",
                        "quality": "720p",
                        "uploadedAt": "2024-01-01T11:07:00.000Z"
                    }
                ]
            }
        },
        "resources": {
            "pdfs": [
                {
                    "id": "pdf-hydro-002",
                    "filename": "hydrocarbon-reactions.pdf",
                    "signedUrl": "https://d2g812ib16t6xm.cloudfront.net/courses/XI_CBSE/organic-chemistry/hydrocarbons-basics/pdfs/hydrocarbon-reactions.pdf?Expires=1748472805&Key-Pair-Id=K22X5QEWHPT69I&Signature=EjFMjQFDFh4kXFb7PAmr6xcvi6Zc0NPMaUUi3sDReLpY79oqFkYhRSi5H2SJfaxsHyWmGSkqTCKZTlmLAG-UOacyUkYUa7L7EQNVTkkWkkxH6OjrU31y8GVi17B7gYVUqNpl3GkyYDMeCSYu3HNmpsND-nVw7RJuWgtCmTZHcYYlprf8zQ1lyxOsOlSsghjGxPoKbJdEReLTZ8HrvEetFBEExnRaTKv31qvvubvIe3NI07TD5CeLXkRbfjhQxYvQQ7WDuIEKmv1RniSXjWtzWZXIQCBq~9pydutT17LhSWVtlihpmL0IZH8H79VEXZ0po~6~IjKnGDgTS0muC44GRQ__"
                }
            ],
            "videos": [
                {
                    "id": "vid-hydro-001",
                    "filename": "hydrocarbon-introduction.mp4",
                    "quality": "720p",
                    "signedUrl": "https://d2g812ib16t6xm.cloudfront.net/courses/XI_CBSE/organic-chemistry/hydrocarbons-basics/videos/hydrocarbon-introduction.mp4?Expires=1748478205&Key-Pair-Id=K22X5QEWHPT69I&Signature=HJRJ2ytlD4iQaK6XOTGYiC~1qh3QwWXiVW~zm4-E2bukG2XO9exd72nvSE2BZjnwLB9yc5wnLGiIdRpIjr2LLagFu~~U-osj7owoaAeSBr9ry2IZTd-MLu58wQ5u~pcT4XW4frrJ3dKjFVAzVHuv8OHB5k1hO8rvYK3mR0IDuFExKWGuZ6~I36iqzBQTdcPNHJOuZr-1-rFICHAQDEMlHPi0Iym3~yrJHp3oF5Xfq7UdNMA30V~4krhbHPDOfimJY79B5Yz8leNarQWwFm-t-~YtVqe2xHvHsg4L5i9LKiNjpBbQQGXQSUdadBglLnWtvOygbeTM54wM6~yMKH6d5A__"
                },
                {
                    "id": "vid-hydro-002",
                    "filename": "hydrocarbon-lab-demo.mp4",
                    "quality": "720p",
                    "signedUrl": "https://d2g812ib16t6xm.cloudfront.net/courses/XI_CBSE/organic-chemistry/hydrocarbons-basics/videos/hydrocarbon-lab-demo.mp4?Expires=1748478205&Key-Pair-Id=K22X5QEWHPT69I&Signature=U0XvUfRVivyaB7N1YUfpDBe0406irem3qhv-brODG8RK4tjiZDC5~ZB~xCekqmnaH3Nzk3-rYtGC~VB~DaYsYDy18xrfAolSXRNHtFeRpIziTkrPK~C32xx6YxsSi1akneA-YhK3sxJ35CVw7YYKKVKRzZhjAQ~bipFAJsY~pC9-f6qXmyZyAiRpamKALkJ82hK5zLXE121HMRN5qXqWRUTs8aCIdnBTsi5W~1wpk4jLwPzY6sR6PWOCC1eUWOp5dFVjzqhd~BhzMbpZJ416NJ6aT5JUCxmyw9QioZpj3Ng~a0vq9eo4plbzz6IZTQ1obXRoR7E2R2FN-bBhtQoSZA__"
                }
            ]
        }
    },
    "timestamp": "2025-01-15T14:22:15.789Z"
}
```

**Response Schema**:
- Returns the updated chapter object with remaining resources after deletion
- Same structure as GET /v1/chapters/{chapterId} response for admin users
- `resources` field contains signed URLs for remaining files only
- `uploadConfig.existingFiles` reflects the updated file list

**Important Notes**:
- **Admin Only**: Only users in `Admin` Cognito group can delete chapter resources
- **Metadata Deletion**: Only removes resource metadata from DynamoDB
- **S3 Preservation**: S3 files remain and should be cleaned up by lifecycle policies
- **Resource Types**: Supports deletion of both PDF and video resources
- **Graceful Fallback**: If signed URL generation fails for remaining resources, chapter data is still returned without `resources` field
- **Audit Trail**: All deletion attempts are logged with user info and resource details

**S3 Lifecycle Policy Recommendation**:
```yaml
# Recommended S3 Bucket Lifecycle Policy for Chapter Resources
Rules:
  - Id: CleanupOrphanedChapterResources
    Status: Enabled
    Filter:
      Prefix: "courses/"
    Expiration:
      Days: 90  # Auto-delete orphaned files after 90 days
```

**Error Responses**:

**404 Not Found - Chapter**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Chapter not found"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**404 Not Found - Resource**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found in this chapter"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**403 Forbidden**:
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Access denied: Only administrators can delete chapter resources. Please contact your administrator for assistance."
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**400 Bad Request**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Chapter ID and Resource ID are required"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

### 5. Generate Upload URLs

#### `POST /v1/upload`
**Access**: Admin Only (JWT required + Admin group)
**Description**: Generate presigned S3 upload URLs for files

**Request Body**:
```json
{
  "chapterId": "motion",
  "files": [
    {
      "fileName": "lesson1.pdf",
      "fileSize": 2048576,
      "contentType": "application/pdf"
    },
    {
      "fileName": "video-lecture.mp4",
      "fileSize": 104857600,
      "contentType": "video/mp4",
      "quality": "720p"
    }
  ]
}
```

**Request Body Schema**:
- `chapterId` (string, required): Target chapter ID
- `files` (array, required): Array of file objects
  - `fileName` (string, required): Original filename
  - `fileSize` (number, required): File size in bytes
  - `contentType` (string, required): MIME type (`application/pdf` or `video/mp4`)
  - `quality` (string, optional): Video quality (`720p`, `480p`, `360p`) - only for videos

**File Constraints**:
- **PDF files**: Max 25MB
- **Video files**: Max 2GB  
- **Allowed types**: `application/pdf`, `video/mp4`

**Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "uploadId": "550e8400-e29b-41d4-a716-446655440000",
    "urls": [
      {
        "fileId": "file-123",
        "fileName": "lesson1.pdf",
        "uploadUrl": "https://s3.amazonaws.com/bucket/path?signature=...",
        "s3Key": "uploads/motion/lesson1-timestamp.pdf",
        "expiresIn": 3600
      },
      {
        "fileId": "file-124",
        "fileName": "video-lecture.mp4",
        "uploadUrl": "https://s3.amazonaws.com/bucket/path?signature=...",
        "s3Key": "uploads/motion/video-lecture-timestamp.mp4",
        "expiresIn": 3600
      }
    ]
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

### 6. Complete Upload

#### `POST /v1/upload/{uploadId}/complete`
**Access**: Admin Only (JWT required + Admin group)
**Description**: Complete upload and update DynamoDB with file references

**URL Parameters**:
- `uploadId` (string, required): UUID from upload URL generation response

**Request Body**:
```json
{
  "chapterId": "motion",
  "completedFiles": [
    {
      "fileId": "file-123",
      "fileName": "lesson1.pdf",
      "s3Key": "uploads/motion/lesson1-timestamp.pdf",
      "contentType": "application/pdf"
    },
    {
      "fileId": "file-124",
      "fileName": "video-lecture.mp4",
      "s3Key": "uploads/motion/video-lecture-timestamp.mp4",
      "contentType": "video/mp4",
      "quality": "720p"
    }
  ]
}
```

**Request Body Schema**:
- `chapterId` (string, required): Target chapter ID (must match original request)
- `completedFiles` (array, required): Array of successfully uploaded files
  - `fileId` (string, required): File ID from upload URL response
  - `fileName` (string, required): Original filename
  - `s3Key` (string, required): S3 key from upload URL response
  - `contentType` (string, required): MIME type
  - `quality` (string, optional): Video quality - only for videos

**Response** (`204 No Content`): Empty body on success

---

### 7. Create Course (Admin)

#### `POST /v1/courses`
**Access**: Admin Only (JWT required + Admin group)
**Description**: Create a new course

**Request Body**:
```json
{
  "courseId": "XI_ICSE",
  "description": "Foundation course for CBSE Class XI students covering core subjects",
  "title": "Class XI ICSE Foundation Course"
}
```

**Request Body Schema**:
- `courseId` (string, required): Unique course identifier (3-50 characters, alphanumeric, underscore, and hyphen only)
- `title` (string, required): Course title (1-200 characters)
- `description` (string, required): Course description (1-1000 characters)

**Response** (`201 Created`):
```json
{
    "success": true,
    "data": {
        "courseId": "XI_ICSE",
        "title": "Class XI ICSE Foundation Course",
        "description": "Foundation course for CBSE Class XI students covering core subjects",
        "books": []
    },
    "timestamp": "2025-05-28T21:45:33.750Z"
}
```

---

### 8. Create Book (Admin)

#### `POST /v1/courses/{courseId}/books`
**Access**: Admin Only (JWT required + Admin group)
**Description**: Create a new book within a course

**URL Parameters**:
- `courseId` (string, required): Target course ID

**Request Body**:
```json
{
  "title": "Apni Kitaab 2",
  "order": 2
}
```

**Request Body Schema**:
- `title` (string, required): Book title (1-200 characters)
- `order` (number, optional): Display order (positive integer)

**Response** (`201 Created`):
```json
{
    "success": true,
    "data": {
        "bookId": "apni-kitaab-2-1748469783493",
        "title": "Apni Kitaab 2",
        "order": 2,
        "chapters": []
    },
    "timestamp": "2025-05-28T22:03:03.534Z"
}
```

---

### 9. Create Chapter (Admin)

#### `POST /v1/courses/{courseId}/books/{bookId}/chapters`
**Access**: Admin Only (JWT required + Admin group)
**Description**: Create a new chapter within a book

**URL Parameters**:
- `courseId` (string, required): Target course ID
- `bookId` (string, required): Target book ID

**Request Body**:
```json
{
  "title": "Apna Chapter 1",
  "order": 1
}
```

**Request Body Schema**:
- `title` (string, required): Chapter title (1-200 characters)
- `order` (number, optional): Display order (positive integer)

**Response** (`201 Created`):
```json
{
    "success": true,
    "data": {
        "chapterId": "apna-chapter-1-1748471274945",
        "title": "Apna Chapter 1",
        "bookId": "apni-kitaab-2-1748469783493",
        "courseId": "XI_ICSE",
        "order": 1,
        "canUpload": true,
        "isAdmin": true
    },
    "timestamp": "2025-05-28T22:27:54.986Z"
}
```

---

### 10. Update Book Title (Admin)

#### `PATCH /v1/courses/{courseId}/books/{bookId}`
**Access**: Admin Only (JWT required + Admin group)
**Description**: Update book title

**URL Parameters**:
- `courseId` (string, required): Target course ID
- `bookId` (string, required): Target book ID

**Request Body**:
```json
{
  "title": "Updated Organic Chemistry Fundamentals"
}
```

**Request Body Schema**:
- `title` (string, required): Book title (1-100 characters)

**Response** (`200 OK`):
```json
{
    "success": true,
    "data": {
        "book": {
            "bookId": "organic-chemistry",
            "title": "Updated Organic Chemistry Fundamentals",
            "order": 1,
            "chapters": [
                {
                    "chapterId": "hydrocarbons-basics",
                    "title": "Hydrocarbons Basics",
                    "order": 1
                },
                {
                    "chapterId": "functional-groups",
                    "title": "Functional Groups",
                    "order": 2
                }
            ]
        }
    },
    "timestamp": "2025-01-15T14:22:15.789Z"
}
```

**Validation Constraints**:
- **Title**: 1-100 characters, required
- **Course ID**: Must reference an existing, active course
- **Book ID**: Must reference an existing book within the specified course
- **Admin Access**: Only users in `Admin` Cognito group can update book titles

---

### 11. Update Chapter (Admin)

#### `PATCH /v1/courses/{courseId}/books/{bookId}/chapters/{chapterId}`
**Access**: Admin Only (JWT required + Admin group)
**Description**: Update chapter title

**URL Parameters**:
- `courseId` (string, required): Target course ID
- `bookId` (string, required): Target book ID
- `chapterId` (string, required): Target chapter ID

**Request Body**:
```json
{
  "title": "Updated Hydrocarbons Fundamentals"
}
```

**Request Body Schema**:
- `title` (string, required): Chapter title (1-200 characters)

**Response** (`200 OK`):
```json
{
    "success": true,
    "data": {
        "chapterId": "apna-chapter-1-1748471274945",
        "title": "Updated Hydrocarbons Fundamentals",
        "bookId": "apni-kitaab-2-1748469783493",
        "courseId": "XI_ICSE",
        "order": 1,
        "canUpload": true,
        "isAdmin": true,
        "uploadConfig": {
            "allowedFormats": [
                "application/pdf",
                "video/mp4"
            ],
            "maxFileSizes": {
                "pdf": 25,
                "video": 2048
            },
            "existingFiles": {
                "pdfs": [],
                "videos": []
            }
        }
    },
    "timestamp": "2025-01-15T14:22:15.789Z"
}
```

**Validation Constraints**:
- **Title**: 1-200 characters, required
- **Course ID**: Must reference an existing, active course
- **Book ID**: Must reference an existing book within the specified course
- **Admin Access**: Only users in `Admin` Cognito group can update chapter titles

---

### 12. Get Notifications (Paginated)

#### `GET /v1/notifications`
**Access**: Protected (JWT required)
**Description**: Get paginated notifications for user's course
- **Regular Users**: Returns notifications for their enrolled course only
- **Admin Users**: Can access notifications for any course by specifying `courseId` parameter

**Query Parameters**:
- `pageSize` (number, optional): Number of notifications per page (1-100, default: 20)
- `cursor` (string, optional): Pagination cursor for next/previous page
- `courseId` (string, optional): Course ID (admin only - regular users automatically use enrolled course)

**Request**: None required in body

**Response for Regular User** (`200 OK`):
```json
{
    "success": true,
    "data": {
        "notifications": [
            {
                "notificationId": "notification-1748472805123-abc123",
                "courseId": "XI_CBSE",
                "title": "Important: Exam Schedule Update",
                "content": "The final examination schedule has been updated. Please check the new dates for Chemistry and Biology exams. All students must review the updated schedule on the portal.",
                "priority": "HIGH",
                "status": "ACTIVE",
                "createdAt": "2025-01-15T10:30:00.000Z",
                "createdBy": "admin-user-123",
                "createdByName": "admin@example.com",
                "attachments": [
                    {
                        "id": "exam-schedule-001",
                        "filename": "exam-schedule-updated.pdf",
                        "originalFilename": "Final Exam Schedule - Updated.pdf",
                        "s3Key": "notifications/attachments/upload-123/exam-schedule-001-exam-schedule-updated.pdf",
                        "contentType": "application/pdf",
                        "fileSize": 1245678,
                        "uploadedAt": "2025-01-15T10:25:00.000Z",
                        "uploadedBy": "admin-user-123",
                        "downloadUrl": "https://d1234567890.cloudfront.net/notifications/attachments/upload-123/exam-schedule-001-exam-schedule-updated.pdf?Expires=1748476800&Key-Pair-Id=K22X5QEWHPT69I&Signature=CloudFront-signed-params..."
                    }
                ]
            },
            {
                "notificationId": "notification-1748469200456-def456",
                "courseId": "XI_CBSE",
                "title": "New Study Material Available",
                "content": "Additional practice questions for Organic Chemistry have been uploaded to Chapter 2. Students are encouraged to solve these before the upcoming test.",
                "priority": "MEDIUM",
                "status": "ACTIVE",
                "createdAt": "2025-01-14T15:45:00.000Z",
                "createdBy": "admin-user-123",
                "createdByName": "admin@example.com",
                "attachments": [
                    {
                        "id": "practice-001",
                        "filename": "organic-chemistry-practice.pdf",
                        "originalFilename": "Organic Chemistry Practice Questions.pdf",
                        "s3Key": "notifications/attachments/upload-456/practice-001-organic-chemistry-practice.pdf",
                        "contentType": "application/pdf",
                        "fileSize": 2856742,
                        "uploadedAt": "2025-01-14T15:40:00.000Z",
                        "uploadedBy": "admin-user-123",
                        "downloadUrl": "https://d1234567890.cloudfront.net/notifications/attachments/upload-456/practice-001-organic-chemistry-practice.pdf?Expires=1748476800&Key-Pair-Id=K22X5QEWHPT69I&Signature=CloudFront-signed-params..."
                    },
                    {
                        "id": "answer-key-001",
                        "filename": "answer-key.pdf",
                        "originalFilename": "Practice Questions Answer Key.pdf",
                        "s3Key": "notifications/attachments/upload-456/answer-key-001-answer-key.pdf",
                        "contentType": "application/pdf",
                        "fileSize": 987654,
                        "uploadedAt": "2025-01-14T15:42:00.000Z",
                        "uploadedBy": "admin-user-123",
                        "downloadUrl": "https://d1234567890.cloudfront.net/notifications/attachments/upload-456/answer-key-001-answer-key.pdf?Expires=1748476800&Key-Pair-Id=K22X5QEWHPT69I&Signature=CloudFront-signed-params..."
                    }
                ]
            },
            {
                "notificationId": "notification-1748465600789-ghi789",
                "courseId": "XI_CBSE",
                "title": "Library Maintenance Notice",
                "content": "The digital library will be under maintenance on January 20th from 2:00 AM to 6:00 AM IST. Access to study materials may be limited during this time.",
                "priority": "LOW",
                "status": "ACTIVE",
                "createdAt": "2025-01-13T09:15:00.000Z",
                "createdBy": "admin-user-456",
                "createdByName": "library@example.com"
            }
        ],
        "pagination": {
            "hasNextPage": false,
            "hasPreviousPage": false,
            "pageSize": 20
        }
    },
    "timestamp": "2025-01-15T14:22:15.789Z"
}
```

**Response for Admin User with `courseId` parameter** (`200 OK`):
```json
{
    "success": true,
    "data": {
        "notifications": [
            {
                "notificationId": "notification-1748476800123-xyz789",
                "courseId": "XII_CBSE",
                "title": "Board Exam Registration Reminder",
                "content": "Reminder: Board examination registration deadline is approaching. Students must complete their registration by January 31st, 2025.",
                "priority": "URGENT",
                "status": "ACTIVE",
                "createdAt": "2025-01-15T11:00:00.000Z",
                "createdBy": "admin-user-123",
                "createdByName": "admin@example.com"
            }
        ],
        "pagination": {
            "hasNextPage": false,
            "hasPreviousPage": false,
            "pageSize": 20
        }
    },
    "timestamp": "2025-01-15T14:22:15.789Z"
}
```

**Empty Result** (`200 OK`):
```json
{
    "success": true,
    "data": {
        "notifications": [],
        "pagination": {
            "hasNextPage": false,
            "hasPreviousPage": false,
            "pageSize": 20
        }
    },
    "timestamp": "2025-01-15T14:22:15.789Z"
}
```

**Response Schema**:
- `notifications` (array): Array of notification objects
  - `notificationId` (string): Unique notification identifier
  - `courseId` (string): Associated course ID
  - `title` (string): Notification title (max 200 characters)
  - `content` (string): Notification content (max 2000 characters)
  - `priority` (string): Notification priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`)
  - `status` (string): Notification status (`ACTIVE`, `ARCHIVED`)
  - `createdAt` (string): ISO timestamp when notification was created
  - `createdBy` (string): User ID of the creator
  - `createdByName` (string, optional): Display name/email of the creator
  - `attachments` (array, optional): Array of file attachments (only if notification has attachments)
    - `id` (string): File identifier
    - `filename` (string): Sanitized filename for storage
    - `originalFilename` (string): Original filename from upload
    - `s3Key` (string): S3 object key for the file
    - `contentType` (string): MIME type of the file
    - `fileSize` (number): File size in bytes
    - `uploadedAt` (string): ISO timestamp when file was uploaded
    - `uploadedBy` (string): User ID who uploaded the file
    - `downloadUrl` (string): CloudFront signed download URL (1-hour expiration)
- `pagination` (object): Pagination metadata
  - `hasNextPage` (boolean): Whether more notifications are available
  - `hasPreviousPage` (boolean): Whether there are previous notifications
  - `nextCursor` (string, optional): Cursor for fetching next page
  - `previousCursor` (string, optional): Cursor for fetching previous page
  - `pageSize` (number): Number of notifications per page

**Important Notes**:
- **Cursor-based Pagination**: Use `nextCursor` from response as `cursor` parameter for next page
- **Security**: Regular users can only access notifications for their enrolled course
- **Admin Access**: Admin users can access notifications for any course using `courseId` parameter
- **Performance**: Results are ordered by creation date (newest first)
- **Limits**: Maximum 100 notifications per page, default 20
- **Attachment Download URLs**: CloudFront signed URLs expire after 1 hour and are generated fresh on each request
- **Attachment Security**: Download URLs are tied to user authentication and delivered via AWS CloudFront CDN

---

### 13. Create Notification (Admin)

#### `POST /v1/notifications`
**Access**: Admin Only (JWT required + Admin group)
**Description**: Create a new notification for a specific course with optional file attachments

**Request Body**:
```json
{
  "courseId": "XI_CBSE",
  "title": "Important: Class Schedule Change",
  "content": "Due to unforeseen circumstances, tomorrow's Chemistry class has been rescheduled from 10:00 AM to 2:00 PM. Please make note of this change and inform all students.",
  "priority": "HIGH",
  "fileAttachments": [
    {
      "fileId": "file-uuid-1",
      "s3Key": "notifications/attachments/upload-id/file-uuid-1-document-1.pdf",
      "filename": "document-1.pdf",
      "contentType": "application/pdf",
      "fileSize": 2456789
    },
    {
      "fileId": "file-uuid-2",
      "s3Key": "notifications/attachments/upload-id/file-uuid-2-document-2.pdf",
      "filename": "document-2.pdf",
      "contentType": "application/pdf",
      "fileSize": 1843621
    }
  ]
}
```

**Request Body Schema**:
- `courseId` (string, required): Target course ID (must be an existing, active course)
- `title` (string, required): Notification title (1-200 characters)
- `content` (string, required): Notification content (1-2000 characters)
- `priority` (string, optional): Notification priority - defaults to `MEDIUM`
  - Allowed values: `LOW`, `MEDIUM`, `HIGH`, `URGENT`
- `fileAttachments` (array, optional): Array of file objects
  - `fileId` (string, required): File ID from attachment upload (max 5 files)
  - `s3Key` (string, required): S3 key from attachment upload (max 5 files)
  - `filename` (string, required): Original filename from upload (max 255 characters)
  - `contentType` (string, required): MIME type of the file (max 255 characters)
  - `fileSize` (number, required): File size in bytes (max 10MB per file, 50MB total)

**Response** (`201 Created`):
```json
{
    "success": true,
    "data": {
        "notificationId": "notification-1748476800456-abc123def",
        "courseId": "XI_CBSE",
        "title": "Important: Class Schedule Change",
        "content": "Due to unforeseen circumstances, tomorrow's Chemistry class has been rescheduled from 10:00 AM to 2:00 PM. Please make note of this change and inform all students.",
        "priority": "HIGH",
        "status": "ACTIVE",
        "createdAt": "2025-01-15T14:30:25.456Z",
        "createdBy": "admin-user-123",
        "createdByName": "admin@example.com",
        "attachments": [
            {
                "id": "file-uuid-1",
                "filename": "document-1.pdf",
                "originalFilename": "Important Document 1.pdf",
                "s3Key": "notifications/attachments/upload-id/file-uuid-1-document-1.pdf",
                "contentType": "application/pdf",
                "fileSize": 2456789,
                "uploadedAt": "2025-01-15T14:30:25.456Z",
                "uploadedBy": "admin-user-123",
                "downloadUrl": "https://d1234567890.cloudfront.net/notifications/attachments/upload-id/file-uuid-1-document-1.pdf?Expires=1748476800&Key-Pair-Id=K22X5QEWHPT69I&Signature=CloudFront-signed-params..."
            },
            {
                "id": "file-uuid-2",
                "filename": "document-2.pdf",
                "originalFilename": "Important Document 2.pdf",
                "s3Key": "notifications/attachments/upload-id/file-uuid-2-document-2.pdf",
                "contentType": "application/pdf",
                "fileSize": 1843621,
                "uploadedAt": "2025-01-15T14:30:25.456Z",
                "uploadedBy": "admin-user-123",
                "downloadUrl": "https://d1234567890.cloudfront.net/notifications/attachments/upload-id/file-uuid-2-document-2.pdf?Expires=1748476800&Key-Pair-Id=K22X5QEWHPT69I&Signature=CloudFront-signed-params..."
            }
        ]
    },
    "timestamp": "2025-01-15T14:30:25.456Z"
}
```

**Attachment Response Schema**:
- `attachments` (array, optional): Array of attachment objects (only if attachmentIds provided)
  - `id` (string): File identifier from upload process
  - `filename` (string): Sanitized filename for storage
  - `originalFilename` (string): Original filename from upload
  - `s3Key` (string): S3 object key for the file
  - `contentType` (string): MIME type of the file
  - `fileSize` (number): File size in bytes
  - `uploadedAt` (string): ISO timestamp when file was uploaded
  - `uploadedBy` (string): User ID who uploaded the file
  - `downloadUrl` (string): CloudFront signed download URL (1-hour expiration)

**Validation Constraints**:
- **Title**: 1-200 characters, required
- **Content**: 1-2000 characters, required  
- **Course ID**: Must reference an existing, active course
- **Priority**: Must be one of: `LOW`, `MEDIUM`, `HIGH`, `URGENT`
- **File Attachments**: Must be valid UUIDs from prior attachment upload process (max 5 files)
- **Admin Access**: Only users in `Admin` Cognito group can create notifications

**Attachment Workflow**:
1. **Generate Upload URLs**: Use `POST /v1/notifications/attachments/upload-urls` to get presigned URLs
2. **Upload Files**: Upload files directly to S3 using the presigned URLs
3. **Create Notification**: Use the `fileId` values in notification creation
4. **Download**: Attachment download URLs are automatically generated and included in responses

**Upload Instructions**:
1. Use the `uploadUrl` for direct S3 upload via PUT request
2. Set the correct `Content-Type` header matching the original request
3. Use the `fileId` values when creating notifications

**Example S3 Upload**:
```bash
curl -X PUT "https://s3.amazonaws.com/bucket/notifications/attachments/upload-id/file-uuid-1-assignment.pdf?..." \
  -H "Content-Type: application/pdf" \
  --data-binary @assignment.pdf
```

---

### 14. Delete Notification (Admin)

#### `DELETE /v1/notifications/{notificationId}`
**Access**: Admin Only (JWT required + Admin group)
**Description**: Permanently delete a specific notification

**URL Parameters**:
- `notificationId` (string, required): Notification identifier

**Request**: None required

**Response** (`204 No Content`): Empty body on success

**Important Notes**:
- **Permanent Deletion**: This operation cannot be undone
- **Admin Only**: Only users in `Admin` Cognito group can delete notifications
- **Validation**: Notification must exist and belong to an active course

**Error Responses**:

**404 Not Found**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Notification not found"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**403 Forbidden**:
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Only administrators can delete notifications"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

### 15. Remove Notification Attachments (Admin)

#### `DELETE /v1/notifications/{notificationId}/attachments`
**Access**: Admin Only (JWT required + Admin group)
**Description**: Remove all attachment metadata from a notification. S3 files are preserved and cleaned up by lifecycle policies.

**URL Parameters**:
- `notificationId` (string, required): Notification identifier

**Request**: None required

**Response** (`200 OK`):
```json
{
    "success": true,
    "data": {
        "notificationId": "notification-1748476800456-abc123def",
        "courseId": "XI_CBSE",
        "title": "Important: Class Schedule Change",
        "content": "Due to unforeseen circumstances, tomorrow's Chemistry class has been rescheduled from 10:00 AM to 2:00 PM.",
        "priority": "HIGH",
        "status": "ACTIVE",
        "createdAt": "2025-01-15T14:30:25.456Z",
        "createdBy": "admin-user-123",
        "createdByName": "admin@example.com"
    },
    "timestamp": "2025-01-15T16:22:30.123Z"
}
```

**Important Notes**:
- **DynamoDB Only**: Removes attachment metadata from DynamoDB, S3 files remain
- **S3 Lifecycle**: Files should be cleaned up automatically by S3 lifecycle policies
- **Audit Trail**: Operation is logged with timestamp and admin user
- **Graceful**: Returns success even if notification has no attachments
- **Admin Only**: Only users in `Admin` Cognito group can remove attachments

**S3 Lifecycle Policy Example**:
```yaml
# Recommended S3 Bucket Lifecycle Policy
Rules:
  - Id: CleanupNotificationAttachments
    Status: Enabled
    Filter:
      Prefix: "notifications/attachments/"
    Expiration:
      Days: 90  # Auto-delete orphaned files after 90 days
```

**Error Responses**:

**404 Not Found**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Notification not found"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**403 Forbidden**:
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Only administrators can remove notification attachments"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

### 16. Remove Specific Notification Attachment (Admin)

#### `DELETE /v1/notifications/{notificationId}/attachments/{attachmentId}`
**Access**: Admin Only (JWT required + Admin group)
**Description**: Remove a specific attachment from a notification by its ID. S3 files are preserved and cleaned up by lifecycle policies.

**URL Parameters**:
- `notificationId` (string, required): Notification identifier
- `attachmentId` (string, required): Specific attachment identifier to remove

**Request**: None required

**Response** (`200 OK`):
```json
{
    "success": true,
    "data": {
        "notificationId": "notification-1748476800456-abc123def",
        "courseId": "XI_CBSE",
        "title": "Important: Class Schedule Change",
        "content": "Due to unforeseen circumstances, tomorrow's Chemistry class has been rescheduled from 10:00 AM to 2:00 PM.",
        "priority": "HIGH",
        "status": "ACTIVE",
        "createdAt": "2025-01-15T14:30:25.456Z",
        "createdBy": "admin-user-123",
        "createdByName": "admin@example.com",
        "attachments": [
            {
                "id": "file-uuid-2",
                "filename": "document-2.pdf",
                "originalFilename": "Important Document 2.pdf",
                "s3Key": "notifications/attachments/upload-id/file-uuid-2-document-2.pdf",
                "contentType": "application/pdf",
                "fileSize": 1843621,
                "uploadedAt": "2025-01-15T14:30:25.456Z",
                "uploadedBy": "admin-user-123",
                "downloadUrl": "https://d1234567890.cloudfront.net/notifications/attachments/upload-id/file-uuid-2-document-2.pdf?Expires=1748476800&Key-Pair-Id=K22X5QEWHPT69I&Signature=CloudFront-signed-params..."
            }
        ]
    },
    "timestamp": "2025-01-15T16:22:30.123Z"
}
```

**Use Cases**:
- Remove a specific attachment without affecting others (e.g., remove 1 out of 5 attachments)
- Update attachments by removing specific files and adding new ones
- Clean up incorrect or outdated attachments while preserving important ones

**Important Notes**:
- **Selective Removal**: Only removes the specified attachment, others remain intact
- **DynamoDB Only**: Removes attachment metadata from DynamoDB, S3 files remain
- **S3 Lifecycle**: Files should be cleaned up automatically by S3 lifecycle policies
- **Efficient**: Avoids need to remove all attachments and re-upload desired ones
- **Audit Trail**: Operation is logged with specific attachment ID and admin user
- **Admin Only**: Only users in `Admin` Cognito group can remove attachments

**Error Responses**:

**404 Not Found - Notification**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Notification not found"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**404 Not Found - Attachment**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Attachment with ID 'file-uuid-1' not found in notification"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**404 Not Found - No Attachments**:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Notification has no attachments"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**403 Forbidden**:
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Only administrators can remove notification attachments"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**400 Bad Request**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Attachment ID is required"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

### 17. Generate Notification Attachment Upload URLs (Admin)

#### `POST /v1/notifications/attachments/upload-urls`
**Access**: Admin Only (JWT required + Admin group)
**Description**: Generate presigned S3 upload URLs for notification attachments

**Request Body**:
```json
{
  "files": [
    {
      "filename": "assignment.pdf",
      "fileSize": 5242880,
      "contentType": "application/pdf"
    },
    {
      "filename": "rubric.docx",
      "fileSize": 1048576,
      "contentType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    },
    {
      "filename": "example-image.jpg",
      "fileSize": 2048000,
      "contentType": "image/jpeg"
    }
  ]
}
```

**Request Body Schema**:
- `files` (array, required): Array of file objects (1-5 files)
  - `filename` (string, required): Original filename (1-255 characters)
  - `fileSize` (number, required): File size in bytes (max 10MB per file, 50MB total)
  - `contentType` (string, required): MIME type (see allowed types below)

**Allowed Content Types**:
- `application/pdf` - PDF documents
- `application/msword` - Microsoft Word (.doc)
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` - Microsoft Word (.docx)
- `image/jpeg` - JPEG images
- `image/png` - PNG images

**File Constraints**:
- **Maximum files**: 5 attachments per notification
- **Individual file size**: 10MB maximum
- **Total size**: 50MB maximum across all files
- **Filename**: Alphanumeric characters, spaces, dots, hyphens, underscores, and parentheses only

**Response** (`200 OK`):
```json
{
  "success": true,
  "data": {
    "uploadId": "550e8400-e29b-41d4-a716-446655440000",
    "urls": [
      {
        "fileId": "file-uuid-1",
        "filename": "assignment.pdf",
        "uploadUrl": "https://s3.amazonaws.com/bucket/notifications/attachments/upload-id/file-uuid-1-assignment.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...",
        "s3Key": "notifications/attachments/upload-id/file-uuid-1-assignment.pdf",
        "expiresIn": 3600
      },
      {
        "fileId": "file-uuid-2",
        "filename": "rubric.docx",
        "uploadUrl": "https://s3.amazonaws.com/bucket/notifications/attachments/upload-id/file-uuid-2-rubric.docx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...",
        "s3Key": "notifications/attachments/upload-id/file-uuid-2-rubric.docx",
        "expiresIn": 3600
      },
      {
        "fileId": "file-uuid-3",
        "filename": "example-image.jpg",
        "uploadUrl": "https://s3.amazonaws.com/bucket/notifications/attachments/upload-id/file-uuid-3-example-image.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...",
        "s3Key": "notifications/attachments/upload-id/file-uuid-3-example-image.jpg",
        "expiresIn": 5400
      }
    ]
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Response Schema**:
- `uploadId` (string): Unique identifier for this upload batch
- `urls` (array): Array of presigned upload URL objects
  - `fileId` (string): Unique identifier for this file
  - `filename` (string): Original filename from request
  - `uploadUrl` (string): Presigned S3 upload URL (expires based on file size)
  - `s3Key` (string): S3 object key for the file
  - `expiresIn` (number): Expiration time in seconds

**Dynamic Expiration**:
- **Files ≤ 2MB**: 1 hour expiration
- **Files 2-5MB**: 1.5 hours expiration  
- **Files > 5MB**: 2 hours expiration

**Security Features**:
- **UUID-based filenames**: Prevents path traversal attacks
- **Filename sanitization**: Dangerous characters removed
- **Admin-only access**: Only administrators can generate upload URLs

**Upload Instructions**:
1. Use the `uploadUrl` for direct S3 upload via PUT request
2. Set the correct `Content-Type` header matching the original request
3. Use the `fileId` values when creating notifications with `attachmentIds`

**Example S3 Upload**:
```bash
curl -X PUT "https://s3.amazonaws.com/bucket/notifications/attachments/upload-id/file-uuid-1-assignment.pdf?..." \
  -H "Content-Type: application/pdf" \
  --data-binary @assignment.pdf
```

