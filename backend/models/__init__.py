from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User
from .book import Book
from .chapter import Chapter
from .page import Page
from .child import Child
from .personalization import Personalization, PersonalizationCharacters
from .reading_progress import ReadingProgress
from .book_character_template import BookCharacterTemplate
from .R2File import R2File