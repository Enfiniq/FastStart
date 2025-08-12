# FASTSTART

FastStart is a Registry for reusable code snippets with email and embeddings utilities.

## API Routes

### 1. **key** - Authentication
- **POST `/api/key`** - Generate FastStartKey
  - **Body:** `{fastStartName: string}`
  - **Auth:** None

### 2. **database** - PostgreSQL Management
- **GET `/api/database`** - List packages
  - **Query:** `{name?: string, author?: string, type?: string, limit?: number, offset?: number}`
  - **Auth:** FastStartKey

- **POST `/api/database`** - Sync to GitHub
  - **Body:** `{name: string}`
  - **Auth:** FastStartKey

- **PUT `/api/database`** - Create/update package
  - **Body:** `{name: string, fastStart: string, author: string, type: string, versions?: string[]}`
  - **Auth:** FastStartKey

- **DELETE `/api/database`** - Remove from both DB and GitHub
  - **Body:** `{name: string}`
  - **Auth:** FastStartKey

### 3. **packages** - GitHub Registry
- **GET `/api/packages`** - List packages
  - **Query:** `{fastStartName?: string, type?: string, author?: string, url?: string, version?: string}`
  - **Auth:** None

- **PUT `/api/packages`** - Add/update package
  - **Body:** `{name: string, fastStart: string, versions: string[], type: string, author: string}`
  - **Auth:** FastStartKey

- **DELETE `/api/packages`** - Remove package
  - **Query:** `{name: string}`
  - **Auth:** FastStartKey

### 4. **starts** - Package Discovery
- **POST `/api/starts`** - Search packages/authors
  - **Body:** `{limit?: number, offset?: number, type?: "faststart" | "author", scope?: string}`
  - **Auth:** None

### 5. **files** - Content Retrieval
- **GET `/api/files`** - Get package content
  - **Query:** `{fastStart: string}` (supports versioning and direct URLs with `!` prefix)
  - **Auth:** None

### 6. **utils/email** - Email Service
- **GET `/api/utils/email`** - Preview templates
  - **Query:** `{template: "verify-email" | "reset-password-email" | "welcome-email" | "newsletter-email"}`
  - **Auth:** None

- **POST `/api/utils/email`** - Send emails
  - **Body:** `{templateName: string, recipients: EmailRecipient[], subject?: string, content?: string[], text?: string, sender?: EmailSender, data?: EmailData}`
    - EmailRecipient: `{username: string, email, string;}`
    - EmailSender: `{name?: string, email?: string, user?: string, app_password?: string}`
    - EmailData: `{companyName?: string, verificationCode?: string, resetPasswordCode?: string, cta?: { text: string, url: string } }`
  - **Auth:** None

### 7. **utils/embeddings** - Vector Embeddings
- **POST `/api/utils/embeddings`** - Generate embeddings
  - **Body:** `{text: string}`
  - **Auth:** None

### 8. **registry** - Admin Access
- **GET `/api/registry`** - Get registry data
  - **Query:** `{action?: "getRegistry"}`
  - **Auth:** Admin

- **PUT `/api/registry`** - Update registry
  - **Body:** `{action: "updateRegistry", registry: object, sha: string}`
  - **Auth:** Admin

- **DELETE `/api/registry`** - Remove package
  - **Query:** `{packageName: string}`
  - **Auth:** Admin

---

## Edge Cases

### Scoped Packages (@org/package)
1. Generate scope key: `POST /api/key` with `{"fastStartName": "@org"}`
2. Generate package key: `POST /api/key` with `{"fastStartName": "@org/package"}` + scope key auth
3. Use package key for operations

### File Route Special Prefix
- `!` prefix bypasses registry: `"fastStart": "!https://example.com/file.js"`
- Standard: appends version/extensions
- Direct: fetches exact URL

### Limits
- Database: 100 results max, use offset for pagination
- GitHub: Rate limited, changes may delay
- Email: No built-in limits

## Auth Types
- **None:** Public
- **FastStartKey:** Package-specific 
- **Admin:** Registry secret
- **Scope:** For @org/package

## Contributors
Enfiniq - Routes, Utils, project Setup, email route, embeddings route, database route, files route, starts route
AI - Error, templates and Response Messages