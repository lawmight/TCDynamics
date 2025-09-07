"""
AI-Powered Personalization System for TCDynamics
Implements adaptive learning paths, personalized recommendations, and AI tutoring
"""

import json
import logging
import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum
import hashlib

class LearningStyle(Enum):
    VISUAL = "visual"
    AUDITORY = "auditory"
    KINESTHETIC = "kinesthetic"
    READING_WRITING = "reading_writing"

class DifficultyLevel(Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

@dataclass
class LearningProfile:
    """User's learning profile and preferences"""
    user_id: str
    learning_style: LearningStyle
    preferred_difficulty: DifficultyLevel
    learning_pace: float  # 0.5 (slow) to 2.0 (fast)
    interests: List[str]
    strengths: List[str]
    weaknesses: List[str]
    completion_rate: float
    average_time_per_lesson: float
    last_updated: str

@dataclass
class LearningRecommendation:
    """Personalized learning recommendation"""
    content_id: str
    content_type: str  # "lesson", "exercise", "project", "challenge"
    title: str
    description: str
    difficulty: DifficultyLevel
    estimated_time: int  # minutes
    confidence_score: float  # 0.0 to 1.0
    reasoning: str
    prerequisites: List[str]
    learning_objectives: List[str]

@dataclass
class AITutorResponse:
    """AI tutor response to user questions"""
    response: str
    confidence: float
    suggested_actions: List[str]
    related_topics: List[str]
    difficulty_adjustment: Optional[float]

class AIPersonalizationEngine:
    """AI-powered personalization engine"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.learning_profiles = {}
        self.content_database = self._load_content_database()
        self.ai_tutor_knowledge = self._load_ai_tutor_knowledge()
    
    def _load_content_database(self) -> Dict:
        """Load the content database with learning materials"""
        return {
            "lessons": [
                {
                    "id": "python_basics_1",
                    "title": "Python Variables and Data Types",
                    "difficulty": "beginner",
                    "estimated_time": 30,
                    "topics": ["variables", "data_types", "strings", "numbers"],
                    "learning_style": ["visual", "reading_writing"],
                    "prerequisites": [],
                    "learning_objectives": ["Understand Python variables", "Learn basic data types"]
                },
                {
                    "id": "python_basics_2",
                    "title": "Control Flow: If Statements",
                    "difficulty": "beginner",
                    "estimated_time": 45,
                    "topics": ["conditionals", "if_statements", "logic"],
                    "learning_style": ["visual", "kinesthetic"],
                    "prerequisites": ["python_basics_1"],
                    "learning_objectives": ["Master if statements", "Understand boolean logic"]
                },
                {
                    "id": "python_loops_1",
                    "title": "For Loops and Iteration",
                    "difficulty": "intermediate",
                    "estimated_time": 60,
                    "topics": ["loops", "iteration", "lists"],
                    "learning_style": ["visual", "kinesthetic"],
                    "prerequisites": ["python_basics_2"],
                    "learning_objectives": ["Master for loops", "Understand iteration"]
                },
                {
                    "id": "python_functions_1",
                    "title": "Functions and Parameters",
                    "difficulty": "intermediate",
                    "estimated_time": 75,
                    "topics": ["functions", "parameters", "return_values"],
                    "learning_style": ["reading_writing", "kinesthetic"],
                    "prerequisites": ["python_loops_1"],
                    "learning_objectives": ["Create functions", "Use parameters effectively"]
                },
                {
                    "id": "python_oop_1",
                    "title": "Object-Oriented Programming Basics",
                    "difficulty": "advanced",
                    "estimated_time": 90,
                    "topics": ["classes", "objects", "inheritance"],
                    "learning_style": ["visual", "reading_writing"],
                    "prerequisites": ["python_functions_1"],
                    "learning_objectives": ["Understand OOP concepts", "Create classes"]
                }
            ],
            "exercises": [
                {
                    "id": "exercise_variables_1",
                    "title": "Variable Practice",
                    "difficulty": "beginner",
                    "estimated_time": 15,
                    "topics": ["variables"],
                    "learning_style": ["kinesthetic"],
                    "prerequisites": ["python_basics_1"]
                },
                {
                    "id": "exercise_loops_1",
                    "title": "Loop Challenges",
                    "difficulty": "intermediate",
                    "estimated_time": 25,
                    "topics": ["loops"],
                    "learning_style": ["kinesthetic"],
                    "prerequisites": ["python_loops_1"]
                }
            ],
            "projects": [
                {
                    "id": "project_calculator",
                    "title": "Build a Calculator",
                    "difficulty": "intermediate",
                    "estimated_time": 120,
                    "topics": ["functions", "conditionals", "loops"],
                    "learning_style": ["kinesthetic", "visual"],
                    "prerequisites": ["python_functions_1"]
                },
                {
                    "id": "project_todo_app",
                    "title": "Todo List Application",
                    "difficulty": "advanced",
                    "estimated_time": 180,
                    "topics": ["oop", "data_structures", "file_handling"],
                    "learning_style": ["kinesthetic", "visual"],
                    "prerequisites": ["python_oop_1"]
                }
            ]
        }
    
    def _load_ai_tutor_knowledge(self) -> Dict:
        """Load AI tutor knowledge base"""
        return {
            "python_basics": {
                "keywords": ["variable", "string", "number", "data type"],
                "responses": [
                    "Variables in Python are containers for storing data values. They don't need to be declared with any particular type.",
                    "Python has several built-in data types: strings, integers, floats, booleans, and more.",
                    "You can assign values to variables using the = operator."
                ],
                "common_mistakes": [
                    "Forgetting to use quotes for strings",
                    "Using incorrect variable names",
                    "Mixing data types incorrectly"
                ]
            },
            "loops": {
                "keywords": ["loop", "for", "while", "iteration"],
                "responses": [
                    "Loops allow you to execute a block of code repeatedly.",
                    "For loops are used when you know how many times you want to iterate.",
                    "While loops continue until a condition becomes false."
                ],
                "common_mistakes": [
                    "Creating infinite loops",
                    "Off-by-one errors",
                    "Not updating loop variables"
                ]
            },
            "functions": {
                "keywords": ["function", "def", "parameter", "return"],
                "responses": [
                    "Functions are reusable blocks of code that perform specific tasks.",
                    "Use the 'def' keyword to define a function.",
                    "Functions can take parameters and return values."
                ],
                "common_mistakes": [
                    "Forgetting the colon after def",
                    "Not returning values when needed",
                    "Incorrect parameter passing"
                ]
            }
        }
    
    def create_learning_profile(self, user_id: str, initial_data: Dict) -> LearningProfile:
        """Create initial learning profile for new user"""
        profile = LearningProfile(
            user_id=user_id,
            learning_style=LearningStyle(initial_data.get("learning_style", "visual")),
            preferred_difficulty=DifficultyLevel(initial_data.get("difficulty", "beginner")),
            learning_pace=initial_data.get("learning_pace", 1.0),
            interests=initial_data.get("interests", []),
            strengths=[],
            weaknesses=[],
            completion_rate=0.0,
            average_time_per_lesson=0.0,
            last_updated=datetime.now().isoformat()
        )
        
        self.learning_profiles[user_id] = profile
        self.logger.info(f"Created learning profile for user {user_id}")
        return profile
    
    def update_learning_profile(self, user_id: str, activity_data: Dict) -> LearningProfile:
        """Update learning profile based on user activity"""
        if user_id not in self.learning_profiles:
            self.create_learning_profile(user_id, {})
        
        profile = self.learning_profiles[user_id]
        
        # Update completion rate
        if "completion_status" in activity_data:
            profile.completion_rate = self._calculate_completion_rate(user_id, activity_data)
        
        # Update average time
        if "time_spent" in activity_data:
            profile.average_time_per_lesson = self._calculate_average_time(user_id, activity_data)
        
        # Update strengths and weaknesses
        if "performance_data" in activity_data:
            profile.strengths, profile.weaknesses = self._analyze_performance(activity_data["performance_data"])
        
        # Adjust learning pace based on performance
        if "difficulty_feedback" in activity_data:
            profile.learning_pace = self._adjust_learning_pace(profile, activity_data["difficulty_feedback"])
        
        profile.last_updated = datetime.now().isoformat()
        self.logger.info(f"Updated learning profile for user {user_id}")
        return profile
    
    def generate_recommendations(self, user_id: str, limit: int = 5) -> List[LearningRecommendation]:
        """Generate personalized learning recommendations"""
        if user_id not in self.learning_profiles:
            return self._get_default_recommendations(limit)
        
        profile = self.learning_profiles[user_id]
        recommendations = []
        
        # Get all available content
        all_content = []
        for content_type, items in self.content_database.items():
            for item in items:
                item["content_type"] = content_type
                all_content.append(item)
        
        # Score and rank content
        scored_content = []
        for content in all_content:
            score = self._calculate_recommendation_score(profile, content)
            if score > 0.3:  # Only recommend content with decent score
                scored_content.append((content, score))
        
        # Sort by score and take top recommendations
        scored_content.sort(key=lambda x: x[1], reverse=True)
        
        for content, score in scored_content[:limit]:
            recommendation = LearningRecommendation(
                content_id=content["id"],
                content_type=content["content_type"],
                title=content["title"],
                description=f"Recommended based on your learning style and progress",
                difficulty=DifficultyLevel(content["difficulty"]),
                estimated_time=int(content["estimated_time"] * profile.learning_pace),
                confidence_score=score,
                reasoning=self._generate_reasoning(profile, content, score),
                prerequisites=content.get("prerequisites", []),
                learning_objectives=content.get("learning_objectives", [])
            )
            recommendations.append(recommendation)
        
        return recommendations
    
    def get_ai_tutor_response(self, user_id: str, question: str, context: str = "") -> AITutorResponse:
        """Get AI tutor response to user question"""
        if user_id not in self.learning_profiles:
            profile = self.create_learning_profile(user_id, {})
        else:
            profile = self.learning_profiles[user_id]
        
        # Analyze question to determine topic
        topic = self._identify_topic(question)
        
        # Get relevant knowledge
        knowledge = self.ai_tutor_knowledge.get(topic, {})
        
        # Generate response
        response = self._generate_tutor_response(question, knowledge, profile)
        
        # Suggest actions
        suggested_actions = self._suggest_actions(topic, profile)
        
        # Get related topics
        related_topics = self._get_related_topics(topic)
        
        # Determine if difficulty adjustment is needed
        difficulty_adjustment = self._assess_difficulty_needs(question, profile)
        
        return AITutorResponse(
            response=response,
            confidence=self._calculate_response_confidence(question, knowledge),
            suggested_actions=suggested_actions,
            related_topics=related_topics,
            difficulty_adjustment=difficulty_adjustment
        )
    
    def _calculate_recommendation_score(self, profile: LearningProfile, content: Dict) -> float:
        """Calculate recommendation score for content"""
        score = 0.0
        
        # Difficulty match
        if content["difficulty"] == profile.preferred_difficulty.value:
            score += 0.3
        elif self._is_appropriate_difficulty(content["difficulty"], profile):
            score += 0.2
        
        # Learning style match
        if profile.learning_style.value in content.get("learning_style", []):
            score += 0.25
        
        # Interest match
        content_topics = content.get("topics", [])
        interest_matches = sum(1 for topic in content_topics if topic in profile.interests)
        if interest_matches > 0:
            score += 0.2 * (interest_matches / len(content_topics))
        
        # Prerequisites check
        if self._prerequisites_met(profile, content.get("prerequisites", [])):
            score += 0.15
        else:
            score -= 0.3  # Penalize if prerequisites not met
        
        # Time estimation match
        estimated_time = content.get("estimated_time", 30)
        if estimated_time <= profile.average_time_per_lesson * 1.5:
            score += 0.1
        
        return min(1.0, max(0.0, score))
    
    def _generate_tutor_response(self, question: str, knowledge: Dict, profile: LearningProfile) -> str:
        """Generate AI tutor response"""
        responses = knowledge.get("responses", [])
        common_mistakes = knowledge.get("common_mistakes", [])
        
        # Simple response generation (in production, use a proper NLP model)
        if "variable" in question.lower():
            return "Variables in Python are containers for storing data values. You can create them like this: `name = 'Python'` or `age = 25`. They don't need to be declared with a specific type - Python figures it out automatically!"
        elif "loop" in question.lower():
            return "Loops help you repeat code. Use `for` when you know how many times to repeat, and `while` when you want to repeat until a condition is met. For example: `for i in range(5): print(i)`"
        elif "function" in question.lower():
            return "Functions are reusable blocks of code. Define them with `def`, like this: `def greet(name): return f'Hello, {name}!'`. They help organize your code and avoid repetition."
        else:
            return "That's a great question! Let me help you understand this concept. Based on your learning style, I'd recommend trying some hands-on exercises to reinforce this topic."
    
    def _suggest_actions(self, topic: str, profile: LearningProfile) -> List[str]:
        """Suggest actions based on topic and profile"""
        actions = []
        
        if topic == "python_basics":
            actions.extend([
                "Try creating some variables with different data types",
                "Practice with the interactive code playground",
                "Complete the 'Variable Practice' exercise"
            ])
        elif topic == "loops":
            actions.extend([
                "Write a loop that prints numbers 1 to 10",
                "Try the 'Loop Challenges' exercise",
                "Experiment with different loop conditions"
            ])
        elif topic == "functions":
            actions.extend([
                "Create a simple function that adds two numbers",
                "Try the 'Function Practice' exercise",
                "Write a function that takes parameters"
            ])
        
        # Add personalized suggestions based on learning style
        if profile.learning_style == LearningStyle.VISUAL:
            actions.append("Check out the visual diagrams for this topic")
        elif profile.learning_style == LearningStyle.KINESTHETIC:
            actions.append("Try the hands-on coding exercises")
        elif profile.learning_style == LearningStyle.READING_WRITING:
            actions.append("Read the detailed documentation")
        
        return actions
    
    def _get_related_topics(self, topic: str) -> List[str]:
        """Get related topics for further learning"""
        topic_relations = {
            "python_basics": ["loops", "functions", "data_structures"],
            "loops": ["functions", "data_structures", "algorithms"],
            "functions": ["oop", "modules", "error_handling"],
            "oop": ["inheritance", "polymorphism", "design_patterns"]
        }
        return topic_relations.get(topic, [])
    
    def _assess_difficulty_needs(self, question: str, profile: LearningProfile) -> Optional[float]:
        """Assess if difficulty adjustment is needed"""
        # Simple heuristic based on question complexity
        if len(question.split()) > 20:  # Complex question
            return 0.1  # Slightly increase difficulty
        elif len(question.split()) < 5:  # Simple question
            return -0.1  # Slightly decrease difficulty
        return None
    
    def _calculate_response_confidence(self, question: str, knowledge: Dict) -> float:
        """Calculate confidence in AI tutor response"""
        if not knowledge:
            return 0.3
        
        # Simple confidence calculation
        keyword_matches = sum(1 for keyword in knowledge.get("keywords", []) 
                            if keyword in question.lower())
        
        if keyword_matches > 0:
            return min(0.9, 0.5 + (keyword_matches * 0.1))
        return 0.4
    
    def _identify_topic(self, question: str) -> str:
        """Identify the main topic of the question"""
        question_lower = question.lower()
        
        if any(word in question_lower for word in ["variable", "string", "number", "data type"]):
            return "python_basics"
        elif any(word in question_lower for word in ["loop", "for", "while", "iteration"]):
            return "loops"
        elif any(word in question_lower for word in ["function", "def", "parameter", "return"]):
            return "functions"
        elif any(word in question_lower for word in ["class", "object", "oop", "inheritance"]):
            return "oop"
        else:
            return "general"
    
    def _calculate_completion_rate(self, user_id: str, activity_data: Dict) -> float:
        """Calculate user's completion rate"""
        # This would integrate with your existing progress tracking
        return activity_data.get("completion_rate", 0.0)
    
    def _calculate_average_time(self, user_id: str, activity_data: Dict) -> float:
        """Calculate average time per lesson"""
        return activity_data.get("average_time", 30.0)
    
    def _analyze_performance(self, performance_data: Dict) -> Tuple[List[str], List[str]]:
        """Analyze user performance to identify strengths and weaknesses"""
        strengths = []
        weaknesses = []
        
        # Simple analysis based on performance metrics
        if performance_data.get("code_quality_score", 0) > 0.8:
            strengths.append("Code Quality")
        else:
            weaknesses.append("Code Quality")
        
        if performance_data.get("completion_speed", 0) > 0.7:
            strengths.append("Learning Speed")
        else:
            weaknesses.append("Learning Speed")
        
        return strengths, weaknesses
    
    def _adjust_learning_pace(self, profile: LearningProfile, feedback: Dict) -> float:
        """Adjust learning pace based on feedback"""
        current_pace = profile.learning_pace
        
        if feedback.get("too_easy", False):
            return min(2.0, current_pace + 0.1)
        elif feedback.get("too_hard", False):
            return max(0.5, current_pace - 0.1)
        
        return current_pace
    
    def _is_appropriate_difficulty(self, content_difficulty: str, profile: LearningProfile) -> bool:
        """Check if content difficulty is appropriate for user"""
        difficulty_levels = ["beginner", "intermediate", "advanced"]
        user_level = difficulty_levels.index(profile.preferred_difficulty.value)
        content_level = difficulty_levels.index(content_difficulty)
        
        # Allow content that's at user level or one level above
        return content_level <= user_level + 1
    
    def _prerequisites_met(self, profile: LearningProfile, prerequisites: List[str]) -> bool:
        """Check if user has met prerequisites"""
        # This would integrate with your existing progress tracking
        # For now, return True for simplicity
        return True
    
    def _generate_reasoning(self, profile: LearningProfile, content: Dict, score: float) -> str:
        """Generate reasoning for recommendation"""
        reasons = []
        
        if profile.learning_style.value in content.get("learning_style", []):
            reasons.append(f"matches your {profile.learning_style.value} learning style")
        
        if content["difficulty"] == profile.preferred_difficulty.value:
            reasons.append("matches your preferred difficulty level")
        
        if score > 0.7:
            reasons.append("highly recommended based on your progress")
        
        return f"Recommended because it {' and '.join(reasons)}" if reasons else "Recommended for your learning journey"
    
    def _get_default_recommendations(self, limit: int) -> List[LearningRecommendation]:
        """Get default recommendations for new users"""
        default_content = self.content_database["lessons"][:limit]
        recommendations = []
        
        for content in default_content:
            recommendation = LearningRecommendation(
                content_id=content["id"],
                content_type="lesson",
                title=content["title"],
                description="Start your Python learning journey with this lesson",
                difficulty=DifficultyLevel(content["difficulty"]),
                estimated_time=content["estimated_time"],
                confidence_score=0.8,
                reasoning="Perfect for beginners starting their Python journey",
                prerequisites=content.get("prerequisites", []),
                learning_objectives=content.get("learning_objectives", [])
            )
            recommendations.append(recommendation)
        
        return recommendations

# Global AI personalization engine instance
ai_personalization_engine = AIPersonalizationEngine()
