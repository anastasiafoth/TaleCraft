from models import db, User
import flask_praetorian

guard = flask_praetorian.Praetorian()

class DataManager():
    def create_user(self, first_name, last_name, email, role, password):
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
        return new_user

    def get_users(self):
        """Returns a list of all users in database"""
        return User.query.all()


    #children
    def get_all_children(self, parent_id):
        pass

    def create_child(self, parent_id, data):
        pass

    def get_child(self, child_id, parent_id):
        pass

    def update_child(self, child_id, data, parent_id):
        pass

    def delete_child(self, child_id, parent_id):
        pass


    # books
    def get_all_books(self):
        pass

    def create_book(self, data):
        pass

    def get_book(self, get_book):
        pass

    def update_book(self, book_id, data):
        pass

    def delete_book(self, book_id):
        pass


    #chapter
    def get_all_chapters(self, book_id):
        pass

    def create_chapter(self, book_id):
        pass

    def get_chapter(self, chapter_id):
        pass

    def update_chapter(self, chapter_id, data):
        pass

    def delete_chapter(self, chapter_id):
        pass


    #pages
    def get_all_pages(self, chapter_id):
        pass

    def create_page(self, chapter_id):
        pass

    def get_page(self, page_id):
        pass

    def update_page(self, page_id, data):
        pass

    def delete_page(self, page_id):
        pass


    #personalization
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




