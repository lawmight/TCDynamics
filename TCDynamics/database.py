"""
Database integration for TCDynamics
Supports both Azure Cosmos DB and Azure Table Storage
"""
import os
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict

try:
    from azure.cosmos import CosmosClient, exceptions
    COSMOS_AVAILABLE = True
except ImportError:
    COSMOS_AVAILABLE = False
    logging.warning("Azure Cosmos DB not available - install azure-cosmos")

try:
    from azure.data.tables import TableServiceClient
    TABLES_AVAILABLE = True
except ImportError:
    TABLES_AVAILABLE = False
    logging.warning("Azure Table Storage not available - install azure-storage-table")

@dataclass
class ContactSubmission:
    """Contact form submission data structure"""
    id: str
    name: str
    email: str
    message: str
    timestamp: str
    ip_address: str
    user_agent: str
    email_sent: bool = False
    spam_score: float = 0.0

class DatabaseManager:
    """Unified database manager supporting multiple backends"""
    
    def __init__(self):
        self.cosmos_client = None
        self.table_client = None
        self.storage_type = self._detect_storage_type()
        self._initialize_storage()
    
    def _detect_storage_type(self) -> str:
        """Detect which storage backend to use"""
        if os.environ.get("COSMOS_CONNECTION_STRING") and COSMOS_AVAILABLE:
            return "cosmos"
        elif os.environ.get("AZURE_STORAGE_CONNECTION_STRING") and TABLES_AVAILABLE:
            return "table"
        else:
            logging.warning("No database configured - using in-memory storage")
            return "memory"
    
    def _initialize_storage(self):
        """Initialize the appropriate storage backend"""
        try:
            if self.storage_type == "cosmos":
                self._init_cosmos()
            elif self.storage_type == "table":
                self._init_table_storage()
            else:
                self.memory_storage = []
                
        except Exception as e:
            logging.error(f"Failed to initialize {self.storage_type} storage: {e}")
            self.storage_type = "memory"
            self.memory_storage = []
    
    def _init_cosmos(self):
        """Initialize Cosmos DB"""
        connection_string = os.environ.get("COSMOS_CONNECTION_STRING")
        self.cosmos_client = CosmosClient.from_connection_string(connection_string)
        
        # Create database and container if they don't exist
        database = self.cosmos_client.create_database_if_not_exists("TCDynamics")
        self.container = database.create_container_if_not_exists(
            id="ContactSubmissions",
            partition_key="/email"
        )
        logging.info("Cosmos DB initialized successfully")
    
    def _init_table_storage(self):
        """Initialize Azure Table Storage"""
        connection_string = os.environ.get("AZURE_STORAGE_CONNECTION_STRING")
        self.table_client = TableServiceClient.from_connection_string(connection_string)
        
        # Create table if it doesn't exist
        try:
            self.table_client.create_table_if_not_exists("ContactSubmissions")
            logging.info("Table Storage initialized successfully")
        except Exception as e:
            logging.error(f"Failed to create table: {e}")
    
    def save_contact_submission(self, submission: ContactSubmission) -> bool:
        """Save contact submission to configured storage"""
        try:
            if self.storage_type == "cosmos":
                return self._save_to_cosmos(submission)
            elif self.storage_type == "table":
                return self._save_to_table(submission)
            else:
                return self._save_to_memory(submission)
        except Exception as e:
            logging.error(f"Failed to save submission: {e}")
            return False
    
    def _save_to_cosmos(self, submission: ContactSubmission) -> bool:
        """Save to Cosmos DB"""
        try:
            item = asdict(submission)
            self.container.create_item(item)
            return True
        except exceptions.CosmosHttpResponseError as e:
            logging.error(f"Cosmos DB save failed: {e}")
            return False
    
    def _save_to_table(self, submission: ContactSubmission) -> bool:
        """Save to Table Storage"""
        try:
            entity = {
                "PartitionKey": submission.email,
                "RowKey": submission.id,
                **asdict(submission)
            }
            table_client = self.table_client.get_table_client("ContactSubmissions")
            table_client.create_entity(entity)
            return True
        except Exception as e:
            logging.error(f"Table Storage save failed: {e}")
            return False
    
    def _save_to_memory(self, submission: ContactSubmission) -> bool:
        """Save to in-memory storage (development only)"""
        self.memory_storage.append(submission)
        logging.info(f"Saved to memory storage (total: {len(self.memory_storage)})")
        return True
    
    def get_recent_submissions(self, limit: int = 10) -> List[ContactSubmission]:
        """Get recent contact submissions"""
        try:
            if self.storage_type == "cosmos":
                return self._get_from_cosmos(limit)
            elif self.storage_type == "table":
                return self._get_from_table(limit)
            else:
                return self._get_from_memory(limit)
        except Exception as e:
            logging.error(f"Failed to retrieve submissions: {e}")
            return []
    
    def _get_from_cosmos(self, limit: int) -> List[ContactSubmission]:
        """Get from Cosmos DB"""
        query = f"SELECT * FROM c ORDER BY c.timestamp DESC OFFSET 0 LIMIT {limit}"
        items = list(self.container.query_items(query, enable_cross_partition_query=True))
        return [ContactSubmission(**item) for item in items]
    
    def _get_from_table(self, limit: int) -> List[ContactSubmission]:
        """Get from Table Storage"""
        table_client = self.table_client.get_table_client("ContactSubmissions")
        entities = list(table_client.list_entities(select="*"))
        # Sort by timestamp and limit
        sorted_entities = sorted(entities, key=lambda x: x.get('timestamp', ''), reverse=True)[:limit]
        return [ContactSubmission(**{k: v for k, v in entity.items() if k not in ['PartitionKey', 'RowKey']}) 
                for entity in sorted_entities]
    
    def _get_from_memory(self, limit: int) -> List[ContactSubmission]:
        """Get from memory storage"""
        return sorted(self.memory_storage, key=lambda x: x.timestamp, reverse=True)[:limit]
    
    def get_submission_stats(self) -> Dict:
        """Get statistics about submissions"""
        try:
            recent_submissions = self.get_recent_submissions(100)
            
            stats = {
                "total_submissions": len(recent_submissions),
                "successful_emails": sum(1 for s in recent_submissions if s.email_sent),
                "failed_emails": sum(1 for s in recent_submissions if not s.email_sent),
                "unique_visitors": len(set(s.ip_address for s in recent_submissions)),
                "storage_type": self.storage_type,
                "last_submission": recent_submissions[0].timestamp if recent_submissions else None
            }
            
            return stats
        except Exception as e:
            logging.error(f"Failed to get stats: {e}")
            return {"error": str(e), "storage_type": self.storage_type}

# Global database manager instance
db_manager = DatabaseManager()
