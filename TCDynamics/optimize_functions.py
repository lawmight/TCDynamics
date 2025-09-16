"""
Azure Functions Optimization for Free Tier
Maximizes performance within free limits: 1M executions + 400,000 GB-s
"""

import json
import logging
import time
import hashlib
from typing import Dict, Any, Optional
from functools import wraps
from datetime import datetime, timedelta
import azure.functions as func

# Configure logging for minimal overhead
logging.basicConfig(level=logging.WARNING)
logger = logging.getLogger(__name__)

# In-memory cache for function responses
response_cache: Dict[str, Dict[str, Any]] = {}
CACHE_TTL = 300  # 5 minutes cache TTL

class FreeFreeTierOptimizer:
    """Optimizations for Azure Functions free tier"""
    
    def __init__(self):
        self.execution_count = 0
        self.total_duration_ms = 0
        self.cache_hits = 0
        self.cache_misses = 0
    
    def get_stats(self) -> Dict[str, Any]:
        """Get optimization statistics"""
        return {
            "executions": self.execution_count,
            "avg_duration_ms": self.total_duration_ms / max(1, self.execution_count),
            "cache_hit_rate": self.cache_hits / max(1, self.cache_hits + self.cache_misses),
            "estimated_gb_seconds": (self.total_duration_ms * 0.128) / 1000,  # Assuming 128MB functions
            "free_tier_usage": {
                "executions_percent": (self.execution_count / 1000000) * 100,
                "gb_seconds_percent": ((self.total_duration_ms * 0.128) / 1000 / 400000) * 100
            }
        }

optimizer = FreeFreeTierOptimizer()

def cache_response(ttl_seconds: int = 300):
    """
    Decorator to cache function responses
    Reduces redundant executions within free tier
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Create cache key from function name and arguments
            cache_key = hashlib.md5(
                f"{func.__name__}:{str(args)}:{str(kwargs)}".encode()
            ).hexdigest()
            
            # Check cache
            if cache_key in response_cache:
                cached_data = response_cache[cache_key]
                if time.time() - cached_data['timestamp'] < ttl_seconds:
                    optimizer.cache_hits += 1
                    logger.info(f"Cache hit for {func.__name__}")
                    return cached_data['response']
            
            # Execute function and cache result
            optimizer.cache_misses += 1
            result = func(*args, **kwargs)
            
            response_cache[cache_key] = {
                'response': result,
                'timestamp': time.time()
            }
            
            # Clean old cache entries (keep cache small for memory efficiency)
            _cleanup_cache()
            
            return result
        return wrapper
    return decorator

def track_execution(func):
    """
    Decorator to track function execution metrics
    Helps monitor free tier usage
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        optimizer.execution_count += 1
        
        try:
            result = func(*args, **kwargs)
            return result
        finally:
            duration_ms = (time.time() - start_time) * 1000
            optimizer.total_duration_ms += duration_ms
            
            # Log warning if approaching limits
            stats = optimizer.get_stats()
            if stats['free_tier_usage']['executions_percent'] > 80:
                logger.warning(f"Approaching free tier execution limit: {stats['free_tier_usage']['executions_percent']:.1f}%")
            if stats['free_tier_usage']['gb_seconds_percent'] > 80:
                logger.warning(f"Approaching free tier GB-seconds limit: {stats['free_tier_usage']['gb_seconds_percent']:.1f}%")
    
    return wrapper

def _cleanup_cache(max_size: int = 100):
    """Remove expired cache entries to keep memory usage low"""
    current_time = time.time()
    keys_to_delete = []
    
    for key, data in response_cache.items():
        if current_time - data['timestamp'] > CACHE_TTL:
            keys_to_delete.append(key)
    
    for key in keys_to_delete:
        del response_cache[key]
    
    # If cache is still too large, remove oldest entries
    if len(response_cache) > max_size:
        sorted_keys = sorted(
            response_cache.keys(),
            key=lambda k: response_cache[k]['timestamp']
        )
        for key in sorted_keys[:len(response_cache) - max_size]:
            del response_cache[key]

