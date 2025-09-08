"""
Code Execution Service for TCDynamics
Safely executes Python code in a sandboxed environment
"""

import subprocess
import tempfile
import os
import sys
import time
import logging
from typing import Dict, Any, Optional, List
from contextlib import contextmanager
import signal

class CodeExecutionError(Exception):
    """Custom exception for code execution errors"""
    pass

class CodeExecutor:
    """Safe Python code executor with sandboxing"""
    
    def __init__(self, timeout: int = 5, max_memory: int = 128):
        self.timeout = timeout
        self.max_memory = max_memory  # MB
        self.logger = logging.getLogger(__name__)
        self.sandbox_dir = None
    
    @contextmanager
    def create_sandbox(self):
        """Create a temporary sandbox directory"""
        self.sandbox_dir = tempfile.mkdtemp(prefix='tcdynamics_')
        try:
            yield self.sandbox_dir
        finally:
            if self.sandbox_dir and os.path.exists(self.sandbox_dir):
                self._cleanup_sandbox()
    
    def _cleanup_sandbox(self):
        """Clean up sandbox directory"""
        try:
            import shutil
            shutil.rmtree(self.sandbox_dir)
        except Exception as e:
            self.logger.warning(f"Failed to cleanup sandbox: {e}")
    
    def execute_python_code(self, code: str, inputs: str = "") -> Dict[str, Any]:
        """Execute Python code safely"""
        start_time = time.time()
        
        try:
            with self.create_sandbox() as sandbox_dir:
                # Validate code for dangerous operations
                if not self._validate_code(code):
                    return {
                        'success': False,
                        'error': 'Code contains potentially dangerous operations',
                        'output': '',
                        'execution_time': 0
                    }
                
                # Create temporary file
                temp_file = os.path.join(sandbox_dir, 'code.py')
                with open(temp_file, 'w', encoding='utf-8') as f:
                    f.write(code)
                
                # Execute code
                result = self._run_code(temp_file, inputs)
                
                execution_time = time.time() - start_time
                
                return {
                    'success': result['returncode'] == 0,
                    'output': result['stdout'],
                    'error': result['stderr'],
                    'execution_time': round(execution_time, 3)
                }
                
        except Exception as e:
            execution_time = time.time() - start_time
            self.logger.error(f"Code execution failed: {e}")
            return {
                'success': False,
                'error': f'Execution failed: {str(e)}',
                'output': '',
                'execution_time': round(execution_time, 3)
            }
    
    def _validate_code(self, code: str) -> bool:
        """Validate code for dangerous operations"""
        dangerous_patterns = [
            'import os',
            'import sys',
            'import subprocess',
            'import shutil',
            'import socket',
            'import urllib',
            'import requests',
            'import http',
            'import ftplib',
            'import smtplib',
            'import poplib',
            'import imaplib',
            'import telnetlib',
            'import ssl',
            'import ssl',
            'import ssl',
            'open(',
            'file(',
            'exec(',
            'eval(',
            'compile(',
            '__import__',
            'getattr',
            'setattr',
            'delattr',
            'hasattr',
            'globals',
            'locals',
            'vars',
            'dir',
            'help',
            'input(',
            'raw_input(',
            'exit(',
            'quit(',
            'reload(',
            'reload_module',
        ]
        
        code_lower = code.lower()
        for pattern in dangerous_patterns:
            if pattern in code_lower:
                return False
        
        return True
    
    def _run_code(self, file_path: str, inputs: str = "") -> Dict[str, Any]:
        """Run Python code with timeout and resource limits"""
        try:
            # Use timeout and resource limits
            process = subprocess.Popen(
                [sys.executable, file_path],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd=os.path.dirname(file_path),
                preexec_fn=self._set_limits if hasattr(os, 'setrlimit') else None
            )
            
            # Send inputs if provided
            stdout, stderr = process.communicate(
                input=inputs,
                timeout=self.timeout
            )
            
            return {
                'returncode': process.returncode,
                'stdout': stdout,
                'stderr': stderr
            }
            
        except subprocess.TimeoutExpired:
            process.kill()
            return {
                'returncode': -1,
                'stdout': '',
                'stderr': f'Code execution timed out after {self.timeout} seconds'
            }
        except Exception as e:
            return {
                'returncode': -1,
                'stdout': '',
                'stderr': f'Execution error: {str(e)}'
            }
    
    def _set_limits(self):
        """Set resource limits for the process"""
        try:
            import resource
            # Limit memory usage
            resource.setrlimit(resource.RLIMIT_AS, (self.max_memory * 1024 * 1024, -1))
            # Limit CPU time
            resource.setrlimit(resource.RLIMIT_CPU, (self.timeout, -1))
        except Exception as e:
            self.logger.warning(f"Failed to set resource limits: {e}")

class CodeExecutionService:
    """Service for handling code execution requests"""
    
    def __init__(self):
        self.executor = CodeExecutor()
        self.logger = logging.getLogger(__name__)
        self.execution_history = []
    
    def execute_code(self, code: str, inputs: str = "", user_id: str = None) -> Dict[str, Any]:
        """Execute code and return results"""
        try:
            # Log execution attempt
            self.logger.info(f"Code execution requested by user: {user_id}")
            
            # Execute code
            result = self.executor.execute_python_code(code, inputs)
            
            # Add metadata
            result['timestamp'] = time.time()
            result['user_id'] = user_id
            result['code_length'] = len(code)
            
            # Store in history (limit to last 100 executions)
            self.execution_history.append(result)
            if len(self.execution_history) > 100:
                self.execution_history.pop(0)
            
            return result
            
        except Exception as e:
            self.logger.error(f"Code execution service error: {e}")
            return {
                'success': False,
                'error': f'Service error: {str(e)}',
                'output': '',
                'execution_time': 0,
                'timestamp': time.time(),
                'user_id': user_id
            }
    
    def get_execution_history(self, user_id: str = None, limit: int = 10) -> List[Dict]:
        """Get execution history for a user"""
        if user_id:
            user_history = [exec for exec in self.execution_history if exec.get('user_id') == user_id]
            return user_history[-limit:]
        return self.execution_history[-limit:]
    
    def get_code_examples(self) -> List[Dict]:
        """Get example Python code for beginners"""
        return [
            {
                'title': 'Hello World',
                'description': 'Your first Python program',
                'code': 'print("Hello, World!")',
                'difficulty': 'beginner'
            },
            {
                'title': 'Variables and Math',
                'description': 'Working with variables and basic math',
                'code': '''name = "Python"
age = 30
print(f"My name is {name} and I'm {age} years old")
print(f"Next year I'll be {age + 1}")''',
                'difficulty': 'beginner'
            },
            {
                'title': 'Lists and Loops',
                'description': 'Working with lists and for loops',
                'code': '''fruits = ["apple", "banana", "orange"]
for fruit in fruits:
    print(f"I like {fruit}")

print(f"Total fruits: {len(fruits)}")''',
                'difficulty': 'beginner'
            },
            {
                'title': 'Functions',
                'description': 'Creating and using functions',
                'code': '''def greet(name):
    return f"Hello, {name}!"

def add_numbers(a, b):
    return a + b

print(greet("World"))
print(f"2 + 3 = {add_numbers(2, 3)}")''',
                'difficulty': 'intermediate'
            },
            {
                'title': 'Conditionals',
                'description': 'Using if/else statements',
                'code': '''age = 18

if age >= 18:
    print("You are an adult")
elif age >= 13:
    print("You are a teenager")
else:
    print("You are a child")''',
                'difficulty': 'beginner'
            }
        ]

# Global code execution service instance
code_execution_service = CodeExecutionService()
