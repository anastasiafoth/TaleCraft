from models import db, Book, BookCharacterTemplate
from sqlalchemy.exc import IntegrityError

class BookCharacterTemplateManager:

    @staticmethod
    def get_all_book_character_templates(book_id, author_id):
        book = Book.query.filter_by(id=book_id, author_id=author_id).first()
        if not book:
            raise ValueError("Book not found or not authorized")

        templates = BookCharacterTemplate.query.filter_by(book_id=book_id).all()
        return [template.to_dict() for template in templates]

    @staticmethod
    def create_book_character_template(book_id, data, author_id):
        """Templates are created by author for each book and each character."""
        book = Book.query.filter_by(id=book_id, author_id=author_id).first()
        if not book:
            raise ValueError("Book not found or not authorized")

        role_raw = data.get("role")
        if not role_raw:
            raise ValueError("Role is required")
        role = role_raw.strip().lower()

        existing_role = BookCharacterTemplate.query.filter_by(book_id=book_id, role=role).first()
        if existing_role:
            raise ValueError("Role already exists.")

        new_template = BookCharacterTemplate(
            book_id=book_id,
            role=role,
            name=data.get("name"),
            gender=data.get("gender"),
            parts=data.get("parts"),
            colors=data.get("colors"),
            customizable=data.get("customizable", True),
        )

        db.session.add(new_template)

        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            raise ValueError("Role already exists for this book.")

        return new_template.to_dict()

    @staticmethod
    def get_book_character_template(template_id, author_id):
        template = BookCharacterTemplate.query.join(Book).filter(
            BookCharacterTemplate.id == template_id,
            Book.author_id == author_id
        ).first()

        if not template:
            raise ValueError("Template not found or not authorized")

        return template.to_dict()

    @staticmethod
    def update_book_character_template(template_id, data, author_id):
        template = BookCharacterTemplate.query.join(Book).filter(
            BookCharacterTemplate.id == template_id,
            Book.author_id == author_id
        ).first()

        if not template:
            raise ValueError("Template not found or not authorized")

        updatable_fields = ["role", "name", "gender", "parts", "colors", "customizable", "rendered_url"]
        for field in updatable_fields:
            if field in data:
                setattr(template, field, data[field])

        db.session.commit()
        return template.to_dict()

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