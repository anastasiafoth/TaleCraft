from models import db, Book, BookCharacterTemplate, Personalization, PersonalizationCharacters

class PersonalizationManager:

    @staticmethod
    def get_all_personalizations(parent_id):
        personalizations = Personalization.query.filter_by(parent_id=parent_id).all()
        return [p.to_dict(include_book=True) for p in personalizations]

    @staticmethod
    def create_personalization(book_id, parent_id):
        book = Book.query.filter_by(id=book_id).first()
        if not book:
            raise ValueError("Book not found")
        if not book.is_published:
            raise ValueError("Book is not published yet.")

        personalization = Personalization(parent_id=parent_id, book_id=book.id)
        db.session.add(personalization)
        db.session.flush()  # so we get personalization.id before commit

        templates = BookCharacterTemplate.query.filter_by(book_id=book_id).all()

        for template in templates:
            character = PersonalizationCharacters.from_template(
                template=template,
                personalization_id=personalization.id
            )
            db.session.add(character)

        db.session.commit()
        return personalization.to_dict()

    @staticmethod
    def get_personalization(personalization_id, parent_id):
        personalization = Personalization.query.filter_by(
            id=personalization_id,
            parent_id=parent_id
        ).first()

        if not personalization:
            raise ValueError("Personalization not found or not authorized")

        return personalization.to_dict(include_book=True, include_characters=True)

    @staticmethod
    def delete_personalization(personalization_id, parent_id):
        personalization = Personalization.query.filter_by(
            id=personalization_id,
            parent_id=parent_id
        ).first()

        if not personalization:
            raise ValueError("Personalization not found or not authorized")

        db.session.delete(personalization)
        db.session.commit()
        return {"message": "Personalization deleted successfully"}