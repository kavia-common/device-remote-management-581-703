# Protocol Operations Quick Reference

## SNMP Operations

### GET - Retrieve Single OID
```
Device ID:  device-001
OID:        1.3.6.1.2.1.1.1.0
Version:    v2c
Community:  public
```

### SET - Modify OID Value
```
Device ID:    device-001
OID:          1.3.6.1.2.1.1.6.0
Value:        New York Office
Value Type:   OctetString
Version:      v2c
Community:    private
```

### WALK - Retrieve OID Hierarchy
```
Device ID:        device-001
OID:              1.3.6.1.2.1.2.2.1
Version:          v2c
Community:        public
Max Repetitions:  25
```

---

## WebPA Operations

### GET - Retrieve Parameter
```
Device ID:      AA:BB:CC:DD:EE:FF
Parameter:      Device.WiFi.SSID.1.SSID
```

### SET - Modify Parameter
```
Device ID:      AA:BB:CC:DD:EE:FF
Parameter:      Device.WiFi.SSID.1.SSID
Value:          MyHomeNetwork
Data Type:      string
```

**Common TR-181 Parameters:**
- `Device.WiFi.SSID.1.SSID` - WiFi network name
- `Device.WiFi.SSID.1.Enable` - Enable/disable WiFi
- `Device.WiFi.Radio.1.Channel` - WiFi channel
- `Device.Time.NTPServer1` - NTP server
- `Device.DeviceInfo.ModelName` - Device model

---

## TR-069 Operations

### GET - Retrieve Parameters
```
CPE Device ID:  cpe-001
Parameters:     InternetGatewayDevice.DeviceInfo.Manufacturer
                InternetGatewayDevice.DeviceInfo.ModelName
                InternetGatewayDevice.ManagementServer.URL
```

### SET - Modify Parameters
```
CPE Device ID:  cpe-001
Parameters:     InternetGatewayDevice.ManagementServer.URL=http://acs.example.com
                InternetGatewayDevice.Time.NTPServer1=pool.ntp.org
```

### REBOOT Task
```
CPE Device ID:  cpe-001
Task Type:      Reboot
```

### DOWNLOAD Task
```
CPE Device ID:  cpe-001
Task Type:      Download
File Type:      1 (Firmware Upgrade Image)
Download URL:   http://example.com/firmware.bin
```

**File Types:**
- `1` - Firmware Upgrade Image
- `2` - Web Content
- `3` - Vendor Configuration File

---

## TR-369/USP Operations

### GET - Retrieve Parameters
```
Device ID:  device-001
Paths:      Device.WiFi.SSID.1.
            Device.WiFi.Radio.1.Channel
```

### SET - Modify Parameters
```
Device ID:    device-001
Parameters:   Device.WiFi.SSID.1.SSID=MyNetwork
              Device.WiFi.SSID.1.Enable=true
```

### ADD - Create Object Instance
```
Device ID:    device-001
Path:         Device.WiFi.SSID.
Parameters:   SSID=GuestNetwork
              Enable=true
```

### DELETE - Remove Object Instance
```
Device ID:  device-001
Paths:      Device.WiFi.SSID.3.
```

### OPERATE - Execute Command
```
Device ID:    device-001
Command:      Device.Reboot()
Command Key:  cmd-1234567890
```

---

## Tips & Shortcuts

### Form Persistence
- All form values are automatically saved to browser localStorage
- Values are restored when you return to the page
- Each protocol has its own namespace

### Copy & Export
- **Copy JSON**: Click clipboard icon to copy raw response
- **Export CSV**: Click download icon for spreadsheet-friendly format
- **Export JSON**: Click download icon for full JSON file

### Multi-line Inputs
For TR-069 and TR-369, use multi-line inputs:
```
# One parameter per line
param1=value1
param2=value2
param3=value3
```

### Error Handling
- Red borders indicate invalid fields
- Helper text shows what's expected
- Error messages appear under fields and in results panel
- Snackbar shows operation status

### Loading States
- Execute button shows spinner during operation
- Results panel shows loading indicator
- Disable all inputs during operation

### Task Status (TR-069)
- **Pending** (Orange): Task initiated, waiting for completion
- **Completed** (Green): Task finished successfully
- **Failed** (Red): Task encountered an error
- Auto-refreshes every 3 seconds
- Manual refresh button available

---

## Common OIDs (SNMP)

| OID | Description |
|-----|-------------|
| 1.3.6.1.2.1.1.1.0 | System Description |
| 1.3.6.1.2.1.1.3.0 | System Uptime |
| 1.3.6.1.2.1.1.5.0 | System Name |
| 1.3.6.1.2.1.1.6.0 | System Location |
| 1.3.6.1.2.1.2.1.0 | Number of Interfaces |
| 1.3.6.1.2.1.2.2.1.2 | Interface Descriptions |
| 1.3.6.1.2.1.2.2.1.10 | Interface Inbound Octets |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Navigate between fields |
| `Shift+Tab` | Navigate backwards |
| `Enter` | Submit form (when in text field) |
| `Ctrl+C` | Copy (when in results view) |

---

## Mock Mode Testing

When `REACT_APP_API_BASE` is not set, all operations use mock data:
- SNMP GET returns mock IP address
- SNMP WALK returns 3 mock entries
- WebPA GET returns mock WiFi SSID
- TR-069 tasks return mock task IDs
- TR-369 operations return mock success responses

Perfect for testing UI without backend!
