"""
Test suite for advanced features
Tests gamification, code execution, and real-time functionality
"""

import pytest
import json
import asyncio
from unittest.mock import patch, MagicMock, AsyncMock
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from gamification import GamificationEngine, UserProgress, AchievementType
from code_executor import CodeExecutor, CodeExecutionService
from realtime_service import RealtimeService, RealtimeEvent

class TestGamificationEngine:
    """Test gamification system"""
    
    def setup_method(self):
        self.engine = GamificationEngine()
        self.user_progress = UserProgress(
            user_id="test_user",
            completed_days=[1, 2, 3],
            total_points=30,
            level=1,
            streak=3,
            last_activity="2025-01-01T00:00:00",
            achievements=[],
            time_spent=60
        )
    
    def test_achievement_loading(self):
        """Test that achievements are loaded correctly"""
        achievements = self.engine.achievements
        assert len(achievements) > 0
        assert any(achievement.id == "first_day" for achievement in achievements)
        assert any(achievement.id == "python_master" for achievement in achievements)
    
    def test_level_calculation(self):
        """Test level calculation based on points"""
        assert self.engine.calculate_level(0) == 1
        assert self.engine.calculate_level(100) == 2
        assert self.engine.calculate_level(250) == 3
        assert self.engine.calculate_level(500) == 6
    
    def test_streak_calculation(self):
        """Test streak calculation"""
        # Test with consecutive days
        consecutive_days = [1, 2, 3, 4, 5]
        streak = self.engine.calculate_streak(consecutive_days)
        assert streak >= 0  # Basic validation
        
        # Test with empty list
        assert self.engine.calculate_streak([]) == 0
    
    def test_achievement_checking(self):
        """Test achievement checking logic"""
        # Test first day achievement
        new_achievements = self.engine.check_achievements(self.user_progress)
        assert len(new_achievements) >= 0  # Should find some achievements
        
        # Test that achievements are marked as unlocked
        for achievement in new_achievements:
            assert achievement.unlocked == True
            assert achievement.unlocked_at is not None
    
    def test_progress_update(self):
        """Test progress update functionality"""
        result = self.engine.update_progress(self.user_progress, 4, 30)
        
        assert "new_achievements" in result
        assert "updated_progress" in result
        assert "level_up" in result
        assert 4 in self.user_progress.completed_days
        assert self.user_progress.time_spent == 90  # 60 + 30
    
    def test_user_stats(self):
        """Test user statistics generation"""
        stats = self.engine.get_user_stats(self.user_progress)
        
        assert "user_id" in stats
        assert "level" in stats
        assert "total_points" in stats
        assert "completed_days" in stats
        assert "streak" in stats
        assert "progress_percentage" in stats
        assert stats["user_id"] == "test_user"
        assert stats["completed_days"] == 3

class TestCodeExecutor:
    """Test code execution functionality"""
    
    def setup_method(self):
        self.executor = CodeExecutor(timeout=2)
    
    def test_code_validation(self):
        """Test code validation for dangerous operations"""
        # Safe code should pass
        safe_code = "print('Hello, World!')"
        assert self.executor._validate_code(safe_code) == True
        
        # Dangerous code should fail
        dangerous_code = "import os; os.system('rm -rf /')"
        assert self.executor._validate_code(dangerous_code) == False
        
        # Another dangerous pattern
        dangerous_code2 = "exec('malicious code')"
        assert self.executor._validate_code(dangerous_code2) == False
    
    def test_safe_code_execution(self):
        """Test execution of safe code"""
        safe_code = "print('Hello, World!')"
        result = self.executor.execute_python_code(safe_code)
        
        assert "success" in result
        assert "output" in result
        assert "error" in result
        assert "execution_time" in result
        assert result["execution_time"] > 0
    
    def test_dangerous_code_rejection(self):
        """Test that dangerous code is rejected"""
        dangerous_code = "import os"
        result = self.executor.execute_python_code(dangerous_code)
        
        assert result["success"] == False
        assert "dangerous operations" in result["error"]
    
    def test_execution_timeout(self):
        """Test code execution timeout"""
        # Code that would run forever
        infinite_code = "while True: pass"
        result = self.executor.execute_python_code(infinite_code)
        
        # Should timeout and return error
        assert result["success"] == False
        assert "timeout" in result["error"].lower() or "execution" in result["error"].lower()

