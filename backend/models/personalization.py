from . import db
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import JSONB

class Personalization(db.Model):
    __tablename__ = 'personalizations'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
    # Timestamps (from Neon server)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    parent = db.relationship('User', back_populates='personalizations')
    book = db.relationship('Book', back_populates='personalization')
    personalization_characters = db.relationship("PersonalizationCharacters", back_populates="personalization",
        cascade="all, delete-orphan")
    reading_progresses = db.relationship("ReadingProgress", back_populates="personalization", cascade="all, delete-orphan")

    def to_dict(self, include_book=False, include_characters=False):
        data = {
            "id": self.id,
            "parent_id": self.parent_id,
            "book_id": self.book_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

        if include_book:
            data["book"] = {
                "id": self.book.id,
                "title": self.book.title,
                "cover_thumbnail_url": self.book.cover_thumbnail_url,
                "recommended_age": self.book.recommended_age,
            }

        if include_characters:
            data["characters"] = [c.to_dict() for c in self.personalization_characters]

        return data


class PersonalizationCharacters(db.Model):
    __tablename__ = 'personalization_characters'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    personalization_id = db.Column(db.Integer, db.ForeignKey('personalizations.id'), nullable=False)
    template_id = db.Column(db.Integer, db.ForeignKey('book_character_templates.id'), nullable=False)
    role = db.Column(db.String(200), nullable=False) # example: "main", "friend", "pet"
    name = db.Column(db.String(200), nullable=False)
    gender = db.Column(db.String(200), nullable=False) # "male"/"female"
    main_color = db.Column(db.String(200), nullable=False) # skin or fur_color
    hair_color = db.Column(db.String(200))
    clothing = db.Column(JSONB) # only different color options, nullable because animals
    glasses = db.Column(db.Boolean, default=False)
    extra_attributes = db.Column(JSONB) # hair_style etc.
    customizable = db.Column(db.Boolean, nullable=False)

    # Relationship
    template = db.relationship('BookCharacterTemplate', back_populates="personalization_characters")
    personalization = db.relationship( "Personalization", back_populates="personalization_characters")

    def to_dict(self):
        return {
            "id": self.id,
            "personalization_id": self.personalization_id,
            "template_id": self.template_id,
            "role": self.role,
            "name": self.name,
            "gender": self.gender,
            "main_color": self.main_color,
            "hair_color": self.hair_color,
            "clothing": self.clothing,
            "glasses": self.glasses,
            "extra_attributes": self.extra_attributes,
            "customizable": self.customizable,
        }
