from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
from datetime import date
from sqlalchemy.dialects.postgresql import JSONB

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    role = db.Column(db.String(6), nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    is_active = db.Column(db.Boolean, default=True, server_default='true')

    @classmethod
    def find_by_email(cls, email):
        return cls.query.filter_by(email=email).one_or_none()

    @classmethod
    def lookup(cls, email):
        return cls.find_by_email(email)

    @classmethod
    def identify(cls, user_id):
        return db.session.get(cls, user_id)

    @property
    def identity(self):
        return self.id

    @property
    def rolenames(self):
        return [self.role]

    def is_valid(self):
        return self.is_active

    @property
    def password(self):
        return self.password_hash

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class Child(db.Model):
    __tablename__ = 'children'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    parent_id = db.Column(db.ForeignKey("users.id"))
    first_name = db.Column(db.String(200), nullable=False)
    birthday = db.Column(db.Date(), nullable=False)
    profile_img = db.Column(db.String, nullable=False)

    # Relationship
    parent = db.relationship('User', backref=db.backref('children', lazy=True))

    @property
    def age(self):
        today = date.today()
        age = today.year - self.birthdate.year

        # checks if the birthday was already this year, if not -1 from age
        if (today.month, today.day) < (self.birthdate.month, self.birthdate.day):
            age -= 1

        return age


class Book(db.Model):
    __tablename__ = 'books'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(200), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    description = db.Column(db.Text)
    cover_image_url = db.Column(db.String(500))
    cover_text = db.Column(db.Text)
    is_published = db.Column(db.Boolean, default=False)
    recommended_age = db.Column(db.Integer)

    # Timestamps (from Neon server)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship
    author = db.relationship('User', backref=db.backref('books', lazy=True))

    @property
    def author_name(self):
        return self.author.full_name


class Chapter(db.Model):
    __tablename__ = 'chapters'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
    title = db.Column(db.Text)
    order_index = db.Column(db.Integer, nullable=False)

    # Relationship
    book = db.relationship('Book', backref=db.backref('chapters', lazy=True, order_by="Chapter.order_index"))

    @classmethod
    def get_all_chapters_by_book(cls, book_id):
        return cls.query.filter_by(book_id=book_id) \
            .order_by(cls.order_index).all()

    def next_chapter(self):
        return Chapter.query.filter_by(book_id=self.book_id) \
            .filter(Chapter.order_index > self.order_index) \
            .order_by(Chapter.order_index).first()

    def previous_chapter(self):
        return Chapter.query.filter_by(book_id=self.book_id) \
            .filter(Chapter.order_index < self.order_index) \
            .order_by(Chapter.order_index.desc()).first()


class Page(db.Model):
    __tablename__ = 'pages'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapters.id'), nullable=False)
    order_index = db.Column(db.Integer, nullable=False)
    layout_data = db.Column(JSONB, nullable=True)

    # Relationship
    chapter = db.relationship('Chapter', backref=db.backref('pages', lazy=True, order_by="Page.order_index"))

    @classmethod
    def get_all_pages_by_chapter(cls, chapter_id):
        return cls.query.filter_by(chapter_id=chapter_id) \
            .order_by(cls.order_index).all()

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


class Reading_Process(db.Model):
    __tablename__ = 'pages'


class P(db.Model):
    __tablename__ = 'pages'