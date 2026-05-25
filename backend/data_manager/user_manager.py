from models import db, User
import re
from flask_mail import Message
import threading
from flask import current_app

class UserManager:
    @staticmethod
    def is_valid_email(email):
        pattern = r'^[^@\s]+@[^@\s]+\.[^@\s]+$'
        return re.match(pattern, email) is not None

    @staticmethod
    def create_user(guard, data, mail):
        """Adds a new user to database"""
        if not data:
            raise ValueError("Please enter information.")

        raw_password = data.get("password")
        first_name = data.get("first_name")
        last_name = data.get("last_name")
        email = data.get("email")
        role = data.get("role")

        # VALIDATION
        if not first_name:
            raise ValueError("Please enter a first name.")

        if not last_name:
            raise ValueError("Please enter a last name.")

        if not role:
            raise ValueError("Please enter a role.")

        if not raw_password:
            raise ValueError("Please enter a password.")

        # EMAIL VALIDATION
        if not email:
            raise ValueError("Please enter an email.")

        if not UserManager.is_valid_email(email):
            raise ValueError("Please enter a valid email.")

        # Normalize email
        email = email.strip().lower()

        # Check if email already exists
        existing_user = User.query.filter_by(email=email).first()

        if existing_user:
            raise ValueError("Email already exists.")

        # Hash password AFTER validation
        password = guard.hash_password(raw_password)

        # Create user
        new_user = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            role=role,
            password_hash=password
        )

        db.session.add(new_user)
        db.session.commit()

        # SEND EMAIL ASYNC
        user_id = new_user.id
        user_first_name = new_user.first_name
        user_last_name = new_user.last_name
        user_email = new_user.email
        user_role = new_user.role

        # Store real app object BEFORE thread starts
        app = current_app._get_current_object()

        def send_email(app):
            with app.app_context():
                try:
                    msg = Message(
                        subject="Welcome",
                        recipients=[user_email],
                        html="<b>Welcome!</b>"
                    )
                    print("Sending email...")
                    mail.send(msg)
                    print("Email sent!")

                except Exception as e:
                    print(f"Mail send failed: {e}")

        threading.Thread(
            target=send_email,
            args=(app,)
        ).start()

        return {
            "id": user_id,
            "first_name": user_first_name,
            "last_name": user_last_name,
            "email": user_email,
            "role": user_role
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


