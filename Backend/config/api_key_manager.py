import json
import os
from pathlib import Path
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class ApiKeyManager:
    """
    Utility class for managing API keys securely
    """
    def __init__(self):
        self.config_dir = Path(__file__).parent
        self.secrets_path = self.config_dir / "secrets.json"
        self.env_prefix = "SOUNDSCAPE_"
        self._secrets_cache: Optional[Dict[str, Any]] = None

    def get_api_key(self, service: str, key_name: str = "api_key") -> str:
        """
        Get an API key for the specified service. Prioritizes environment variables
        over config files for security best practices.
        
        Args:
            service: The service name (e.g., 'grok', 'openai')
            key_name: The key name within the service config (default: 'api_key')
            
        Returns:
            The API key as a string
            
        Raises:
            ValueError: If the API key cannot be found
        """
        # Check environment variables first (most secure option)
        env_var_name = f"{self.env_prefix}{service.upper()}_{key_name.upper()}"
        api_key = os.environ.get(env_var_name)
        
        if api_key:
            logger.debug(f"Using {service} API key from environment variable")
            return api_key
        
        # Fall back to config file if environment variable not set
        try:
            secrets = self._load_secrets()
            if service in secrets and key_name in secrets[service]:
                logger.debug(f"Using {service} API key from secrets file")
                return secrets[service][key_name]
        except (FileNotFoundError, json.JSONDecodeError, KeyError) as e:
            logger.warning(f"Error loading API key from secrets file: {e}")
        
        raise ValueError(f"Could not find API key for {service}.{key_name}. "
                        f"Please set the {env_var_name} environment variable or add it to the secrets.json file.")

    def _load_secrets(self) -> Dict[str, Any]:
        """Load secrets from the JSON file"""
        if self._secrets_cache is None:
            if not self.secrets_path.exists():
                raise FileNotFoundError(f"Secrets file not found at {self.secrets_path}")
            
            with open(self.secrets_path, 'r') as f:
                self._secrets_cache = json.load(f)
                
        return self._secrets_cache

# Singleton instance for application-wide use
api_key_manager = ApiKeyManager()