# Protocol UIs Implementation Guide

## Overview

This document describes the implementation of dedicated protocol-specific UI pages for SNMP, WebPA, TR-069, and TR-369/USP protocols in the Device Remote Management platform.

## Architecture

### File Structure

```
src/
├── pages/
│   └── protocols/
│       ├── SNMPPage.jsx      # SNMP operations UI
│       ├── WebPAPage.jsx     # WebPA operations UI
│       ├── TR069Page.jsx     # TR-069/ACS operations UI
│       └── TR369Page.jsx     # TR-369/USP operations UI
├── api/
│   └── protocols/
│       ├── snmp.js           # SNMP API functions
│       ├── webpa.js          # WebPA API functions
│       ├── tr069.js          # TR-069 API functions
│       └── tr369.js          # TR-369 API functions
└── utils/
    └── exporters.js          # CSV/JSON export utilities
```

### Routes

All protocol pages are protected routes (require authentication):

- `/protocols/snmp` - SNMP operations
- `/protocols/webpa` - WebPA operations
- `/protocols/tr069` - TR-069 operations
- `/protocols/tr369` - TR-369/USP operations

## Features

### Common Features Across All Protocol UIs

1. **Form Validation**
   - Required field indicators with asterisks
   - Real-time validation with error messages
   - Helper text with examples and guidance
   - Visual feedback for invalid inputs

2. **Results Display**
   - Tabular view for multi-item results
   - Card view for single results
   - Status chips with color coding
   - Timestamp display for all operations
   - Raw JSON response view

3. **Export Capabilities**
   - Copy JSON to clipboard
   - Export to CSV file
   - Export to JSON file
   - Timestamped filenames

4. **State Persistence**
   - Form values saved to localStorage
   - Namespaced per protocol
   - Automatically restored on page load

5. **Error Handling**
   - API errors displayed in results panel
   - Global snackbar notifications
   - Detailed error messages from backend
   - Loading states with spinners

## Protocol-Specific Details

### SNMP Page (`SNMPPage.jsx`)

**Operations:**
- GET: Retrieve single OID value
- SET: Modify OID value with type specification
- WALK: Retrieve multiple OIDs in hierarchy

**Form Fields:**
- Device ID (required)
- OID (required)
- SNMP Version (v2c/v3)
- Community String
- Value (SET only, required)
- Value Type (SET only): OctetString, Integer, IpAddress, Counter32, Counter64, Gauge32, TimeTicks, Opaque
- Max Repetitions (WALK only)

**Results Display:**
- GET/SET: Single result with OID, value, type
- WALK: Tabular display with OID, value, type columns

**LocalStorage Key:** `snmp_form_values`

### WebPA Page (`WebPAPage.jsx`)

**Operations:**
- GET: Retrieve parameter value
- SET: Modify parameter value

**Form Fields:**
- Device ID (required)
- Parameter Name (required) - TR-181 data model path
- Value (SET only, required)
- Data Type (SET only): string, int, uint, boolean, dateTime, base64

**Results Display:**
- Single result with parameter, value, dataType
- Previous value shown for SET operations

**LocalStorage Key:** `webpa_form_values`

### TR-069 Page (`TR069Page.jsx`)

**Operations:**
- GET: Retrieve multiple parameter values
- SET: Modify multiple parameters
- TASKS: Device management tasks (Reboot, Download)

**Form Fields:**
- CPE Device ID (required)
- Parameters (multi-line textarea):
  - GET: One parameter name per line
  - SET: One name=value per line
- Task Type (TASKS): Reboot or Download
- File Type (Download): 1=Firmware, 2=Web Content, 3=Vendor Config
- Download URL (Download, required)

**Results Display:**
- GET/SET: Tabular display with parameter, value, type
- TASKS: Task status card with progress indicator
- Auto-polling for task status (every 3 seconds)
- Manual refresh button for task status

**LocalStorage Key:** `tr069_form_values`

**Special Features:**
- Async task management
- Status polling with visual feedback
- Progress bar for long-running tasks
- Task status chips: pending (warning), completed (success), failed (error)

### TR-369 Page (`TR369Page.jsx`)

**Operations:**
- GET: Retrieve parameter values
- SET: Modify parameters
- ADD: Create object instances
- DELETE: Remove object instances
- OPERATE: Execute commands

**Form Fields:**
- Device ID (required)
- Paths (multi-line, required for GET/SET/DELETE, single line for ADD)
- Parameters (multi-line, for SET/ADD):
  - SET: path=value format
  - ADD: key=value format for initial values
- Command (OPERATE, required)
- Command Key (OPERATE, required)

**Results Display:**
- GET/SET: Tabular display with path, value, status
- ADD: Created instance path display
- DELETE: Status for each deleted path
- OPERATE: Command execution status

**LocalStorage Key:** `tr369_form_values`

**Special Features:**
- Comprehensive USP operations
- Multi-path support
- Object instance lifecycle management
- Command execution tracking

## Implementation Details

### Form Validation Pattern

```javascript
const validate = () => {
  const newErrors = {};
  if (!deviceId.trim()) newErrors.deviceId = 'Device ID is required';
  if (!oid.trim()) newErrors.oid = 'OID is required';
  // ... additional validations
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### LocalStorage Persistence Pattern

```javascript
// Load on mount
useEffect(() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setDeviceId(parsed.deviceId || '');
      // ... restore other fields
    }
  } catch (err) {
    console.error('Failed to load persisted form values:', err);
  }
}, []);

