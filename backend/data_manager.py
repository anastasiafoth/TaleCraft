from models import db, User, Child, Book, Chapter, Page, BookCharacterTemplate, Personalization, PersonalizationCharacters, ReadingProgress
import flask_praetorian
from sqlalchemy import func
from datetime import datetime
from sqlalchemy.exc import IntegrityError

guard = flask_praetorian.Praetorian()

class UserManager:
    @staticmethod
    def create_user(first_name, last_name, email, role, password):
        """Adds a new user to database"""

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



class ChildManager:
    @staticmethod
    def get_all_children(parent_id):
        all_children = Child.query.filter_by(parent_id=parent_id).all()

        # serialize objects
        children_list = []
        for child in all_children:
            child_dict = {
                "child_id": child.id,
                "first_name": child.first_name,
                "age": child.age,
                "profile_img": child.profile_img
            }
            children_list.append(child_dict)

        return children_list

    @staticmethod
    def create_child(parent_id, first_name, birthdate, profile_img):
        # get User from DB for role checking
        user = db.session.get(User, parent_id)

        if not user:
            raise ValueError("Parent does not exists.")

        if user.role != "Parent":
            raise PermissionError("Only Parents can create children profiles.")

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
                "child_id": new_child.id,
                "first_name" : new_child.first_name,
                "age" : new_child.age,
                "profile_img" : new_child.profile_img
                }

    @staticmethod
    def get_child(child_id, parent_id):
        child = Child.query.filter_by(id=child_id, parent_id=parent_id).first()
        if not child:
            raise ValueError("Child not found or not authorized")
        return {
            "child_id": child.id,
            "first_name" : child.first_name,
            "age" : child.age,
            "profile_img" : child.profile_img
        }

    @staticmethod
    def update_child(child_id, data, parent_id):
        child = Child.query.filter_by(id=child_id, parent_id=parent_id).first()

        if not child:
            raise ValueError("Child not found or not authorized")

        if "first_name" in data:
            child.first_name = data["first_name"]

        if "profile_img" in data:
            child.profile_img = data["profile_img"]

        if "birthdate" in data:
            birthdate_obj = datetime.strptime(data["birthdate"], "%Y-%m-%d").date()
            child.birthdate = birthdate_obj

        db.session.commit()

        return {
            "child_id": child.id,
            "first_name": child.first_name,
            "age": child.age,
            "profile_img": child.profile_img
        }

    @staticmethod
    def delete_child(child_id, parent_id):
        child = Child.query.filter_by(id=child_id, parent_id=parent_id).first()

        if not child:
            raise ValueError("Child not found or not authorized")

        db.session.delete(child)
        db.session.commit()

        return True


