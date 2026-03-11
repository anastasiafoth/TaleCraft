from . import db

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