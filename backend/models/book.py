from . import db
from sqlalchemy import func

class Book(db.Model):
    __tablename__ = 'books'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(200), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    description = db.Column(db.Text)
    cover_page_id = db.Column(db.Integer, db.ForeignKey("pages.id"), nullable=True)
    cover_thumbnail_url = db.Column(db.String(500), nullable=True) # Cover will be renderd when book.is_published = True or when Cover changes
    is_published = db.Column(db.Boolean, default=False)
    recommended_age = db.Column(db.Integer)

    # Timestamps (from Neon server)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship
    author = db.relationship('User', back_populates="books")
    chapters = db.relationship("Chapter", back_populates="book", cascade="all, delete-orphan",
        order_by="Chapter.order_index"
    )
    reading_progresses = db.relationship("ReadingProgress", back_populates="book", cascade="all, delete-orphan")
    character_templates = db.relationship('BookCharacterTemplate', back_populates="book", cascade="all, delete-orphan")
    personalization = db.relationship('Personalization', back_populates="book", cascade="all, delete-orphan")

    @property
    def author_name(self):
        return self.author.full_name
