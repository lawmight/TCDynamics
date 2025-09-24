import azure.functions as func
import logging
import json
import os
import stripe

def main(req: func.HttpRequest) -> func.HttpResponse:
    """Create a Stripe subscription"""
    logging.info('Creating subscription')

    try:
        stripe_key = os.environ.get('STRIPE_SECRET_KEY')
        if not stripe_key:
            return func.HttpResponse(
                json.dumps({"error": "Stripe not configured"}),
                status_code=500,
                headers={"Content-Type": "application/json"}
            )

        stripe.api_key = stripe_key

        req_body = req.get_json()
        price_id = req_body.get('priceId')
        payment_method_id = req_body.get('paymentMethodId')

        if not price_id or not payment_method_id:
            return func.HttpResponse(
                json.dumps({"error": "Missing required fields"}),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )

        # This is a simplified version - in production you'd create a customer first
        subscription = stripe.Subscription.create(
            default_payment_method=payment_method_id,
            items=[{"price": price_id}],
            expand=["latest_invoice.payment_intent"]
        )

        return func.HttpResponse(
            json.dumps({"subscription": subscription}),
            status_code=200,
            headers={"Content-Type": "application/json"}
        )

    except Exception as e:
        logging.error(f"Subscription error: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            headers={"Content-Type": "application/json"}
        )
