# 🛡️ Security Implementation Guide

## ✅ **Security Features Implemented**

### **1. Input Validation & Sanitization**
- **Email Validation**: Uses `email-validator` library for proper RFC-compliant validation
- **XSS Protection**: `bleach` library sanitizes all user inputs
- **Input Sanitization**: Strips dangerous HTML tags and scripts

### **2. Rate Limiting**
- **IP-based Limiting**: Max 5 requests per 15 minutes per IP
- **Automatic Cleanup**: Old requests are automatically purged
- **Configurable**: Easy to adjust limits in production

### **3. Environment Security**
- **Environment Variables**: Sensitive data (Zoho credentials) moved to env vars
- **Local Development**: `.env` file support with `python-dotenv`
- **Production Ready**: Azure Function App settings for production

### **4. CORS Protection**
- **Proper Headers**: Configured CORS headers for cross-origin requests
- **Preflight Handling**: OPTIONS requests handled correctly
- **Configurable Origins**: Can be restricted to specific domains

### **5. Error Handling**
- **No Data Leakage**: Error messages don't expose internal details
- **Proper HTTP Status**: Correct status codes for different error types
- **Comprehensive Logging**: All errors logged for monitoring

## 🔧 **Configuration**

### **Environment Variables**
Create `.env` file from `env.example`:

```bash
cp env.example .env
```

Fill in your actual values:
```env
ZOHO_EMAIL=your-actual-email@zoho.com
ZOHO_PASSWORD=your-actual-app-password
```

### **Rate Limiting Configuration**
In `function_app.py`, adjust these parameters:

```python
def is_rate_limited(ip_address: str, max_requests: int = 5, window_minutes: int = 15):
    # Customize max_requests and window_minutes as needed
```

### **CORS Configuration**
Currently allows all origins (`*`). For production, restrict to your domain:

```python
"Access-Control-Allow-Origin": "https://yourdomain.com"
```

## 🧪 **Testing Security Features**

### **Run Security Tests**
```bash
python -m pytest tests/test_contact_form.py -v
```

### **Test Rate Limiting**
```bash
# Send multiple requests quickly to test rate limiting
for i in {1..10}; do curl -X POST your-function-url; done
```

### **Test Input Sanitization**
```bash
# Test XSS prevention
curl -X POST your-function-url \
  -H "Content-Type: application/json" \
  -d '{"name":"<script>alert(\"xss\")</script>","email":"test@example.com","message":"test"}'
```

## 📊 **Security Monitoring**

### **What to Monitor**
1. **Rate Limit Violations**: High number of 429 responses
2. **Invalid Input Attempts**: Failed validation attempts
3. **Email Delivery Failures**: SMTP errors
4. **Unusual Traffic Patterns**: Spikes in requests

### **Azure Monitor Integration**
The project includes `azure-monitor-opentelemetry` for comprehensive monitoring:

```python
# Already configured in requirements.txt
azure-monitor-opentelemetry==1.2.0
```

## 🚨 **Security Checklist**

### **Before Production**
- [ ] Update `.env` with production credentials
- [ ] Restrict CORS to specific domains
- [ ] Configure Azure Function App settings
- [ ] Set up monitoring and alerting
- [ ] Test all security features
- [ ] Review rate limiting settings
- [ ] Enable HTTPS only

### **Regular Security Tasks**
- [ ] Rotate Zoho app passwords quarterly
- [ ] Review and update dependencies monthly
- [ ] Monitor security logs weekly
- [ ] Test rate limiting functionality monthly
- [ ] Audit CORS settings quarterly

## 🔍 **Security Best Practices**

### **Input Validation**
```python
# Always sanitize user inputs
name = sanitize_input(req_body.get('name', ''))
email = sanitize_input(req_body.get('email', ''))
message = sanitize_input(req_body.get('message', ''))

# Validate email format
if not validate_email_address(email):
    return error_response("Invalid email format")
```

### **Rate Limiting**
```python
# Check rate limits before processing
client_ip = req.headers.get('X-Forwarded-For', 'unknown')
if is_rate_limited(client_ip):
    return rate_limit_response()
```

### **Error Handling**
```python
# Never expose internal errors to users
try:
    # Process request
    pass
except Exception as e:
    logging.error(f"Internal error: {str(e)}")
    return generic_error_response()
```

## 🛠️ **Troubleshooting**

### **Common Issues**

**Rate Limiting Too Aggressive**
- Increase `max_requests` or `window_minutes`
- Consider user-based limiting instead of IP-based

**CORS Errors**
- Check `Access-Control-Allow-Origin` header
- Ensure preflight requests are handled
- Verify request methods are allowed

**Email Delivery Failures**
- Verify Zoho credentials in environment variables
- Check SMTP settings and firewall rules
- Monitor Zoho account for blocks

**Input Sanitization Issues**
- Review `bleach` configuration
- Test with various input types
- Check for false positives

---

**🔒 Security is an ongoing process. Regularly review and update these measures!**
