"""
Learning Analytics Dashboard for TCDynamics
Comprehensive analytics and insights for learning optimization
"""

import json
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
import statistics

@dataclass
class LearningMetrics:
    """Learning performance metrics"""
    user_id: str
    total_time_spent: float
    lessons_completed: int
    exercises_completed: int
    projects_completed: int
    average_score: float
    completion_rate: float
    streak_days: int
    last_activity: str
    learning_velocity: float
    difficulty_progression: List[float]

@dataclass
class AnalyticsInsight:
    """Analytics insight"""
    type: str
    title: str
    description: str
    impact: str
    recommendation: str
    confidence: float
    data: Dict

class LearningAnalyticsEngine:
    """Learning analytics engine"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.metrics_history = {}
        self.insights_cache = {}
    
    def calculate_learning_metrics(self, user_id: str, activity_data: List[Dict]) -> LearningMetrics:
        """Calculate comprehensive learning metrics"""
        total_time = sum(activity.get("time_spent", 0) for activity in activity_data)
        lessons = sum(1 for activity in activity_data if activity.get("type") == "lesson")
        exercises = sum(1 for activity in activity_data if activity.get("type") == "exercise")
        projects = sum(1 for activity in activity_data if activity.get("type") == "project")
        
        scores = [activity.get("score", 0) for activity in activity_data if activity.get("score")]
        avg_score = statistics.mean(scores) if scores else 0
        
        completion_rate = self._calculate_completion_rate(activity_data)
        streak = self._calculate_streak(activity_data)
        velocity = self._calculate_learning_velocity(activity_data)
        progression = self._calculate_difficulty_progression(activity_data)
        
        return LearningMetrics(
            user_id=user_id,
            total_time_spent=total_time,
            lessons_completed=lessons,
            exercises_completed=exercises,
            projects_completed=projects,
            average_score=avg_score,
            completion_rate=completion_rate,
            streak_days=streak,
            last_activity=activity_data[-1].get("timestamp", "") if activity_data else "",
            learning_velocity=velocity,
            difficulty_progression=progression
        )
    
    def generate_insights(self, metrics: LearningMetrics) -> List[AnalyticsInsight]:
        """Generate actionable insights from metrics"""
        insights = []
        
        # Performance insights
        if metrics.average_score > 0.8:
            insights.append(AnalyticsInsight(
                type="performance",
                title="Excellent Performance!",
                description=f"Your average score is {metrics.average_score:.1%}",
                impact="high",
                recommendation="Consider tackling more advanced challenges",
                confidence=0.9,
                data={"score": metrics.average_score}
            ))
        
        # Time management insights
        if metrics.total_time_spent > 0:
            avg_time_per_lesson = metrics.total_time_spent / max(metrics.lessons_completed, 1)
            if avg_time_per_lesson > 60:
                insights.append(AnalyticsInsight(
                    type="time_management",
                    title="Deep Learning Approach",
                    description=f"You spend {avg_time_per_lesson:.1f} minutes per lesson on average",
                    impact="medium",
                    recommendation="This thorough approach is great for retention",
                    confidence=0.8,
                    data={"avg_time": avg_time_per_lesson}
                ))
        
        # Streak insights
        if metrics.streak_days > 7:
            insights.append(AnalyticsInsight(
                type="consistency",
                title="Impressive Streak!",
                description=f"You've maintained a {metrics.streak_days}-day learning streak",
                impact="high",
                recommendation="Keep up the consistent learning habit",
                confidence=0.95,
                data={"streak": metrics.streak_days}
            ))
        
        # Learning velocity insights
        if metrics.learning_velocity > 1.5:
            insights.append(AnalyticsInsight(
                type="progress",
                title="Fast Learner",
                description="You're progressing faster than average",
                impact="medium",
                recommendation="Consider exploring additional topics",
                confidence=0.7,
                data={"velocity": metrics.learning_velocity}
            ))
        
        return insights
    
    def _calculate_completion_rate(self, activity_data: List[Dict]) -> float:
        """Calculate completion rate"""
        if not activity_data:
            return 0.0
        
        completed = sum(1 for activity in activity_data if activity.get("completed", False))
        return completed / len(activity_data)
    
    def _calculate_streak(self, activity_data: List[Dict]) -> int:
        """Calculate current streak"""
        if not activity_data:
            return 0
        
        # Sort by date and calculate consecutive days
        sorted_activities = sorted(activity_data, key=lambda x: x.get("timestamp", ""), reverse=True)
        streak = 0
        current_date = None
        
        for activity in sorted_activities:
            activity_date = datetime.fromisoformat(activity.get("timestamp", "")).date()
            if current_date is None:
                current_date = activity_date
                streak = 1
            elif activity_date == current_date - timedelta(days=1):
                current_date = activity_date
                streak += 1
            else:
                break
        
        return streak
    
    def _calculate_learning_velocity(self, activity_data: List[Dict]) -> float:
        """Calculate learning velocity (lessons per day)"""
        if not activity_data:
            return 0.0
        
        # Calculate days between first and last activity
        dates = [datetime.fromisoformat(activity.get("timestamp", "")) for activity in activity_data]
        if len(dates) < 2:
            return 1.0
        
        time_span = (max(dates) - min(dates)).days + 1
        total_lessons = len(activity_data)
        
        return total_lessons / time_span if time_span > 0 else 0.0
    
    def _calculate_difficulty_progression(self, activity_data: List[Dict]) -> List[float]:
        """Calculate difficulty progression over time"""
        difficulty_map = {"beginner": 1.0, "intermediate": 2.0, "advanced": 3.0}
        progression = []
        
        for activity in activity_data:
            difficulty = activity.get("difficulty", "beginner")
            progression.append(difficulty_map.get(difficulty, 1.0))
        
        return progression

# Global learning analytics engine
learning_analytics_engine = LearningAnalyticsEngine()
