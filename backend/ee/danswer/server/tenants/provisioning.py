import asyncio
import logging
import uuid

import aiohttp  # Async HTTP client
from fastapi import HTTPException
from sqlalchemy.orm import Session

from danswer.auth.users import exceptions
from danswer.configs.app_configs import CONTROL_PLANE_API_BASE_URL
from danswer.configs.app_configs import EXPECTED_API_KEY
from danswer.db.engine import get_session_with_tenant
from danswer.db.engine import get_sqlalchemy_engine
from danswer.db.llm import upsert_cloud_embedding_provider
from danswer.db.llm import upsert_llm_provider
from danswer.db.models import UserTenantMapping
from danswer.server.manage.embedding.models import CloudEmbeddingProviderCreationRequest
from danswer.server.manage.llm.models import LLMProviderUpsertRequest
from danswer.setup import setup_danswer
from ee.danswer.configs.app_configs import ANTHROPIC_DEFAULT_API_KEY
from ee.danswer.configs.app_configs import COHERE_DEFAULT_API_KEY
from ee.danswer.configs.app_configs import OPENAI_DEFAULT_API_KEY
from ee.danswer.server.tenants.schema_management import create_schema_if_not_exists
from ee.danswer.server.tenants.schema_management import drop_schema
from ee.danswer.server.tenants.schema_management import run_alembic_migrations
from ee.danswer.server.tenants.user_mapping import add_users_to_tenant
from ee.danswer.server.tenants.user_mapping import get_tenant_id_for_email
from ee.danswer.server.tenants.user_mapping import user_owns_a_tenant
from shared_configs.configs import MULTI_TENANT
from shared_configs.configs import POSTGRES_DEFAULT_SCHEMA
from shared_configs.configs import TENANT_ID_PREFIX
from shared_configs.contextvars import CURRENT_TENANT_ID_CONTEXTVAR
from shared_configs.enums import EmbeddingProvider

logger = logging.getLogger(__name__)


async def get_or_create_tenant_id(email: str) -> str:
    """Get existing tenant ID for an email or create a new tenant if none exists."""
    if not MULTI_TENANT:
        return POSTGRES_DEFAULT_SCHEMA

    try:
        tenant_id = get_tenant_id_for_email(email)
    except exceptions.UserNotExists:
        # If tenant does not exist and in Multi tenant mode, provision a new tenant
        try:
            tenant_id = await create_tenant(email)
        except Exception as e:
            logger.error(f"Tenant provisioning failed: {e}")
            raise HTTPException(status_code=500, detail="Failed to provision tenant.")

    if not tenant_id:
        raise HTTPException(
            status_code=401, detail="User does not belong to an organization"
        )

    return tenant_id


async def create_tenant(email: str) -> str:
    tenant_id = TENANT_ID_PREFIX + str(uuid.uuid4())
    try:
        # Provision tenant on data plane
        await provision_tenant(tenant_id, email)
        # Notify control plane
        await notify_control_plane(tenant_id, email)
    except Exception as e:
        logger.error(f"Tenant provisioning failed: {e}")
        await rollback_tenant_provisioning(tenant_id)
        raise HTTPException(status_code=500, detail="Failed to provision tenant.")
    return tenant_id


async def provision_tenant(tenant_id: str, email: str) -> None:
    if not MULTI_TENANT:
        raise HTTPException(status_code=403, detail="Multi-tenancy is not enabled")

    if user_owns_a_tenant(email):
        raise HTTPException(
            status_code=409, detail="User already belongs to an organization"
        )

    logger.info(f"Provisioning tenant: {tenant_id}")
    token = None

    try:
        if not create_schema_if_not_exists(tenant_id):
            logger.info(f"Created schema for tenant {tenant_id}")
        else:
            logger.info(f"Schema already exists for tenant {tenant_id}")

        token = CURRENT_TENANT_ID_CONTEXTVAR.set(tenant_id)

        # Await the Alembic migrations
        await asyncio.to_thread(run_alembic_migrations, tenant_id)

        with get_session_with_tenant(tenant_id) as db_session:
            setup_danswer(db_session, tenant_id)
            configure_default_api_keys(db_session)

        add_users_to_tenant([email], tenant_id)

    except Exception as e:
        logger.exception(f"Failed to create tenant {tenant_id}")
        raise HTTPException(
            status_code=500, detail=f"Failed to create tenant: {str(e)}"
        )
    finally:
        if token is not None:
            CURRENT_TENANT_ID_CONTEXTVAR.reset(token)


async def notify_control_plane(tenant_id: str, email: str) -> None:
    headers = {
        "Authorization": f"Bearer {EXPECTED_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {"tenant_id": tenant_id, "email": email}

    async with aiohttp.ClientSession() as session:
        async with session.post(
            f"{CONTROL_PLANE_API_BASE_URL}/tenants/create",
            headers=headers,
            json=payload,
        ) as response:
            if response.status != 200:
                error_text = await response.text()
                logger.error(f"Control plane tenant creation failed: {error_text}")
                raise Exception(
                    f"Failed to create tenant on control plane: {error_text}"
                )


async def rollback_tenant_provisioning(tenant_id: str) -> None:
    # Logic to rollback tenant provisioning on data plane
    logger.info(f"Rolling back tenant provisioning for tenant_id: {tenant_id}")
    try:
        # Drop the tenant's schema to rollback provisioning
        drop_schema(tenant_id)
        # Remove tenant mapping
        with Session(get_sqlalchemy_engine()) as db_session:
            db_session.query(UserTenantMapping).filter(
                UserTenantMapping.tenant_id == tenant_id
            ).delete()
            db_session.commit()
    except Exception as e:
        logger.error(f"Failed to rollback tenant provisioning: {e}")


def configure_default_api_keys(db_session: Session) -> None:
    open_provider = LLMProviderUpsertRequest(
        name="OpenAI",
        provider="OpenAI",
        api_key=OPENAI_DEFAULT_API_KEY,
        default_model_name="gpt-4o",
    )
    anthropic_provider = LLMProviderUpsertRequest(
        name="Anthropic",
        provider="Anthropic",
        api_key=ANTHROPIC_DEFAULT_API_KEY,
        default_model_name="claude-3-5-sonnet-20240620",
    )
    upsert_llm_provider(open_provider, db_session)
    upsert_llm_provider(anthropic_provider, db_session)

    cloud_embedding_provider = CloudEmbeddingProviderCreationRequest(
        provider_type=EmbeddingProvider.COHERE,
        api_key=COHERE_DEFAULT_API_KEY,
    )
    upsert_cloud_embedding_provider(db_session, cloud_embedding_provider)
