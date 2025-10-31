# Device Remote Management Platform - User Guide

Welcome to the Device Remote Management Platform! This guide will help you get started with managing your network devices across multiple protocols.

## Table of Contents

1. [Getting Started](#getting-started)
2. [User Interface Overview](#user-interface-overview)
3. [Device Management](#device-management)
4. [Protocol Operations](#protocol-operations)
5. [Query History](#query-history)
6. [MIB Management](#mib-management)
7. [Tips and Best Practices](#tips-and-best-practices)

## Getting Started

### Creating an Account

1. Navigate to the application URL
2. Click "Sign Up" on the login page
3. Enter your full name, email address, and password
4. Click "Sign Up" to create your account
5. You'll be redirected to the login page

### Logging In

1. Enter your email and password
2. Click "Sign In"
3. You'll be redirected to the Dashboard

### First-Time Setup

After logging in for the first time:
1. Add your first device from the Devices page
2. Configure device credentials (if required)
3. Test connectivity with a simple query

## User Interface Overview

### Navigation Menu

The left sidebar contains the main navigation:

- **Dashboard**: Overview of your devices and recent activity
- **Devices**: Manage your device inventory
- **SNMP**: Execute SNMP protocol operations
- **WebPA**: Execute WebPA protocol operations
- **TR-69**: Execute TR-69/ACS protocol operations
- **TR-369**: Execute TR-369/USP protocol operations
- **Query History**: View past queries and results
- **MIB Upload**: Manage SNMP MIB files

### User Menu

Click your profile icon in the top-right corner to:
- View your account information
- Log out of the application

## Device Management

### Adding a Device

1. Navigate to **Devices** page
2. Click **"Add Device"** button
3. Fill in device information:
   - **Name**: Friendly name for the device
   - **IP Address**: Device IP address or hostname
   - **Protocol**: Select protocol (SNMP, WebPA, TR-69, TR-369)
   - **Description**: Optional description
4. Click **"Create"**

### Editing a Device

1. Navigate to **Devices** page
2. Click the **edit icon** (pencil) next to the device
3. Modify device information
4. Click **"Update"**

### Deleting a Device

1. Navigate to **Devices** page
2. Click the **delete icon** (trash) next to the device
3. Confirm the deletion
4. Device will be permanently removed

### Device List Features

- **Pagination**: Navigate through pages if you have many devices
- **Search**: Find devices quickly by name or IP address
- **Filter**: Filter by protocol or status
- **Sort**: Click column headers to sort

## Protocol Operations

### SNMP Operations

SNMP (Simple Network Management Protocol) allows you to query and configure devices using OIDs.

#### SNMP GET

1. Navigate to **SNMP** page
2. Select **"GET"** operation
3. Select target device
4. Enter OID(s):
   - Example: `1.3.6.1.2.1.1.1.0` (System Description)
   - Example: `1.3.6.1.2.1.1.5.0` (System Name)
5. Click **"Add OID"** to add more OIDs
6. Click **"Execute"**
7. View results in the right panel

**Common OIDs**:
- System Information: `1.3.6.1.2.1.1`
- Interfaces: `1.3.6.1.2.1.2`
- IP Information: `1.3.6.1.2.1.4`

#### SNMP WALK

1. Select **"WALK"** operation
2. Select device
3. Enter base OID (e.g., `1.3.6.1.2.1.1`)
4. Click **"Execute"**
5. View all sub-OIDs and values

#### SNMP SET

1. Select **"SET"** operation
2. Select device
3. Enter OID and new value
4. Specify data type (string, integer, etc.)
5. Click **"Execute"**

**Note**: SET operations modify device configuration. Use with caution!

### WebPA Operations

WebPA provides access to TR-181 data model parameters on supported devices.

#### WebPA GET

1. Navigate to **WebPA** page
2. Select **"GET"** operation
3. Select device
4. Enter parameter names:
   - Example: `Device.WiFi.SSID.1.SSID`
   - Example: `Device.WiFi.SSID.1.Enable`
5. Click **"Execute"**

**Common Parameters**:
- WiFi Settings: `Device.WiFi.*`
- Device Info: `Device.DeviceInfo.*`
- Ethernet: `Device.Ethernet.*`

#### WebPA SET

1. Select **"SET"** operation
2. Select device
3. Enter parameter and new value
4. Click **"Execute"**

### TR-69 Operations

TR-69 (CWMP) protocol for managing CPE devices through an ACS.

#### GetParameterValues

1. Navigate to **TR-69** page
2. Select **"GetParameterValues"** operation
3. Select device
4. Enter parameter paths:
   - Example: `InternetGatewayDevice.DeviceInfo.ModelName`
5. Click **"Execute"**

#### SetParameterValues

1. Select **"SetParameterValues"** operation
2. Select device
3. Enter parameter and value
4. Click **"Execute"**

### TR-369 Operations

TR-369 (USP) for next-generation device management.

#### TR-369 GET

1. Navigate to **TR-369** page
2. Select **"GET"** operation
3. Select device
4. Enter data model paths:
   - Example: `Device.DeviceInfo.`
5. Click **"Execute"**

#### TR-369 SET

1. Select **"SET"** operation
2. Select device
3. Enter parameter and value
4. Click **"Execute"**

## Query Execution Flow

All protocol operations follow this flow:

1. **Submit Query**: Click "Execute" button
2. **Job Created**: System creates a job with unique Job ID
3. **Processing**: Query is executed asynchronously
4. **Status Updates**: Monitor status (Pending → Running → Completed/Failed)
5. **View Results**: Results appear in right panel when completed

### Job Status Indicators

- **Pending**: Query queued for execution
- **Running**: Query currently executing
- **Completed**: Query finished successfully (green)
- **Failed**: Query encountered an error (red)

## Query History

### Viewing Query History

1. Navigate to **Query History** page
2. View list of all past queries
3. See query details:
   - Job ID
   - Protocol used
   - Operation performed
   - Target device
   - Status
   - Timestamp

### Viewing Query Results

1. Click **"View"** icon (eye) next to any query
2. Results display below the table
3. Review returned data

### Exporting Results

Export query results in two formats:

#### Export as CSV

1. Find completed query in history
2. Click **"CSV"** button
3. File downloads automatically
4. Open in Excel, Google Sheets, etc.

#### Export as JSON

1. Find completed query in history
2. Click **"JSON"** button
3. File downloads automatically
4. Use for programmatic processing

### Filtering and Sorting

- **Filter by Status**: Show only completed, failed, or pending queries
- **Filter by Protocol**: Show only SNMP, WebPA, TR-69, or TR-369 queries
- **Sort**: Click column headers to sort by any field
- **Pagination**: Navigate through historical queries

## MIB Management

SNMP MIB (Management Information Base) files help translate OIDs to readable names.

### Uploading MIB Files

1. Navigate to **MIB Upload** page
2. Click **"Select MIB File"**
3. Choose `.mib` or `.txt` file
4. File uploads automatically
5. Confirmation message appears

### Supported File Formats

- `.mib` - Standard MIB format
- `.txt` - Text-based MIB format

### Managing MIBs

1. View list of uploaded MIBs
2. See file details (name, size, upload date)
3. Click **delete icon** to remove MIB

### Using MIBs

Once uploaded, MIBs are used to:
- Translate OIDs to names
- Validate OID syntax
- Provide OID suggestions

## Tips and Best Practices

### Device Management

- **Use descriptive names**: Make devices easy to identify
- **Keep IP addresses updated**: Ensure connectivity
- **Add descriptions**: Document device location or purpose
- **Regular cleanup**: Remove unused devices

### Query Operations

- **Start small**: Test with single parameters first
- **Use WALK carefully**: Can return large datasets
- **Monitor job status**: Don't submit duplicate queries
- **Save successful queries**: For future reference

### Performance

- **Batch similar queries**: Group related parameters
- **Avoid excessive polling**: Can overload devices
- **Use appropriate timeouts**: Some queries take longer
- **Export large results**: Don't display huge datasets inline

### Security

- **Use strong passwords**: Protect your account
- **Log out when done**: Especially on shared computers
- **Don't share credentials**: Each user should have own account
- **Review query history**: Audit what queries were run

### Troubleshooting

#### Query Fails Immediately

- Check device is online and reachable
- Verify credentials are correct
- Ensure protocol is supported by device
- Check firewall settings

#### Query Stays Pending

- Backend may be processing other queries
- Check backend service is running
- Review system logs

#### Results Are Empty

- OID/parameter may not exist on device
- Device may not support the operation
- Check parameter syntax

#### Can't Connect to Device

- Verify IP address is correct
- Check network connectivity
- Ensure device protocol service is enabled
- Verify credentials

## Getting Help

### In-App Support

- Hover over form fields for tooltips
- Check error messages for guidance
- Review recent queries for examples

### Additional Resources

- Backend API Documentation
- Protocol-specific documentation (SNMP RFCs, TR-181 spec, etc.)
- Community forums
- Support team contact

## Keyboard Shortcuts

- **Ctrl+K**: Quick search (coming soon)
- **Esc**: Close dialogs
- **Tab**: Navigate form fields

## Mobile Usage

The platform is fully responsive:

- Access on tablets and phones
- Drawer menu on mobile devices
- Optimized touch targets
- Readable on small screens

## Frequently Asked Questions

**Q: Can I execute multiple queries simultaneously?**
A: Yes, the system supports asynchronous execution of multiple queries.

**Q: How long are query results stored?**
A: Query history is retained per backend configuration (typically 30-90 days).

**Q: Can I share devices with other users?**
A: No, each user maintains their own device inventory for security.

**Q: What happens if a query times out?**
A: The query will be marked as failed with a timeout error message.

**Q: Can I schedule recurring queries?**
A: Scheduled queries are a planned feature for future releases.

## Conclusion

This guide covers the essential features of the Device Remote Management Platform. For advanced usage, protocol-specific guidance, or technical support, please consult the additional documentation or contact your system administrator.

Happy device managing!
