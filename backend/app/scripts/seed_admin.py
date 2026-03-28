import asyncio
import uuid
from sqlalchemy import select
from app.infrastructure.database.session import AsyncSessionFactory
from app.infrastructure.database.models import UserModel, RoleModel
from app.infrastructure.security.jwt import hash_password
from app.domain.enums import UserRole

async def seed_admin():
    async with AsyncSessionFactory() as db:
        # 1. Ensure 'admin' role exists
        admin_role_stmt = select(RoleModel).where(RoleModel.name == UserRole.ADMIN.value)
        result = await db.execute(admin_role_stmt)
        admin_role = result.scalar_one_or_none()
        
        if not admin_role:
            admin_role = RoleModel(name=UserRole.ADMIN.value)
            db.add(admin_role)
            await db.flush()
            print(f"Role '{UserRole.ADMIN.value}' created.")
        
        # 2. Check if admin user exists
        admin_email = "admin@dlms.edu.vn"
        admin_user_stmt = select(UserModel).where(UserModel.email == admin_email)
        result = await db.execute(admin_user_stmt)
        admin_user = result.scalar_one_or_none()
        
        if not admin_user:
            admin_user = UserModel(
                id=uuid.uuid4(),
                email=admin_email,
                hashed_password=hash_password("adminpassword123"),
                full_name="System Administrator",
                is_active=True,
                role_id=admin_role.id
            )
            db.add(admin_user)
            await db.commit()
            print(f"Admin user '{admin_email}' created with password 'adminpassword123'.")
        else:
            print(f"Admin user '{admin_email}' already exists.")

if __name__ == "__main__":
    asyncio.run(seed_admin())
