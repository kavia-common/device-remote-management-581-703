# E2E Testing - API Integration & Deployment Update

## Overview

This document provides updates to API integration and deployment documentation to reflect the new E2E testing framework implementation.

## E2E Testing Infrastructure

### Framework Details
- **Testing Framework**: Playwright 1.40+
- **Test Count**: 30 E2E tests across 6 test suites
- **Mock Strategy**: API route interception with `page.route()`
- **Realtime Testing**: Mock EventSource for SSE/WebSocket simulation

### API Endpoints Covered in E2E Tests

#### Authentication Endpoints
```
POST /api/v1/auth/login
- Tested with valid credentials
- Tested with invalid credentials
- Tested with network errors
- Mock responses: 200 (success), 401 (unauthorized), error (network)
```

#### Device Management Endpoints
```
GET /api/v1/devices?search={query}
- Tested with search parameter
- Tested with debounce validation
- Tested with empty results
- Mock responses: 200 with device array
```

#### Query Management Endpoints
```
POST /api/v1/queries
- Tested for SNMP, WebPA, TR69, TR369 protocols
- Mock responses: 201 with queryId and status

GET /api/v1/queries
- Tested for query history retrieval
- Tested with favorites filter
- Mock responses: 200 with query array and pagination

GET /api/v1/queries/{id}
- Tested for status checking
- Mock responses: 200 with query status and result

DELETE /api/v1/queries/{id} (or /api/v1/queries/{id}/cancel)
- Tested for query cancellation
- Mock responses: 200 with success message, 500 for errors
```

#### Favorites Endpoints
```
POST /api/v1/queries/{id}/favorite
- Tested for adding to favorites
- Mock responses: 200 with success message

DELETE /api/v1/queries/{id}/favorite
- Tested for removing from favorites
- Mock responses: 200 with success message
```

#### Tenant Endpoints
```
GET /api/v1/tenants
- Tested for tenant listing
- Mock responses: 200 with tenant array
```

#### Realtime Updates
```
EventSource: /api/v1/realtime or SSE endpoint
- Tested SSE connection establishment
- Tested query status update messages
- Tested connection error handling
- Tested reconnection logic
- Mock: Custom EventSource implementation
```

## API Contract Requirements for E2E Tests

### Authentication Response Format
```json
{
  "token": "jwt-token-string",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user|admin",
    "tenantId": "tenant-id"
  }
}
```

### Device List Response Format
```json
{
  "data": [
    {
      "id": "device-id",
      "name": "Device Name",
      "type": "router|switch|modem",
      "ip": "192.168.1.1",
      "status": "online|offline"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "totalItems": 100
  }
}
```

### Query Creation Response Format
```json
{
  "queryId": "query-unique-id",
  "status": "pending|running|completed|failed|cancelled",
  "protocol": "snmp|webpa|tr69|tr369",
  "deviceId": "device-id",
  "createdAt": "2025-01-01T12:00:00Z"
}
```

### Query Status Response Format
```json
{
  "queryId": "query-unique-id",
  "status": "pending|running|completed|failed|cancelled",
  "protocol": "snmp|webpa|tr69|tr369",
  "result": {
    "data": "query-result-data"
  },
  "error": "error-message-if-failed"
}
```

### Error Response Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "timestamp": "2025-01-01T12:00:00Z",
    "details": ["Additional error detail 1", "Additional error detail 2"]
  }
}
```

### SSE Message Format
```javascript
// Event data sent via SSE
{
  "type": "query_status_update",
  "queryId": "query-unique-id",
  "status": "completed|failed|cancelled",
  "timestamp": "2025-01-01T12:00:00Z",
  "result": { /* optional result data */ }
}
```

## Deployment Considerations

### Environment Variables for E2E

#### Required Variables
```bash
# Application base URL for tests
E2E_BASE_URL=http://localhost:3000

# Backend API URL (if different)
E2E_API_BASE_URL=http://localhost:8080/api/v1