def optimize_ai_request(prompt: str, max_tokens: int = 500) -> Dict[str, Any]:
    """
    Optimize OpenAI API requests for free tier
    - Shorter prompts
    - Token limits
    - Response caching
    """
    # Truncate prompt if too long (save tokens)
    if len(prompt) > 500:
        prompt = prompt[:497] + "..."
    
    # Use smaller token limits to maximize number of requests
    max_tokens = min(max_tokens, 500)
    
    return {
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful assistant. Be concise."  # Shorter system prompt
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "max_tokens": max_tokens,
        "temperature": 0.7,
        "top_p": 0.95,
        "frequency_penalty": 0,
        "presence_penalty": 0
    }

def batch_process_requests(requests: list, batch_size: int = 5) -> list:
    """
    Process multiple requests in batches to optimize execution time
    Helps stay within 400,000 GB-s limit
    """
    results = []
    for i in range(0, len(requests), batch_size):
        batch = requests[i:i + batch_size]
        # Process batch in parallel (simulated here)
        batch_results = [process_single_request(req) for req in batch]
        results.extend(batch_results)
        
        # Small delay to avoid rate limits
        if i + batch_size < len(requests):
            time.sleep(0.1)
    
    return results

def process_single_request(request: Dict[str, Any]) -> Dict[str, Any]:
    """Process a single request (placeholder for actual logic)"""
    # Your actual processing logic here
    return {"status": "processed", "request": request}

# Optimized function for document processing
@cache_response(ttl_seconds=600)  # Cache for 10 minutes
@track_execution
def process_document_optimized(document_text: str) -> Dict[str, Any]:
    """
    Process document with optimizations:
    - Caching for repeated documents
    - Minimal processing time
    - Efficient memory usage
    """
    # Quick document analysis (optimized for speed)
    doc_hash = hashlib.md5(document_text.encode()).hexdigest()
    word_count = len(document_text.split())
    
    # Only process if document is reasonable size (save GB-seconds)
    if word_count > 10000:
        return {
            "status": "too_large",
            "message": "Document exceeds free tier optimization limits",
            "word_count": word_count
        }
    
    # Simulate processing (replace with actual logic)
    result = {
        "doc_id": doc_hash[:8],
        "word_count": word_count,
        "processing_time_ms": 50,  # Keep it fast
        "status": "success"
    }
    
    return result

# Health check endpoint (minimal resource usage)
def health_check() -> Dict[str, Any]:
    """
    Lightweight health check
    Uses minimal resources to preserve free tier
    """
    stats = optimizer.get_stats()
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "free_tier_usage": stats['free_tier_usage'],
        "cache_hit_rate": f"{stats['cache_hit_rate']:.2%}"
    }

# Export optimized Azure Function
def main(req: func.HttpRequest) -> func.HttpResponse:
    """
    Main Azure Function entry point with optimizations
    """
    try:
        # Quick request validation
        if req.method not in ['GET', 'POST']:
            return func.HttpResponse("Method not allowed", status_code=405)
        
        # Route to appropriate handler
        path = req.route_params.get('path', '')
        
        if path == 'health':
            result = health_check()
        elif path == 'stats':
            result = optimizer.get_stats()
        elif path == 'process':
            # Get document from request
            try:
                req_body = req.get_json()
                document = req_body.get('document', '')
                result = process_document_optimized(document)
            except ValueError:
                return func.HttpResponse("Invalid JSON", status_code=400)
        else:
            result = {"message": "Endpoint not found"}
        
        return func.HttpResponse(
            json.dumps(result),
            mimetype="application/json",
            status_code=200
        )
        
    except Exception as e:
        logger.error(f"Function error: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": "Internal server error"}),
            status_code=500,
            mimetype="application/json"
        )

# Warm-up function to reduce cold starts
def warmup():
    """
    Warm-up function to reduce cold start latency
    Called periodically to keep function warm
    """
    _ = health_check()
    logger.info("Function warmed up")

if __name__ == "__main__":
    # Local testing
    print("Azure Functions Free Tier Optimizer")
    print("=" * 40)
    print("Free Tier Limits:")
    print("- Executions: 1,000,000/month")
    print("- Compute: 400,000 GB-seconds/month")
    print("- Storage: 1 GB")
    print("\nOptimization Strategies:")
    print("1. Response caching")
    print("2. Batch processing")
    print("3. Token optimization")
    print("4. Execution tracking")
    print("\nCurrent Stats:")
    print(json.dumps(optimizer.get_stats(), indent=2))