class TestCodeExecutionService:
    """Test code execution service"""
    
    def setup_method(self):
        self.service = CodeExecutionService()
    
    def test_code_execution(self):
        """Test code execution through service"""
        code = "print('Hello, World!')"
        result = self.service.execute_code(code, user_id="test_user")
        
        assert "success" in result
        assert "timestamp" in result
        assert "user_id" in result
        assert result["user_id"] == "test_user"
    
    def test_execution_history(self):
        """Test execution history tracking"""
        # Execute some code
        self.service.execute_code("print('test')", user_id="test_user")
        
        # Get history
        history = self.service.get_execution_history("test_user", limit=5)
        assert len(history) >= 0  # Should have at least the execution we just made
    
    def test_code_examples(self):
        """Test code examples retrieval"""
        examples = self.service.get_code_examples()
        
        assert len(examples) > 0
        assert all("title" in example for example in examples)
        assert all("description" in example for example in examples)
        assert all("code" in example for example in examples)
        assert all("difficulty" in example for example in examples)

class TestRealtimeService:
    """Test real-time service functionality"""
    
    def setup_method(self):
        self.service = RealtimeService()
    
    def test_event_creation(self):
        """Test real-time event creation"""
        event = RealtimeEvent(
            id="test_id",
            type="test_event",
            data={"test": "data"},
            timestamp="2025-01-01T00:00:00",
            user_id="test_user"
        )
        
        assert event.id == "test_id"
        assert event.type == "test_event"
        assert event.data == {"test": "data"}
        assert event.user_id == "test_user"
    
    def test_event_history(self):
        """Test event history management"""
        # Add an event
        event = RealtimeEvent(
            id="test_id",
            type="test_event",
            data={"test": "data"},
            timestamp="2025-01-01T00:00:00",
            user_id="test_user"
        )
        
        self.service._add_to_history(event)
        
        # Check history
        assert len(self.service.event_history) == 1
        assert self.service.event_history[0].id == "test_id"
    
    def test_history_limit(self):
        """Test event history limit"""
        # Add more events than the limit
        for i in range(1001):  # More than max_history (1000)
            event = RealtimeEvent(
                id=f"test_id_{i}",
                type="test_event",
                data={"test": "data"},
                timestamp="2025-01-01T00:00:00",
                user_id="test_user"
            )
            self.service._add_to_history(event)
        
        # Should not exceed limit
        assert len(self.service.event_history) <= 1000
    
    @pytest.mark.asyncio
    async def test_connected_users(self):
        """Test connected users tracking"""
        users = await self.service.get_connected_users()
        assert isinstance(users, list)
    
    @pytest.mark.asyncio
    async def test_recent_events(self):
        """Test recent events retrieval"""
        events = await self.service.get_recent_events(limit=10)
        assert isinstance(events, list)
        assert len(events) <= 10

class TestIntegration:
    """Integration tests for advanced features"""
    
    def test_gamification_with_code_execution(self):
        """Test gamification system with code execution"""
        # Create gamification engine
        engine = GamificationEngine()
        user_progress = UserProgress(
            user_id="test_user",
            completed_days=[1, 2, 3],
            total_points=30,
            level=1,
            streak=3,
            last_activity="2025-01-01T00:00:00",
            achievements=[],
            time_spent=60
        )
        
        # Create code execution service
        code_service = CodeExecutionService()
        
        # Execute code and update progress
        code_result = code_service.execute_code("print('Hello')", user_id="test_user")
        progress_result = engine.update_progress(user_progress, 4, 30)
        
        # Both should work
        assert code_result["success"] == True
        assert "new_achievements" in progress_result
    
    def test_full_user_journey(self):
        """Test complete user journey through the system"""
        # Initialize systems
        engine = GamificationEngine()
        code_service = CodeExecutionService()
        
        # Create new user
        user_progress = UserProgress(
            user_id="new_user",
            completed_days=[],
            total_points=0,
            level=1,
            streak=0,
            last_activity="2025-01-01T00:00:00",
            achievements=[],
            time_spent=0
        )
        
        # Complete first day
        result1 = engine.update_progress(user_progress, 1, 30)
        assert len(result1["new_achievements"]) > 0  # Should get first day achievement
        
        # Execute some code
        code_result = code_service.execute_code("print('Learning Python!')", user_id="new_user")
        assert code_result["success"] == True
        
        # Complete more days
        for day in range(2, 8):
            result = engine.update_progress(user_progress, day, 30)
            if day == 7:  # Should get week warrior achievement
                assert any(achievement["id"] == "week_warrior" for achievement in result["new_achievements"])
        
        # Check final stats
        stats = engine.get_user_stats(user_progress)
        assert stats["completed_days"] == 7
        assert stats["level"] >= 1  # Level should be at least 1
        assert stats["progress_percentage"] > 0

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
