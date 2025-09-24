import azure.functions as func
import logging
import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email_notification(name, email, message):
    """Send email notification via Zoho Mail"""
    try:
        zoho_email = os.environ.get('ZOHO_EMAIL', 'contact@tcdynamics.fr')
        zoho_password = os.environ.get('ZOHO_PASSWORD', '')

        if not zoho_password:
            logging.warning("Zoho password not configured")
            return False

        # Create message
        msg = MIMEMultipart()
        msg['From'] = zoho_email
        msg['To'] = zoho_email
        msg['Subject'] = f"Nouveau message de contact - {name}"

        body = f"""
Nouvelle demande de contact reçue:

Nom: {name}
Email: {email}
Message:
{message}

Cordialement,
Le système de contact TCDynamics
        """.strip()

        msg.attach(MIMEText(body, 'plain'))

        # Send email
        server = smtplib.SMTP_SSL('smtp.zoho.eu', 465)
        server.login(zoho_email, zoho_password)
        text = msg.as_string()
        server.sendmail(zoho_email, zoho_email, text)
        server.quit()

        logging.info(f"Contact email sent successfully for {name}")
        return True

    except Exception as e:
        logging.error(f"Failed to send contact email: {str(e)}")
        return False

def main(req: func.HttpRequest) -> func.HttpResponse:
    """Handle contact form submissions and send email via Zoho Mail"""
    logging.info('Contact form submission received.')

    try:
        # Parse request body
        req_body = req.get_json()
        name = req_body.get('name', '').strip()
        email = req_body.get('email', '').strip()
        message = req_body.get('message', '').strip()
        phone = req_body.get('phone', '').strip() if req_body.get('phone') else None
        company = req_body.get('company', '').strip() if req_body.get('company') else None

        # Validate required fields
        if not name or not email or not message:
            return func.HttpResponse(
                json.dumps({
                    "success": False,
                    "message": "Tous les champs requis doivent être remplis"
                }),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )

        # Send notification email
        email_sent = send_email_notification(name, email, message)

        # Create response
        response_data = {
            "success": True,
            "message": "Message envoyé avec succès",
            "emailSent": email_sent
        }

        logging.info(f"Contact form processed successfully for {name}")
        return func.HttpResponse(
            json.dumps(response_data),
            status_code=200,
            headers={"Content-Type": "application/json"}
        )

    except Exception as e:
        logging.error(f"Contact form error: {str(e)}")
        return func.HttpResponse(
            json.dumps({
                "success": False,
                "message": "Erreur lors du traitement du formulaire"
            }),
            status_code=500,
            headers={"Content-Type": "application/json"}
        )
