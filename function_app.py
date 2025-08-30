import azure.functions as func
import logging
import json

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

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
        
        # Here you would typically:
        # 1. Save to database
        # 2. Send email notification
        # 3. Send confirmation email to user
        
        # For now, just return success response
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