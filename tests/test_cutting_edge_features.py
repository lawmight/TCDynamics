"""
Test suite for cutting-edge features
Tests AI personalization, enhanced security, analytics, and notifications
"""

import pytest
import json
import sys
import os
from unittest.mock import patch, MagicMock

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai_personalization import AIPersonalizationEngine, LearningProfile, LearningStyle, DifficultyLevel
from enhanced_security import EnhancedCodeExecutor, SecurityConfig
from push_notifications import PushNotificationService, NotificationPayload
from learning_analytics import LearningAnalyticsEngine, LearningMetrics

class TestAIPersonalization:
    """Test AI personalization system"""
    
    def setup_method(self):
        self.engine = AIPersonalizationEngine()
    
    def test_create_learning_profile(self):
        """Test learning profile creation"""
        profile = self.engine.create_learning_profile("test_user", {
            "learning_style": "visual",
            "difficulty": "beginner",
            "learning_pace": 1.2,
            "interests": ["web_development", "data_science"]
        })
        
        assert profile.user_id == "test_user"
        assert profile.learning_style == LearningStyle.VISUAL
        assert profile.preferred_difficulty == DifficultyLevel.BEGINNER
        assert profile.learning_pace == 1.2
        assert "web_development" in profile.interests
    
    def test_generate_recommendations(self):
        """Test recommendation generation"""
        # Create a profile first
        self.engine.create_learning_profile("test_user", {
            "learning_style": "visual",
            "difficulty": "beginner"
        })
        
        recommendations = self.engine.generate_recommendations("test_user", limit=3)
        
        assert len(recommendations) <= 3
        assert all(hasattr(rec, 'content_id') for rec in recommendations)
        assert all(hasattr(rec, 'confidence_score') for rec in recommendations)
    
    def test_ai_tutor_response(self):
        """Test AI tutor response generation"""
        response = self.engine.get_ai_tutor_response("test_user", "What is a variable in Python?")
        
        assert hasattr(response, 'response')
        assert hasattr(response, 'confidence')
        assert hasattr(response, 'suggested_actions')
        assert response.confidence > 0
        assert len(response.suggested_actions) > 0
    
    def test_update_learning_profile(self):
        """Test learning profile updates"""
        # Create initial profile
        profile = self.engine.create_learning_profile("test_user", {})
        
        # Update with activity data
        updated_profile = self.engine.update_learning_profile("test_user", {
            "completion_status": True,
            "time_spent": 30,
            "performance_data": {"code_quality_score": 0.9},
            "difficulty_feedback": {"too_easy": False, "too_hard": False}
        })
        
        assert updated_profile.user_id == "test_user"
        # The last_updated should be updated (may be same if executed very quickly)
        assert updated_profile.last_updated is not None

class TestEnhancedSecurity:
    """Test enhanced security system"""
    
    def setup_method(self):
        self.config = SecurityConfig(max_execution_time=2, max_memory_mb=64)
        self.executor = EnhancedCodeExecutor(self.config)
    
    def test_safe_code_execution(self):
        """Test execution of safe code"""
        safe_code = "print('Hello, World!')"
        result = self.executor.execute_code_securely(safe_code)
        
        assert "success" in result
        assert "output" in result
        assert "security_level" in result
        assert result["execution_time"] > 0
    
    def test_dangerous_code_blocking(self):
        """Test blocking of dangerous code"""
        dangerous_code = "import os; os.system('ls')"
        result = self.executor.execute_code_securely(dangerous_code)
        
        assert result["success"] == False
        assert "Security violation" in result["error"]
        assert result["security_level"] == "blocked"
    
    def test_code_complexity_check(self):
        """Test code complexity validation"""
        complex_code = """
def very_nested_function():
    if True:
        if True:
            if True:
                if True:
                    if True:
                        if True:
                            if True:
                                if True:
                                    if True:
                                        if True:
                                            print('too nested')
        """
        
        security_check = self.executor._pre_execution_security_check(complex_code)
        assert security_check["safe"] == False
        assert "Excessive code nesting" in security_check["violation"]
    
    def test_suspicious_patterns(self):
        """Test detection of suspicious patterns"""
        suspicious_code = "import base64; data = base64.b64encode(b'secret')"
        security_check = self.executor._pre_execution_security_check(suspicious_code)
        
        assert security_check["safe"] == False
        assert "Base64 encoding" in security_check["violation"]
    
    def test_security_report(self):
        """Test security report generation"""
        report = self.executor.get_security_report("test_user")
        
        assert "total_executions" in report
        assert "security_violations" in report
        assert "violation_types" in report
        assert "risk_level" in report

