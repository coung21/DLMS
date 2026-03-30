# DLMS Document Upload & Admin Review Flow - Exploration Summary

## Overview
The DLMS codebase has a **partial implementation** of the document upload flow. Teachers can upload documents, but the admin review/approval workflow is **not yet implemented**.

---

## 1. UPLOAD DOCUMENT FLOW

### 1.1 Endpoint
**Location:** [backend/app/api/v1/endpoints/documents.py](backend/app/api/v1/endpoints/documents.py#L50)

```
POST /api/v1/documents/upload
```

**Requirements:**
- User must have `ADMIN` or `TEACHER` role (see [auth.py](backend/app/api/v1/dependencies/auth.py#L32))
- File size max: **10MB**
- Allowed extensions: `pdf, docx, doc, xlsx, xls, jpg, jpeg, png, txt`

### 1.2 Upload Request Parameters
- **file** (UploadFile): The document file
- **title** (string, required): Document title
- **description** (Optional[string]): Document description
- **category_id** (Optional[UUID]): Document category

### 1.3 Upload Use Case
**Location:** [backend/app/application/use_cases/upload_document_use_case.py](backend/app/application/use_cases/upload_document_use_case.py)

**Process:**
1. **File Storage**: Uploads file to MinIO storage with unique filename
2. **File Type Detection**: Determines file type from extension (PDF, DOCX, EXCEL, TEXT, IMAGE, OTHER)
3. **Document Entity Creation**: Creates a Document domain entity with:
   - Auto-generated UUID
   - Status: **ALWAYS set to `AVAILABLE`** (hardcoded, no workflow)
   - uploaded_by: Current user UUID
   - category_id: Optional
   - created_at/updated_at: Current timestamp
4. **Database Save**: Saves metadata to PostgreSQL via DocumentRepository

### 1.4 Document Schema Response
**Location:** [backend/app/application/schemas/document.py](backend/app/application/schemas/document.py)

```python
class DocumentResponse(BaseModel):
    id: UUID
    title: str
    description: str
    file_path: Optional[str] = None
    file_type: DocumentType  # PDF, DOCX, EXCEL, TEXT, IMAGE, VIDEO, OTHER
    status: DocumentStatus   # AVAILABLE, ARCHIVED, DELETED
    uploaded_by: Optional[UUID] = None
    category_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
```

---

## 2. DOCUMENT DATA MODELS

### 2.1 Domain Entity
**Location:** [backend/app/domain/entities/document.py](backend/app/domain/entities/document.py)

```python
@dataclass
class Document:
    id: UUID = field(default_factory=uuid4)
    title: str = ""
    description: str = ""
    file_path: str | None = None
    file_type: DocumentType = DocumentType.PDF
    file_size: int = 0
    original_file_name: str | None = None
    status: DocumentStatus = DocumentStatus.AVAILABLE  # ← Status defined here
    uploaded_by: UUID | None = None
    category_id: UUID | None = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
```

### 2.2 Database Model
**Location:** [backend/app/infrastructure/database/models/__init__.py](backend/app/infrastructure/database/models/__init__.py#L54)

```python
class DocumentModel(Base):
    __tablename__ = "documents"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, default="")
    file_path = Column(Text, nullable=True)
    file_type = Column(String(50), nullable=True)
    file_size = Column(Integer, default=0)
    original_file_name = Column(String(255), nullable=True)
    uploaded_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    category_id = Column(PGUUID(as_uuid=True), ForeignKey("categories.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    # ⚠️ MISSING: status field (not in database yet)
    # ⚠️ MISSING: updated_at field (not in database yet)

    uploader = relationship("UserModel", back_populates="documents")
    category = relationship("CategoryModel", back_populates="documents")
```

### 2.3 Database Status Inconsistency
**⚠️ IMPORTANT FINDING:**
In [document_repository_impl.py](backend/app/infrastructure/repositories/document_repository_impl.py#L20-L21), there's a comment:

```python
status=DocumentStatus.AVAILABLE, # Assuming available as there is no status in model yet
```

**The status field exists in the domain entity but is MISSING from the database schema!** Documents are always hardcoded to `AVAILABLE` when retrieved from the database.

---

## 3. DOCUMENT STATUS ENUMS
**Location:** [backend/app/domain/enums/__init__.py](backend/app/domain/enums/__init__.py#L20-L24)

```python
class DocumentStatus(str, Enum):
    AVAILABLE = "available"
    ARCHIVED = "archived"
    DELETED = "deleted"
```

**Current Status:**
- ✅ `AVAILABLE`: Used when documents are immediately available after upload
- ✅ `ARCHIVED`: Defined but no logic to archive documents
- ✅ `DELETED`: Defined but no logic to delete documents
- ❌ **MISSING**: No `PENDING`, `SUBMITTED`, `IN_REVIEW`, or `APPROVED` statuses for approval workflow

---

## 4. DOCUMENT RETRIEVAL

### 4.1 Endpoint
**Location:** [backend/app/api/v1/endpoints/documents.py](backend/app/api/v1/endpoints/documents.py#L22)

```
GET /api/v1/documents?skip=0&limit=10&category_id=...&search=...&sort_by=...
```

**Features:**
- Pagination (skip, limit)
- Optional filtering by category_id
- Optional text search in title/description
- Optional sorting (created_at_desc, created_at_asc, title_asc, title_desc)

### 4.2 Document Repository
**Location:** [backend/app/infrastructure/repositories/document_repository_impl.py](backend/app/infrastructure/repositories/document_repository_impl.py#L32-L65)

**Methods:**
- `find_all()`: Get paginated document list with optional filters
- `count_all()`: Count total documents matching filters
- `find_by_id()`: Get single document by ID
- `save()`: Save new document to database

---

## 5. MISSING ADMIN REVIEW WORKFLOW

### ❌ Currently NOT Implemented:

1. **No Admin Review Endpoints**
   - No endpoint to fetch pending documents for admin review
   - No endpoint to approve documents
   - No endpoint to reject documents with comments

2. **No Approval Status**
   - No `PENDING` status for documents awaiting approval
   - No transition logic (PENDING → APPROVED/REJECTED)

3. **No Audit Trail**
   - No tracking of who approved/rejected documents
   - No reason/comment field for rejections
   - No approval timestamp

4. **No Review Logic**
   - No use case for admin approval workflow
   - No notification system for teachers on approval/rejection

---

## 6. ROLE-BASED ACCESS CONTROL

### Current Roles
**Location:** [backend/app/domain/enums/__init__.py](backend/app/domain/enums/__init__.py#L5-L7)

```python
class UserRole(str, Enum):
    ADMIN = "admin"
    STUDENT = "student"
    TEACHER = "teacher"
```

### Upload Permissions
- ✅ `TEACHER`: Can upload documents (hardcoded in [documents.py](backend/app/api/v1/endpoints/documents.py#L53))
- ✅ `ADMIN`: Can upload documents
- ❌ `STUDENT`: Cannot upload (403 Forbidden)

### Admin Permissions (Needed for Review Workflow)
- ❌ No admin-only endpoints defined for document review
- ❌ No role-based filtering on GET documents endpoint (all documents public)

---

## 7. FILE STORAGE

### Storage Service
**Location:** [backend/app/infrastructure/services/storage/minio_storage_service.py](backend/app/infrastructure/services/storage/minio_storage_service.py)

- Uses **MinIO** for distributed object storage
- Files stored with unique names: `{uuid}_{original_filename}`
- No version control or history tracking

---

## 8. DATABASE MIGRATIONS

### Current Migration
**Location:** [backend/app/infrastructure/database/migrations/versions/cb638f60bf0c_initial_tables.py](backend/app/infrastructure/database/migrations/versions/cb638f60bf0c_initial_tables.py)

**Status:**
- Initial schema created: roles, users, categories, documents
- ❌ Missing migration for status field on documents table
- ❌ Missing migration for updated_at field on documents table

---

## 9. TEST COVERAGE

### Existing Tests

#### Teacher Upload Test
**Location:** [backend/tests/integration/test_teacher_upload.py](backend/tests/integration/test_teacher_upload.py#L21)
- ✅ Teacher can upload document → 201 Created
- ✅ Student cannot upload → 403 Forbidden
- ✅ Document immediately set to AVAILABLE status

#### Document Upload API Tests
**Location:** [backend/tests/integration/test_document_upload_api.py](backend/tests/integration/test_document_upload_api.py)
- ✅ Upload with valid file → 201 Created
- ✅ File size validation (>10MB → 413)
- ✅ File extension validation (invalid → 400)

### Missing Tests
- ❌ Admin document review/approval workflow
- ❌ Document status transitions
- ❌ Get documents with status filtering

---

## 10. KEY FINDINGS & RECOMMENDATIONS

### Current State Summary
✅ **Implemented:**
- Teacher/Admin can upload documents
- Documents stored in MinIO
- Metadata saved to PostgreSQL
- Document retrieval with filtering/sorting
- Role-based upload restrictions

❌ **Not Implemented:**
- Admin review/approval workflow
- Document status management (only hardcoded AVAILABLE)
- Status field not in database schema
- No rejection/feedback mechanism
- No audit trail for approvals

### To Implement Admin Review Workflow:
1. **Add Database Migrations:**
   - Add `status` VARCHAR column to documents table
   - Add `updated_at` TIMESTAMP column
   - Add `reviewed_by` UUID column (FK to users)
   - Add `review_comment` TEXT column

2. **Update Status Enums:**
   - Add `PENDING = "pending"`
   - Add `APPROVED = "approved"`
   - Add `REJECTED = "rejected"`

3. **Create Admin Endpoints:**
   - `GET /api/v1/documents/pending` - List pending documents
   - `POST /api/v1/documents/{id}/approve` - Approve document
   - `POST /api/v1/documents/{id}/reject` - Reject with comment

4. **Create Use Cases:**
   - `ApproveDocumentUseCase`
   - `RejectDocumentUseCase`
   - `GetPendingDocumentsUseCase`

5. **Update Upload Flow:**
   - Create documents with `PENDING` status (not AVAILABLE)
   - Only AVAILABLE documents shown to students

6. **Add Notifications:**
   - Notify teacher when document approved/rejected
   - Notify admin when new document pending review

---

## 11. CODEBASE STRUCTURE SUMMARY

```
backend/app/
├── api/v1/
│   ├── endpoints/
│   │   └── documents.py          ← Upload & Get endpoints
│   ├── dependencies/
│   │   └── auth.py               ← Role-based access control
│   └── router.py                 ← API route aggregation
├── application/
│   ├── use_cases/
│   │   ├── upload_document_use_case.py    ← Upload logic
│   │   ├── get_documents_use_case.py      ← Retrieval logic
│   │   └── [MISSING] approve_document_use_case.py
│   └── schemas/
│       └── document.py           ← Document response schema
├── domain/
│   ├── entities/
│   │   └── document.py           ← Domain entity with status field
│   ├── enums/
│   │   └── __init__.py           ← DocumentStatus enum
│   └── repositories/
│       └── document_repository.py ← Repository interface
├── infrastructure/
│   ├── database/
│   │   ├── models/               ← SQLAlchemy models (missing status)
│   │   ├── migrations/           ← DB migrations
│   │   └── session.py            ← DB connection
│   ├── repositories/
│   │   └── document_repository_impl.py  ← SQLAlchemy implementation
│   └── services/storage/
│       └── minio_storage_service.py     ← MinIO file storage
└── core/
    ├── exceptions.py             ← Custom exceptions
    ├── config.py                 ← Configuration
    └── logging.py                ← Logging setup

tests/
├── integration/
│   ├── test_teacher_upload.py    ← Upload endpoint tests
│   └── test_document_upload_api.py ← API validation tests
└── unit/
    └── application/
        └── test_upload_document_use_case.py
```
