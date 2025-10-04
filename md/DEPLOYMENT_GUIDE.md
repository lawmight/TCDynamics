# 🚀 TCDynamics Deployment Guide (Node.js Backend)

**Date:** September 30, 2025  
**Status:** Ready for deployment

---

## ✅ What We've Done

### 1. **Removed Azure Functions Complexity**

- Deleted `TCDynamics/` Python backend directory
- Removed Stripe payment pages (Checkout.tsx, CheckoutSuccess.tsx)
- Simplified to single Node.js backend

### 2. **Created Environment-Based API Configuration**

- Created `src/utils/apiConfig.ts` - simple API client
- Updated `useContactForm.ts` and `useDemoForm.ts` to use environment variables
- Frontend now calls correct backend URL based on environment

### 3. **Built Production Frontend**

- **Location:** `dist/` folder (585 KB total)
- **Build successful!** ✅
- Ready to deploy to OVHcloud

---

## 📦 Files to Deploy

### **Frontend (Upload to OVHcloud via FileZilla)**

Upload the entire **`dist/`** folder contents to your web root:

```
dist/
├── index.html
├── assets/
│   ├── hero-network-B8V4kP3X.jpg
│   ├── index-DJb6a_VD.css
│   ├── index-nLxmS9Zq.js
│   ├── vendor-DJcYfsJ3.js
│   ├── ui-DAtPT9Kv.js
│   ├── AIChatbot-CSpc-I-f.js
│   ├── Index--drEFEEO.js
│   └── ... (other assets)
├── favicon.ico
├── manifest.json
├── robots.txt
└── sw.js
```

**OVHcloud Web Root:** Usually `/www/` or `/public_html/`

### **Backend (Deploy to OVHcloud Server)**

Upload the **`backend/`** folder:

```
backend/
├── src/
│   ├── server.js
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   └── utils/
├── package.json
├── package-lock.json
└── .env (create this on server)
```

---

## 🔧 Step-by-Step Deployment

### **Step 1: Deploy Frontend with FileZilla**

1. **Open FileZilla**
2. **Connect to OVHcloud:**
   - Host: `ftp.tcdynamics.fr` (or your FTP hostname)
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21 (or 22 for SFTP)

3. **Navigate to web root:**
   - Remote site: `/www/` or `/public_html/`

4. **Upload dist/ contents:**
   - **Local site:** Navigate to `/home/Tom/GitHub/TCDynamics/dist/`
   - **Select all files and folders inside `dist/`**
   - **Drag and drop to remote site**
   - Wait for upload to complete

### **Step 2: Deploy Backend to OVHcloud Server**

#### **Option A: Using FileZilla (Easier)**

1. **Upload backend folder:**
   - Local: `/home/Tom/GitHub/TCDynamics/backend/`
   - Remote: `/home/your_username/TCDynamics-backend/` (or similar)

2. **SSH into your server:**

   ```bash
   ssh your_username@tcdynamics.fr
   ```

3. **Install dependencies:**

   ```bash
   cd ~/TCDynamics-backend
   npm install --production
   ```

4. **Create `.env` file:**

   ```bash
   nano .env
   ```

   Paste this content:

   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=production

   # Email Configuration (Zoho)
   EMAIL_HOST=smtp.zoho.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=contact@workflowai.fr
   EMAIL_PASS=gsdSk4MQk3ck

   # Security
   JWT_SECRET=your_very_long_secure_random_string_here_at_least_32_characters
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=5

   # URLs
   FRONTEND_URL=https://tcdynamics.fr
   BACKEND_URL=https://tcdynamics.fr/api
   ALLOWED_ORIGINS=https://tcdynamics.fr,https://www.tcdynamics.fr
   ```

   **Save:** Press `Ctrl+X`, then `Y`, then `Enter`

5. **Install PM2 (if not installed):**

   ```bash
   npm install -g pm2
   ```

6. **Start the backend:**

   ```bash
   pm2 start src/server.js --name tcdynamics-api
   pm2 save
   pm2 startup
   ```

   **Copy the command PM2 shows you and run it** (it will auto-start on reboot)

7. **Check it's running:**
   ```bash
   pm2 status
   pm2 logs tcdynamics-api
   ```

#### **Option B: Using Git (Advanced)**

```bash
# On server
cd ~
git clone https://github.com/lawmight/TCDynamics.git
cd TCDynamics/backend
npm install --production