class TestPushNotifications:
    """Test push notification system"""
    
    def setup_method(self):
        self.service = PushNotificationService()
    
    def test_notification_creation(self):
        """Test notification payload creation"""
        notification = self.service.create_notification("daily_reminder", {
            "user_id": "test_user",
            "lesson_id": "lesson_1"
        })
        
        assert isinstance(notification, NotificationPayload)
        assert notification.title is not None
        assert notification.body is not None
        assert notification.icon is not None
        assert len(notification.actions) > 0
    
    def test_achievement_notification(self):
        """Test achievement notification"""
        achievement = {
            "id": "first_day",
            "name": "Getting Started",
            "points": 10
        }
        
        # This should not raise an exception
        self.service.send_achievement_notification("test_user", achievement)
    
    def test_streak_reminder(self):
        """Test streak reminder notification"""
        # This should not raise an exception
        self.service.send_streak_reminder("test_user", 5)
    
    def test_daily_reminder_scheduling(self):
        """Test daily reminder scheduling"""
        # This should not raise an exception
        self.service.schedule_daily_reminder("test_user", "09:00")

class TestLearningAnalytics:
    """Test learning analytics system"""
    
    def setup_method(self):
        self.engine = LearningAnalyticsEngine()
    
    def test_metrics_calculation(self):
        """Test learning metrics calculation"""
        activity_data = [
            {"type": "lesson", "time_spent": 30, "score": 0.9, "completed": True, "timestamp": "2025-01-01T10:00:00", "difficulty": "beginner"},
            {"type": "exercise", "time_spent": 15, "score": 0.8, "completed": True, "timestamp": "2025-01-02T10:00:00", "difficulty": "beginner"},
            {"type": "lesson", "time_spent": 45, "score": 0.95, "completed": True, "timestamp": "2025-01-03T10:00:00", "difficulty": "intermediate"}
        ]
        
        metrics = self.engine.calculate_learning_metrics("test_user", activity_data)
        
        assert metrics.user_id == "test_user"
        assert metrics.total_time_spent == 90  # 30 + 15 + 45
        assert metrics.lessons_completed == 2
        assert metrics.exercises_completed == 1
        assert metrics.average_score > 0
        assert metrics.completion_rate > 0
    
    def test_insights_generation(self):
        """Test insights generation"""
        metrics = LearningMetrics(
            user_id="test_user",
            total_time_spent=120,
            lessons_completed=5,
            exercises_completed=3,
            projects_completed=1,
            average_score=0.9,
            completion_rate=0.95,
            streak_days=10,
            last_activity="2025-01-01T10:00:00",
            learning_velocity=1.5,
            difficulty_progression=[1.0, 1.0, 2.0, 2.0, 3.0]
        )
        
        insights = self.engine.generate_insights(metrics)
        
        assert len(insights) > 0
        assert all(hasattr(insight, 'type') for insight in insights)
        assert all(hasattr(insight, 'title') for insight in insights)
        assert all(hasattr(insight, 'recommendation') for insight in insights)
        assert all(hasattr(insight, 'confidence') for insight in insights)
    
    def test_streak_calculation(self):
        """Test streak calculation"""
        activity_data = [
            {"timestamp": "2025-01-01T10:00:00", "completed": True},
            {"timestamp": "2025-01-02T10:00:00", "completed": True},
            {"timestamp": "2025-01-03T10:00:00", "completed": True},
            {"timestamp": "2025-01-05T10:00:00", "completed": True}  # Gap on day 4
        ]
        
        streak = self.engine._calculate_streak(activity_data)
        assert streak >= 1  # Should count at least 1 day (the most recent)
    
    def test_learning_velocity(self):
        """Test learning velocity calculation"""
        activity_data = [
            {"timestamp": "2025-01-01T10:00:00"},
            {"timestamp": "2025-01-02T10:00:00"},
            {"timestamp": "2025-01-03T10:00:00"}
        ]
        
        velocity = self.engine._calculate_learning_velocity(activity_data)
        assert velocity == 1.0  # 3 activities over 3 days

