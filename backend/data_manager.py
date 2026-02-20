from models import db, User, Child, Book, Chapter, Page
import flask_praetorian
from sqlalchemy import func
from datetime import datetime

guard = flask_praetorian.Praetorian()

class UserManager:
    @staticmethod
    def create_user(first_name, last_name, email, role, password):
        """Adds a new user to database"""
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
        current_user = User.query.filter_by(user_id=user_id)

        return {
                "id": current_user.id,
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
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_active": user.is_active
        }



class ChildManager:
    @staticmethod
    def get_all_children(parent_id):
        all_children = Child.query.filter_by(parent_id=parent_id).all()

        # serialize objects
        children_list = []
        for child in all_children:
            child_dict = {
                "id": child.id,
                "parent_id": child.parent_id,
                "first_name": child.first_name,
                "birthdate": child.birthdate.isoformat(),
                "profile_img": child.profile_img
            }
            children_list.append(child_dict)

        return children_list

    @staticmethod
    def create_child(parent_id, first_name, birthdate, profile_img):
        # get User from DB
        user = db.session.get(User, parent_id)

        if not user:
            raise ValueError("Parent does not exists.")

        if user.role != "Parent":
            raise ValueError("User needs to have the role 'parent'")

        # String is converted to datetime obj
        birthdate_obj = datetime.strptime(birthdate, "%Y-%m-%d").date()

        new_child = Child(
            parent_id=user.id,
            first_name=first_name,
            birthdate=birthdate_obj,
            profile_img=profile_img
        )
        db.session.add(new_child)
        db.session.commit()

        return {
                "id": new_child.id,
                "parent_id" : new_child.parent_id,
                "first_name" : new_child.first_name,
                "birthdate" : new_child.birthdate,
                "profile_img" : new_child.profile_img
                }

    def get_child(self, child_id, parent_id):
        return Child.query.filter_by(id=child_id, parent_id=parent_id).first()

    def update_child(self, child_id, data, parent_id):
        pass

    def delete_child(self, child_id, parent_id):
        pass


class BookManager:
    def get_all_books(self):
        pass

    @staticmethod
    def create_book(user: User, title: str):
        """Creates Book"""
        if user.role != "Author":
            raise PermissionError("Only Authors can create books")

        book = Book(title=title, author_id=user.id)
        db.session.add(book)
        db.session.commit()
        return {
            "id": book.id,
            "title": book.title,
            "author_id": book.author_id
        }

    def get_book(self, get_book):
        pass

    def update_book(self, book_id, data):
        pass

    def delete_book(self, book_id):
        pass


class ChapterManager:
    @staticmethod
    def get_all_chapters(book_id):
        return Chapter.query.filter_by(book_id=book_id).all()

    @staticmethod
    def create_chapter(book_id, title):

        # finds max order_index from the book and saves only the max value
        max_index = db.session.query(func.max(Chapter.order_index)) \
            .filter_by(book_id=book_id).scalar()

        # if no chapters in this book yet
        if max_index is None:
            max_index = 0

        new_chapter = Chapter(
            book_id=book_id,
            title=title,
            order_index=max_index + 1
        )

        db.session.add(new_chapter)
        db.session.commit()

        return new_chapter

    def get_chapter(self, chapter_id):
        pass

    def update_chapter(self, chapter_id, data):
        pass

    def delete_chapter(self, chapter_id):
        pass


class PageManager:
    @staticmethod
    def get_all_pages(chapter_id):
        return Page.query.filter_by(chapter_id=chapter_id).all()

    def create_page(self, chapter_id):
        pass

    def get_page(self, page_id):
        pass

    def update_page(self, page_id, data):
        pass

    def delete_page(self, page_id):
        pass


class PersonalizationManager:
    def get_all_personalizations(self, parent_id):
        pass

    def create_personalization(self, parent_id):
        pass

    def get_personalization(self, personalization_id):
        pass

    def update_personalization(self, personalization_id):
        pass

    def delete_personalization(self, personalization_id):
        pass




