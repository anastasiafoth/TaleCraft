from data_manager import UserManager, ChildManager, BookManager, ChapterManager, PageManager, BookCharacterTemplateManager, PersonalizationManager, PersonalizationCharactersManager, ReadingProgressManager
from models import db, User
from flask import Flask, request, url_for,jsonify
import os
from dotenv import load_dotenv
import flask_praetorian
import flask_cors

from flask_migrate import Migrate

load_dotenv()

NEON_KEY = os.getenv("NEON_KEY")
app = Flask(__name__)
app.debug = True
app.config['SECRET_KEY'] = 'a_very_long_random_secret_key_at_least_32_chars'
app.config['JWT_ACCESS_LIFESPAN'] = {'hours': 24}
app.config['JWT_REFRESH_LIFESPAN'] = {'days': 30}


#jwt auth
guard = flask_praetorian.Praetorian()
# Initialize the flask-praetorian instance for the app
guard.init_app(app, User)

cors = flask_cors.CORS()


app.config['SQLALCHEMY_DATABASE_URI'] = NEON_KEY
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
#Connection Pooling Problem
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_pre_ping': True,  # Checks connection before usage
    'pool_recycle': 300,    # Recycle connection after 5 min
}


# Link the database and the app. This is the reason you need to import db from models
db.init_app(app)

# Initializes CORS so that the api_tool can talk to the app
cors.init_app(app)

# Initializes Flask Migrate, for updating db
migrate = Migrate(app, db)

# Run only once to create tables

with app.app_context():
    db.create_all()

# Create objects of all DataManager classes
user_manager = UserManager()
child_manager = ChildManager()
book_manager = BookManager()
chapter_manager = ChapterManager()
page_manager = PageManager()
personalization_manager = PersonalizationManager()
book_character_template_manager = BookCharacterTemplateManager()
personalization_characters_manager = PersonalizationCharactersManager()
reading_progress_manager = ReadingProgressManager()


""" __________________ User ________________________"""
@app.route('/api/login', methods=['POST'])
def login():
    """
    Logs a user in by parsing a POST request containing user credentials and
        issuing a JWT token.
    example::
       $ curl http://localhost:5000/api/login -X POST \
         -d '{"email":"Yasoob@mail.com","password":"strongpassword"}'
    """
    req = request.get_json()
    email = req.get("email")
    password = req.get("password")

    # Email not case-sensitive
    email = email.strip().lower()

    user = guard.authenticate(email, password)

    return jsonify({'access_token': guard.encode_jwt_token(user)}), 200

@app.route('/api/refresh', methods=['POST'])
def refresh():
    """
    Refreshes an existing JWT by creating a new one that is a copy of the old
    except that it has a refreshed access expiration.
    example::
       $ curl http://localhost:5000/api/refresh -X GET \
         -H "Authorization: Bearer <your_token>"
    """
    print("refresh request")
    old_token = request.get_data()
    new_token = guard.refresh_jwt_token(old_token)
    return jsonify({'access_token': new_token}), 200

@app.route('/api/protected')
@flask_praetorian.auth_required
def protected():
    """
        A protected endpoint. The auth_required decorator will require a header
        containing a valid JWT
        example::
           $ curl http://localhost:5000/api/protected -X GET \
             -H "Authorization: Bearer <your_token>"
        """
    user = flask_praetorian.current_user()
    return jsonify({"message": f"protected endpoint (allowed user {user.first_name})"})


@app.route('/api/register', methods=['POST'])
def create_user():
    data = request.get_json()

    try:
        new_user = user_manager.create_user(
            first_name=data["first_name"],
            last_name=data["last_name"],
            email=data["email"],
            role=data["role"],
            password=guard.hash_password(data["password"])
        )

        return jsonify(new_user), 201

    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/logout', methods=['PATCH'])
@flask_praetorian.auth_required
def logout():
    """
    JWT token delete from frontend
    """
    return jsonify({"message": "Successfully logged out"}), 200

