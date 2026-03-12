from models import db, User, Book, Chapter, Page
from sqlalchemy import func

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

        title = data.get("title")

        if not title:
            raise ValueError("Please enter a title.")

        # Checks if the title already exists for this author
        existing_book = Book.query.filter_by(title=title).first()

        if existing_book:
            raise ValueError("Book title already exists, choose another title.")

        new_book = Book(
            author_id=user.id,
            title=title,
            description=data.get("description"),
            recommended_age=data.get("recommended_age")
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

        if not book:
            raise ValueError("Book not found or not authorized")

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

        # Book needs to have a title
        if "title" in data:
            new_title = data.get("title")
            if not new_title:
                raise ValueError("Please enter a title.")

            # Checks if the title already exists for this author
            existing_book = Book.query.filter_by(title=new_title).first()
            if existing_book:
                raise ValueError("Book title already exists, choose another title.")

            book.title = new_title


        if "description" in data:
            book.description = data.get("description")

        if "cover_page_id" in data:
            book.cover_page_id = data.get("cover_page_id")

        if "recommended_age" in data:
            book.recommended_age = data.get("recommended_age")

        if "cover_thumbnail_url" in data:
            book.cover_thumbnail_url = data.get("cover_thumbnail_url")

        if "is_published" in data:
            book.is_published = data.get("is_published")


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