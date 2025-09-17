# 🚀 TCDynamics Deployment Guide

This guide explains how to use your existing VS Code CI/CD setup to deploy your complete TCDynamics project.

## 📋 **What You Already Have**

✅ **VS Code Azure Functions CI/CD** - Already configured  
✅ **Python virtual environment** - Already set up  
✅ **Local development tasks** - Already working  
✅ **GitHub repository** - Ready to push  

## 🎯 **Complete CI/CD Pipeline**

### **Option 1: VS Code Tasks (Recommended)**

Your VS Code now has enhanced tasks for complete deployment:

1. **Open VS Code Command Palette** (`Ctrl+Shift+P`)
2. **Run Tasks** → **Run Task**
3. **Choose from these options**:

#### **🔄 Full Deployment (Backend + Frontend)**
- Deploys Azure Functions backend
- Prepares frontend files for OVHcloud
- Runs all necessary steps automatically

#### **⚡ Deploy to Azure Functions**
- Only deploys the backend API
- Updates your Function App automatically

#### **🌐 Deploy Frontend to OVHcloud**
- Shows you exactly which files to upload
- Provides step-by-step instructions

#### **🧪 Test Local Development**
- Starts local server for testing
- Runs on `http://localhost:8000`

#### **📤 Git: Commit and Push**
- Automatically commits and pushes changes
- Triggers GitHub Actions if configured

### **Option 2: GitHub Actions (Automatic)**

When you push to GitHub, the workflow automatically:

1. **Tests** your code
2. **Deploys** Azure Functions backend
3. **Prepares** frontend files for OVHcloud
4. **Notifies** you of next steps

## 🔧 **Setup Steps**

### **1. GitHub Repository Setup**

```bash
# Add your GitHub repository (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/TCDynamics.git
git push -u origin main
```

### **2. Azure Functions Setup**

1. **Go to [portal.azure.com](https://portal.azure.com)**
2. **Create Function App**:
   - Name: `tcdynamics-api`
   - Runtime: Python 3.9
   - Region: Choose closest to you
3. **Get Publish Profile**:
   - Go to Function App → Overview → Get publish profile
   - Download the file

### **3. GitHub Secrets Setup**

In your GitHub repository → Settings → Secrets:

- `AZURE_FUNCTIONAPP_PUBLISH_PROFILE`: Paste your publish profile content
- `ZOHO_EMAIL`: Your Zoho email address
- `ZOHO_PASSWORD`: Your Zoho app password

### **4. OVHcloud Path Configuration**

Update the PowerShell script with your OVHcloud path:

```powershell
# Edit deploy-ovhcloud.ps1
$OVHcloudPath = "C:\path\to\your\actual\ovhcloud\folder"
```

## 🚀 **Deployment Commands**

### **Using VS Code (Easiest)**

1. **Press `Ctrl+Shift+P`**
2. **Type "Tasks: Run Task"**
3. **Select "Full Deployment (Backend + Frontend)"**

### **Using PowerShell**

```powershell
# Deploy to OVHcloud
.\deploy-ovhcloud.ps1 -OVHcloudPath "C:\your\ovhcloud\path"

# Deploy with backup
.\deploy-ovhcloud.ps1 -OVHcloudPath "C:\your\ovhcloud\path" -Backup
```

### **Using Git (Triggers GitHub Actions)**

```bash
git add .
git commit -m "Update website"
git push origin main
```

## 📁 **File Structure After Deployment**

```
OVHcloud Hosting:
├── index.html          # Your main website
├── style.css           # Complete styling
├── script.js           # Interactive functionality
└── README.md           # Documentation

Azure Functions:
├── function_app.py     # Contact form API
├── requirements.txt    # Python dependencies
└── host.json          # Function configuration
```

## 🔗 **Integration Points**

### **Frontend → Backend Connection**

Your `script.js` connects to Azure Functions:

```javascript
// Current endpoint (update with your actual Function App name)
const response = await fetch('https://tcdynamics-api.azurewebsites.net/api/ContactForm', {
```

### **Email Integration**

Azure Function sends emails via Zoho:

```python
# Configured in Azure Function App settings
ZOHO_EMAIL = "your-email@zoho.com"
ZOHO_PASSWORD = "your-app-password"
```

## 🧪 **Testing Your Deployment**

### **1. Test Frontend**
- Visit your OVHcloud domain
- Check all styling and animations
- Test navigation and interactions

### **2. Test Backend**
- Fill out the contact form
- Check if you receive email notifications
- Verify error handling

### **3. Test Integration**
- Submit contact form from your website
- Confirm email is sent via Zoho
- Check Azure Function logs

## 🔄 **Continuous Deployment**

### **Automatic Updates**

Every time you push to GitHub:
1. ✅ Code is tested
2. ✅ Backend is deployed to Azure
3. ✅ Frontend files are prepared
4. ✅ You get notified to upload to OVHcloud

### **Manual Updates**

Using VS Code tasks:
1. ✅ Make your changes
2. ✅ Run "Full Deployment" task
3. ✅ Everything is updated automatically

## 🛠️ **Troubleshooting**

### **Azure Functions Issues**
- Check Function App logs in Azure Portal
- Verify environment variables are set
- Test function locally with VS Code

### **Frontend Issues**
- Check browser console for errors
- Verify file paths in OVHcloud
- Test locally with `python -m http.server 8000`

### **Email Issues**
- Verify Zoho credentials in Azure
- Check Zoho app password is correct
- Test SMTP settings

## 📞 **Support**

- **VS Code Tasks**: Use Command Palette
- **GitHub Actions**: Check Actions tab in repository
- **Azure Functions**: Use Azure Portal
- **OVHcloud**: Use OVHcloud control panel

---

**🎉 Your CI/CD pipeline is now complete and ready to use!**
