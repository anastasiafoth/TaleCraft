from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

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


class Book(db.Model):
    __tablename__ = 'books'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    description = db.Column(db.Text)
    cover_image_url = db.Column(db.String(500))
    cover_text = db.Column(db.Text)
    is_published = db.Column(db.Boolean, default=False)

    # Timestamps (automatisch!)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship
    author = db.relationship('User', backref=db.backref('books', lazy=True))