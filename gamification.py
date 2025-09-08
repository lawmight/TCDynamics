"""
Gamification System for TCDynamics
Handles achievements, points, levels, and user progress tracking
"""

import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from enum import Enum

class AchievementType(Enum):
    DAY_COMPLETION = "day_completion"
    STREAK = "streak"
    POINTS = "points"
    TIME_SPENT = "time_spent"
    SOCIAL = "social"

@dataclass
class Achievement:
    """Achievement definition"""
    id: str
    name: str
    description: str
    icon: str
    points: int
    type: AchievementType
    condition: Dict
    unlocked: bool = False
    unlocked_at: Optional[str] = None

@dataclass
class UserProgress:
    """User progress tracking"""
    user_id: str
    completed_days: List[int]
    total_points: int
    level: int
    streak: int
    last_activity: str
    achievements: List[str]
    time_spent: int = 0  # in minutes
    created_at: str = ""
    updated_at: str = ""

class GamificationEngine:
    """Main gamification engine"""
    
    def __init__(self):
        self.achievements = self._load_achievements()
        self.logger = logging.getLogger(__name__)
    
    def _load_achievements(self) -> List[Achievement]:
        """Load predefined achievements"""
        return [
            Achievement(
                id="first_day",
                name="Getting Started",
                description="Completed your first day of Python learning!",
                icon="🎉",
                points=10,
                type=AchievementType.DAY_COMPLETION,
                condition={"days_completed": 1}
            ),
            Achievement(
                id="week_warrior",
                name="Week Warrior",
                description="Completed 7 days of Python learning!",
                icon="🏆",
                points=50,
                type=AchievementType.DAY_COMPLETION,
                condition={"days_completed": 7}
            ),
            Achievement(
                id="halfway_hero",
                name="Halfway Hero",
                description="Completed 15 days - you're halfway there!",
                icon="⭐",
                points=100,
                type=AchievementType.DAY_COMPLETION,
                condition={"days_completed": 15}
            ),
            Achievement(
                id="python_master",
                name="Python Master",
                description="Completed all 30 days of Python learning!",
                icon="👑",
                points=500,
                type=AchievementType.DAY_COMPLETION,
                condition={"days_completed": 30}
            ),
            Achievement(
                id="streak_3",
                name="Consistent Learner",
                description="Maintained a 3-day streak!",
                icon="🔥",
                points=25,
                type=AchievementType.STREAK,
                condition={"streak_days": 3}
            ),
            Achievement(
                id="streak_7",
                name="Dedicated Student",
                description="Maintained a 7-day streak!",
                icon="💪",
                points=75,
                type=AchievementType.STREAK,
                condition={"streak_days": 7}
            ),
            Achievement(
                id="streak_14",
                name="Learning Champion",
                description="Maintained a 14-day streak!",
                icon="🏅",
                points=150,
                type=AchievementType.STREAK,
                condition={"streak_days": 14}
            ),
            Achievement(
                id="points_100",
                name="Point Collector",
                description="Earned 100 points!",
                icon="💎",
                points=0,  # This achievement gives no additional points
                type=AchievementType.POINTS,
                condition={"total_points": 100}
            ),
            Achievement(
                id="points_500",
                name="Point Master",
                description="Earned 500 points!",
                icon="💍",
                points=0,
                type=AchievementType.POINTS,
                condition={"total_points": 500}
            ),
            Achievement(
                id="time_60",
                name="Time Invested",
                description="Spent 60 minutes learning Python!",
                icon="⏰",
                points=20,
                type=AchievementType.TIME_SPENT,
                condition={"minutes_spent": 60}
            ),
            Achievement(
                id="time_300",
                name="Learning Enthusiast",
                description="Spent 5 hours learning Python!",
                icon="📚",
                points=50,
                type=AchievementType.TIME_SPENT,
                condition={"minutes_spent": 300}
            )
        ]
    
    def check_achievements(self, user_progress: UserProgress) -> List[Achievement]:
        """Check which achievements the user has earned"""
        new_achievements = []
        
        for achievement in self.achievements:
            if achievement.unlocked:
                continue
                
            if self._evaluate_condition(achievement, user_progress):
                achievement.unlocked = True
                achievement.unlocked_at = datetime.now().isoformat()
                new_achievements.append(achievement)
                
                # Award points
                user_progress.total_points += achievement.points
                
                self.logger.info(f"User {user_progress.user_id} unlocked achievement: {achievement.name}")
        
        return new_achievements
    
    def _evaluate_condition(self, achievement: Achievement, user_progress: UserProgress) -> bool:
        """Evaluate if achievement condition is met"""
        condition = achievement.condition
        
        if achievement.type == AchievementType.DAY_COMPLETION:
            required_days = condition.get("days_completed", 0)
            return len(user_progress.completed_days) >= required_days
            
        elif achievement.type == AchievementType.STREAK:
            required_streak = condition.get("streak_days", 0)
            return user_progress.streak >= required_streak
            
        elif achievement.type == AchievementType.POINTS:
            required_points = condition.get("total_points", 0)
            return user_progress.total_points >= required_points
            
        elif achievement.type == AchievementType.TIME_SPENT:
            required_minutes = condition.get("minutes_spent", 0)
            return user_progress.time_spent >= required_minutes
            
        return False
    
    def calculate_level(self, total_points: int) -> int:
        """Calculate user level based on points"""
        # Level formula: every 100 points = 1 level, starting from level 1
        return max(1, (total_points // 100) + 1)
    
    def calculate_streak(self, completed_days: List[int]) -> int:
        """Calculate current streak based on completed days"""
        if not completed_days:
            return 0
        
        # Sort days in descending order
        sorted_days = sorted(completed_days, reverse=True)
        current_streak = 0
        today = datetime.now().date()
        
        # Check consecutive days starting from today
        for i, day in enumerate(sorted_days):
            expected_date = today - timedelta(days=i)
            # For simplicity, we'll assume day numbers correspond to dates
            # In a real implementation, you'd track actual dates
            if day == len(sorted_days) - i:
                current_streak += 1
            else:
                break
        
        return current_streak
    
    def update_progress(self, user_progress: UserProgress, day_number: int, time_spent: int = 0) -> Dict:
        """Update user progress and check for new achievements"""
        # Add day if not already completed
        if day_number not in user_progress.completed_days:
            user_progress.completed_days.append(day_number)
            user_progress.completed_days.sort()
        
        # Update time spent
        user_progress.time_spent += time_spent
        
        # Recalculate streak and level
        user_progress.streak = self.calculate_streak(user_progress.completed_days)
        user_progress.level = self.calculate_level(user_progress.total_points)
        user_progress.updated_at = datetime.now().isoformat()
        
        # Check for new achievements
        new_achievements = self.check_achievements(user_progress)
        
        # Add new achievement IDs to user progress
        for achievement in new_achievements:
            if achievement.id not in user_progress.achievements:
                user_progress.achievements.append(achievement.id)
        
        return {
            "new_achievements": [asdict(achievement) for achievement in new_achievements],
            "updated_progress": asdict(user_progress),
            "level_up": len(new_achievements) > 0
        }
    
    def get_leaderboard(self, limit: int = 10) -> List[Dict]:
        """Get top users by points (simulated)"""
        # In a real implementation, this would query the database
        # For now, we'll return simulated data
        return [
            {"rank": 1, "user_id": "alice", "name": "Alice", "points": 1250, "level": 13},
            {"rank": 2, "user_id": "bob", "name": "Bob", "points": 980, "level": 10},
            {"rank": 3, "user_id": "charlie", "name": "Charlie", "points": 750, "level": 8},
            {"rank": 4, "user_id": "diana", "name": "Diana", "points": 650, "level": 7},
            {"rank": 5, "user_id": "eve", "name": "Eve", "points": 520, "level": 6},
        ][:limit]
    
    def get_user_stats(self, user_progress: UserProgress) -> Dict:
        """Get comprehensive user statistics"""
        return {
            "user_id": user_progress.user_id,
            "level": user_progress.level,
            "total_points": user_progress.total_points,
            "completed_days": len(user_progress.completed_days),
            "streak": user_progress.streak,
            "time_spent": user_progress.time_spent,
            "achievements_count": len(user_progress.achievements),
            "progress_percentage": (len(user_progress.completed_days) / 30) * 100,
            "next_level_points": (user_progress.level * 100) - user_progress.total_points,
            "unlocked_achievements": [
                achievement for achievement in self.achievements 
                if achievement.id in user_progress.achievements
            ]
        }

# Global gamification engine instance
gamification_engine = GamificationEngine()
