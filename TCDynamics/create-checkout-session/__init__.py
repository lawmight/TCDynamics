import azure.functions as func
import json
import os
import stripe
from typing import Dict, Any

def main(req: func.HttpRequest) -> func.HttpResponse:
    """Handle Stripe checkout session creation"""

    try:
        # Initialize Stripe with secret key
        stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')
        if not stripe.api_key:
            return func.HttpResponse(
                json.dumps({"error": "Stripe configuration missing"}),
                status_code=500,
                mimetype="application/json"
            )

        # Parse request body
        try:
            req_body = req.get_json()
        except ValueError:
            return func.HttpResponse(
                json.dumps({"error": "Invalid JSON body"}),
                status_code=400,
                mimetype="application/json"
            )

        price_id = req_body.get('priceId')
        plan_id = req_body.get('planId')
        success_url = req_body.get('successUrl')
        cancel_url = req_body.get('cancelUrl')

        if not all([price_id, plan_id, success_url, cancel_url]):
            return func.HttpResponse(
                json.dumps({"error": "Missing required parameters"}),
                status_code=400,
                mimetype="application/json"
            )

        # Create checkout session
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            mode='subscription',  # or 'payment' for one-time payments
            success_url=success_url,
            cancel_url=cancel_url,
            allow_promotion_codes=True,
            billing_address_collection='required',
            customer_email=None,  # Will be collected during checkout
            metadata={
                'plan_id': plan_id,
            },
            automatic_tax={
                'enabled': True,
            },
            # Trial period
            subscription_data={
                'trial_period_days': 14,
            }
        )

        return func.HttpResponse(
            json.dumps({
                "clientSecret": session.id,  # For embedded checkout, return session ID
                "sessionId": session.id,
                "url": session.url  # For redirect-based checkout
            }),
            status_code=200,
            mimetype="application/json"
        )

    except stripe.error.StripeError as e:
        return func.HttpResponse(
            json.dumps({"error": f"Stripe error: {str(e)}"}),
            status_code=400,
            mimetype="application/json"
        )
    except Exception as e:
        return func.HttpResponse(
            json.dumps({"error": f"Internal server error: {str(e)}"}),
            status_code=500,
            mimetype="application/json"
        )