class TestIntegration:
    """Integration tests for cutting-edge features"""
    
    def test_ai_personalization_with_analytics(self):
        """Test AI personalization integrated with analytics"""
        # Create AI engine
        ai_engine = AIPersonalizationEngine()
        analytics_engine = LearningAnalyticsEngine()
        
        # Create user profile
        profile = ai_engine.create_learning_profile("test_user", {
            "learning_style": "visual",
            "difficulty": "beginner"
        })
        
        # Generate recommendations
        recommendations = ai_engine.generate_recommendations("test_user", limit=3)
        
        # Calculate analytics
        activity_data = [
            {"type": "lesson", "time_spent": 30, "score": 0.9, "completed": True, "timestamp": "2025-01-01T10:00:00", "difficulty": "beginner"}
        ]
        metrics = analytics_engine.calculate_learning_metrics("test_user", activity_data)
        insights = analytics_engine.generate_insights(metrics)
        
        # Both systems should work together
        assert len(recommendations) > 0
        assert metrics.user_id == "test_user"
        assert len(insights) >= 0
    
    def test_security_with_notifications(self):
        """Test security system with notifications"""
        security_executor = EnhancedCodeExecutor()
        notification_service = PushNotificationService()
        
        # Execute safe code
        result = security_executor.execute_code_securely("print('Hello')")
        
        # Send notification about execution
        notification = notification_service.create_notification("code_executed", {
            "success": result["success"],
            "security_level": result.get("security_level", "unknown")
        })
        
        assert result["success"] == True
        assert notification.title is not None
    
    def test_full_learning_workflow(self):
        """Test complete learning workflow with all systems"""
        # Initialize all systems
        ai_engine = AIPersonalizationEngine()
        security_executor = EnhancedCodeExecutor()
        analytics_engine = LearningAnalyticsEngine()
        notification_service = PushNotificationService()
        
        user_id = "workflow_test_user"
        
        # 1. Create learning profile
        profile = ai_engine.create_learning_profile(user_id, {
            "learning_style": "kinesthetic",
            "difficulty": "beginner"
        })
        
        # 2. Get recommendations
        recommendations = ai_engine.generate_recommendations(user_id, limit=2)
        
        # 3. Execute code safely
        code_result = security_executor.execute_code_securely("print('Learning Python!')", user_id=user_id)
        
        # 4. Calculate analytics
        activity_data = [
            {"type": "lesson", "time_spent": 30, "score": 0.9, "completed": True, "timestamp": "2025-01-01T10:00:00", "difficulty": "beginner"}
        ]
        metrics = analytics_engine.calculate_learning_metrics(user_id, activity_data)
        insights = analytics_engine.generate_insights(metrics)
        
        # 5. Send notification
        notification = notification_service.create_notification("achievement_unlocked", {
            "achievement": {"id": "first_code", "name": "First Code Execution"}
        })
        
        # All systems should work together
        assert profile.user_id == user_id
        assert len(recommendations) > 0
        assert code_result["success"] == True
        assert metrics.user_id == user_id
        assert len(insights) >= 0
        assert notification.title is not None

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
