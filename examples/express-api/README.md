# Express API Example

This is a sample Express.js API to demonstrate Smart Test Generator's capabilities with Node.js, Express middleware, database operations, and TypeScript.

## Features Demonstrated

- **Express Routes**: RESTful API endpoints with proper HTTP methods
- **Middleware**: Authentication, validation, error handling, logging
- **Database Operations**: CRUD operations with error handling
- **Input Validation**: Request body and parameter validation
- **Error Handling**: Centralized error handling with proper status codes
- **Authentication**: JWT-based authentication middleware
- **Rate Limiting**: Request rate limiting and throttling
- **File Uploads**: Multipart form data handling

## Generated Test Coverage

Smart Test Generator will create tests for:

1. **Route Handlers**:
   - User CRUD operations (/api/users)
   - Authentication endpoints (/api/auth)
   - File upload endpoints (/api/upload)

2. **Middleware**:
   - Authentication middleware
   - Validation middleware
   - Rate limiting middleware
   - Error handling middleware

3. **Database Layer**:
   - User model operations
   - Database connection handling
   - Transaction management

4. **Utilities**:
   - JWT token generation/validation
   - Password hashing
   - Input sanitization
   - Email validation

## Running the Example

```bash
cd examples/express-api
npm install
npm run dev

# Generate tests
test-gen init
test-gen analyze src/
test-gen generate --coverage 95 --types unit integration

# Run generated tests
npm test
```

## Expected Results

- **95%+** test coverage
- **30+** test files generated
- **Database mocking** with realistic data
- **HTTP request/response testing**
- **Error scenario coverage**
- **Middleware integration testing**