class BookManager:
    @staticmethod
    def get_total_pages(book_id):
        total = (
            db.session.query(func.count(Page.id))
            .join(Chapter, Page.chapter_id == Chapter.id)
            .filter(Chapter.book_id == book_id)
            .scalar()
        )

        return total or 0

    @staticmethod
    def get_all_books():
        all_books = Book.query.all()

        # serialize objects
        books_list = []
        for book in all_books:
            book_dict = {
                "id" : book.id,
                "title" : book.title,
                "author" : book.author_name,
                "description" : book.description,
                "cover_page_id" : book.cover_page_id,
                "cover_thumbnail_url": book.cover_thumbnail_url,
                "is_published": book.is_published,
                "recommended_age" : book.recommended_age,
                "created_at" : book.created_at,
                "updated_at" : book.updated_at,
                "total_pages": BookManager.get_total_pages(book.id)
            }
            books_list.append(book_dict)

        return books_list

    @staticmethod
    def create_book(user: User, data):
        if not user:
            raise ValueError("Author does not exists.")
        if user.role != "Author":
            raise PermissionError("Only Authors can create books.")

        new_book = Book(
            author_id=user.id,
            title=data["title"],
            description=data["description"],
            recommended_age=data["recommended_age"]
        )
        db.session.add(new_book)
        db.session.commit()

        book_dict = {
            "id" : new_book.id,
            "title" : new_book.title,
            "author" : new_book.author_name,
            "description" : new_book.description,
            "cover_page_id" : new_book.cover_page_id,
            "cover_thumbnail_url": new_book.cover_thumbnail_url,
            "is_published": new_book.is_published,
            "recommended_age" : new_book.recommended_age,
            "created_at" : new_book.created_at,
            "updated_at" : new_book.updated_at
        }
        return book_dict

    @staticmethod
    def get_book(book_id):
        book = Book.query.filter_by(id=book_id).first()

        book_dict = {
            "id": book.id,
            "title": book.title,
            "author": book.author_name,
            "description": book.description,
            "cover_page_id": book.cover_page_id,
            "cover_thumbnail_url": book.cover_thumbnail_url,
            "is_published": book.is_published,
            "recommended_age": book.recommended_age,
            "created_at": book.created_at,
            "updated_at": book.updated_at,
            "total_pages": BookManager.get_total_pages(book.id)
            }

        return book_dict

    @staticmethod
    def update_book(book_id, data, author_id):
        book = Book.query.filter_by(id=book_id, author_id=author_id).first()

        if not book:
            raise ValueError("Book not found or not authorized")

        if "title" in data:
            book.title = data["title"]

        if "description" in data:
            book.description = data["description"]

        if "cover_page_id" in data:
            book.cover_page_id = data["cover_page_id"]

        if "recommended_age" in data:
            book.recommended_age = data["recommended_age"]

        if "cover_thumbnail_url" in data:
            book.cover_thumbnail_url = data["cover_thumbnail_url"]

        if "is_published" in data:
            book.is_published = data["is_published"]


        db.session.commit()

        return {
            "id": book.id,
            "title": book.title,
            "author": book.author_name,
            "description": book.description,
            "cover_page_id": book.cover_page_id,
            "cover_thumbnail_url": book.cover_thumbnail_url,
            "is_published": book.is_published,
            "recommended_age": book.recommended_age,
            "created_at": book.created_at,
            "updated_at": book.updated_at,
            "total_pages": BookManager.get_total_pages(book.id)
        }

    @staticmethod
    def delete_book(book_id, author_id):
        book = Book.query.filter_by(id=book_id, author_id=author_id).first()

        if not book:
            raise ValueError("Book not found or not authorized")

        db.session.delete(book)
        db.session.commit()

        return True


class ChapterManager:
    @staticmethod
    def get_all_chapters(book_id):
        # gets all chapters sorted by order_index
        all_chapters = Chapter.query.filter_by(book_id=book_id).order_by(Chapter.order_index).all()

        # serialize objects
        chapter_list = []
        for chapter in all_chapters:
            chapter_dict = {
                "id": chapter.id,
                "book_id": chapter.book_id,
                "title": chapter.title,
                "order_index": chapter.order_index
            }

            chapter_list.append(chapter_dict)

        return chapter_list

    @staticmethod
    def create_chapter(book_id, data, author_id):
        # checks if book belongs to author
        book = Book.query.filter_by(id=book_id, author_id=author_id).first()
        if not book:
            raise ValueError("Book not found or not authorized")

        # finds max order_index from the book and saves only the max value
        max_index = db.session.query(func.max(Chapter.order_index)) \
                        .filter_by(book_id=book_id).scalar() or 0

        # if no chapters in this book yet
        if max_index is None:
            max_index = 0

        new_chapter = Chapter(
            book_id=book_id,
            title=data["title"],
            order_index=max_index + 1
        )

        db.session.add(new_chapter)
        db.session.commit()

        chapter_dict = {
            "id": new_chapter.id,
            "book_id": new_chapter.book_id,
            "title": new_chapter.title,
            "order_index": new_chapter.order_index
        }

        return chapter_dict

    @staticmethod
    def get_chapter(chapter_id):
        chapter = Chapter.query.filter_by(id=chapter_id).first()

        chapter_dict = {
                "id": chapter.id,
                "book_id": chapter.book_id,
                "title": chapter.title,
                "order_index": chapter.order_index
            }

        return chapter_dict

    @staticmethod
    def update_chapter(chapter_id, data, author_id):
        chapter = Chapter.query.join(Book).filter(
            Chapter.id == chapter_id,
            Book.author_id == author_id
        ).first()

        if not chapter:
            raise ValueError("Chapter not found or not authorized")

        if "title" in data:
            chapter.title = data["title"]

        db.session.commit()

        return {
            "id": chapter.id,
            "book_id": chapter.book_id,
            "title": chapter.title,
            "order_index": chapter.order_index
        }

    @staticmethod
    def delete_chapter(chapter_id, author_id):
        chapter = Chapter.query.join(Book).filter(
            Chapter.id == chapter_id,
            Book.author_id == author_id
        ).first()

        if not chapter:
            raise ValueError("Chapter not found or not authorized")

        db.session.delete(chapter)
        db.session.commit()

        return True


