from . import db

class R2File(db.Model):
    __tablename__ = 'r2_files'
    id = db.Column(db.Integer, primary_key=True)
    object_key = db.Column(db.String, nullable=False)
    file_url = db.Column(db.String, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)