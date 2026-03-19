from models import db, Book, BookCharacterTemplate
from sqlalchemy.exc import IntegrityError

class BookCharacterTemplateManager:
    @staticmethod
    def get_all_book_character_templates(book_id, author_id):
        # check if book belongs to author
        book = Book.query.filter_by(id=book_id, author_id=author_id).first()

        if not book:
            raise ValueError("Book not found or not authorized")

        templates = BookCharacterTemplate.query.filter_by(book_id=book_id).all()

        templates_list = []
        for template in templates:
            template_dict = {
                "id": template.id,
                "book_id": template.book_id,
                "role": template.role,
                "default_name": template.default_name,
                "default_gender": template.default_gender,
                "default_main_color": template.default_main_color,
                "default_hair_color": template.default_hair_color,
                "default_clothing": template.default_clothing,
                "default_glasses": template.default_glasses,
                "extra_attributes": template.extra_attributes,
                "customizable": template.customizable
            }
            templates_list.append(template_dict)

        return templates_list

    @staticmethod
    def create_book_character_template(book_id, data, author_id):
        """ Templates are created by author for each book and each character """
        # check if book belongs to author
        book = Book.query.filter_by(id=book_id, author_id=author_id).first()

        if not book:
            raise ValueError("Book not found or not authorized")

        # Converts role
        role_raw = data.get("role")
        # Checks is role is not None, since there will be an error if you use .strip().lower() on None
        if not role_raw:
            raise ValueError("Role is required")
        role = role_raw.strip().lower()

        # Checks if role already exists in the db based on book_id
        existing_role = BookCharacterTemplate.query.filter_by(book_id=book_id, role=role).first()
        if existing_role:
            raise ValueError("Role already exists.")

        new_template = BookCharacterTemplate(
            book_id=book_id,
            role=role,
            default_name=data.get("default_name"),
            default_gender=data.get("default_gender"),
            default_main_color=data.get("default_main_color"),
            default_hair_color=data.get("default_hair_color"),
            default_clothing=data.get("default_clothing"),
            default_glasses=data.get("default_glasses", False),
            extra_attributes=data.get("extra_attributes"),
            customizable=data.get("customizable")
        )

        db.session.add(new_template)

        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            raise ValueError("Role already exists for this book.")

        return {
            "id": new_template.id,
            "book_id": new_template.book_id,
            "role": new_template.role,
            "default_name": new_template.default_name,
            "default_gender": new_template.default_gender,
            "default_main_color": new_template.default_main_color,
            "default_hair_color": new_template.default_hair_color,
            "default_clothing": new_template.default_clothing,
            "default_glasses": new_template.default_glasses,
            "extra_attributes": new_template.extra_attributes,
            "customizable": new_template.customizable
        }

    @staticmethod
    def get_book_character_template(template_id, author_id):
        template = BookCharacterTemplate.query.join(Book).filter(
            BookCharacterTemplate.id == template_id,
            Book.author_id == author_id
        ).first()

        if not template:
            raise ValueError("Template not found or not authorized")

        return {
            "id": template.id,
            "book_id": template.book_id,
            "role": template.role,
            "default_name": template.default_name,
            "default_gender": template.default_gender,
            "default_main_color": template.default_main_color,
            "default_hair_color": template.default_hair_color,
            "default_clothing": template.default_clothing,
            "default_glasses": template.default_glasses,
            "extra_attributes": template.extra_attributes,
            "customizable": template.customizable
        }

    @staticmethod
    def update_book_character_template(template_id, data, author_id):
        template = BookCharacterTemplate.query.join(Book).filter(
            BookCharacterTemplate.id == template_id,
            Book.author_id == author_id
        ).first()

        if not template:
            raise ValueError("Template not found or not authorized")

        if "role" in data:
            template.role = data["role"]

        if "default_name" in data:
            template.default_name = data["default_name"]

        if "default_gender" in data:
            template.default_gender = data["default_gender"]

        if "default_main_color" in data:
            template.default_main_color = data["default_main_color"]

        if "default_hair_color" in data:
            template.default_hair_color = data["default_hair_color"]

        if "default_clothing" in data:
            template.default_clothing = data["default_clothing"]

        if "default_glasses" in data:
            template.default_glasses = data["default_glasses"]

        if "extra_attributes" in data:
            template.extra_attributes = data["extra_attributes"]

        if "customizable" in data:
            template.customizable = data["customizable"]

        db.session.commit()

        return {
            "id": template.id,
            "book_id": template.book_id,
            "role": template.role,
            "default_name": template.default_name,
            "default_gender": template.default_gender,
            "default_main_color": template.default_main_color,
            "default_hair_color": template.default_hair_color,
            "default_clothing": template.default_clothing,
            "default_glasses": template.default_glasses,
            "extra_attributes": template.extra_attributes,
            "customizable": template.customizable
        }

    @staticmethod
    def delete_book_character_template(template_id, author_id):
        template = BookCharacterTemplate.query.join(Book).filter(
            BookCharacterTemplate.id == template_id,
            Book.author_id == author_id
        ).first()

        if not template:
            raise ValueError("Template not found or not authorized")

        db.session.delete(template)
        db.session.commit()

        return {"message": "Template deleted successfully"}