class PageManager:
    @staticmethod
    def get_all_pages(chapter_id):
        all_pages = Page.query.filter_by(chapter_id=chapter_id).all()

        # serialize objects
        pages_list = []
        for page in all_pages:
            page_dict = {
                "id": page.id,
                "chapter_id": page.chapter_id,
                "order_index": page.order_index,
                "layout_data": page.layout_data,
                "is_cover": page.is_cover,
            }
            pages_list.append(page_dict)

        return pages_list

    @staticmethod
    def create_page(chapter_id, data, author_id):
        # checks if chapter and book belongs to author
        chapter = (Chapter.query.join(Book).filter(
            Chapter.id==chapter_id,
            Book.author_id==author_id)
            .first())

        if not chapter:
            raise ValueError("Chapter not found or not authorized")

        # finds max order_index from the book and saves only the max value
        max_index = db.session.query(func.max(Page.order_index)) \
                        .filter_by(chapter_id=chapter_id).scalar() or 0

        new_page = Page(
            chapter_id=chapter_id,
            order_index=max_index + 1,
            layout_data=data.get("layout_data"),
            is_cover=data.get("is_cover", False)
        )

        db.session.add(new_page)
        db.session.commit()

        chapter_dict = {
            "id": new_page.id,
            "chapter_id": new_page.chapter_id,
            "order_index": new_page.order_index,
            "layout_data": new_page.layout_data,
            "is_cover": new_page.is_cover,
        }

        return chapter_dict

    @staticmethod
    def get_page(page_id):
        page = Page.query.filter_by(id=page_id).first()

        page_dict = {
            "id": page.id,
            "chapter_id": page.chapter_id,
            "order_index": page.order_index,
            "layout_data": page.layout_data,
            "is_cover": page.is_cover,
            }

        return page_dict

    @staticmethod
    def update_page(page_id, data, author_id):
        # checks if page belongs to author (via chapter -> book)
        page = Page.query.join(Chapter).join(Book).filter(
            Page.id == page_id,
            Book.author_id == author_id
        ).first()

        if not page:
            raise ValueError("Page not found or not authorized")

        if "layout_data" in data:
            page.layout_data = data["layout_data"]

        if "is_cover" in data:
            page.is_cover = data["is_cover"]

        db.session.commit()

        page_dict = {
            "id": page.id,
            "chapter_id": page.chapter_id,
            "order_index": page.order_index,
            "layout_data": page.layout_data,
            "is_cover": page.is_cover,
        }

        return page_dict

    @staticmethod
    def delete_page(page_id, author_id):
        # checks if page belongs to author (via chapter -> book)
        page = Page.query.join(Chapter).join(Book).filter(
            Page.id == page_id,
            Book.author_id == author_id
        ).first()

        if not page:
            raise ValueError("Page not found or not authorized")

        db.session.delete(page)
        db.session.commit()

        return True


