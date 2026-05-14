from . import db
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime, timezone

def default_parts():
    return {
        "head": "head_1",
        "hair": "hair_long_1",
        "outfits": "dress_long_1",
        "body": "body_standing_1",
        "glasses": None}

def default_colors():
    return {
        "main": "#f2c6a0",
        "hair": "#3b2f2f"
    }

class BookCharacterTemplate(db.Model):
    __tablename__ = "book_character_templates"
    __table_args__ = (
        db.UniqueConstraint("book_id", "role", name="uq_book_role"),
    )
    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey("books.id"), nullable=False)
    role = db.Column(db.String(200), nullable=False)  # example: "main", "friend", "pet"
    name = db.Column(db.String(200), nullable=False)
    gender = db.Column(db.String(50), nullable=False) # "male"/"female"
    parts = db.Column(JSONB, nullable=False, default=default_parts)
    colors = db.Column(JSONB, nullable=False, default=default_colors)
    customizable = db.Column(db.Boolean, nullable=False, default=True)
    rendered_url = db.Column(db.String(200), nullable=True)
    updated_at = db.Column(
        db.DateTime,
        nullable=True,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    #Relationship
    book = db.relationship('Book', back_populates='character_templates')
    personalization_characters = db.relationship(
        "PersonalizationCharacters", back_populates="template"
    )

    def to_dict(self):

        return {
            "id": self.id,
            "book_id": self.book_id,
            "role": self.role,
            "name": self.name,
            "gender": self.gender,
            "parts": self.parts,
            "colors": self.colors,
            "customizable": self.customizable,
            "rendered_url": self.rendered_url,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
            }

