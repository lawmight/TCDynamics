import azure.functions as func
import logging
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv
from email_validator import validate_email, EmailNotValidError
import bleach
from datetime import datetime, timedelta
from typing import Dict, Optional
import time
import hashlib
import uuid
from database import db_manager, ContactSubmission

# Load environment variables
load_dotenv()

# Configure enhanced logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Performance monitoring
performance_metrics = {
    'requests_processed': 0,
    'successful_emails': 0,
    'failed_emails': 0,
    'rate_limited_requests': 0,
    'validation_failures': 0
}

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

# Rate limiting storage (in production, use Redis or database)
rate_limit_storage: Dict[str, list] = {}

def log_performance_metric(metric_name: str, increment: int = 1):
    """Log performance metrics for monitoring"""
    performance_metrics[metric_name] += increment
    if performance_metrics['requests_processed'] % 100 == 0:  # Log every 100 requests
        logging.info(f"Performance metrics: {performance_metrics}")

def get_client_identifier(req: func.HttpRequest) -> str:
    """Get client identifier for rate limiting (IP + User-Agent hash)"""
    ip = req.headers.get('X-Forwarded-For', req.headers.get('X-Real-IP', 'unknown'))
    user_agent = req.headers.get('User-Agent', '')
    # Create a hash to avoid storing full user agent strings
    ua_hash = hashlib.md5(user_agent.encode()).hexdigest()[:8] if user_agent else 'unknown'
    return f"{ip}:{ua_hash}"

def is_rate_limited(client_id: str, max_requests: int = 5, window_minutes: int = 15) -> bool:
    """Enhanced rate limiting with client identification"""
    now = datetime.now()
    window_start = now - timedelta(minutes=window_minutes)
    
    if client_id not in rate_limit_storage:
        rate_limit_storage[client_id] = []
    
    # Clean old requests
    rate_limit_storage[client_id] = [
        req_time for req_time in rate_limit_storage[client_id] 
        if req_time > window_start
    ]
    
    # Check if limit exceeded
    if len(rate_limit_storage[client_id]) >= max_requests:
        log_performance_metric('rate_limited_requests')
        logging.warning(f"Rate limit exceeded for client: {client_id}")
        return True
    
    # Add current request
    rate_limit_storage[client_id].append(now)
    return False

def sanitize_input(text: str) -> str:
    """Sanitize user input to prevent XSS"""
    if not text:
        return ""
    # Remove HTML tags and dangerous characters
    return bleach.clean(text.strip(), tags=[], strip=True)

def validate_email_address(email: str) -> bool:
    """Validate email address format"""
    try:
        validate_email(email)
        return True
    except EmailNotValidError:
        log_performance_metric('validation_failures')
        return False

