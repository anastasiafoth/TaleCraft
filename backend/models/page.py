from . import db
from sqlalchemy.dialects.postgresql import JSONB

class Page(db.Model):
    __tablename__ = 'pages'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapters.id'), nullable=False)
    order_index = db.Column(db.Integer, nullable=False)
    layout_data = db.Column(JSONB)
    is_cover = db.Column(db.Boolean, nullable=False, default=False)

    # Relationships
    chapter = db.relationship( 'Chapter', back_populates='pages')
    reading_progresses = db.relationship("ReadingProgress", back_populates="current_page", cascade="all, delete-orphan")

    def next_page(self):
        return Page.query.filter_by(chapter_id=self.chapter_id) \
            .filter(Page.order_index > self.order_index) \
            .order_by(Page.order_index).first()

    def previous_page(self):
        return Page.query.filter_by(chapter_id=self.chapter_id) \
            .filter(Page.order_index < self.order_index) \
            .order_by(Page.order_index.desc()).first()

    # For deactivating buttons "Next"/"Back" if first or last page
    @property
    def is_first_page(self):
        return self.previous_page() is None

    @property
    def is_last_page(self):
        return self.next_page() is None
