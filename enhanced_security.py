"""
Enhanced Security System for TCDynamics
Implements CodeJail-style sandboxing and advanced security measures
"""

import os
import sys
import subprocess
import tempfile
import time
import logging
import resource
import signal
import threading
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from contextlib import contextmanager
import json
import hashlib

@dataclass
class SecurityConfig:
    """Security configuration for code execution"""
    max_execution_time: int = 5  # seconds
    max_memory_mb: int = 128
    max_cpu_time: int = 10  # seconds
    max_file_size_mb: int = 10
    max_output_size_mb: int = 5
    allowed_modules: List[str] = None
    blocked_functions: List[str] = None
    max_recursion_depth: int = 100

class EnhancedCodeExecutor:
    """Enhanced secure code executor with advanced sandboxing"""
    
    def __init__(self, config: SecurityConfig = None):
        self.config = config or SecurityConfig()
        self.logger = logging.getLogger(__name__)
        self.execution_history = []
        self.security_violations = []
        
        # Initialize security rules
        self._init_security_rules()
    
    def _init_security_rules(self):
        """Initialize security rules and blocked operations"""
        self.blocked_imports = [
            'os', 'sys', 'subprocess', 'shutil', 'socket', 'urllib', 'requests',
            'http', 'ftplib', 'smtplib', 'poplib', 'imaplib', 'telnetlib',
            'ssl', 'hashlib', 'secrets', 'random', 'pickle', 'marshal',
            'ctypes', 'multiprocessing', 'threading', 'asyncio', 'concurrent'
        ]
        
        self.blocked_functions = [
            'exec', 'eval', 'compile', '__import__', 'getattr', 'setattr',
            'delattr', 'hasattr', 'globals', 'locals', 'vars', 'dir',
            'help', 'input', 'raw_input', 'exit', 'quit', 'reload',
            'open', 'file', 'input', 'raw_input'
        ]
        
        self.blocked_patterns = [
            r'import\s+os',
            r'import\s+sys',
            r'import\s+subprocess',
            r'from\s+os\s+import',
            r'from\s+sys\s+import',
            r'__import__\s*\(',
            r'exec\s*\(',
            r'eval\s*\(',
            r'compile\s*\(',
            r'open\s*\(',
            r'file\s*\(',
            r'input\s*\(',
            r'raw_input\s*\(',
            r'getattr\s*\(',
            r'setattr\s*\(',
            r'globals\s*\(',
            r'locals\s*\(',
            r'vars\s*\(',
            r'dir\s*\(',
            r'help\s*\(',
            r'__.*__',  # Block dunder methods
        ]
    
    def execute_code_securely(self, code: str, inputs: str = "", user_id: str = None) -> Dict[str, Any]:
        """Execute code with enhanced security measures"""
        start_time = time.time()
        
        try:
            # Pre-execution security checks
            security_check = self._pre_execution_security_check(code)
            if not security_check["safe"]:
                return {
                    "success": False,
                    "error": f"Security violation: {security_check['violation']}",
                    "output": "",
                    "execution_time": 0,
                    "security_level": "blocked"
                }
            
            # Create secure execution environment
            with self._create_secure_environment() as sandbox_dir:
                # Write code to temporary file
                code_file = os.path.join(sandbox_dir, "code.py")
                with open(code_file, 'w', encoding='utf-8') as f:
                    f.write(code)
                
                # Execute with security constraints
                result = self._execute_with_constraints(code_file, inputs)
                
                execution_time = time.time() - start_time
                
                # Post-execution security analysis
                security_analysis = self._post_execution_analysis(result, execution_time)
                
                return {
                    "success": result["returncode"] == 0,
                    "output": result["stdout"],
                    "error": result["stderr"],
                    "execution_time": round(execution_time, 3),
                    "security_level": security_analysis["level"],
                    "security_warnings": security_analysis["warnings"],
                    "resource_usage": security_analysis["resource_usage"]
                }
                
        except Exception as e:
            execution_time = time.time() - start_time
            self.logger.error(f"Secure execution failed: {e}")
            return {
                "success": False,
                "error": f"Execution failed: {str(e)}",
                "output": "",
                "execution_time": round(execution_time, 3),
                "security_level": "error"
            }
    
    def _pre_execution_security_check(self, code: str) -> Dict[str, Any]:
        """Perform comprehensive pre-execution security checks"""
        import re
        
        # Check for blocked imports
        for blocked_import in self.blocked_imports:
            if re.search(rf'import\s+{blocked_import}\b', code, re.IGNORECASE):
                return {
                    "safe": False,
                    "violation": f"Blocked import: {blocked_import}",
                    "severity": "high"
                }
            if re.search(rf'from\s+{blocked_import}\s+import', code, re.IGNORECASE):
                return {
                    "safe": False,
                    "violation": f"Blocked import from: {blocked_import}",
                    "severity": "high"
                }
        
        # Check for blocked functions
        for blocked_func in self.blocked_functions:
            if re.search(rf'{blocked_func}\s*\(', code, re.IGNORECASE):
                return {
                    "safe": False,
                    "violation": f"Blocked function: {blocked_func}",
                    "severity": "high"
                }
        
        # Check for blocked patterns
        for pattern in self.blocked_patterns:
            if re.search(pattern, code, re.IGNORECASE):
                return {
                    "safe": False,
                    "violation": f"Blocked pattern detected: {pattern}",
                    "severity": "high"
                }
        
        # Check code complexity
        complexity_check = self._check_code_complexity(code)
        if not complexity_check["safe"]:
            return complexity_check
        
        # Check for suspicious patterns
        suspicious_check = self._check_suspicious_patterns(code)
        if not suspicious_check["safe"]:
            return suspicious_check
        
        return {"safe": True, "violation": None, "severity": "none"}
    
    def _check_code_complexity(self, code: str) -> Dict[str, Any]:
        """Check code complexity and potential issues"""
        lines = code.split('\n')
        
        # Check for excessive nesting
        max_indent = 0
        for line in lines:
            if line.strip():
                indent = len(line) - len(line.lstrip())
                max_indent = max(max_indent, indent)
        
        if max_indent > 20:  # More than 5 levels of nesting
            return {
                "safe": False,
                "violation": "Excessive code nesting detected",
                "severity": "medium"
            }
        
        # Check for very long lines
        for line in lines:
            if len(line) > 200:
                return {
                    "safe": False,
                    "violation": "Line too long (potential obfuscation)",
                    "severity": "medium"
                }
        
        # Check for excessive recursion potential
        if code.count('def ') > 10:
            return {
                "safe": False,
                "violation": "Too many function definitions",
                "severity": "medium"
            }
        
        return {"safe": True, "violation": None, "severity": "none"}
    
    def _check_suspicious_patterns(self, code: str) -> Dict[str, Any]:
        """Check for suspicious patterns that might indicate malicious code"""
        import re
        
        # Check for base64 encoding attempts
        if re.search(r'base64|b64', code, re.IGNORECASE):
            return {
                "safe": False,
                "violation": "Base64 encoding detected",
                "severity": "high"
            }
        
        # Check for URL patterns
        if re.search(r'https?://|ftp://', code, re.IGNORECASE):
            return {
                "safe": False,
                "violation": "Network access attempt detected",
                "severity": "high"
            }
        
        # Check for file path patterns
        if re.search(r'/[a-zA-Z]:/|\.\./|\.\.\\', code):
            return {
                "safe": False,
                "violation": "File system access attempt detected",
                "severity": "high"
            }
        
        # Check for shell command patterns
        if re.search(r'cmd|shell|bash|sh|powershell', code, re.IGNORECASE):
            return {
                "safe": False,
                "violation": "Shell command attempt detected",
                "severity": "high"
            }
        
        return {"safe": True, "violation": None, "severity": "none"}
    
    @contextmanager
    def _create_secure_environment(self):
        """Create a secure execution environment"""
        sandbox_dir = tempfile.mkdtemp(prefix='tcdynamics_secure_')
        
        try:
            # Set up restricted environment
            env = os.environ.copy()
            env['PYTHONPATH'] = ''  # Clear Python path
            env['PATH'] = '/usr/bin:/bin'  # Minimal PATH
            
            # Create restricted Python environment
            restricted_py = os.path.join(sandbox_dir, 'restricted.py')
            with open(restricted_py, 'w') as f:
                f.write(self._get_restricted_python_code())
            
            yield sandbox_dir
            
        finally:
            # Clean up sandbox
            import shutil
            try:
                shutil.rmtree(sandbox_dir)
            except Exception as e:
                self.logger.warning(f"Failed to cleanup sandbox: {e}")
    
    def _get_restricted_python_code(self) -> str:
        """Get restricted Python execution code"""
        return '''
import sys
import builtins

# Remove dangerous builtins
dangerous_builtins = [
    'exec', 'eval', 'compile', '__import__', 'getattr', 'setattr',
    'delattr', 'hasattr', 'globals', 'locals', 'vars', 'dir',
    'help', 'input', 'raw_input', 'exit', 'quit', 'reload',
    'open', 'file'
]

for name in dangerous_builtins:
    if name in builtins.__dict__:
        del builtins.__dict__[name]

# Restrict sys module
sys.modules['os'] = None
sys.modules['sys'] = None
sys.modules['subprocess'] = None
sys.modules['shutil'] = None
sys.modules['socket'] = None
sys.modules['urllib'] = None
sys.modules['requests'] = None
sys.modules['http'] = None
sys.modules['ftplib'] = None
sys.modules['smtplib'] = None
sys.modules['poplib'] = None
sys.modules['imaplib'] = None
sys.modules['telnetlib'] = None
sys.modules['ssl'] = None
sys.modules['hashlib'] = None
sys.modules['secrets'] = None
sys.modules['random'] = None
sys.modules['pickle'] = None
sys.modules['marshal'] = None
sys.modules['ctypes'] = None
sys.modules['multiprocessing'] = None
sys.modules['threading'] = None
sys.modules['asyncio'] = None
sys.modules['concurrent'] = None

# Set recursion limit
sys.setrecursionlimit(100)

# Execute the user code
exec(open('code.py').read())
'''
    
    def _execute_with_constraints(self, code_file: str, inputs: str) -> Dict[str, Any]:
        """Execute code with resource constraints"""
        try:
            # Set up resource limits
            def set_limits():
                # Memory limit
                resource.setrlimit(resource.RLIMIT_AS, (self.config.max_memory_mb * 1024 * 1024, -1))
                # CPU time limit
                resource.setrlimit(resource.RLIMIT_CPU, (self.config.max_cpu_time, -1))
                # File size limit
                resource.setrlimit(resource.RLIMIT_FSIZE, (self.config.max_file_size_mb * 1024 * 1024, -1))
            
            # Execute with timeout
            process = subprocess.Popen(
                [sys.executable, code_file],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                preexec_fn=set_limits,
                cwd=os.path.dirname(code_file)
            )
            
            # Send inputs and get output with timeout
            try:
                stdout, stderr = process.communicate(
                    input=inputs,
                    timeout=self.config.max_execution_time
                )
                
                return {
                    "returncode": process.returncode,
                    "stdout": stdout,
                    "stderr": stderr
                }
                
            except subprocess.TimeoutExpired:
                process.kill()
                return {
                    "returncode": -1,
                    "stdout": "",
                    "stderr": f"Code execution timed out after {self.config.max_execution_time} seconds"
                }
                
        except Exception as e:
            return {
                "returncode": -1,
                "stdout": "",
                "stderr": f"Execution error: {str(e)}"
            }
    
    def _post_execution_analysis(self, result: Dict, execution_time: float) -> Dict[str, Any]:
        """Analyze execution results for security issues"""
        warnings = []
        resource_usage = {
            "execution_time": execution_time,
            "output_size": len(result.get("stdout", "")),
            "error_size": len(result.get("stderr", ""))
        }
        
        # Check execution time
        if execution_time > self.config.max_execution_time * 0.8:
            warnings.append("Execution time approaching limit")
        
        # Check output size
        if resource_usage["output_size"] > self.config.max_output_size_mb * 1024 * 1024:
            warnings.append("Output size exceeds limit")
        
        # Check for suspicious output
        if "error" in result.get("stderr", "").lower():
            warnings.append("Execution produced errors")
        
        # Determine security level
        if warnings:
            level = "warning" if len(warnings) < 3 else "high_risk"
        else:
            level = "safe"
        
        return {
            "level": level,
            "warnings": warnings,
            "resource_usage": resource_usage
        }
    
    def get_security_report(self, user_id: str = None) -> Dict[str, Any]:
        """Generate security report for user or system"""
        report = {
            "total_executions": len(self.execution_history),
            "security_violations": len(self.security_violations),
            "violation_types": {},
            "risk_level": "low"
        }
        
        # Analyze violation types
        for violation in self.security_violations:
            violation_type = violation.get("type", "unknown")
            report["violation_types"][violation_type] = report["violation_types"].get(violation_type, 0) + 1
        
        # Determine overall risk level
        if report["security_violations"] > 10:
            report["risk_level"] = "high"
        elif report["security_violations"] > 5:
            report["risk_level"] = "medium"
        
        return report

# Global enhanced security executor instance
enhanced_security_executor = EnhancedCodeExecutor()
