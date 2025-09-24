import azure.functions as func
import logging
import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_demo_email(name, email, company, message):
    """Send demo request notification via Zoho Mail"""
    try:
        zoho_email = os.environ.get('ZOHO_EMAIL', 'contact@tcdynamics.fr')
        zoho_password = os.environ.get('ZOHO_PASSWORD', '')

        if not zoho_password:
            logging.warning("Zoho password not configured")
            return False

        msg = MIMEMultipart()
        msg['From'] = zoho_email
        msg['To'] = zoho_email
        msg['Subject'] = f"Nouvelle demande de démo - {name}"

        body = f"""
Nouvelle demande de démonstration reçue:

Nom: {name}
Email: {email}
Entreprise: {company or 'Non spécifiée'}
Message:
{message}

Cordialement,
Le système de démo TCDynamics
        """.strip()

        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP_SSL('smtp.zoho.eu', 465)
        server.login(zoho_email, zoho_password)
        text = msg.as_string()
        server.sendmail(zoho_email, zoho_email, text)
        server.quit()

        logging.info(f"Demo email sent successfully for {name}")
        return True

    except Exception as e:
        logging.error(f"Failed to send demo email: {str(e)}")
        return False

def main(req: func.HttpRequest) -> func.HttpResponse:
    """Handle demo form submissions"""
    logging.info('Demo form submission received.')

    try:
        req_body = req.get_json()
        first_name = req_body.get('firstName', '').strip()
        last_name = req_body.get('lastName', '').strip()
        email = req_body.get('email', '').strip()
        company = req_body.get('company', '').strip()
        message = req_body.get('message', '').strip()

        if not first_name or not last_name or not email:
            return func.HttpResponse(
                json.dumps({"success": False, "message": "Champs requis manquants"}),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )

        email_sent = send_demo_email(f"{first_name} {last_name}", email, company, message)

        return func.HttpResponse(
            json.dumps({
                "success": True,
                "message": "Demande de démo envoyée avec succès",
                "emailSent": email_sent
            }),
            status_code=200,
            headers={"Content-Type": "application/json"}
        )

    except Exception as e:
        logging.error(f"Demo form error: {str(e)}")
        return func.HttpResponse(
            json.dumps({"success": False, "message": "Erreur de traitement"}),
            status_code=500,
            headers={"Content-Type": "application/json"}
        )