# CI mode flag
CI=true
```

#### Optional Variables
```bash
# Test user credentials (for non-mocked scenarios)
E2E_TEST_USER_EMAIL=test@example.com
E2E_TEST_USER_PASSWORD=TestPassword123

# Playwright configuration
PLAYWRIGHT_TIMEOUT=30000
PLAYWRIGHT_WORKERS=1
HEADLESS=true
```

### CI/CD Pipeline Integration

#### GitHub Actions
```yaml
jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        working-directory: ./FrontendApplicationContainer
        run: npm ci
      
      - name: Install Playwright browsers
        working-directory: ./FrontendApplicationContainer
        run: npx playwright install --with-deps chromium
      
      - name: Run E2E tests
        working-directory: ./FrontendApplicationContainer
        run: npm run e2e:ci
        env:
          CI: true
          E2E_BASE_URL: http://localhost:3000
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: FrontendApplicationContainer/e2e-report/
```

#### GitLab CI
```yaml
e2e-tests:
  image: mcr.microsoft.com/playwright:v1.40.0-focal
  stage: test
  script:
    - cd FrontendApplicationContainer
    - npm ci
    - npx playwright install chromium
    - npm run e2e:ci
  artifacts:
    when: always
    paths:
      - FrontendApplicationContainer/e2e-report/
      - FrontendApplicationContainer/e2e-results.json
```

### Docker Deployment with E2E

#### Dockerfile Considerations
```dockerfile
# Multi-stage build example

# Stage 1: Dependencies and tests
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Install Playwright for E2E tests
RUN npx playwright install --with-deps chromium

COPY . .

# Run E2E tests during build (optional)
# RUN npm run e2e:ci

# Build production assets
RUN npm run build

# Stage 2: Production
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Feature Flags and E2E Tests

E2E tests should account for feature flags:

```javascript
// In test setup
await page.addInitScript(() => {
  window.FEATURE_FLAGS = {
    REALTIME_UPDATES: true,
    FAVORITES: true,
    CANCEL_QUERIES: true,
    METADATA_DRAWER: true,
    TENANT_SWITCHING: true
  };
});
```

### Tenant Headers in E2E Tests

```javascript
// Mock tenant header in API requests
await page.route('**/api/v1/**', async (route) => {
  const headers = route.request().headers();
  headers['X-Tenant-ID'] = 'tenant-001';
  
  await route.continue({ headers });
});
```

## API Integration Checklist for E2E

### Authentication
- [x] Login endpoint properly mocked
- [x] Token storage tested
- [x] Invalid credentials handling tested
- [x] Network error handling tested

### Device Management
- [x] Device listing endpoint mocked
- [x] Search parameter handling tested
- [x] Debounce behavior validated
- [x] Empty results handling tested

### Protocol Operations
- [x] SNMP query execution tested
- [x] WebPA query execution tested
- [x] TR69 query execution tested
- [x] TR369 query execution tested
- [x] Query status checking tested
- [x] Form validation tested

### Realtime Updates
- [x] SSE connection mocked
- [x] Status update messages tested
- [x] Connection error handling tested
- [x] Reconnection logic tested

### Favorites
- [x] Add to favorites tested
- [x] Remove from favorites tested
- [x] Favorites filter tested
- [x] Favorites display tested

### Query Cancellation
- [x] Cancel endpoint mocked
- [x] Cancel button display tested
- [x] Status update after cancel tested
- [x] Error handling tested

### Multi-tenant Support
- [x] Tenant header handling prepared
- [x] Tenant switching scenarios outlined
- [ ] Advanced multi-tenant flows (future)

## Deployment Checklist

### Pre-Deployment
- [ ] Run E2E tests locally: `npm run e2e`
- [ ] Verify all 30 tests pass
- [ ] Check for flaky tests
- [ ] Review test reports