def send_email_notification(name: str, email: str, message: str) -> bool:
    """Send email notification using Zoho SMTP with performance tracking"""
    start_time = time.time()
    try:
        # Zoho SMTP settings
        smtp_server = "smtp.zoho.com"
        smtp_port = 587
        sender_email = os.environ.get("ZOHO_EMAIL")  # Your Zoho email
        sender_password = os.environ.get("ZOHO_PASSWORD")  # Your Zoho app password
        
        if not sender_email or not sender_password:
            logging.error("Zoho email credentials not configured")
            return False
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = sender_email  # Send to yourself
        msg['Subject'] = f"Nouveau message de contact - {name}"
        
        # Email body
        body = f"""
        Nouveau message de contact reçu sur TCDynamics :
        
        Nom: {name}
        Email: {email}
        Message: {message}
        
        ---
        Envoyé automatiquement depuis le formulaire de contact.
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Send email
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        text = msg.as_string()
        server.sendmail(sender_email, sender_email, text)
        server.quit()
        
        elapsed_time = time.time() - start_time
        logging.info(f"Email notification sent for contact from {name} (took {elapsed_time:.2f}s)")
        log_performance_metric('successful_emails')
        return True
        
    except Exception as e:
        elapsed_time = time.time() - start_time
        logging.error(f"Failed to send email notification: {str(e)} (took {elapsed_time:.2f}s)")
        log_performance_metric('failed_emails')
        return False

@app.route(route="ContactForm", methods=["GET", "POST", "OPTIONS"])
def ContactForm(req: func.HttpRequest) -> func.HttpResponse:
    """Enhanced contact form handler with performance monitoring"""
    request_start_time = time.time()
    log_performance_metric('requests_processed')
    
    logging.info('Contact form submission received.')
    
    # Handle CORS preflight requests
    if req.method == "OPTIONS":
        allowed_origins = os.environ.get("ALLOWED_ORIGINS", "*")
        return func.HttpResponse(
            "",
            status_code=200,
            headers={
                "Access-Control-Allow-Origin": allowed_origins,
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        )
    
    try:
        # Get form data from request body
        req_body = req.get_json()
        
        # Extract form fields
        name = req_body.get('name', '').strip()
        email = req_body.get('email', '').strip()
        message = req_body.get('message', '').strip()
        
        # Validate required fields
        if not name or not email or not message:
            return func.HttpResponse(
                json.dumps({
                    "success": False,
                    "message": "Tous les champs sont requis (nom, email, message)."
                }),
                status_code=400,
                mimetype="application/json"
            )
        
        # Sanitize inputs
        name = sanitize_input(name)
        email = sanitize_input(email)
        message = sanitize_input(message)
        
        # Validate email format
        if not validate_email_address(email):
            return func.HttpResponse(
                json.dumps({
                    "success": False,
                    "message": "Veuillez fournir une adresse email valide."
                }),
                status_code=400,
                mimetype="application/json"
            )
        
        # Rate limiting check with enhanced client identification
        client_id = get_client_identifier(req)
        if is_rate_limited(client_id):
            return func.HttpResponse(
                json.dumps({
                    "success": False,
                    "message": "Trop de tentatives. Veuillez réessayer dans 15 minutes."
                }),
                status_code=429,
                mimetype="application/json"
            )
        
        # Create submission record
        submission = ContactSubmission(
            id=str(uuid.uuid4()),
            name=name,
            email=email,
            message=message,
            timestamp=datetime.now().isoformat(),
            ip_address=client_id.split(':')[0],  # Extract IP from client_id
            user_agent=req.headers.get('User-Agent', 'Unknown')[:200]  # Limit length
        )
        
        # Log the contact form submission
        logging.info(f'Contact form submitted by {name} ({email}): {message[:100]}...')
        
        # Send email notification
        email_sent = send_email_notification(name, email, message)
        submission.email_sent = email_sent
        
        # Save to database
        db_saved = db_manager.save_contact_submission(submission)
        if not db_saved:
            logging.warning("Failed to save submission to database")
        
        # Return success response with CORS headers
        allowed_origins = os.environ.get("ALLOWED_ORIGINS", "*")
        return func.HttpResponse(
            json.dumps({
                "success": True,
                "message": "Merci pour votre message ! Je vous répondrai bientôt."
            }),
            status_code=200,
            mimetype="application/json",
            headers={
                "Access-Control-Allow-Origin": allowed_origins,
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        )
        
    except ValueError:
        return func.HttpResponse(
            json.dumps({
                "success": False,
                "message": "Données de formulaire invalides."
            }),
            status_code=400,
            mimetype="application/json"
        )
            except Exception as e:
        request_duration = time.time() - request_start_time
        logging.error(f'Error processing contact form: {str(e)} (took {request_duration:.2f}s)')
        return func.HttpResponse(
            json.dumps({
                "success": False,
                "message": "Une erreur s'est produite. Veuillez réessayer."
            }),
            status_code=500,
            mimetype="application/json",
            headers={
                "Access-Control-Allow-Origin": os.environ.get("ALLOWED_ORIGINS", "*"),
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        )

@app.route(route="health")
def health_check(req: func.HttpRequest) -> func.HttpResponse:
    """Health check endpoint for monitoring"""
    try:
        # Enhanced health checks with database stats
        health_status = {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0",
            "performance_metrics": performance_metrics.copy(),
            "database_stats": db_manager.get_submission_stats(),
            "environment": {
                "python_version": os.sys.version,
                "has_zoho_config": bool(os.environ.get("ZOHO_EMAIL") and os.environ.get("ZOHO_PASSWORD")),
                "storage_backend": db_manager.storage_type,
                "rate_limit_active_clients": len(rate_limit_storage)
            }
        }
        
        return func.HttpResponse(
            json.dumps(health_status, indent=2),
            status_code=200,
            mimetype="application/json",
            headers={
                "Access-Control-Allow-Origin": os.environ.get("ALLOWED_ORIGINS", "*"),
                "Cache-Control": "no-cache"
            }
        )
    except Exception as e:
        logging.error(f"Health check failed: {str(e)}")
        return func.HttpResponse(
            json.dumps({
                "status": "unhealthy",
                "error": "Health check failed",
                "timestamp": datetime.now().isoformat()
            }),
            status_code=500,
            mimetype="application/json"
        )

@app.route(route="admin/dashboard", methods=["GET"])
def admin_dashboard(req: func.HttpRequest) -> func.HttpResponse:
    """Admin dashboard with submission analytics"""
    try:
        # Simple authentication check (in production, use proper auth)
        auth_header = req.headers.get('Authorization', '')
        admin_key = os.environ.get('ADMIN_KEY', 'default-admin-key')
        
        if not auth_header or auth_header != f"Bearer {admin_key}":
            return func.HttpResponse(
                json.dumps({"error": "Unauthorized"}),
                status_code=401,
                mimetype="application/json"
            )
        
        # Get recent submissions and analytics
        recent_submissions = db_manager.get_recent_submissions(50)
        stats = db_manager.get_submission_stats()
        
        dashboard_data = {
            "summary": stats,
            "performance": performance_metrics.copy(),
            "recent_submissions": [
                {
                    "id": sub.id,
                    "name": sub.name,
                    "email": sub.email[:3] + "***@" + sub.email.split('@')[1] if '@' in sub.email else "***",  # Privacy
                    "timestamp": sub.timestamp,
                    "email_sent": sub.email_sent,
                    "message_length": len(sub.message)
                } for sub in recent_submissions[:10]  # Limit for privacy
            ],
            "rate_limiting": {
                "active_clients": len(rate_limit_storage),
                "rate_limited_requests": performance_metrics.get('rate_limited_requests', 0)
            },
            "system_info": {
                "storage_type": db_manager.storage_type,
                "timestamp": datetime.now().isoformat()
            }
        }
        
        return func.HttpResponse(
            json.dumps(dashboard_data, indent=2),
            status_code=200,
            mimetype="application/json",
            headers={
                "Access-Control-Allow-Origin": os.environ.get("ALLOWED_ORIGINS", "*"),
                "Cache-Control": "no-cache"
            }
        )
        
    except Exception as e:
        logging.error(f"Admin dashboard error: {str(e)}")
        return func.HttpResponse(
            json.dumps({
                "error": "Dashboard unavailable",
                "timestamp": datetime.now().isoformat()
            }),
            status_code=500,
            mimetype="application/json"
        )