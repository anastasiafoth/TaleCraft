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

    # Relationship
    personalizations = db.relationship('Personalization', back_populates='parent', cascade="all, delete-orphan")
    books = db.relationship("Book", back_populates="author")

    # Can be changed, since we never delete a User, so children will also never be deleted
    children = db.relationship('Child', back_populates='parent', cascade="all, delete-orphan")


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
    birthdate = db.Column(db.Date(), nullable=False)
    profile_img = db.Column(db.String)

    # Relationship
    parent = db.relationship('User', back_populates='children')
    reading_progresses = db.relationship("ReadingProgress", back_populates="child", cascade="all, delete-orphan")

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
    clothing = db.Column(db.String(200)) # only different color options, nullable because animals
    glasses = db.Column(db.Boolean, default=False)
    extra_attributes = db.Column(JSONB) # hair_style etc.
    customizable = db.Column(db.Boolean, nullable=False)

    # Relationship
    template = db.relationship('BookCharacterTemplate', back_populates="personalization_characters")
    personalization = db.relationship( "Personalization", back_populates="personalization_characters")


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
