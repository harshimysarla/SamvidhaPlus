from typing import Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.integrations.base_provider import AcademicDataProvider
from app.integrations.demo_provider import DemoDataProvider
from app.integrations.authorized_import_provider import AuthorizedImportProvider
from app.integrations.official_api_provider import OfficialApiProvider

def get_academic_data_provider(db: Optional[Session] = None) -> AcademicDataProvider:
    """
    Factory function returning the active academic data provider based on configuration.
    Defaults to DemoDataProvider if Official API credentials are not verified.
    """
    active = settings.ACTIVE_DATA_PROVIDER
    if active == "Official API":
        official = OfficialApiProvider()
        if official.is_live_integration:
            return official
        # Graceful fallback to Authorized Import or Demo Data if official not verified
        if db:
            return AuthorizedImportProvider(db)
        return DemoDataProvider()
    elif active == "Authorized Import" and db is not None:
        return AuthorizedImportProvider(db)
    else:
        return DemoDataProvider()

__all__ = [
    "AcademicDataProvider",
    "DemoDataProvider",
    "AuthorizedImportProvider",
    "OfficialApiProvider",
    "get_academic_data_provider"
]