# Create .env file (same as above)
nano .env

# Start with PM2
pm2 start src/server.js --name tcdynamics-api
pm2 save
```

### **Step 3: Configure Nginx**

Your Nginx configuration should look like this:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name tcdynamics.fr www.tcdynamics.fr;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name tcdynamics.fr www.tcdynamics.fr;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/tcdynamics.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tcdynamics.fr/privkey.pem;

    # Frontend - Static files
    root /www;  # or /public_html
    index index.html;

    # Frontend routing (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend health check
    location /health {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Apply Nginx configuration:**

```bash
# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🧪 Testing After Deployment

### **1. Test Frontend**

Open browser: https://tcdynamics.fr

- Should load WorkFlowAI homepage
- No console errors

### **2. Test Backend Health**

Open browser: https://tcdynamics.fr/health

- Should show: `{"status":"OK","timestamp":"...","uptime":...}`

### **3. Test Contact Form**

1. Go to https://tcdynamics.fr
2. Scroll to Contact section
3. Fill out form and submit
4. Should receive success message

### **4. Check Backend Logs**

```bash
ssh your_username@tcdynamics.fr
pm2 logs tcdynamics-api
```

---

## 📊 Monitoring

### **Backend Status**

```bash
pm2 status          # See if running
pm2 logs tcdynamics-api  # View logs
pm2 restart tcdynamics-api  # Restart if needed
```

### **View Logs**

```bash
pm2 logs tcdynamics-api --lines 100
```

---

## 🔄 Future Updates

### **Update Frontend:**

```bash
# On your local machine
cd /home/Tom/GitHub/TCDynamics
npm run build

# Upload dist/ via FileZilla to OVHcloud
```

### **Update Backend:**

```bash
# On OVHcloud server
cd ~/TCDynamics-backend
git pull
npm install --production
pm2 restart tcdynamics-api
```

---

## ⚠️ Important Notes

1. **Backend must run on port 3001** (or update Nginx config)
2. **CORS is configured** for tcdynamics.fr domain
3. **Email uses Zoho SMTP** with credentials in `.env`
4. **Rate limiting:** 5 requests per 15 minutes per IP
5. **CSRF protection enabled** - forms must come from your domain

---

## 🆘 Troubleshooting

### **Contact form not working:**

- Check PM2 logs: `pm2 logs tcdynamics-api`
- Verify backend is running: `curl http://localhost:3001/health`
- Check Nginx proxy: `sudo nginx -t`

### **Backend not starting:**

- Check .env file exists: `ls -la /home/username/TCDynamics-backend/.env`
- Install dependencies: `npm install`
- Check Node version: `node --version` (should be 18+)

### **Emails not sending:**

- Verify Zoho credentials in `.env`
- Check backend logs for email errors
- Test Zoho SMTP: https://www.zoho.com/mail/

---

## ✅ Deployment Checklist

- [ ] Frontend built successfully (`dist/` folder created)
- [ ] Frontend uploaded to OVHcloud via FileZilla
- [ ] Backend uploaded to OVHcloud server
- [ ] Backend `.env` file created with correct values
- [ ] Backend dependencies installed (`npm install`)
- [ ] Backend started with PM2
- [ ] Nginx configured and reloaded
- [ ] Frontend loads at https://tcdynamics.fr
- [ ] Backend health check works
- [ ] Contact form submits successfully
- [ ] PM2 auto-start configured

---

**Need Help?** Check the logs or contact support!

**Your simple Node.js backend is ready to go! 🎉**
