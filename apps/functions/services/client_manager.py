"""
Client Manager - Singleton pattern for managing Azure service clients
Centralizes client initialization and configuration
"""

import os
import logging
from typing import Optional
import openai
from azure.ai.vision.imageanalysis import ImageAnalysisClient
from azure.core.credentials import AzureKeyCredential
import azure.cosmos as cosmos
import stripe


class ClientManager:
    """
    Singleton class for managing all Azure service clients

    Provides centralized client initialization, configuration checks,
    and consistent error handling across all Azure Functions.
    """

    _instance: Optional["ClientManager"] = None
    _initialized: bool = False

    def __new__(cls):
        """Ensure only one instance exists (Singleton pattern)"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        """Initialize clients only once"""
        if not ClientManager._initialized:
            self._init_clients()
            ClientManager._initialized = True

    def _init_clients(self):
        """Initialize all service clients from environment variables"""
        # Environment configuration
        self.azure_openai_endpoint = os.environ.get("AZURE_OPENAI_ENDPOINT")
        self.azure_openai_key = os.environ.get("AZURE_OPENAI_KEY")
        self.azure_openai_deployment = os.environ.get(
            "AZURE_OPENAI_DEPLOYMENT", "gpt-35-turbo"
        )
        self.azure_vision_endpoint = os.environ.get("AZURE_VISION_ENDPOINT")
        self.azure_vision_key = os.environ.get("AZURE_VISION_KEY")
        self.zoho_email = os.environ.get("ZOHO_EMAIL")
        self.zoho_password = os.environ.get("ZOHO_PASSWORD")
        self.cosmos_connection_string = os.environ.get("COSMOS_CONNECTION_STRING")
        self.cosmos_database = os.environ.get("COSMOS_DATABASE", "tcdynamics")
        self.cosmos_container_contacts = os.environ.get(
            "COSMOS_CONTAINER_CONTACTS", "contacts"
        )
        self.cosmos_container_demos = os.environ.get(
            "COSMOS_CONTAINER_DEMOS", "demo_requests"
        )
        self.cosmos_container_conversations = os.environ.get(
            "COSMOS_CONTAINER_CONVERSATIONS", "conversations"
        )
        self.stripe_secret_key = os.environ.get("STRIPE_SECRET_KEY")

        # Initialize OpenAI client
        self.openai_client = None
        if self.azure_openai_endpoint and self.azure_openai_key:
            try:
                self.openai_client = openai.AzureOpenAI(
                    azure_endpoint=self.azure_openai_endpoint,
                    api_key=self.azure_openai_key,
                    api_version="2024-02-15-preview",
                )
                logging.info("OpenAI client initialized successfully")
            except Exception as e:
                logging.error(f"Failed to initialize OpenAI client: {e}")

        # Initialize Vision client
        self.vision_client = None
        if self.azure_vision_endpoint and self.azure_vision_key:
            try:
                self.vision_client = ImageAnalysisClient(
                    endpoint=self.azure_vision_endpoint,
                    credential=AzureKeyCredential(self.azure_vision_key),
                )
                logging.info("Vision client initialized successfully")
            except Exception as e:
                logging.error(f"Failed to initialize Vision client: {e}")

        # Initialize Cosmos DB clients
        self.cosmos_client = None
        self.database = None
        self.contacts_container = None
        self.demos_container = None
        self.conversations_container = None

        if self.cosmos_connection_string:
            try:
                self.cosmos_client = cosmos.CosmosClient.from_connection_string(
                    self.cosmos_connection_string
                )
                self.database = self.cosmos_client.get_database_client(
                    self.cosmos_database
                )
                self.contacts_container = self.database.get_container_client(
                    self.cosmos_container_contacts
                )
                self.demos_container = self.database.get_container_client(
                    self.cosmos_container_demos
                )
                self.conversations_container = self.database.get_container_client(
                    self.cosmos_container_conversations
                )
                logging.info("Cosmos DB clients initialized successfully")
            except Exception as e:
                logging.error(f"Failed to initialize Cosmos DB clients: {e}")

        # Initialize Stripe
        if self.stripe_secret_key:
            try:
                stripe.api_key = self.stripe_secret_key
                logging.info("Stripe initialized successfully")
            except Exception as e:
                logging.error(f"Failed to initialize Stripe: {e}")

    # Configuration check methods
    def is_openai_configured(self) -> bool:
        """Check if OpenAI is properly configured"""
        return self.openai_client is not None

    def is_vision_configured(self) -> bool:
        """Check if Azure Vision is properly configured"""
        return self.vision_client is not None

    def is_cosmos_configured(self) -> bool:
        """Check if Cosmos DB is properly configured"""
        return self.cosmos_client is not None

    def is_email_configured(self) -> bool:
        """Check if email (Zoho) is properly configured"""
        return bool(self.zoho_email and self.zoho_password)

    def is_stripe_configured(self) -> bool:
        """Check if Stripe is properly configured"""
        return bool(stripe.api_key)

    # Client getter methods
    def get_openai_client(self):
        """Get OpenAI client (raises error if not configured)"""
        if not self.is_openai_configured():
            raise ValueError("OpenAI client not configured")
        return self.openai_client

    def get_vision_client(self):
        """Get Vision client (raises error if not configured)"""
        if not self.is_vision_configured():
            raise ValueError("Vision client not configured")
        return self.vision_client

    def get_cosmos_container(self, container_type: str):
        """
        Get Cosmos DB container by type

        Args:
            container_type: One of 'contacts', 'demos', 'conversations'

        Returns:
            Container client

        Raises:
            ValueError: If Cosmos DB not configured or invalid container type
        """
        if not self.is_cosmos_configured():
            raise ValueError("Cosmos DB not configured")

        containers = {
            "contacts": self.contacts_container,
            "demos": self.demos_container,
            "conversations": self.conversations_container,
        }

        if container_type not in containers:
            raise ValueError(f"Invalid container type: {container_type}")

        return containers[container_type]
