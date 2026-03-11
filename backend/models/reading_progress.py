from . import db

class ReadingProgress(db.Model):
    __tablename__ = 'reading_progresses'
    __table_args__ = (db.UniqueConstraint('book_id', 'child_id'),) # only one reading progress per child
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
    child_id = db.Column(db.Integer, db.ForeignKey('children.id'), nullable=False)
    current_page_id = db.Column(db.Integer, db.ForeignKey('pages.id'), nullable=False)

    # Relationships
    book = db.relationship('Book', back_populates="reading_progresses")
    child = db.relationship('Child', back_populates="reading_progresses")
    current_page = db.relationship('Page', back_populates="reading_progresses")