@app.route('/api/user', methods=['GET', 'PATCH'])
@flask_praetorian.auth_required
def handle_user():
    user = flask_praetorian.current_user()
    current_user = user_manager.get_user_by_id(user.id)

    if request.method == 'GET':
        return jsonify(current_user), 200

    elif request.method == 'PATCH':
        data = request.get_json()
        updated_user = user_manager.update_user(user.id, data)
        return jsonify(updated_user), 200

    return jsonify({"error": "Method not allowed"}), 405


""" __________________ Children ________________________"""
@app.route('/api/children', methods=['GET', 'POST'])
@flask_praetorian.auth_required
@flask_praetorian.roles_required("Parent")
def children():
    user = flask_praetorian.current_user()

    if request.method == 'GET':
        all_children = child_manager.get_all_children(parent_id=user.id)

        return jsonify(all_children)

    elif request.method == 'POST':
        data = request.get_json()
        new_child = child_manager.create_child(
            parent_id=user.id,
            first_name=data["first_name"],
            birthdate=data["birthdate"],
            profile_img=data["profile_img"])

        return jsonify(new_child), 201

    return jsonify({"error": "Method not allowed"}), 405

@app.route('/api/children/<int:child_id>', methods=['GET', 'PATCH', 'DELETE'])
@flask_praetorian.auth_required
@flask_praetorian.roles_required("Parent")
def children_detail(child_id):
    user = flask_praetorian.current_user()

    if request.method == 'GET':
        child = child_manager.get_child(child_id, parent_id=user.id)
        return jsonify(child), 200

    elif request.method == 'PATCH':
        data = request.get_json()

        updated_child = child_manager.update_child(child_id, data, parent_id=user.id)
        return jsonify(updated_child), 200

    elif request.method == 'DELETE':
        child_manager.delete_child(child_id, parent_id=user.id)
        return "", 204

    return jsonify({"error": "Method not allowed"}), 405


""" __________________ Books ________________________"""
@app.route('/api/books/')
def books_get_all():
    all_books = book_manager.get_all_books()
    return jsonify(all_books), 200

@app.route('/api/books/<int:book_id>')
def book_get_by_id(book_id):
    book = book_manager.get_book(book_id)
    return jsonify(book), 200

@app.route('/api/books', methods=['POST'])
@flask_praetorian.auth_required
@flask_praetorian.roles_required("Author")
def add_book():
    user = flask_praetorian.current_user()
    data = request.get_json()

    new_book = book_manager.create_book(user, data)
    return jsonify(new_book), 201

@app.route('/api/books/<int:book_id>', methods=['PATCH', 'DELETE'])
@flask_praetorian.auth_required
@flask_praetorian.roles_required("Author")
def book_detail(book_id):
    user = flask_praetorian.current_user()

    if request.method == 'PATCH':
        data = request.get_json()
        updated_book = book_manager.update_book(book_id, data, author_id=user.id)
        return jsonify(updated_book), 200

    elif request.method == 'DELETE':
        book_manager.delete_book(book_id, author_id=user.id)
        return "", 204

    return jsonify({"error": "Method not allowed"}), 405


""" __________________ Chapters ________________________"""
@app.route('/api/books/<int:book_id>/chapters')
def chapters(book_id):
    all_chapters = chapter_manager.get_all_chapters(book_id)
    return jsonify(all_chapters), 200

@app.route('/api/chapters/<int:chapter_id>')
def get_chapter_by_id(chapter_id):
    chapter = chapter_manager.get_chapter(chapter_id)
    return jsonify(chapter), 200

@app.route('/api/books/<int:book_id>/chapters', methods=['POST'])
@flask_praetorian.auth_required
@flask_praetorian.roles_required("Author")
def add_chapter(book_id):
    user = flask_praetorian.current_user()
    data = request.get_json()
    new_chapter = chapter_manager.create_chapter(book_id, data, author_id=user.id)

    return jsonify(new_chapter), 201

@app.route('/api/chapters/<int:chapter_id>', methods=['PATCH', 'DELETE'])
@flask_praetorian.auth_required
@flask_praetorian.roles_required("Author")
def chapter_detail(chapter_id):
    user = flask_praetorian.current_user()
    if request.method == 'PATCH':
        data = request.get_json()
        updated_chapter = chapter_manager.update_chapter(chapter_id, data, author_id=user.id)
        return jsonify(updated_chapter), 200
    elif request.method == 'DELETE':
        chapter_manager.delete_chapter(chapter_id, author_id=user.id)
        return "", 204
    return jsonify({"error": "Method not allowed"}), 405