class BookCharacterTemplateManager:
    @staticmethod
    def get_all_book_character_templates(book_id, author_id):
        # check if book belongs to author
        book = Book.query.filter_by(id=book_id, author_id=author_id).first()

        if not book:
            raise ValueError("Book not found or not authorized")

        templates = BookCharacterTemplate.query.filter_by(book_id=book_id).all()

        templates_list = []
        for template in templates:
            template_dict = {
                "id": template.id,
                "book_id": template.book_id,
                "role": template.role,
                "default_name": template.default_name,
                "default_gender": template.default_gender,
                "default_main_color": template.default_main_color,
                "default_hair_color": template.default_hair_color,
                "default_clothing": template.default_clothing,
                "default_glasses": template.default_glasses,
                "extra_attributes": template.extra_attributes,
                "customizable": template.customizable
            }
            templates_list.append(template_dict)

        return templates_list

    @staticmethod
    def create_book_character_template(book_id, data, author_id):
        """ Templates are created by author for each book and each character """
        # check if book belongs to author
        book = Book.query.filter_by(id=book_id, author_id=author_id).first()

        if not book:
            raise ValueError("Book not found or not authorized")

        # Converts role
        role_raw = data.get("role")
        # Checks is role is not None, since there will be an error if you use .strip().lower() on None
        if not role_raw:
            raise ValueError("Role is required")
        role = role_raw.strip().lower()

        # Checks if role already exists in the db based on book_id
        existing_role = BookCharacterTemplate.query.filter_by(book_id=book_id, role=role).first()
        if existing_role:
            raise ValueError("Role already exists.")

        new_template = BookCharacterTemplate(
            book_id=book_id,
            role=role,
            default_name=data.get("default_name"),
            default_gender=data.get("default_gender"),
            default_main_color=data.get("default_main_color"),
            default_hair_color=data.get("default_hair_color"),
            default_clothing=data.get("default_clothing"),
            default_glasses=data.get("default_glasses", False),
            extra_attributes=data.get("extra_attributes"),
            customizable=data.get("customizable")
        )

        db.session.add(new_template)

        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            raise ValueError("Role already exists for this book.")

        return {
            "id": new_template.id,
            "book_id": new_template.book_id,
            "role": new_template.role,
            "default_name": new_template.default_name,
            "default_gender": new_template.default_gender,
            "default_main_color": new_template.default_main_color,
            "default_hair_color": new_template.default_hair_color,
            "default_clothing": new_template.default_clothing,
            "default_glasses": new_template.default_glasses,
            "extra_attributes": new_template.extra_attributes,
            "customizable": new_template.customizable
        }

    @staticmethod
    def get_book_character_template(template_id, author_id):
        template = BookCharacterTemplate.query.join(Book).filter(
            BookCharacterTemplate.id == template_id,
            Book.author_id == author_id
        ).first()

        if not template:
            raise ValueError("Template not found or not authorized")

        return {
            "id": template.id,
            "book_id": template.book_id,
            "role": template.role,
            "default_name": template.default_name,
            "default_gender": template.default_gender,
            "default_main_color": template.default_main_color,
            "default_hair_color": template.default_hair_color,
            "default_clothing": template.default_clothing,
            "default_glasses": template.default_glasses,
            "extra_attributes": template.extra_attributes,
            "customizable": template.customizable
        }

    @staticmethod
    def update_book_character_template(template_id, data, author_id):
        template = BookCharacterTemplate.query.join(Book).filter(
            BookCharacterTemplate.id == template_id,
            Book.author_id == author_id
        ).first()

        if not template:
            raise ValueError("Template not found or not authorized")

        if "role" in data:
            template.role = data["role"]

        if "default_name" in data:
            template.default_name = data["default_name"]

        if "default_gender" in data:
            template.default_gender = data["default_gender"]

        if "default_main_color" in data:
            template.default_main_color = data["default_main_color"]

        if "default_hair_color" in data:
            template.default_hair_color = data["default_hair_color"]

        if "default_clothing" in data:
            template.default_clothing = data["default_clothing"]

        if "default_glasses" in data:
            template.default_glasses = data["default_glasses"]

        if "extra_attributes" in data:
            template.extra_attributes = data["extra_attributes"]

        if "customizable" in data:
            template.customizable = data["customizable"]

        db.session.commit()

        return {
            "id": template.id,
            "book_id": template.book_id,
            "role": template.role,
            "default_name": template.default_name,
            "default_gender": template.default_gender,
            "default_main_color": template.default_main_color,
            "default_hair_color": template.default_hair_color,
            "default_clothing": template.default_clothing,
            "default_glasses": template.default_glasses,
            "extra_attributes": template.extra_attributes,
            "customizable": template.customizable
        }

    @staticmethod
    def delete_book_character_template(template_id, author_id):
        template = BookCharacterTemplate.query.join(Book).filter(
            BookCharacterTemplate.id == template_id,
            Book.author_id == author_id
        ).first()

        if not template:
            raise ValueError("Template not found or not authorized")

        db.session.delete(template)
        db.session.commit()

        return True


