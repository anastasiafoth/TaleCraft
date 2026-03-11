from models import db, Book, Chapter, Page
from sqlalchemy import func

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