""" __________________ Pages ________________________"""
@app.route('/api/chapters/<int:chapter_id>/pages')
def all_pages(chapter_id):
    all_pages = page_manager.get_all_pages(chapter_id)
    return jsonify(all_pages), 200

@app.route('/api/chapters/<int:chapter_id>/pages', methods=['POST'])
@flask_praetorian.auth_required
@flask_praetorian.roles_required("Author")
def add_page(chapter_id):
    user = flask_praetorian.current_user()
    data = request.get_json()
    new_page = page_manager.create_page(chapter_id, data, author_id=user.id)
    return jsonify(new_page), 201

@app.route('/api/pages/<int:page_id>')
def get_page_by_id(page_id):
    page = page_manager.get_page(page_id)
    return jsonify(page), 200

@app.route('/api/pages/<int:page_id>', methods=['PATCH', 'DELETE'])
@flask_praetorian.auth_required
@flask_praetorian.roles_required("Author")
def page_detail(page_id):
    user = flask_praetorian.current_user()
    if request.method == 'PATCH':
        data = request.get_json()
        updated_page = page_manager.update_page(page_id, data, author_id=user.id)
        return jsonify(updated_page), 200
    elif request.method == 'DELETE':
        page_manager.delete_page(page_id, author_id=user.id)
        return "", 204
    return jsonify({"error": "Method not allowed"}), 405


""" __________________ Personalization ________________________"""
@app.route('/api/books/<int:book_id>/personalization', methods=['GET', 'POST'])
@flask_praetorian.auth_required
@flask_praetorian.roles_required("Parent")
def personalizations(book_id):
    user = flask_praetorian.current_user()
    if request.method == 'GET':
        personalization = personalization_manager.get_all_personalizations(parent_id=user.id)
        return jsonify(personalization)

    elif request.method == 'POST':
        personalization = personalization_manager.create_personalization(book_id, parent_id=user.id)
        return jsonify(personalization)

    return jsonify({"error": "Method not allowed"}), 405

@app.route('/api/personalization/<personalization_id>', methods=['GET', 'DELETE'])
@flask_praetorian.auth_required
@flask_praetorian.roles_required("Parent")
def personalization_detail(personalization_id):
    user = flask_praetorian.current_user()
    if request.method == 'GET':
        personalization = personalization_manager.get_personalization(personalization_id, parent_id=user.id)
        if not personalization:
            return {"error": "Book not found"}, 404
        return jsonify(personalization)

    elif request.method == 'DELETE':
        personalization_manager.delete_personalization(personalization_id, parent_id=user.id)
        return "", 204

    return jsonify({"error": "Method not allowed"}), 405

""" __________________ Book Character Template ________________________"""

@app.route('/api/books/<int:book_id>/character-templates', methods=['GET', 'POST'])
@flask_praetorian.auth_required
@flask_praetorian.roles_required("Author")
def book_character_templates(book_id):
    user = flask_praetorian.current_user()

    if request.method == 'GET':
        templates = book_character_template_manager.get_all_book_character_templates(
            book_id=book_id,
            author_id=user.id
        )
        return jsonify(templates)

    elif request.method == 'POST':
        data = request.json
        template = book_character_template_manager.create_book_character_template(
            book_id=book_id,
            data=data,
            author_id=user.id
        )
        return jsonify(template), 201

    return jsonify({"error": "Method not allowed"}), 405