class PersonalizationManager:
    @staticmethod
    def get_all_personalizations(parent_id):
        personalizations = Personalization.query.filter_by(
            parent_id=parent_id
        ).all()

        all_personalizations = []

        for p in personalizations:
            all_personalizations.append({
                "id": p.id,
                "parent_id": p.parent_id,
                "book_id": p.book_id,
                "created_at": p.created_at,
                "updated_at": p.updated_at,
            })

        return all_personalizations

    @staticmethod
    def create_personalization(book_id, parent_id):
        # check if book exists
        book = Book.query.filter_by(id=book_id).first()

        if not book:
            raise ValueError("Book not found")

        personalization = Personalization(
            parent_id=parent_id,
            book_id=book.id
        )

        db.session.add(personalization)
        db.session.flush() # so we get personalization.id before commit

        # copies all character templates for this book
        templates = BookCharacterTemplate.query.filter_by(
            book_id=book_id
        ).all()

        # all Characters are copied, even the not customizable ones, since they are needed in the rendering
        for template in templates:
            character = PersonalizationCharacters(
                personalization_id=personalization.id,
                template_id=template.id,
                role=template.role,
                name=template.default_name,
                gender=template.default_gender,
                main_color=template.default_main_color,
                hair_color=template.default_hair_color,
                clothing=template.default_clothing,
                glasses=template.default_glasses,
                extra_attributes=template.extra_attributes,
                customizable=template.customizable
            )
            db.session.add(character)

        db.session.commit()

        return {
            "id": personalization.id,
            "parent_id": personalization.parent_id,
            "book_id": personalization.book_id,
            "created_at": personalization.created_at,
            "updated_at": personalization.updated_at,
        }

    @staticmethod
    def get_personalization(personalization_id, parent_id):
        personalization = Personalization.query.filter_by(
            id=personalization_id,
            parent_id=parent_id
        ).first()

        if not personalization:
            raise ValueError("Personalization not found or not authorized")

        return {
            "id": personalization.id,
            "parent_id": personalization.parent_id,
            "book_id": personalization.book_id,
            "created_at": personalization.created_at,
            "updated_at": personalization.updated_at,
        }

    @staticmethod
    def delete_personalization(personalization_id, parent_id):
        personalization = Personalization.query.filter_by(
            id=personalization_id,
            parent_id=parent_id
        ).first()

        if not personalization:
            raise ValueError("Personalization not found or not authorized")

        # if personalization is getting deleted, so will be the personalized characters
        PersonalizationCharacters.query.filter_by(
            personalization_id=personalization.id
        ).delete()

        db.session.delete(personalization)
        db.session.commit()

        return True


