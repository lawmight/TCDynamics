import azure.functions as func
import logging
import json
import os
import requests
import base64

def main(req: func.HttpRequest) -> func.HttpResponse:
    """Handle document/image processing requests"""
    logging.info('AI vision function processed a request.')

    try:
        vision_endpoint = os.environ.get('AZURE_VISION_ENDPOINT')
        vision_key = os.environ.get('AZURE_VISION_KEY')

        if not vision_endpoint or not vision_key:
            return func.HttpResponse(
                json.dumps({"success": False, "message": "Vision service not configured"}),
                status_code=500,
                headers={"Content-Type": "application/json"}
            )

        req_body = req.get_json()
        image_data = req_body.get('imageData') or req_body.get('imageUrl')

        if not image_data:
            return func.HttpResponse(
                json.dumps({"success": False, "message": "No image data provided"}),
                status_code=400,
                headers={"Content-Type": "application/json"}
            )

        # Basic OCR call
        url = f"{vision_endpoint}/vision/v3.2/ocr?language=fr&detectOrientation=true"
        headers = {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': vision_key
        }

        if image_data.startswith('data:'):
            # Handle base64 data
            header, b64data = image_data.split(',', 1)
            binary = base64.b64decode(b64data)

            url = f"{vision_endpoint}/vision/v3.2/read/analyze"
            headers['Content-Type'] = 'application/octet-stream'

            submit = requests.post(url, headers=headers, data=binary, timeout=30)
            submit.raise_for_status()
            return func.HttpResponse(
                json.dumps({"success": True, "data": "Processing started"}),
                status_code=200,
                headers={"Content-Type": "application/json"}
            )
        else:
            # Handle URL
            payload = {'url': image_data}
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            result = response.json()

            return func.HttpResponse(
                json.dumps({"success": True, "data": result}),
                status_code=200,
                headers={"Content-Type": "application/json"}
            )

    except Exception as e:
        logging.error(f"AI vision error: {str(e)}")
        return func.HttpResponse(
            json.dumps({"success": False, "message": "Document processing service temporarily unavailable"}),
            status_code=500,
            headers={"Content-Type": "application/json"}
        )
