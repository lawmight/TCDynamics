import azure.functions as func
import logging
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

def send_email_notification(name, email, message):
    """Send email notification using Zoho SMTP"""
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
        
        logging.info(f"Email notification sent for contact from {name}")
        return True
        
    except Exception as e:
        logging.error(f"Failed to send email notification: {str(e)}")
        return False

@app.route(route="ContactForm")
def ContactForm(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Contact form submission received.')
    
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
        
        # Basic email validation
        if '@' not in email or '.' not in email:
            return func.HttpResponse(
                json.dumps({
                    "success": False,
                    "message": "Veuillez fournir une adresse email valide."
                }),
                status_code=400,
                mimetype="application/json"
            )
        
        # Log the contact form submission
        logging.info(f'Contact form submitted by {name} ({email}): {message[:100]}...')
        
        # Send email notification
        email_sent = send_email_notification(name, email, message)
        
        # Return success response
        return func.HttpResponse(
            json.dumps({
                "success": True,
                "message": "Merci pour votre message ! Je vous répondrai bientôt."
            }),
            status_code=200,
            mimetype="application/json"
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
        logging.error(f'Error processing contact form: {str(e)}')
        return func.HttpResponse(
            json.dumps({
                "success": False,
                "message": "Une erreur s'est produite. Veuillez réessayer."
            }),
            status_code=500,
            mimetype="application/json"
        )