class PersonalizationCharactersManager:
    @staticmethod
    def get_all_personalization_characters(personalization_id, parent_id):
        characters = PersonalizationCharacters.query \
            .join(Personalization) \
            .filter(
                PersonalizationCharacters.personalization_id == personalization_id,
                Personalization.parent_id == parent_id
            ).all()

        result = []

        for c in characters:
            result.append({
                "id": c.id,
                "personalization_id": c.personalization_id,
                "role": c.role,
                "name": c.name,
                "gender": c.gender,
                "main_color": c.main_color,
                "hair_color": c.hair_color,
                "clothing": c.clothing,
                "glasses": c.glasses,
                "extra_attributes": c.extra_attributes,
                "customizable": c.customizable
            })

        return result

    @staticmethod
    def get_personalization_character(character_id, parent_id):
        character = PersonalizationCharacters.query \
            .join(Personalization) \
            .filter(
                PersonalizationCharacters.id == character_id,
                Personalization.parent_id == parent_id
            ).first()

        if not character:
            raise ValueError("Character not found or not authorized")

        return {
            "id": character.id,
            "personalization_id": character.personalization_id,
            "role": character.role,
            "name": character.name,
            "gender": character.gender,
            "main_color": character.main_color,
            "hair_color": character.hair_color,
            "clothing": character.clothing,
            "glasses": character.glasses,
            "extra_attributes": character.extra_attributes,
            "customizable": character.customizable
        }

    @staticmethod
    def update_personalization_character(character_id, parent_id, data):
        character = PersonalizationCharacters.query \
            .join(Personalization) \
            .filter(
                PersonalizationCharacters.id == character_id,
                Personalization.parent_id == parent_id
            ).first()

        if not character:
            raise ValueError("Character not found or not authorized")

        if "name" in data:
            character.name = data["name"]

        if "gender" in data:
            character.gender = data["gender"]

        if "main_color" in data:
            character.main_color = data["main_color"]

        if "hair_color" in data:
            character.hair_color = data["hair_color"]

        if "clothing" in data:
            character.clothing = data["clothing"]

        if "glasses" in data:
            character.glasses = data["glasses"]

        if "extra_attributes" in data:
            character.extra_attributes = data["extra_attributes"]

        db.session.commit()

        return {
            "id": character.id,
            "personalization_id": character.personalization_id,
            "role": character.role,
            "name": character.name,
            "gender": character.gender,
            "main_color": character.main_color,
            "hair_color": character.hair_color,
            "clothing": character.clothing,
            "glasses": character.glasses,
            "extra_attributes": character.extra_attributes,
            "customizable": character.customizable
        }

    @staticmethod
    def delete_personalization_character(character_id, parent_id):
        character = PersonalizationCharacters.query \
            .join(Personalization) \
            .filter(
                PersonalizationCharacters.id == character_id,
                Personalization.parent_id == parent_id
            ).first()

        if not character:
            raise ValueError("Character not found or not authorized")

        db.session.delete(character)
        db.session.commit()

        return True

    @staticmethod
    def reset_character(character_id, parent_id):
        character = (
            PersonalizationCharacters.query
            .join(Personalization)
            .filter(
                PersonalizationCharacters.id == character_id,
                Personalization.parent_id == parent_id
            )
            .first()
        )

        if not character:
            raise ValueError("Character not found")

        template = character.template

        # existing character Obj is reset with values from the template
        character.role = template.role
        character.name = template.default_name
        character.gender = template.default_gender
        character.main_color = template.default_main_color
        character.hair_color = template.default_hair_color
        character.clothing = template.default_clothing
        character.glasses = template.default_glasses
        character.extra_attributes = template.extra_attributes
        character.customizable = template.customizable

        db.session.commit()

        return {
            "id": character.id,
            "personalization_id": character.personalization_id,
            "role": character.role,
            "name": character.name,
            "gender": character.gender,
            "main_color": character.main_color,
            "hair_color": character.hair_color,
            "clothing": character.clothing,
            "glasses": character.glasses,
            "extra_attributes": character.extra_attributes,
            "customizable": character.customizable
        }


