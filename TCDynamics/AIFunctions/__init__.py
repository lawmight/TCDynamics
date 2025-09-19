import azure.functions as func
import json
import logging
import os
import requests
import base64
import time
from typing import Dict, Any, List

def validate_ai_request(data: Dict[str, Any]) -> tuple[bool, str]:
    """Validate AI request data"""
    if not data:
        return False, "No data provided"

    return True, ""

def call_openai_api(messages: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Call Azure OpenAI API server-side"""
    try:
        openai_endpoint = os.environ.get('AZURE_OPENAI_ENDPOINT')
        openai_key = os.environ.get('AZURE_OPENAI_KEY')
        openai_deployment = os.environ.get('AZURE_OPENAI_DEPLOYMENT', 'gpt-35-turbo')

        if not openai_endpoint or not openai_key:
            raise ValueError("Azure OpenAI credentials not configured")

        url = f"{openai_endpoint}/openai/deployments/{openai_deployment}/chat/completions?api-version=2023-12-01-preview"

        headers = {
            'Content-Type': 'application/json',
            'api-key': openai_key
        }

        payload = {
            'messages': messages,
            'max_tokens': 1000,
            'temperature': 0.7,
            'top_p': 0.95,
            'frequency_penalty': 0,
            'presence_penalty': 0,
            'stop': None
        }

        response = requests.post(url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()

        return response.json()

    except Exception as e:
        logging.error(f"OpenAI API call failed: {str(e)}")
        raise

def call_vision_api(image_data: str, analyze_text: bool = True) -> Dict[str, Any]:
    """Call Azure Vision API server-side"""
    try:
        vision_endpoint = os.environ.get('AZURE_VISION_ENDPOINT')
        vision_key = os.environ.get('AZURE_VISION_KEY')

        if not vision_endpoint or not vision_key:
            raise ValueError("Azure Vision credentials not configured")

        if image_data.startswith('data:'):
            header, b64data = image_data.split(',', 1)
            binary = base64.b64decode(b64data)

            url = f"{vision_endpoint}/vision/v3.2/read/analyze"
            headers = {
                'Content-Type': 'application/octet-stream',
                'Ocp-Apim-Subscription-Key': vision_key
            }

            submit = requests.post(url, headers=headers, data=binary, timeout=30)
            submit.raise_for_status()
            operation_location = submit.headers.get('Operation-Location') or submit.headers.get('operation-location')
            if not operation_location:
                raise RuntimeError("No operation-location returned by Vision Read API")

            for _ in range(12):
                time.sleep(1.25)
                poll = requests.get(operation_location, headers={'Ocp-Apim-Subscription-Key': vision_key}, timeout=30)
                poll.raise_for_status()
                result = poll.json()
                if result.get('status') in ('succeeded', 'failed'):
                    return result
            raise TimeoutError("Timed out waiting for Vision Read API result")

        headers = {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': vision_key
        }

        if analyze_text:
            url = f"{vision_endpoint}/vision/v3.2/ocr?language=fr&detectOrientation=true"
        else:
            url = f"{vision_endpoint}/vision/v3.2/analyze?visualFeatures=Description&language=fr"

        payload = {'url': image_data} if image_data.startswith('http') else {}
        resp = requests.post(url, headers=headers, json=payload, timeout=30)
        resp.raise_for_status()
        return resp.json()

    except Exception as e:
        logging.error(f"Vision API call failed: {str(e)}")
        raise

def ai_chat(req: func.HttpRequest) -> func.HttpResponse:
    """Handle AI chat requests"""
    logging.info('AI chat function processed a request.')

    try:
        req_body = req.get_json()

        # Validate request
        is_valid, error_message = validate_ai_request(req_body)
        if not is_valid:
            return func.HttpResponse(
                json.dumps({"success": False, "message": error_message}),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )

        # Extract messages from request
        messages = req_body.get('messages', [])
        if not messages:
            return func.HttpResponse(
                json.dumps({"success": False, "message": "No messages provided"}),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )

        # Call OpenAI API
        openai_response = call_openai_api(messages)

        # Extract the assistant's response
        if 'choices' in openai_response and len(openai_response['choices']) > 0:
            assistant_message = openai_response['choices'][0]['message']['content']

            return func.HttpResponse(
                json.dumps({
                    "success": True,
                    "message": assistant_message,
                    "usage": openai_response.get('usage', {})
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
            json.dumps({
                "success": False,
                "message": "AI chat service temporarily unavailable"
            }),
            status_code=500,
            headers={"Content-Type": "application/json"}
        )

def ai_vision(req: func.HttpRequest) -> func.HttpResponse:
    """Handle document/image processing requests"""
    logging.info('AI vision function processed a request.')

    try:
        req_body = req.get_json()

        # Validate request
        is_valid, error_message = validate_ai_request(req_body)
        if not is_valid:
            return func.HttpResponse(
                json.dumps({"success": False, "message": error_message}),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )

        # Extract image data from request
        image_data = req_body.get('imageData') or req_body.get('imageUrl')
        analyze_text = req_body.get('analyzeText', True)

        if not image_data:
            return func.HttpResponse(
                json.dumps({"success": False, "message": "No image data provided"}),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )

        # Call Vision API
        vision_response = call_vision_api(image_data, analyze_text)

        return func.HttpResponse(
            json.dumps({
                "success": True,
                "data": vision_response
            }),
            status_code=200,
            headers={"Content-Type": "application/json"}
        )

    except Exception as e:
        logging.error(f"AI vision error: {str(e)}")
        return func.HttpResponse(
            json.dumps({
                "success": False,
                "message": "Document processing service temporarily unavailable"
            }),
            status_code=500,
            headers={"Content-Type": "application/json"}
        )
