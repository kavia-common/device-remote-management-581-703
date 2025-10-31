# API Integration Guide

This document describes how the frontend integrates with the backend API and provides guidance for backend developers.

## Base Configuration

The frontend expects the backend API to be available at the URL specified in the `REACT_APP_API_URL` environment variable.

**Default**: `http://localhost:8080/api/v1`

## Authentication

### JWT Token Flow

1. **Login Request**
   - Endpoint: `POST /auth/login`
   - Request Body: `{ "email": "user@example.com", "password": "password123" }`
   - Expected Response: `{ "token": "jwt_token_here", "user": { "id": "...", "email": "...", "name": "..." } }`

2. **Registration Request**
   - Endpoint: `POST /auth/register`
   - Request Body: `{ "name": "John Doe", "email": "user@example.com", "password": "password123" }`
   - Expected Response: `{ "message": "Registration successful", "user": { "id": "...", "email": "...", "name": "..." } }`

3. **Token Storage**
   - Token is stored in `localStorage` with key `token`
   - User data is stored in `localStorage` with key `user`

4. **Token Injection**
   - All authenticated requests include header: `Authorization: Bearer {token}`
   - Axios interceptor automatically adds this header

5. **Token Expiration**
   - Frontend expects `401 Unauthorized` response when token expires
   - Automatically redirects to `/login` on 401 response

### Current User Endpoint

- Endpoint: `GET /auth/me`
- Headers: `Authorization: Bearer {token}`
- Expected Response: `{ "id": "...", "email": "...", "name": "...", "createdAt": "..." }`

## Device Management

### List Devices

- Endpoint: `GET /devices`
- Query Parameters:
  - `page` (integer, default: 1)
  - `pageSize` (integer, default: 50, max: 100)
  - `sort` (string, format: `field:direction`, e.g., `name:asc`)
