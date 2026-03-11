from models import db, User
import re

class UserManager:
    @staticmethod
    def is_valid_email(email):
        pattern = r'^[^@\s]+@[^@\s]+\.[^@\s]+$'
        return re.match(pattern, email) is not None

    @staticmethod
    def create_user(first_name, last_name, email, role, password):
        """Adds a new user to database"""

        if not first_name:
            raise ValueError("Please enter a first name.")
        if not last_name:
            raise ValueError("Please enter a last name.")
        if not role:
            raise ValueError("Please enter a role.")
        if not password:
            raise ValueError("Please enter a password.")

        # Checks if valid email with Regex
        if not email:
            raise ValueError("Please enter an email.")
        if not UserManager.is_valid_email(email):
            raise ValueError("Please enter a valid email.")

        # Converts email and checks if it already exists in the db
        email = email.strip().lower()
        existing_user = User.query.filter_by(email=email).first()

        if existing_user:
            raise ValueError("Email already exists.")

        # Adds new user
        new_user = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            role=role,
            password_hash=password
        )
        db.session.add(new_user)
        db.session.commit()

        return {
                "id": new_user.id,
                "first_name": new_user.first_name,
                "last_name": new_user.last_name,
                "email": new_user.email,
                "role": new_user.role
                }

    @staticmethod
    def get_user_by_id(user_id):
        current_user = User.query.filter_by(id=user_id).first()

        return {
                "first_name": current_user.first_name,
                "last_name": current_user.last_name,
                "email": current_user.email,
                "role": current_user.role
                }

    @staticmethod
    def update_user(user_id, data):
        user = db.session.get(User, user_id)

        if not user:
            raise ValueError("User not found")

        if "first_name" in data:
            user.first_name = data["first_name"]

        if "last_name" in data:
            user.last_name = data["last_name"]

        if "is_active" in data:
            user.is_active = data["is_active"]

        db.session.commit()

        return {
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_active": user.is_active
        }


