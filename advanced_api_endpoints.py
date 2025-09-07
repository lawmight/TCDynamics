"""
Advanced API Endpoints for TCDynamics
New cutting-edge features and endpoints
"""

import json
import logging
from azure import functions as func
from ai_personalization import ai_personalization_engine
from enhanced_security import enhanced_security_executor
from push_notifications import push_notification_service
from learning_analytics import learning_analytics_engine
from dataclasses import asdict

def ai_recommendations(req: func.HttpRequest) -> func.HttpResponse:
    """Get AI-powered learning recommendations"""
    if req.method == "OPTIONS":
        return func.HttpResponse("", status_code=200, headers={"Access-Control-Allow-Origin": "*"})
    
    try:
        if req.method == "GET":
            user_id = req.params.get('user_id', 'anonymous')
            limit = int(req.params.get('limit', 5))
            
            recommendations = ai_personalization_engine.generate_recommendations(user_id, limit)
            
            return func.HttpResponse(
                json.dumps({
                    "success": True,
                    "recommendations": [asdict(rec) for rec in recommendations]
                }),
                status_code=200,
                mimetype="application/json",
                headers={"Access-Control-Allow-Origin": "*"}
            )
        
        elif req.method == "POST":
            req_body = req.get_json()
            user_id = req_body.get('user_id', 'anonymous')
            question = req_body.get('question', '')
            context = req_body.get('context', '')
            
            response = ai_personalization_engine.get_ai_tutor_response(user_id, question, context)
            
            return func.HttpResponse(
                json.dumps({
                    "success": True,
                    "response": asdict(response)
                }),
                status_code=200,
                mimetype="application/json",
                headers={"Access-Control-Allow-Origin": "*"}
            )
    
    except Exception as e:
        logging.error(f"AI recommendations error: {str(e)}")
        return func.HttpResponse(
            json.dumps({"success": False, "error": str(e)}),
            status_code=500,
            mimetype="application/json",
            headers={"Access-Control-Allow-Origin": "*"}
        )

def secure_execute_code(req: func.HttpRequest) -> func.HttpResponse:
    """Execute code with enhanced security"""
    if req.method == "OPTIONS":
        return func.HttpResponse("", status_code=200, headers={"Access-Control-Allow-Origin": "*"})
    
    try:
        req_body = req.get_json()
        code = req_body.get('code', '').strip()
        inputs = req_body.get('inputs', '').strip()
        user_id = req_body.get('user_id', 'anonymous')
        
        if not code:
            return func.HttpResponse(
                json.dumps({
                    "success": False,
                    "error": "No code provided"
                }),
                status_code=400,
                mimetype="application/json",
                headers={"Access-Control-Allow-Origin": "*"}
            )
        
        result = enhanced_security_executor.execute_code_securely(code, inputs, user_id)
        
        return func.HttpResponse(
            json.dumps(result),
            status_code=200,
            mimetype="application/json",
            headers={"Access-Control-Allow-Origin": "*"}
        )
        
    except Exception as e:
        logging.error(f"Secure execution error: {str(e)}")
        return func.HttpResponse(
            json.dumps({
                "success": False,
                "error": f"Execution failed: {str(e)}"
            }),
            status_code=500,
            mimetype="application/json",
            headers={"Access-Control-Allow-Origin": "*"}
        )

def learning_analytics(req: func.HttpRequest) -> func.HttpResponse:
    """Get learning analytics and insights"""
    if req.method == "OPTIONS":
        return func.HttpResponse("", status_code=200, headers={"Access-Control-Allow-Origin": "*"})
    
    try:
        if req.method == "GET":
            user_id = req.params.get('user_id', 'anonymous')
            
            # Mock activity data for demonstration
            activity_data = [
                {"type": "lesson", "time_spent": 30, "score": 0.9, "completed": True, "timestamp": "2025-01-01T10:00:00", "difficulty": "beginner"},
                {"type": "exercise", "time_spent": 15, "score": 0.8, "completed": True, "timestamp": "2025-01-02T10:00:00", "difficulty": "beginner"},
                {"type": "lesson", "time_spent": 45, "score": 0.95, "completed": True, "timestamp": "2025-01-03T10:00:00", "difficulty": "intermediate"}
            ]
            
            metrics = learning_analytics_engine.calculate_learning_metrics(user_id, activity_data)
            insights = learning_analytics_engine.generate_insights(metrics)
            
            return func.HttpResponse(
                json.dumps({
                    "success": True,
                    "metrics": asdict(metrics),
                    "insights": [asdict(insight) for insight in insights]
                }),
                status_code=200,
                mimetype="application/json",
                headers={"Access-Control-Allow-Origin": "*"}
            )
        
        elif req.method == "POST":
            req_body = req.get_json()
            user_id = req_body.get('user_id', 'anonymous')
            activity_data = req_body.get('activity_data', [])
            
            metrics = learning_analytics_engine.calculate_learning_metrics(user_id, activity_data)
            insights = learning_analytics_engine.generate_insights(metrics)
            
            return func.HttpResponse(
                json.dumps({
                    "success": True,
                    "metrics": asdict(metrics),
                    "insights": [asdict(insight) for insight in insights]
                }),
                status_code=200,
                mimetype="application/json",
                headers={"Access-Control-Allow-Origin": "*"}
            )
    
    except Exception as e:
        logging.error(f"Analytics error: {str(e)}")
        return func.HttpResponse(
            json.dumps({"success": False, "error": str(e)}),
            status_code=500,
            mimetype="application/json",
            headers={"Access-Control-Allow-Origin": "*"}
        )

def handle_notifications(req: func.HttpRequest) -> func.HttpResponse:
    """Handle push notifications"""
    if req.method == "OPTIONS":
        return func.HttpResponse("", status_code=200, headers={"Access-Control-Allow-Origin": "*"})
    
    try:
        req_body = req.get_json()
        user_id = req_body.get('user_id', 'anonymous')
        notification_type = req_body.get('type', 'daily_reminder')
        custom_data = req_body.get('data', {})
        
        if notification_type == "achievement":
            achievement = custom_data.get('achievement', {})
            push_notification_service.send_achievement_notification(user_id, achievement)
        elif notification_type == "streak":
            streak_days = custom_data.get('streak_days', 0)
            push_notification_service.send_streak_reminder(user_id, streak_days)
        else:
            push_notification_service.schedule_daily_reminder(user_id)
        
        return func.HttpResponse(
            json.dumps({
                "success": True,
                "message": "Notification scheduled successfully"
            }),
            status_code=200,
            mimetype="application/json",
            headers={"Access-Control-Allow-Origin": "*"}
        )
        
    except Exception as e:
        logging.error(f"Notification error: {str(e)}")
        return func.HttpResponse(
            json.dumps({"success": False, "error": str(e)}),
            status_code=500,
            mimetype="application/json",
            headers={"Access-Control-Allow-Origin": "*"}
        )