- Expected Response:
```json
{
  "data": [
    {
      "id": "device_id",
      "name": "Device Name",
      "ipAddress": "192.168.1.1",
      "protocol": "SNMP",
      "status": "active",
      "description": "Device description",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "totalPages": 5,
    "totalItems": 250,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### Get Device by ID

- Endpoint: `GET /devices/{deviceId}`
- Expected Response: Single device object

### Create Device

- Endpoint: `POST /devices`
- Request Body:
```json
{
  "name": "My Device",
  "ipAddress": "192.168.1.100",
  "protocol": "SNMP",
  "description": "Optional description"
}
```
- Expected Response: Created device object with `id` field

### Update Device

- Endpoint: `PUT /devices/{deviceId}`
- Request Body: Same as Create Device
- Expected Response: Updated device object

### Delete Device

- Endpoint: `DELETE /devices/{deviceId}`
- Expected Response: `204 No Content` or `{ "message": "Device deleted successfully" }`

### Device Statistics

- Endpoint: `GET /devices/stats`
- Expected Response:
```json
{
  "totalDevices": 100,
  "activeDevices": 85,
  "inactiveDevices": 15,
  "failedQueries": 5,
  "snmpDevices": 30,
  "webpaDevices": 25,
  "tr69Devices": 25,
  "tr369Devices": 20
}
```

## Protocol Operations

### SNMP Operations

#### SNMP GET
- Endpoint: `POST /protocols/snmp/get`
- Request Body:
```json
{
  "deviceId": "device_id",
  "oids": ["1.3.6.1.2.1.1.1.0", "1.3.6.1.2.1.1.5.0"]
}
```
- Expected Response:
```json
{
  "jobId": "unique_job_id",
  "status": "pending",
  "message": "Query submitted successfully"
}
```

#### SNMP SET
- Endpoint: `POST /protocols/snmp/set`
- Request Body:
```json
{
  "deviceId": "device_id",
  "oids": ["1.3.6.1.2.1.1.5.0"],
  "values": ["NewDeviceName"],
  "types": ["s"]
}
```

#### SNMP WALK
- Endpoint: `POST /protocols/snmp/walk`
- Request Body:
```json
{
  "deviceId": "device_id",
  "oids": ["1.3.6.1.2.1.1"]
}
```

### WebPA Operations

#### WebPA GET
- Endpoint: `POST /protocols/webpa/get`
- Request Body:
```json
{
  "deviceId": "device_id",
  "parameters": ["Device.WiFi.SSID.1.SSID", "Device.WiFi.SSID.1.Enable"]
}
```

#### WebPA SET
- Endpoint: `POST /protocols/webpa/set`
- Request Body:
```json
{
  "deviceId": "device_id",
  "parameters": {
    "Device.WiFi.SSID.1.SSID": "MyNewSSID",
    "Device.WiFi.SSID.1.Enable": true
  }
}
```

### TR-69 Operations

#### TR-69 GetParameterValues
- Endpoint: `POST /protocols/tr69/get-parameters`
- Request Body:
```json
{
  "deviceId": "device_id",
  "parameters": [
    "InternetGatewayDevice.DeviceInfo.ModelName",
    "InternetGatewayDevice.DeviceInfo.SerialNumber"
  ]
}
```

#### TR-69 SetParameterValues
- Endpoint: `POST /protocols/tr69/set-parameters`
- Request Body:
```json
{
  "deviceId": "device_id",
  "parameters": {
    "InternetGatewayDevice.ManagementServer.PeriodicInformInterval": 3600
  }
}
```

### TR-369 Operations

#### TR-369 GET
- Endpoint: `POST /protocols/tr369/get`
- Request Body:
```json
{
  "deviceId": "device_id",
  "paths": ["Device.DeviceInfo.", "Device.Ethernet."]
}
```

#### TR-369 SET
- Endpoint: `POST /protocols/tr369/set`
- Request Body:
```json
{
  "deviceId": "device_id",
  "parameters": {
    "Device.DeviceInfo.Description": "Updated description"
  }
}
```

## Query Management

### Get Query Status

- Endpoint: `GET /queries/{jobId}/status`
- Expected Response:
```json
{
  "jobId": "unique_job_id",
  "status": "completed",
  "protocol": "SNMP",
  "operation": "GET",
  "deviceId": "device_id",
  "startTime": "2024-01-01T00:00:00Z",
  "endTime": "2024-01-01T00:00:05Z",
  "progress": 100
}
```

**Status Values**: `pending`, `running`, `completed`, `failed`

### Get Query Results

- Endpoint: `GET /queries/{jobId}/results`
- Expected Response:
```json
{
  "jobId": "unique_job_id",
  "status": "completed",
  "data": {
    "1.3.6.1.2.1.1.1.0": "Linux router 4.15.0",
    "1.3.6.1.2.1.1.5.0": "MyRouter"
  },
  "errors": []
}
```

### Get Query History

- Endpoint: `GET /queries/history`
- Query Parameters: `page`, `pageSize`, `sort`
- Expected Response:
```json
{
  "data": [
    {
      "id": "query_id",
      "jobId": "job_id",
      "protocol": "SNMP",
      "operation": "GET",
      "deviceId": "device_id",
      "deviceName": "My Device",
      "status": "completed",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

## Configuration Management

### Upload MIB

- Endpoint: `POST /config/mib/upload`
- Content-Type: `multipart/form-data`
- Form Field: `file` (binary file data)
- Expected Response:
```json
{
  "id": "mib_id",
  "filename": "MY-MIB.txt",
  "size": 12345,
  "uploadedAt": "2024-01-01T00:00:00Z",
  "message": "MIB uploaded successfully"
}
```

### Get MIBs

- Endpoint: `GET /config/mib`
- Expected Response:
```json
{
  "mibs": [
    {
      "id": "mib_id",
      "name": "MY-MIB",
      "filename": "MY-MIB.txt",
      "size": 12345,
      "uploadedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Delete MIB

- Endpoint: `DELETE /config/mib/{mibId}`
- Expected Response: `204 No Content`

## Export Operations

### Export as CSV

- Endpoint: `GET /export/{jobId}/csv`
- Response Type: `text/csv` (file download)
- Headers: `Content-Disposition: attachment; filename="query-{jobId}.csv"`

### Export as JSON

- Endpoint: `GET /export/{jobId}/json`
- Response Type: `application/json` (file download)
- Headers: `Content-Disposition: attachment; filename="query-{jobId}.json"`

## Error Response Format

All error responses should follow this format:

```json
{
  "error": {
    "code": "DEVICE_NOT_FOUND",
    "message": "The specified device could not be found",
    "details": ["Additional error details if any"],
    "timestamp": "2024-01-01T00:00:00Z",
    "path": "/api/v1/devices/invalid-id"
  }
}
```

### Standard Error Codes

- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate entry)
- `422 Unprocessable Entity`: Semantic validation errors
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service temporarily unavailable

## CORS Configuration

The backend must configure CORS to allow requests from the frontend:

- **Allowed Origins**: Frontend URL (e.g., `http://localhost:3000`, `http://localhost:3001`)
- **Allowed Methods**: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- **Allowed Headers**: `Content-Type`, `Authorization`
- **Credentials**: `true` (if using cookies)

## Rate Limiting

If rate limiting is implemented, include these headers in responses:

- `X-RateLimit-Limit`: Request limit per time window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when rate limit resets (Unix timestamp)

## WebSocket Support (Optional)

For real-time query status updates, the backend can implement WebSocket support:

- Endpoint: `ws://localhost:8080/api/v1/ws`
- Authentication: Send token in connection query string: `?token={jwt_token}`
- Message Format:
```json
{
  "type": "query_status_update",
  "jobId": "job_id",
  "status": "running",
  "progress": 50
}
```

## Testing the Integration

### Using curl

```bash
# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get devices (with token)
curl -X GET http://localhost:8080/api/v1/devices \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Environment Variables

Backend developers should ensure these environment variables are properly configured:

- Database connection strings
- SNMP community strings
- WebPA API endpoints
- TR-69 ACS API credentials
- TR-369/USP controller endpoints

## Notes for Backend Developers

1. **Async Processing**: Protocol operations should be asynchronous and return immediately with a `jobId`
2. **Job Queue**: Implement a job queue system to handle long-running queries
3. **Multi-tenancy**: Ensure proper user isolation - users should only see their own devices and queries
4. **Logging**: Log all API requests for debugging and audit purposes
5. **Validation**: Validate all input data and return meaningful error messages
6. **Pagination**: Always implement pagination for list endpoints
7. **Security**: Implement rate limiting and input sanitization
8. **Documentation**: Keep OpenAPI/Swagger documentation up to date

## Support

For questions or issues with the API integration, please contact the development team or refer to the OpenAPI specification at `/api/v1/openapi.json`.
