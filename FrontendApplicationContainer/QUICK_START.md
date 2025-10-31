# Quick Start Guide

Get the Device Remote Management Platform frontend up and running in minutes.

## Prerequisites

- Node.js 14+ installed
- npm installed
- Backend API running (or accessible URL)

## Step 1: Install Dependencies

```bash
cd device-remote-management-581-703/FrontendApplicationContainer
npm install
```

**Status:** ✅ Already done - dependencies are installed

## Step 2: Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and update the backend API URL:

```bash
# .env file
REACT_APP_API_URL=http://localhost:8080/api/v1
REACT_APP_SITE_URL=http://localhost:3000
```

**Important:** Replace `http://localhost:8080` with your actual backend API URL.

## Step 3: Start Development Server

```bash
npm start
```

The application will open at: **http://localhost:3000** (or 3001 if 3000 is busy)

## Step 4: Create Your First Account

1. Click "Sign Up" on the login page
2. Enter your name, email, and password
3. Click "Sign Up"
4. Login with your credentials

## Step 5: Add Your First Device

1. Navigate to **Devices** from the sidebar
2. Click **"Add Device"**
3. Fill in device details:
   - Name: "My Test Device"
   - IP Address: "192.168.1.1"
   - Protocol: Select one (SNMP, WebPA, TR-69, TR-369)
   - Description: Optional
4. Click **"Create"**

## Step 6: Execute Your First Query

### For SNMP Devices:
1. Navigate to **SNMP** from the sidebar
2. Select **"GET"** operation
3. Select your device
4. Enter an OID (e.g., `1.3.6.1.2.1.1.1.0`)
5. Click **"Execute"**
6. View results in the right panel

### For WebPA Devices:
1. Navigate to **WebPA** from the sidebar
2. Select **"GET"** operation
3. Select your device
4. Enter a parameter (e.g., `Device.WiFi.SSID.1.SSID`)
5. Click **"Execute"**
6. View results

## Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Check for vulnerabilities
npm audit

# Update dependencies
npm update
```

## Folder Structure Overview

```
FrontendApplicationContainer/
├── src/
│   ├── api/              # API service functions
│   ├── components/       # Reusable UI components
│   ├── pages/           # Page components (Login, Dashboard, etc.)
│   ├── store/           # Redux state management
│   ├── theme/           # Material-UI theme
│   └── App.js           # Main app with routing
├── public/              # Static files
├── docs/                # Documentation
├── .env                 # Environment variables (create this)
├── .env.example         # Environment template
└── package.json         # Dependencies
```

## Available Routes

After logging in, you can access:

- `/dashboard` - Overview and statistics
- `/devices` - Device management
- `/protocols/snmp` - SNMP operations
- `/protocols/webpa` - WebPA operations
- `/protocols/tr69` - TR-69 operations
- `/protocols/tr369` - TR-369 operations
- `/history` - Query history
- `/config/mib` - MIB file management

## Default Ports

- Frontend: **3000** (or 3001 if 3000 is busy)
- Backend: **8080** (default, may vary)

## Backend Requirements

The backend must be running and accessible. It should provide:

- Authentication endpoints (`/auth/*`)
- Device management endpoints (`/devices/*`)
- Protocol operation endpoints (`/protocols/*`)
- Query management endpoints (`/queries/*`)

**See `docs/API_INTEGRATION.md` for complete backend API requirements.**

## CORS Configuration

Ensure your backend allows requests from the frontend origin:

```javascript
// Backend CORS config example
cors({
  origin: 'http://localhost:3000',
  credentials: true
})
```

## Troubleshooting

### Issue: Cannot connect to backend

**Solution:**
1. Verify backend is running
2. Check `REACT_APP_API_URL` in `.env`
3. Check CORS configuration on backend
4. Check browser console for errors

### Issue: Login fails

**Solution:**
1. Verify backend `/auth/login` endpoint works
2. Check network tab in browser dev tools
3. Ensure correct email/password format
4. Check backend logs for errors

### Issue: Blank page

**Solution:**
1. Check browser console for errors
2. Verify all dependencies installed
3. Try clearing browser cache
4. Run `npm run build` to check for build errors

### Issue: Port already in use

**Solution:**
The app will prompt to use another port. Type `Y` to accept.

Or manually kill the process:
```bash
# Find process on port 3000
lsof -ti:3000

# Kill it
kill -9 <PID>
```

## Development Tips

### Hot Reload
Changes to source files automatically reload the browser.

### Environment Variables
Remember to restart the dev server after changing `.env` files.

### Redux DevTools
Install Redux DevTools browser extension to debug state:
- Chrome: [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools)

### React Developer Tools
Install React Developer Tools for debugging:
- Chrome: [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools)

## Production Build

To create a production build:

```bash
npm run build
```

This creates optimized files in the `build/` directory ready for deployment.

Serve the build locally to test:

```bash
npm install -g serve
serve -s build
```

## What's Next?

1. **Test Backend Integration** - Verify all API endpoints work
2. **Add Test Data** - Create devices and run queries
3. **Explore Features** - Try all protocol operations
4. **Review Documentation** - Read the user guide
5. **Deploy** - Follow deployment guide for your platform

## Documentation

- **README.md** - Project overview
- **docs/USER_GUIDE.md** - Complete user manual
- **docs/API_INTEGRATION.md** - Backend integration guide
- **docs/DEPLOYMENT.md** - Deployment instructions
- **IMPLEMENTATION_SUMMARY.md** - What was built

## Getting Help

- Check browser console for errors
- Review troubleshooting section
- Consult the documentation
- Check backend API logs
- Contact your system administrator

## Success Criteria

You'll know everything is working when:

✅ Development server starts without errors
✅ Login page loads
✅ You can register and login
✅ Dashboard shows statistics
✅ You can add and view devices
✅ Protocol operations execute
✅ Query history displays results

## Important Notes

⚠️ **Backend Required:** The frontend requires a running backend API to function.

⚠️ **Environment Variables:** Don't commit `.env` to version control.

⚠️ **CORS:** Backend must allow frontend origin.

⚠️ **HTTPS:** Use HTTPS in production.

## Quick Reference

**Start Dev Server:** `npm start`
**Build for Production:** `npm run build`
**Run Tests:** `npm test`
**Install Dependencies:** `npm install`

**Frontend URL:** http://localhost:3000
**Backend URL:** (configured in .env)

---

**You're ready to go! 🚀**

If you encounter any issues, refer to the detailed documentation or the troubleshooting section above.