### CI/CD Setup
- [ ] Add E2E test stage to pipeline
- [ ] Configure Playwright browser installation
- [ ] Set up artifact uploads (reports, traces)
- [ ] Configure failure notifications
- [ ] Set appropriate timeouts

### Environment Configuration
- [ ] Set `E2E_BASE_URL` for test environment
- [ ] Configure `CI=true` in pipeline
- [ ] Set up test user credentials (if needed)
- [ ] Configure feature flags for tests

### Monitoring
- [ ] Track E2E test execution time
- [ ] Monitor test flakiness rate
- [ ] Review failure patterns
- [ ] Update tests for API changes

## API Documentation Updates

### New Endpoints for Testing
Document these endpoints for E2E test consumption:

1. **Query Cancellation**
   - Endpoint: `DELETE /api/v1/queries/{id}/cancel`
   - Purpose: Cancel running query
   - Expected in E2E: Status 200 with success message

2. **Favorites Management**
   - Endpoints: 
     - `POST /api/v1/queries/{id}/favorite`
     - `DELETE /api/v1/queries/{id}/favorite`
   - Purpose: Add/remove favorites
   - Expected in E2E: Status 200 with success message

3. **Realtime Updates**
   - Endpoint: SSE connection endpoint (e.g., `/api/v1/realtime`)
   - Purpose: Real-time query status updates
   - Expected in E2E: EventSource-compatible SSE stream

### API Versioning
Current E2E tests use API version: `/api/v1/*`

When API version changes:
1. Update `E2E_API_BASE_URL` environment variable
2. Update route mocks in `e2e/utils/test-helpers.js`
3. Verify all 30 tests still pass

## Performance Considerations

### Test Execution Time
- **Mocked APIs**: Fast execution (~3-5 minutes for 30 tests)
- **Real Backend**: Slower, more realistic (~10-15 minutes)
- **CI Environment**: May be slower due to resource constraints

### Optimization Tips
1. Use API mocking for fast feedback
2. Run subset of tests for quick validation
3. Parallelize tests when stable (use with caution)
4. Cache Playwright browsers in CI

## Security Considerations

### Test Data
- Use mock credentials only
- Never commit real credentials
- Use `.env.example` for templates
- Rotate test credentials regularly

### API Keys
- Mock API keys in tests
- Never expose production keys
- Use separate test environment

### Token Management
- Mock JWT tokens in tests
- Test token expiration scenarios
- Verify logout clears tokens

## Troubleshooting E2E Tests

### Common Issues

#### Tests Fail to Connect
```bash
# Check base URL
echo $E2E_BASE_URL

# Verify dev server is running
curl http://localhost:3000

# Check API endpoint
curl http://localhost:8080/api/v1/devices
```

#### Flaky Tests
- Use proper wait strategies
- Increase timeouts if needed
- Check for race conditions
- Review test isolation

#### CI Failures
- Verify browser installation
- Check environment variables
- Review CI logs and traces
- Ensure proper cleanup

## Future Enhancements

### API Contract Testing
- Implement API schema validation
- Use contract testing tools (Pact, etc.)
- Validate response formats

### Backend Integration Tests
- Create E2E tests with real backend
- Set up test database
- Implement data cleanup

### Performance Testing
- Add performance metrics to E2E tests
- Track API response times
- Monitor client-side performance

## Conclusion

The E2E testing framework is fully integrated with comprehensive API mocking and ready for deployment. All critical API endpoints are covered, and proper CI/CD integration examples are provided.

**Next Steps**:
1. Review and approve this documentation
2. Integrate E2E tests into CI/CD pipeline
3. Run initial test execution to validate
4. Monitor and optimize based on results

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Related Docs**: 
- `e2e/README.md`
- `E2E_QUICK_REFERENCE.md`
- `E2E_IMPLEMENTATION_SUMMARY.md`
- `docs/API_INTEGRATION.md`
- `docs/DEPLOYMENT.md`
