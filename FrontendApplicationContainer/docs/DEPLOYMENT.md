# Deployment Guide

This guide covers deploying the Device Remote Management Platform frontend to various environments.

## Prerequisites

- Node.js 14+ and npm
- Backend API server running and accessible
- Environment variables configured

## Environment Configuration

### Required Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```bash
REACT_APP_API_URL=https://api.yourdomain.com/api/v1
REACT_APP_SITE_URL=https://app.yourdomain.com
REACT_APP_API_TIMEOUT=30000
REACT_APP_DEBUG=false
```

**Important**: Never commit the `.env` file to version control. Use `.env.example` as a template.

### Environment-Specific Configuration

#### Development
```bash
REACT_APP_API_URL=http://localhost:8080/api/v1
REACT_APP_SITE_URL=http://localhost:3000
REACT_APP_DEBUG=true
```

#### Staging
```bash
REACT_APP_API_URL=https://staging-api.yourdomain.com/api/v1
REACT_APP_SITE_URL=https://staging.yourdomain.com
REACT_APP_DEBUG=false
```

#### Production
```bash
REACT_APP_API_URL=https://api.yourdomain.com/api/v1
REACT_APP_SITE_URL=https://app.yourdomain.com
REACT_APP_DEBUG=false
```

## Build Process

### Production Build

```bash
# Install dependencies
npm install

# Create production build
npm run build
```

This creates an optimized production build in the `build/` directory.

### Build Optimization

The build process:
- Minifies JavaScript and CSS
- Bundles all dependencies
- Optimizes images and assets
- Creates source maps (if enabled)
- Generates service worker (if PWA enabled)

## Deployment Options

### 1. Static File Hosting

#### Using Nginx

1. Copy build files to server:
```bash
scp -r build/* user@server:/var/www/device-management/
```

2. Configure Nginx:
```nginx
server {
    listen 80;
    server_name app.yourdomain.com;
    root /var/www/device-management;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/javascript application/xml+rss application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
}
```

3. Restart Nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

#### Using Apache

1. Copy build files:
```bash
scp -r build/* user@server:/var/www/html/device-management/
```

2. Create `.htaccess`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>

# Cache static assets
<FilesMatch "\.(js|css|png|jpg|jpeg|gif|svg|ico)$">
  Header set Cache-Control "max-age=31536000, public"
</FilesMatch>
```

### 2. Cloud Platforms

#### AWS S3 + CloudFront

1. Build the application:
```bash
npm run build
```

2. Create S3 bucket:
```bash
aws s3 mb s3://device-management-frontend
```

3. Upload files:
```bash
aws s3 sync build/ s3://device-management-frontend --delete
```

4. Configure bucket for static website hosting:
```bash
aws s3 website s3://device-management-frontend \
  --index-document index.html \
  --error-document index.html
```

5. Create CloudFront distribution (for HTTPS and CDN)

#### Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Build and deploy:
```bash
npm run build
netlify deploy --prod --dir=build
```

Or connect your Git repository for automatic deployments.

#### Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel --prod
```

#### Heroku

1. Create `static.json` in project root:
```json
{
  "root": "build/",
  "routes": {
    "/**": "index.html"
  },
  "headers": {
    "/**": {
      "Cache-Control": "public, max-age=31536000"
    },
    "/": {
      "Cache-Control": "no-cache"
    }
  }
}
```

2. Deploy:
```bash
heroku create device-management-frontend
git push heroku main
```

### 3. Docker Deployment

#### Create Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Build and run Docker image

```bash
# Build image
docker build -t device-management-frontend .

# Run container
docker run -d -p 80:80 device-management-frontend
```

#### Docker Compose

```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - REACT_APP_API_URL=http://backend:8080/api/v1
    depends_on:
      - backend
```

### 4. Kubernetes Deployment

#### Create Kubernetes manifests

**deployment.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: device-management-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: device-management-frontend
  template:
    metadata:
      labels:
        app: device-management-frontend
    spec:
      containers:
      - name: frontend
        image: your-registry/device-management-frontend:latest
        ports:
        - containerPort: 80
        env:
        - name: REACT_APP_API_URL
          valueFrom:
            configMapKeyRef:
              name: frontend-config
              key: api-url
```

**service.yaml**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: device-management-frontend
spec:
  selector:
    app: device-management-frontend
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

Deploy:
```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

## SSL/TLS Configuration

### Let's Encrypt with Nginx

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d app.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### CloudFlare

1. Add your domain to CloudFlare
2. Enable "Always Use HTTPS"
3. Set SSL/TLS mode to "Full" or "Full (strict)"
4. Enable automatic HTTPS rewrites

## Performance Optimization

### 1. Enable Compression

Ensure your web server enables Gzip/Brotli compression for:
- JavaScript files (.js)
- CSS files (.css)
- JSON files (.json)
- HTML files (.html)

### 2. Caching Strategy

```nginx
# Cache static assets for 1 year
location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Don't cache index.html
location = /index.html {
    add_header Cache-Control "no-cache, must-revalidate";
}
```

### 3. CDN Integration

Use CloudFront, CloudFlare, or similar CDN to:
- Reduce latency
- Offload traffic from origin
- Provide DDoS protection
- Enable HTTP/2 and HTTP/3

### 4. Asset Optimization

```bash
# Optimize images before deployment
npm install -g imagemin-cli
imagemin build/static/media/* --out-dir=build/static/media
```

## Monitoring and Logging

### Application Monitoring

Integrate monitoring tools:
- Google Analytics
- Sentry for error tracking
- LogRocket for session replay
- New Relic or DataDog for APM

### Server Monitoring

Monitor web server metrics:
- Request rate
- Response time
- Error rate
- CPU and memory usage

## Rollback Strategy

### Using Git Tags

```bash
# Tag current release
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0

# Rollback to previous version
git checkout v0.9.0
npm run build
# Deploy build files
```

### Blue-Green Deployment

1. Deploy new version to "green" environment
2. Test thoroughly
3. Switch traffic from "blue" to "green"
4. Keep "blue" as rollback option

## Health Checks

Configure health check endpoints:

```nginx
location /health {
    access_log off;
    return 200 "healthy\n";
    add_header Content-Type text/plain;
}
```

## Security Checklist

- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Environment variables not exposed in client
- [ ] Dependencies updated and vulnerability-free
- [ ] Rate limiting enabled (if applicable)
- [ ] CSP (Content Security Policy) configured
- [ ] Authentication tokens secured

## Post-Deployment Verification

1. Check application loads correctly
2. Test authentication flow
3. Verify API connectivity
4. Test critical user flows
5. Check browser console for errors
6. Verify mobile responsiveness
7. Test all protocol operations
8. Check query history and export features

## Troubleshooting

### Issue: Blank page after deployment

**Solution**: Check browser console for errors. Usually caused by incorrect `homepage` in `package.json` or missing environment variables.

### Issue: API calls failing

**Solution**: Verify `REACT_APP_API_URL` is correct and CORS is configured on backend.

### Issue: 404 errors on refresh

**Solution**: Configure server to redirect all routes to `index.html` for SPA routing.

### Issue: Assets not loading

**Solution**: Check that all asset paths are relative and `PUBLIC_URL` is configured correctly.

## Support

For deployment issues, contact the DevOps team or refer to the platform-specific documentation.
