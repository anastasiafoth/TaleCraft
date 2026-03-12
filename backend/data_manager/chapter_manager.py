from models import db, Book, Chapter
from sqlalchemy import func

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
            title=data.get("title"),
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

        if not chapter:
            raise ValueError("Book not found or not authorized")

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
            chapter.title = data.get("title")

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