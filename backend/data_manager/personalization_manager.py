from models import db, Book, BookCharacterTemplate, Personalization, PersonalizationCharacters

class PersonalizationManager:
    @staticmethod
    def get_all_personalizations(parent_id):
        personalizations = Personalization.query.filter_by(
            parent_id=parent_id
        ).all()

        all_personalizations = []

        for p in personalizations:
            all_personalizations.append({
                "id": p.id,
                "parent_id": p.parent_id,
                "book_id": p.book_id,
                "created_at": p.created_at,
                "updated_at": p.updated_at,
            })

        return all_personalizations

    @staticmethod
    def create_personalization(book_id, parent_id):
        # check if book exists
        book = Book.query.filter_by(id=book_id).first()

        if not book:
            raise ValueError("Book not found")

        personalization = Personalization(
            parent_id=parent_id,
            book_id=book.id
        )

        db.session.add(personalization)
        db.session.flush() # so we get personalization.id before commit

        # copies all character templates for this book
        templates = BookCharacterTemplate.query.filter_by(
            book_id=book_id
        ).all()

        # all Characters are copied, even the not customizable ones, since they are needed in the rendering
        for template in templates:
            character = PersonalizationCharacters(
                personalization_id=personalization.id,
                template_id=template.id,
                role=template.role,
                name=template.default_name,
                gender=template.default_gender,
                main_color=template.default_main_color,
                hair_color=template.default_hair_color,
                clothing=template.default_clothing,
                glasses=template.default_glasses,
                extra_attributes=template.extra_attributes,
                customizable=template.customizable
            )
            db.session.add(character)

        db.session.commit()

        return {
            "id": personalization.id,
            "parent_id": personalization.parent_id,
            "book_id": personalization.book_id,
            "created_at": personalization.created_at,
            "updated_at": personalization.updated_at,
        }

    @staticmethod
    def get_personalization(personalization_id, parent_id):
        personalization = Personalization.query.filter_by(
            id=personalization_id,
            parent_id=parent_id
        ).first()

        if not personalization:
            raise ValueError("Personalization not found or not authorized")

        return {
            "id": personalization.id,
            "parent_id": personalization.parent_id,
            "book_id": personalization.book_id,
            "created_at": personalization.created_at,
            "updated_at": personalization.updated_at,
        }

    @staticmethod
    def delete_personalization(personalization_id, parent_id):
        personalization = Personalization.query.filter_by(
            id=personalization_id,
            parent_id=parent_id
        ).first()

        if not personalization:
            raise ValueError("Personalization not found or not authorized")

        # if personalization is getting deleted, so will be the personalized characters
        PersonalizationCharacters.query.filter_by(
            personalization_id=personalization.id
        ).delete()

        db.session.delete(personalization)
        db.session.commit()

        return True