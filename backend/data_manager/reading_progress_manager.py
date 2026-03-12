from models import db, Child, Book, Chapter, Page, ReadingProgress, Personalization

class ReadingProgressManager:

    @staticmethod
    def get_all_reading_progress(data, parent_id):
        child_id = data.get("child_id")

        if not child_id:
            raise ValueError("Missing child_id.")

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
            "personalization_id" : progress.personalization_id
        })

        return result

    @staticmethod
    def create_reading_progress(data, parent_id):
        child_id = data.get("child_id")
        #book_id = data.get("book_id")
        personalization_id = data.get("personalization_id")

        # Check if child belongs to parent
        child = Child.query.filter_by(
            id=child_id,
            parent_id=parent_id
        ).first()

        if not child:
            raise ValueError("Child not found or not authorized")

        # Check if personalization belongs to parent
        if personalization_id:
            personalization = Personalization.query.filter_by(
                id=personalization_id,
                parent_id=parent_id
            ).first()

            if not personalization:
                raise ValueError("Personalization not found or not authorized")

        # Check if book exists
        #book = Book.query.filter_by(id=book_id).first()

        #if not book:
        #    raise ValueError("Book not found")

        # Check uniqueness
        #existing = ReadingProgress.query.filter_by(
        #    book_id=book_id,
        #    child_id=child_id
        #).first()

        #if existing:
        #    raise ValueError("Reading progress already exists")
        book_id = Personalization.book_id

        first_page = (Page.query
                      .join(Chapter, Page.chapter_id == Chapter.id)
                      .filter(Chapter.book_id==book_id).order_by(Page.order_index).first())

        if not first_page:
            raise ValueError(f"This book has no pages yet.")

        progress = ReadingProgress(
            book_id=book_id,
            child_id=child_id,
            current_page_id=first_page.id,
            personalization_id=personalization_id
        )

        db.session.add(progress)
        db.session.commit()

        return {
                "id": progress.id,
                "book_id": progress.book_id,
                "child_id": progress.child_id,
                "current_page_id": progress.current_page_id,
                "personalization_id": progress.personalization_id
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
            "personalization_id": progress.personalization_id
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
            current_page_id_from_user = data.get("current_page_id")
            book_id_from_user = data.get("book_id")

            current_page_id_check = (Page.query.join(Chapter).filter(Page.id == current_page_id_from_user, Chapter.book_id == book_id_from_user).first())

            if current_page_id_check:
                progress.current_page_id = current_page_id_from_user
                progress.book_id = book_id_from_user
            else:
                raise ValueError("Page does not exists in this chapter")

        db.session.commit()

        return {
            "id": progress.id,
            "book_id": progress.book_id,
            "child_id": progress.child_id,
            "current_page_id": progress.current_page_id,
            "personalization_id": progress.personalization_id
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