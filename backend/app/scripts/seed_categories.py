import asyncio
import uuid
from sqlalchemy import select
from app.infrastructure.database.session import AsyncSessionFactory
from app.infrastructure.database.models import CategoryModel


CATEGORIES = [
    {"name": "Công nghệ thông tin", "description": "Tài liệu về lập trình, mạng máy tính, AI, dữ liệu..."},
    {"name": "Toán học", "description": "Giáo trình toán cao cấp, xác suất thống kê, toán rời rạc..."},
    {"name": "Kinh tế", "description": "Quản trị kinh doanh, marketing, tài chính ngân hàng..."},
    {"name": "Ngoại ngữ", "description": "Tài liệu học tiếng Anh, Nhật, Hàn, Trung..."},
    {"name": "Kỹ năng mềm", "description": "Giao tiếp, làm việc nhóm, quản lý thời gian..."},
]

async def seed_categories():
    async with AsyncSessionFactory() as db:
        for cat_data in CATEGORIES:
            stmt = select(CategoryModel).where(CategoryModel.name == cat_data["name"])
            result = await db.execute(stmt)
            existing = result.scalar_one_or_none()
            
            if not existing:
                category = CategoryModel(
                    id=uuid.uuid4(),
                    name=cat_data["name"],
                    description=cat_data["description"]
                )
                db.add(category)
                print(f"Category '{cat_data['name']}' created.")
            else:
                print(f"Category '{cat_data['name']}' already exists.")
        
        await db.commit()
        print("Category seeding completed.")

if __name__ == "__main__":
    asyncio.run(seed_categories())
