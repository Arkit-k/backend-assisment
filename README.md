# Secure File Upload & Metadata Processing Microservice

A Node.js backend microservice that handles authenticated file uploads, stores associated metadata in a database, and processes those files asynchronously.

## Features

- User authentication with JWT
- Secure file upload with size limits
- File metadata storage in PostgreSQL
- Asynchronous file processing with BullMQ
- File status tracking
- Pagination for file listing
- Security measures (rate limiting, helmet, etc.)

## Tech Stack

- Node.js (>=18)
- Express.js
- PostgreSQL with Prisma ORM
- JWT Authentication
- BullMQ for background jobs (Redis-based)
- Multer for file handling

## Prerequisites

- Node.js (>=18)
- PostgreSQL
- Redis (optional, for BullMQ background processing)

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on the provided example:
   ```
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key_change_in_production
   JWT_EXPIRATION=1h
   DATABASE_URL=postgresql://neondb_owner:npg_Sb2hqIzFkmW1@ep-long-credit-a4tky8rx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
   UPLOAD_LIMIT=5mb
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```
4. The application is configured to use a Neon PostgreSQL database. No need to create a local database.
5. Run the database migration to set up the Prisma schema:
   ```
   npm run db:migrate
   ```

## Running the Application

### Running Locally

1. Start the main server:
   ```
   npm run dev
   ```
2. (Optional) If you have Redis installed, start the worker in a separate terminal:
   ```
   npm run dev:worker
   ```

   Note: If Redis is not available, the application will simulate background processing without requiring the worker process.

### Running with Docker

The application can be run using Docker and Docker Compose, which will set up all required services (Node.js app, PostgreSQL, Redis) automatically.

1. Build and start all services:
   ```
   npm run docker:dev
   ```

   This will:
   - Start a PostgreSQL database
   - Start a Redis instance
   - Initialize the database schema
   - Start the main application
   - Start the worker process

2. To stop all services:
   ```
   npm run docker:down
   ```

3. Other Docker commands:
   ```
   npm run docker:build  # Build Docker images
   npm run docker:up     # Start services without rebuilding
   ```

## API Documentation

### Authentication

#### Register a new user
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Response:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Response:
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com"
  },
  "token": "jwt_token_here"
}
```

### File Operations

#### Upload a file
```
POST /upload
Authorization: Bearer jwt_token_here
Content-Type: multipart/form-data

file: [file]
title: Optional title
description: Optional description
```

Response:
```json
{
  "message": "File uploaded successfully",
  "file": {
    "id": 1,
    "originalFilename": "example.pdf",
    "title": "My Document",
    "status": "uploaded",
    "uploadedAt": "2023-05-15T12:00:00.000Z"
  }
}
```

#### Get file by ID
```
GET /files/:id
Authorization: Bearer jwt_token_here
```

Response:
```json
{
  "file": {
    "id": 1,
    "originalFilename": "example.pdf",
    "title": "My Document",
    "description": "An example document",
    "status": "processed",
    "extractedData": "{\"fileSize\":12345,\"fileHash\":\"hash_value\",\"processedAt\":\"2023-05-15T12:05:00.000Z\"}",
    "uploadedAt": "2023-05-15T12:00:00.000Z"
  }
}
```

#### Get all files (with pagination)
```
GET /files?page=1&limit=10
Authorization: Bearer jwt_token_here
```

Response:
```json
{
  "files": [
    {
      "id": 1,
      "originalFilename": "example.pdf",
      "title": "My Document",
      "status": "processed",
      "uploadedAt": "2023-05-15T12:00:00.000Z"
    }
  ],
  "pagination": {
    "totalFiles": 1,
    "totalPages": 1,
    "currentPage": 1,
    "limit": 10
  }
}
```

## Design Choices

1. **Authentication**: JWT-based authentication was chosen for its stateless nature and ease of implementation.

2. **File Storage**: Files are stored on the local filesystem with unique names to prevent collisions. In a production environment, this could be replaced with cloud storage (S3, etc.).

3. **Background Processing**: BullMQ with Redis was chosen for reliable job processing with retry capabilities.

4. **Database**: Neon PostgreSQL (cloud-based) with Prisma ORM for type-safe database access and easy querying.

5. **Security Measures**:
   - Rate limiting to prevent abuse
   - Helmet for HTTP security headers
   - File size limits
   - User-based access control

## Limitations and Assumptions

1. **Local Storage**: Files are stored locally, which is not suitable for a distributed system. In production, use a cloud storage solution.

2. **Simple Processing**: The file processing is simulated with a hash calculation. In a real application, more sophisticated processing would be implemented.

3. **No File Type Validation**: The current implementation accepts all file types. In production, you might want to restrict to specific file types.

4. **Single Worker**: The current setup uses a single worker process. For production, you might want to scale with multiple workers.

5. **Basic Error Handling**: More sophisticated error handling and logging would be needed for production.

## Future Enhancements

1. Cloud storage integration (AWS S3, Google Cloud Storage, etc.)
2. More sophisticated file processing
3. File type validation and virus scanning
4. Multiple worker processes for better scaling
5. Comprehensive logging and monitoring
6. User roles and permissions
7. File sharing capabilities
8. CI/CD pipeline for automated testing and deployment
