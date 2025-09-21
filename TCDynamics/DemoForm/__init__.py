import azure.functions as func
import json
import logging
import os
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
import re
from typing import Dict, Any

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_demo_data(data: Dict[str, Any]) -> tuple[bool, str]:
    """Validate demo form data"""
    required_fields = ['firstName', 'lastName', 'email', 'company']
    
    for field in required_fields:
        if not data.get(field):
            return False, f"Le champ '{field}' est requis"
    
    if not validate_email(data['email']):
        return False, "Format d'email invalide"
    
    if len(data['company']) < 2:
        return False, "Le nom de l'entreprise doit contenir au moins 2 caractères"
    
    return True, ""

def create_demo_email(data: Dict[str, Any]) -> MIMEMultipart:
    """Create demo request email template"""
    msg = MIMEMultipart('alternative')
    msg['Subject'] = f"Demande de démonstration - {data['firstName']} {data['lastName']} ({data['company']})"
    msg['From'] = os.environ.get('ZOHO_EMAIL', 'contact@tcdynamics.fr')
    msg['To'] = os.environ.get('ZOHO_EMAIL', 'contact@tcdynamics.fr')
    msg['Reply-To'] = data['email']

    # Build conditional HTML parts
    phone_html = f"<p><strong>Téléphone:</strong> {data['phone']}</p>" if data.get('phone') else ""
    employees_html = f"<p><strong>Nombre d'employés:</strong> {data['employees']}</p>" if data.get('employees') else ""

    needs_html = ""
    if data.get('needs'):
        needs_html = f"""
        <div style="background-color: #ffffff; padding: 20px; border-left: 4px solid #e74c3c; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-top: 0;">Besoins exprimés</h3>
            <p style="white-space: pre-wrap;">{data['needs']}</p>
        </div>
        """

    # HTML email template
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
                🎯 Nouvelle demande de démonstration - TCDynamics
            </h2>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">Informations du prospect</h3>
                <p><strong>Nom complet:</strong> {data['firstName']} {data['lastName']}</p>
                <p><strong>Email:</strong> <a href="mailto:{data['email']}">{data['email']}</a></p>
                {phone_html}
                <p><strong>Entreprise:</strong> {data['company']}</p>
                {employees_html}
            </div>

            {needs_html}

            <div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0; font-size: 12px; color: #666;">
                <p><strong>Date:</strong> {datetime.now().strftime('%d/%m/%Y à %H:%M')}</p>
                <p><strong>Source:</strong> Formulaire de démonstration TCDynamics</p>
                <p><strong>Priorité:</strong> <span style="color: #e74c3c; font-weight: bold;">HAUTE</span> - Contacter dans les 2 heures</p>
            </div>

            <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
                <h4 style="color: #155724; margin-top: 0;">📋 Actions recommandées:</h4>
                <ul style="color: #155724; margin: 0;">
                    <li>Contacter le prospect dans les 2 heures</li>
                    <li>Préparer une démonstration personnalisée</li>
                    <li>Envoyer des informations sur les solutions adaptées</li>
                </ul>
            </div>
        </div>
    </body>
    </html>
    """

    msg.attach(MIMEText(html_content, 'html'))
    return msg

def send_email(msg: MIMEMultipart) -> bool:
    """Send email using Zoho SMTP"""
    try:
        smtp_server = "smtp.zoho.eu"
        smtp_port = 465
        email_user = os.environ.get('ZOHO_EMAIL')
        email_password = os.environ.get('ZOHO_PASSWORD')
        
        if not email_user or not email_password:
            logging.error("Email credentials not configured")
            return False
        
        server = smtplib.SMTP_SSL(smtp_server, smtp_port)
        server.login(email_user, email_password)
        server.send_message(msg)
        server.quit()
        
        logging.info(f"Demo email sent successfully to {email_user}")
        return True
        
    except Exception as e:
        logging.error(f"Failed to send demo email: {str(e)}")
        return False

def demo_form(req: func.HttpRequest) -> func.HttpResponse:
    """Handle demo form submissions"""
    logging.info('Demo form function processed a request.')
    
    try:
        # Parse request body
        try:
            req_body = req.get_json()
        except ValueError:
            return func.HttpResponse(
                json.dumps({
                    "success": False,
                    "message": "Données JSON invalides"
                }),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )
        
        if not req_body:
            return func.HttpResponse(
                json.dumps({
                    "success": False,
                    "message": "Aucune donnée reçue"
                }),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )
        
        # Validate data
        is_valid, error_message = validate_demo_data(req_body)
        if not is_valid:
            return func.HttpResponse(
                json.dumps({
                    "success": False,
                    "message": error_message
                }),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )
        
        # Create and send email
        email_msg = create_demo_email(req_body)
        email_sent = send_email(email_msg)
        
        if email_sent:
            return func.HttpResponse(
                json.dumps({
                    "success": True,
                    "message": "Votre demande de démonstration a été enregistrée. Notre équipe vous contactera dans les 2 heures.",
                    "messageId": f"demo_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
                }),
                status_code=200,
                headers={"Content-Type": "application/json"}
            )
        else:
            return func.HttpResponse(
                json.dumps({
                    "success": False,
                    "message": "Erreur lors de l'enregistrement de votre demande. Veuillez réessayer plus tard."
                }),
                status_code=500,
                headers={"Content-Type": "application/json"}
            )
            
    except Exception as e:
        logging.error(f"Demo form error: {str(e)}")
        return func.HttpResponse(
            json.dumps({
                "success": False,
                "message": "Une erreur inattendue s'est produite. Veuillez réessayer plus tard."
            }),
            status_code=500,
            headers={"Content-Type": "application/json"}
        )

