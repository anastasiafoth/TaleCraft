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
