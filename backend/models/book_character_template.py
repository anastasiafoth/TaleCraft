from . import db
from sqlalchemy.dialects.postgresql import JSONB

class BookCharacterTemplate(db.Model):
    __tablename__ = "book_character_templates"
    __table_args__ = (
        db.UniqueConstraint("book_id", "role", name="uq_book_role"),
    )
    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey("books.id"), nullable=False)
    role = db.Column(db.String(200), nullable=False)  # example: "main", "friend", "pet"
    default_name = db.Column(db.String(200), nullable=False)
    default_gender = db.Column(db.String(50), nullable=False) # "male"/"female"
    default_main_color = db.Column(db.String(200), nullable=False)
    default_hair_color = db.Column(db.String(200))
    default_clothing = db.Column(db.String(200))
    default_glasses = db.Column(db.Boolean, default=False)
    extra_attributes = db.Column(JSONB)
    customizable = db.Column(db.Boolean, nullable=False, default=True)

    #Relationship
    book = db.relationship('Book', back_populates='character_templates')
    personalization_characters = db.relationship(
        "PersonalizationCharacters", back_populates="template"
    )