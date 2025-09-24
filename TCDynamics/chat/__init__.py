import azure.functions as func
import logging
import json
import os
import requests

def main(req: func.HttpRequest) -> func.HttpResponse:
    """Handle AI chat requests"""
    logging.info('AI chat function processed a request.')

    try:
        openai_endpoint = os.environ.get('AZURE_OPENAI_ENDPOINT')
        openai_key = os.environ.get('AZURE_OPENAI_KEY')
        deployment = os.environ.get('AZURE_OPENAI_DEPLOYMENT', 'gpt-35-turbo')

        if not openai_endpoint or not openai_key:
            return func.HttpResponse(
                json.dumps({"success": False, "message": "AI service not configured"}),
                status_code=500,
                headers={"Content-Type": "application/json"}
            )

        req_body = req.get_json()
        messages = req_body.get('messages', [])

        if not messages:
            return func.HttpResponse(
                json.dumps({"success": False, "message": "No messages provided"}),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )

        # Call OpenAI API
        url = f"{openai_endpoint}/openai/deployments/{deployment}/chat/completions?api-version=2023-12-01-preview"
        headers = {'Content-Type': 'application/json', 'api-key': openai_key}
        payload = {'messages': messages, 'max_tokens': 1000, 'temperature': 0.7}

        response = requests.post(url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        result = response.json()

        if 'choices' in result and len(result['choices']) > 0:
            assistant_message = result['choices'][0]['message']['content']
            return func.HttpResponse(
                json.dumps({
                    "success": True,
                    "message": assistant_message,
                    "usage": result.get('usage', {})
                }),
                status_code=200,
                headers={"Content-Type": "application/json"}
            )
        else:
            return func.HttpResponse(
                json.dumps({"success": False, "message": "No response from AI"}),
                status_code=500,
                headers={"Content-Type": "application/json"}
            )

    except Exception as e:
        logging.error(f"AI chat error: {str(e)}")
        return func.HttpResponse(
            json.dumps({"success": False, "message": "AI service temporarily unavailable"}),
            status_code=500,
            headers={"Content-Type": "application/json"}
        )
