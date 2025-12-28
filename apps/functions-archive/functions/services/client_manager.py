"""
Client Manager - Singleton pattern for managing Azure service clients
Centralizes client initialization and configuration
"""

import os
import logging
import threading
from typing import Optional
import openai
from azure.ai.vision.imageanalysis import ImageAnalysisClient
from azure.core.credentials import AzureKeyCredential
import azure.cosmos as cosmos
from azure.cosmos import ContainerProxy
import stripe


class ClientManager:
    """
    Singleton class for managing all Azure service clients

    Provides centralized client initialization, configuration checks,
    and consistent error handling across all Azure Functions.
    """

    _instance: Optional["ClientManager"] = None
    _initialized: bool = False
    _lock = threading.Lock()

    def __new__(cls):
        """Ensure only one instance exists (Singleton pattern with thread-safe double-checked locking)"""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        """Initialize clients only once (thread-safe with double-checked locking)"""
        if not ClientManager._initialized:
            with ClientManager._lock:
                if not ClientManager._initialized:
                    self._init_clients()
                    ClientManager._initialized = True

    def _init_clients(self):
        """Initialize all service clients from environment variables

        Security: Secrets are read into local variables, used immediately
        to initialize clients, then cleared. Only client objects are stored
        on the instance, never raw secrets.
        """
        # Non-sensitive configuration (safe to store)
        self.azure_openai_endpoint = os.environ.get("AZURE_OPENAI_ENDPOINT")
        self.azure_openai_deployment = os.environ.get(
            "AZURE_OPENAI_DEPLOYMENT", "gpt-35-turbo"
        )
        self.azure_openai_api_version = os.environ.get(
            "AZURE_OPENAI_API_VERSION",
            os.environ.get("OPENAI_API_VERSION", "2024-02-15-preview"),
        )
        self.azure_vision_endpoint = os.environ.get("AZURE_VISION_ENDPOINT")
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

        # Initialize OpenAI client (read secret, use, then clear)
        self.openai_client = None
        if self.azure_openai_endpoint:
            azure_openai_key = os.environ.get("AZURE_OPENAI_KEY")
            if azure_openai_key:
                try:
                    self.openai_client = openai.AzureOpenAI(
                        azure_endpoint=self.azure_openai_endpoint,
                        api_key=azure_openai_key,
                        api_version=self.azure_openai_api_version,
                    )
                    logging.info("OpenAI client initialized successfully")
                except Exception as e:
                    logging.error(f"Failed to initialize OpenAI client: {e}")
                # Note: Local variable clearing (setting to None/del) provides no real
                # memory-security benefit. The secret remains in os.environ and may be
                # referenced by client objects. Secrets are managed via environment
                # variables and Azure Key Vault for production security.

        # Initialize Vision client (read secret, use, then clear)
        self.vision_client = None
        if self.azure_vision_endpoint:
            azure_vision_key = os.environ.get("AZURE_VISION_KEY")
            if azure_vision_key:
                try:
                    self.vision_client = ImageAnalysisClient(
                        endpoint=self.azure_vision_endpoint,
                        credential=AzureKeyCredential(azure_vision_key),
                    )
                    logging.info("Vision client initialized successfully")
                except Exception as e:
                    logging.error(f"Failed to initialize Vision client: {e}")
                # Note: Local variable clearing (setting to None/del) provides no real
                # memory-security benefit. The secret remains in os.environ and may be
                # referenced by client objects. Secrets are managed via environment
                # variables and Azure Key Vault for production security.

        # Initialize Cosmos DB clients (read secret, use, then clear)
        self.cosmos_client = None
        self.database = None
        self.contacts_container = None
        self.demos_container = None
        self.conversations_container = None
        self.containers = None

        cosmos_connection_string = os.environ.get("COSMOS_CONNECTION_STRING")
        if cosmos_connection_string:
            try:
                self.cosmos_client = cosmos.CosmosClient.from_connection_string(
                    cosmos_connection_string
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
                # Create containers mapping once for efficient lookups
                self.containers = {
                    "contacts": self.contacts_container,
                    "demos": self.demos_container,
                    "conversations": self.conversations_container,
                }
                logging.info("Cosmos DB clients initialized successfully")
            except Exception as e:
                logging.error(f"Failed to initialize Cosmos DB clients: {e}")
            # Note: Local variable clearing (setting to None/del) provides no real
            # memory-security benefit. The secret remains in os.environ and may be
            # referenced by client objects. Secrets are managed via environment
            # variables and Azure Key Vault for production security.

        # Initialize Stripe configuration flag (secret not stored on instance)
        stripe_secret_key = os.environ.get("STRIPE_SECRET_KEY")
        self._stripe_configured = bool(stripe_secret_key)
        # Note: stripe.api_key is set lazily when Stripe operations are needed
        # to avoid storing the secret. The secret is retrieved from environment
        # at call time via ensure_stripe_ready()
        if self._stripe_configured:
            logging.info(
                "Stripe configuration detected (secret available in environment)"
            )
        # Note: Local variable clearing (setting to None/del) provides no real
        # memory-security benefit. The secret remains in os.environ and may be
        # referenced by client objects. Secrets are managed via environment
        # variables and Azure Key Vault for production security.

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
        zoho_email = os.environ.get("ZOHO_EMAIL")
        zoho_password = os.environ.get("ZOHO_PASSWORD")
        is_configured = bool(zoho_email and zoho_password)
        # Clear local variables
        zoho_email = None
        zoho_password = None
        del zoho_email, zoho_password
        return is_configured

    def get_zoho_email(self) -> Optional[str]:
        """
        Get Zoho email from environment (read on-demand, not stored)

        Returns:
            Zoho email address or None if not configured
        """
        return os.environ.get("ZOHO_EMAIL")

    def get_zoho_password(self) -> Optional[str]:
        """
        Get Zoho password from environment (read on-demand, not stored)

        Returns:
            Zoho password or None if not configured

        Security: This method reads the password from environment on each call.
        The password is never stored as an instance attribute.
        """
        return os.environ.get("ZOHO_PASSWORD")

    def is_stripe_configured(self) -> bool:
        """Check if Stripe is properly configured"""
        return getattr(self, "_stripe_configured", False)

    def ensure_stripe_ready(self):
        """
        Ensure Stripe API key is set from environment (lazy initialization).

        Call this method before performing any Stripe operations to ensure
        the API key is set from environment variables.

        Security: Secret is read from environment at call time, never stored on instance.

        Raises:
            ValueError: If Stripe is not configured
        """
        if not self.is_stripe_configured():
            raise ValueError("Stripe is not configured")
        stripe_secret_key = os.environ.get("STRIPE_SECRET_KEY")
        if stripe_secret_key and stripe.api_key != stripe_secret_key:
            stripe.api_key = stripe_secret_key

    # Client getter methods
    def get_openai_client(self) -> openai.AzureOpenAI:
        """Get OpenAI client (raises error if not configured)"""
        if not self.is_openai_configured():
            raise ValueError("OpenAI client not configured")
        return self.openai_client

    def get_vision_client(self) -> ImageAnalysisClient:
        """Get Vision client (raises error if not configured)"""
        if not self.is_vision_configured():
            raise ValueError("Vision client not configured")
        return self.vision_client

    def get_cosmos_container(self, container_type: str) -> ContainerProxy:
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

        # Ensure containers mapping exists (lazy initialization if needed)
        if not hasattr(self, "containers") or self.containers is None:
            self.containers = {
                "contacts": self.contacts_container,
                "demos": self.demos_container,
                "conversations": self.conversations_container,
            }

        if container_type not in self.containers:
            raise ValueError(f"Invalid container type: {container_type}")

        return self.containers[container_type]
