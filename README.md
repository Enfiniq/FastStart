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

### 2. **database** - PostgreSQL Database Management
Manage packages stored in PostgreSQL/Supabase database with bidirectional GitHub sync.

- **GET `/api/database`**
  - **What:** Lists packages from database with filtering and pagination support.
  - **Query Parameters:**
    - `name?: string` - Filter by package name (partial match)
    - `author?: string` - Filter by author name (partial match)  
    - `type?: string` - Filter by package type (exact match)
    - `limit?: number` - Number of results (default: 50, max: 100)
    - `offset?: number` - Pagination offset (default: 0)
  - **Authorization:** FastStartKey required  
  - **Scope:** Database

- **POST `/api/database`**
  - **What:** Syncs a package from database to GitHub registry.
  - **Body:**
    ```typescript
    {
      name: string // Package name to sync
    }
    ```
  - **Authorization:** FastStartKey for the specific package  
  - **Scope:** Database → GitHub

- **PUT `/api/database`**
  - **What:** Creates or updates a package in the database.
  - **Body:**
    ```typescript
    {
      name: string         // Package name
      fastStart: string    // Package URL or content location
      author: string       // Package author
      type: string         // Package type (component, utility, etc.)
      versions?: string[]  // Version array (default: ["1.0.0"])
    }
    ```
  - **Authorization:** FastStartKey for the specific package  
  - **Scope:** Database

- **DELETE `/api/database`**
  - **What:** Removes package from both database and GitHub registry.
  - **Body:**
    ```typescript
    {
      name: string // Package name to delete
    }
    ```
  - **Authorization:** FastStartKey for the specific package  
  - **Scope:** Both (Database + GitHub)

---

### 3. **packages** - GitHub Registry Management
Manage packages directly in the GitHub registry.

- **GET `/api/packages`**
  - **What:** Lists packages from GitHub registry with filtering support.
  - **Query Parameters:**
    - `fastStartName?: string` - Filter by package name (partial match)
    - `type?: string` - Filter by package type
    - `author?: string` - Filter by author name
    - `url?: string` - Filter by fastStart URL
    - `version?: string` - Filter by specific version
  - **Authorization:** None required  
  - **Scope:** GitHub

- **PUT `/api/packages`**
  - **What:** Adds or updates a package in GitHub registry.
  - **Body:**
    ```typescript
    {
      name: string         // Package name
      fastStart: string    // Package URL or content location
      versions: string[]   // Available versions
      type: string         // Package type
      author: string       // Package author
    }
    ```
  - **Authorization:** FastStartKey for the specific package  
  - **Scope:** GitHub

- **DELETE `/api/packages`**
  - **What:** Removes a package from GitHub registry.
  - **Query Parameters:**
    - `name: string` - Package name to delete
  - **Authorization:** FastStartKey for the specific package  
  - **Scope:** GitHub

---

### 4. **starts** - Package Discovery
Search and discover packages with advanced filtering.

- **POST `/api/starts`**
  - **What:** Searches packages or authors with pagination and scope filtering.
  - **Body:**
    ```typescript
    {
      limit?: number              // Results limit (1-100, default: 50)
      offset?: number            // Pagination offset (default: 0)
      type?: "faststart" | "author"  // Search type (default: "author")
      scope?: string             // Scope filter ("@" for all scopes, "@org" for specific)
    }
    ```
  - **Authorization:** None required  
  - **Scope:** GitHub

---

### 5. **files** - Package Content Retrieval
Get file content from FastStart packages.

- **GET `/api/files`**
  - **What:** Retrieves file content from a FastStart package, supporting versioned packages and direct URLs.
  - **Query Parameters:**
    - `fastStart: string` - Package name with optional version (e.g., "package-name" or "package-name@1.0.0")
      - **Standard:** `package-name` → queries registry for package URL
      - **Versioned:** `package-name@1.0.0` → queries specific version
      - **Direct URL:** `!https://example.com/file.js` → bypasses registry, fetches directly
  - **Authorization:** None required  
  - **Scope:** GitHub + External URLs

---

### 6. **utils/email** - Email Services
Send emails using predefined templates.

- **GET `/api/utils/email`**
  - **What:** Previews email templates in HTML format.
  - **Query Parameters:**
    - `template: "verify-email" | "reset-password-email" | "welcome-email" | "newsletter-email"` - Template to preview
  - **Authorization:** None required  
  - **Scope:** Template System

- **POST `/api/utils/email`**
  - **What:** Sends emails using predefined templates to multiple recipients.
  - **Body:**
    ```typescript
    {
      templateName: "verify-email" | "reset-password-email" | "welcome-email" | "newsletter-email"
      recipients: EmailRecipient[]  // Array of {username: string, email: string}
      subject?: string              // Email subject (optional)
      content?: string[]            // Additional content lines
      text?: string                 // Plain text content
      sender?: EmailSender          // Custom sender info
      data?: EmailData              // Template data (verification codes, etc.)
    }

    // Type Definitions:
    interface EmailRecipient {
      username: string  // Recipient's display name
      email: string     // Recipient's email address
    }

    interface EmailSender {
      name?: string        // Sender's display name
      email: string        // Sender's email address
      user?: string        // SMTP username (optional)
      app_password?: string // SMTP app password (optional)
    }

    interface EmailData {
      companyName?: string           // Company name for templates
      verificationCode?: string      // Verification code for verify-email template
      resetPasswordCode?: string     // Reset code for reset-password template
      cta?: {                       // Call-to-action button
        text: string                // Button text
        url: string                 // Button URL
      }
    }
    ```
  - **Authorization:** None required  
  - **Scope:** Email Service (Gmail SMTP)

---

### 7. **utils/embeddings** - Vector Embeddings
Generate text embeddings using transformer models.

- **POST `/api/utils/embeddings`**
  - **What:** Generates 384-dimensional vector embeddings for text input using Supabase/gte-small model.
  - **Body:**
    ```typescript
    {
      text: string // Text to generate embeddings for
    }
    ```
  - **Authorization:** None required  
  - **Scope:** AI Model (Local)

---

### 8. **registry** - Direct Registry Access
Low-level GitHub registry management for administrative operations.

- **GET `/api/registry`**
  - **What:** Retrieves raw registry data from GitHub repository.
  - **Query Parameters:**
    - `action?: "getRegistry"` - Optional action for getting registry with SHA
  - **Authorization:** Admin (Registry Access Secret)  
  - **Scope:** GitHub

- **PUT `/api/registry`**
  - **What:** Updates registry content directly on GitHub.
  - **Body:**
    ```typescript
    {
      action: "updateRegistry"
      registry: object  // Complete registry object
      sha: string       // GitHub file SHA for conflict resolution
    }
    ```
  - **Authorization:** Admin (Registry Access Secret)  
  - **Scope:** GitHub

- **DELETE `/api/registry`**
  - **What:** Removes specific packages from GitHub registry.
  - **Query Parameters:**
    - `packageName: string` - Package name to remove
  - **Authorization:** Admin (Registry Access Secret)  
  - **Scope:** GitHub

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