class ReadingProgressManager:

    @staticmethod
    def get_all_reading_progress(data, parent_id):
        child_id = data.get("child_id")

        progresses = ReadingProgress.query \
            .join(Child) \
            .filter(
            Child.parent_id == parent_id,
            Child.id == child_id
        ).all()

        if not progresses:
            raise ValueError("Reading progress not found or not authorized")

        result = []

        for progress in progresses:
            result.append({
            "id": progress.id,
            "book_id": progress.book_id,
            "child_id": progress.child_id,
            "current_page_id": progress.current_page_id,
        })

        return result

    @staticmethod
    def create_reading_progress(data, parent_id):
        child_id = data.get("child_id")
        book_id = data.get("book_id")

        # Check if child belongs to parent
        child = Child.query.filter_by(
            id=child_id,
            parent_id=parent_id
        ).first()

        if not child:
            raise ValueError("Child not found or not authorized")

        # Check if book exists
        book = Book.query.filter_by(id=book_id).first()

        if not book:
            raise ValueError("Book not found")

        # Check uniqueness
        existing = ReadingProgress.query.filter_by(
            book_id=book_id,
            child_id=child_id
        ).first()

        if existing:
            raise ValueError("Reading progress already exists")

        first_page = (Page.query
                      .join(Chapter, Page.chapter_id == Chapter.id)
                      .filter(Chapter.book_id==book_id).order_by(Page.order_index).first())

        if not first_page:
            raise ValueError(f"Book:'{book.title}' has no pages yet")

        progress = ReadingProgress(
            book_id=book_id,
            child_id=child_id,
            current_page_id=first_page.id
        )

        db.session.add(progress)
        db.session.commit()

        return {
                "id": progress.id,
                "book_id": progress.book_id,
                "child_id": progress.child_id,
                "current_page_id": progress.current_page_id
            }


    @staticmethod
    def get_reading_progress(progress_id, parent_id):
        progress = ReadingProgress.query \
            .join(Child) \
            .filter(
                ReadingProgress.id == progress_id,
                Child.parent_id == parent_id
            ).first()

        if not progress:
            raise ValueError("Reading progress not found or not authorized")

        return {
            "id": progress.id,
            "book_id": progress.book_id,
            "child_id": progress.child_id,
            "current_page_id": progress.current_page_id,
        }

    @staticmethod
    def update_reading_progress(progress_id, parent_id, data):
        progress = ReadingProgress.query \
            .join(Child) \
            .filter(
                ReadingProgress.id == progress_id,
                Child.parent_id == parent_id
            ).first()

        if not progress:
            raise ValueError("Reading progress not found or not authorized")

        if "current_page_id" in data:
            current_page_id_from_user = data["current_page_id"]
            book_id = data["book_id"]
            current_page_id_check = (Page.query.join(Chapter).filter(Page.id == current_page_id_from_user, Chapter.book_id == book_id).first())

            if current_page_id_check:
                progress.current_page_id = current_page_id_from_user
            else:
                raise ValueError("Page does not exists in this chapter")


        db.session.commit()

        return {
            "id": progress.id,
            "book_id": progress.book_id,
            "child_id": progress.child_id,
            "current_page_id": progress.current_page_id,
        }

    @staticmethod
    def delete_reading_progress(progress_id, parent_id):
        progress = ReadingProgress.query \
            .join(Child) \
            .filter(
                ReadingProgress.id == progress_id,
                Child.parent_id == parent_id,
            ).first()

        if not progress:
            raise ValueError("Reading progress not found or not authorized")

        db.session.delete(progress)
        db.session.commit()

        return True




