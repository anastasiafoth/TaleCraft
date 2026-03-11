from . import db

class Chapter(db.Model):
    __tablename__ = 'chapters'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
    title = db.Column(db.Text)
    order_index = db.Column(db.Integer, nullable=False)

    # Relationship
    book = db.relationship("Book", back_populates="chapters")
    # When Chapter Obj gets deleted, so will be all Pages inside Chapter
    pages = db.relationship('Page', back_populates='chapter', cascade='all, delete-orphan')

    def next_chapter(self):
        return Chapter.query.filter_by(book_id=self.book_id) \
            .filter(Chapter.order_index > self.order_index) \
            .order_by(Chapter.order_index).first()

    def previous_chapter(self):
        return Chapter.query.filter_by(book_id=self.book_id) \
            .filter(Chapter.order_index < self.order_index) \
            .order_by(Chapter.order_index.desc()).first()