// Persist on change
useEffect(() => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      deviceId,
      oid,
      // ... other fields
    }));
  } catch (err) {
    console.error('Failed to persist form values:', err);
  }
}, [deviceId, oid, /* dependencies */]);
```

### API Integration Pattern

```javascript
const handleExecute = async () => {
  if (!validate()) {
    dispatch(showSnackbar({ message: 'Please fix validation errors', severity: 'error' }));
    return;
  }

  setLoading(true);
  setError(null);
  setResults(null);

  try {
    const result = await protocolApiFunction({ deviceId, /* params */ });
    setResults(result);
    dispatch(showSnackbar({ message: 'Operation completed successfully', severity: 'success' }));
  } catch (err) {
    const errorMessage = err.response?.data?.error?.message || err.message || 'Operation failed';
    setError(errorMessage);
    dispatch(showSnackbar({ message: errorMessage, severity: 'error' }));
  } finally {
    setLoading(false);
  }
};
```

### Export Pattern

```javascript
const handleExportCSV = () => {
  if (!results) return;
  
  const rows = results.results?.map(r => ({
    field1: r.field1,
    field2: r.field2,
  })) || [];
  
  exportCSV(rows, `protocol_operation_${Date.now()}.csv`);
  dispatch(showSnackbar({ message: 'Exported to CSV', severity: 'success' }));
};

const handleExportJSON = () => {
  if (results) {
    exportJSON(results, `protocol_operation_${Date.now()}.json`);
    dispatch(showSnackbar({ message: 'Exported to JSON', severity: 'success' }));
  }
};
```

## Mock Mode Support

All protocol pages work seamlessly in mock mode when `REACT_APP_API_BASE` is not set:

- API functions automatically detect mock mode
- Return realistic test data
- Simulate network delays
- Support all operations

## Testing

### Manual Testing Checklist

For each protocol page:

- [ ] Form validation works (required fields, error messages)
- [ ] Helper text is clear and helpful
- [ ] Form values persist across page reloads
- [ ] Execute button shows loading state
- [ ] Results display correctly (tables/cards)
- [ ] Copy to clipboard works
- [ ] CSV export works with correct data
- [ ] JSON export works with correct data
- [ ] Error messages display clearly
- [ ] Snackbar notifications appear
- [ ] Page is responsive (mobile, tablet, desktop)
- [ ] Navigation links work
- [ ] Protected route enforces authentication

### Mock Mode Testing

1. Ensure `REACT_APP_API_BASE` is empty
2. Test all operations for each protocol
3. Verify realistic mock data is returned
4. Check that delays simulate real network behavior

### Backend Integration Testing

1. Set `REACT_APP_API_BASE` to backend URL
2. Test all operations against real backend
3. Verify error handling with invalid inputs
4. Test authentication token handling

## Usage Examples

### SNMP GET Operation

1. Navigate to `/protocols/snmp`
2. Enter Device ID: `device-001`
3. Enter OID: `1.3.6.1.2.1.1.1.0`
4. Select Version: `v2c`
5. Enter Community: `public`
6. Click "Execute"
7. View result and optionally export

### TR-069 Reboot Task

1. Navigate to `/protocols/tr069`
2. Select "TASKS" tab
3. Enter CPE Device ID: `cpe-001`
4. Select Task Type: `Reboot`
5. Click "Execute"
6. Watch task status update automatically
7. Manually refresh status if needed

### TR-369 SET Operation

1. Navigate to `/protocols/tr369`
2. Select "SET" tab
3. Enter Device ID: `device-001`
4. Enter Parameters:
   ```
   Device.WiFi.SSID.1.SSID=MyNetwork
   Device.WiFi.SSID.1.Enable=true
   ```
5. Click "Execute"
6. View per-parameter results

## Best Practices

### For Users

1. **Use localStorage wisely**: Form values are persisted, making repeated operations faster
2. **Check helper text**: Each field has contextual help
3. **Export regularly**: Export results for record-keeping
4. **Use raw JSON view**: For debugging or advanced use cases
5. **Monitor task status**: For async operations (TR-069), watch the polling indicators

### For Developers

1. **Maintain consistency**: Follow established patterns for new features
2. **Test mock mode**: Always verify mock mode works
3. **Handle errors gracefully**: Show clear, actionable error messages
4. **Document new fields**: Add helper text for all form inputs
5. **Update API modules**: Keep protocol API functions in sync with backend changes

## Troubleshooting

### Forms Not Validating

- Check that required fields have values
- Look for validation error messages under fields
- Ensure helper text provides guidance

### Results Not Displaying

- Check browser console for errors
- Verify API endpoint is reachable
- Test with mock mode first
- Check authentication token is valid

### Export Not Working

- Ensure results exist before exporting
- Check browser console for errors
- Verify export utility functions are imported
- Test with small datasets first

### LocalStorage Issues

- Clear browser cache/localStorage
- Check browser privacy settings
- Verify localStorage quota not exceeded
- Test in incognito mode

## Future Enhancements

1. **Query Templates**: Save and reuse common queries
2. **Batch Operations**: Execute multiple operations in sequence
3. **History Integration**: Link to query history page
4. **Advanced Filters**: Filter results in the UI
5. **Comparison Mode**: Compare results from multiple devices
6. **Schedule Operations**: Schedule recurring operations
7. **WebSocket Updates**: Real-time status updates for async operations
8. **Parameter Browser**: Browse available parameters/OIDs
9. **Favorites**: Save frequently-used device/parameter combinations
10. **Diff View**: Compare before/after values for SET operations

## Support

For issues or questions:
1. Check this documentation
2. Review API documentation in `src/api/README.md`
3. Examine existing implementations as examples
4. Check browser console for error details