@app.route('/api/character-templates/<int:template_id>', methods=['GET', 'PATCH', 'DELETE'])
@flask_praetorian.auth_required
@flask_praetorian.roles_required("Author")
def book_character_template_detail(template_id):
    user = flask_praetorian.current_user()

    if request.method == 'GET':
        template = book_character_template_manager.get_book_character_template(
            template_id=template_id,
            author_id=user.id
        )
        return jsonify(template)

    elif request.method == 'PATCH':
        data = request.json
        template = book_character_template_manager.update_book_character_template(
            template_id=template_id,
            data=data,
            author_id=user.id
        )
        return jsonify(template)

    elif request.method == 'DELETE':
        book_character_template_manager.delete_book_character_template(
            template_id=template_id,
            author_id=user.id
        )
        return "", 204

    return jsonify({"error": "Method not allowed"}), 405

""" __________________ Personalization Characters ________________________"""
@app.route('/api/personalizations/<int:personalization_id>/characters', methods=['GET'])
@flask_praetorian.auth_required
@flask_praetorian.roles_required("Parent")
def personalization_characters(personalization_id):
    # No POST request, since the characters are already copied
    # from the templates to the personalization_characters table, when the user creates a personalization
    user = flask_praetorian.current_user()

    characters = personalization_characters_manager.get_all_personalization_characters(
        personalization_id=personalization_id,
        parent_id=user.id
    )

    return jsonify(characters)

@app.route('/api/characters/<int:character_id>', methods=['GET', 'PATCH'])
@flask_praetorian.auth_required
@flask_praetorian.roles_required("Parent")
def personalization_character_detail(character_id):
    user = flask_praetorian.current_user()

    if request.method == 'GET':
        character = personalization_characters_manager.get_personalization_character(
            character_id=character_id,
            parent_id=user.id
        )
        return jsonify(character)

    elif request.method == 'PATCH':
        data = request.json
        character = personalization_characters_manager.update_personalization_character(
            character_id=character_id,
            parent_id=user.id,
            data=data
        )
        return jsonify(character)

    return jsonify({"error": "Method not allowed"}), 405

@app.route('/api/characters/<int:character_id>/reset', methods=['POST'])
@flask_praetorian.auth_required
@flask_praetorian.roles_required("Parent")
def personalization_character_reset(character_id):
    user = flask_praetorian.current_user()
    reset_character = personalization_characters_manager.reset_character(character_id, parent_id=user.id)

    return jsonify(reset_character)


""" __________________ Reading Progress ________________________"""
@app.route('/api/reading-progress', methods=['GET', 'POST'])
@flask_praetorian.auth_required
@flask_praetorian.roles_required("Parent")
def reading_progress():
    user = flask_praetorian.current_user()
    data = request.get_json()

    if request.method == 'GET':
        progress = reading_progress_manager.get_all_reading_progress(
            data, parent_id=user.id
        )
        if not progress:
            return jsonify({"error": "Reading progress not found"}), 404

        return jsonify(progress)

    elif request.method == 'POST':
        data = request.json
        progress = reading_progress_manager.create_reading_progress(
            data, parent_id=user.id)
        return jsonify(progress), 201

    return jsonify({"error": "Method not allowed"}), 405

@app.route('/api/reading-progress/<int:progress_id>', methods=['GET', 'PATCH', 'DELETE'])
@flask_praetorian.auth_required
@flask_praetorian.roles_required("Parent")
def reading_progress_detail(progress_id):
    user = flask_praetorian.current_user()

    if request.method == 'GET':
        progress = reading_progress_manager.get_reading_progress(
            progress_id=progress_id,
            parent_id=user.id
        )
        if not progress:
            return jsonify({"error": "Reading progress not found"}), 404

        return jsonify(progress)

    elif request.method == 'PATCH':
        data = request.json
        progress = reading_progress_manager.update_reading_progress(
            progress_id=progress_id,
            parent_id=user.id,
            data=data
        )
        return jsonify(progress)

    elif request.method == 'DELETE':
        reading_progress_manager.delete_reading_progress(
            progress_id=progress_id,
            parent_id=user.id
        )
        return "", 204

    return jsonify({"error": "Method not allowed"}), 405

""" __________________ Errors ________________________"""
@app.errorhandler(ValueError)
def handle_value_error(e):
    return jsonify({"error": str(e)}), 404

@app.errorhandler(PermissionError)
def handle_permission_error(e):
    return jsonify({"error": str(e)}), 403

if __name__ == "__main__":
    app.run(debug=True)