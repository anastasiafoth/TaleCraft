from . import db
from datetime import date

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

