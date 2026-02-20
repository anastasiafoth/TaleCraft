from data_manager import UserManager, ChildManager, BookManager, ChapterManager, PageManager, PersonalizationManager
from models import db, User
from flask import Flask, request, url_for,jsonify
import os
from dotenv import load_dotenv
import flask_praetorian
import flask_cors


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

# user handling
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

    new_user = user_manager.create_user(
        first_name=data["first_name"],
        last_name=data["last_name"],
        email=data["email"],
        role=data["role"],
        password=guard.hash_password(data["password"])
    )

    return jsonify(new_user), 201

@app.route('/api/logout', methods=['POST'])
@flask_praetorian.auth_required
def logout():
    """
    JWT token delete from frontend
    """
    return jsonify({"message": "Successfully logged out"}), 200

@app.route('/api/user', methods=['GET', 'PATCH', 'DELETE'])
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



# children handling
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

@app.route('/api/children/<int:child_id>', methods=['GET', 'PUT', 'DELETE'])
@flask_praetorian.auth_required
@flask_praetorian.roles_required("Parent")
def children_detail(child_id):
    user = flask_praetorian.current_user()

    if request.method == 'GET':
        child = child_manager.get_child(child_id, parent_id=user.id)
        if not child:
            return {"error": "Child not found"}, 404
    elif request.method == 'PUT':
        data = request.get_json()
        child_manager.update_child(child_id, data, parent_id=user.id)
    elif request.method == 'DELETE':
        child_manager.delete_child(child_id, parent_id=user.id)


# books handling
@app.route('/api/books/all')
def books_get_all():
    book_manager.get_all_books()

@app.route('/api/books/add', methods=['POST'])
@flask_praetorian.auth_required
@flask_praetorian.roles_required("Author")
def books():
    user = flask_praetorian.current_user()
    data = request.get_json()
    book_manager.create_book(user.id, data)

@app.route('/api/books/<int:book_id>', methods=['GET', 'PUT', 'DELETE'])
@flask_praetorian.auth_required
def book_detail(book_id):
    if request.method == 'GET':
        book = book_manager.get_book(book_id)
        if not book:
            return {"error": "Book not found"}, 404
    elif request.method == 'PUT':
        #flask_praetorian.roles_required("author")
        data = request.get_json()
        book_manager.update_book(book_id, data)
    elif request.method == 'DELETE':
        #flask_praetorian.roles_required("author")
        book_manager.delete_book(book_id)


# chapters handling
@app.route('/api/books/<int:book_id>/chapters', methods=['GET', 'POST'])

def chapters(book_id):
    if request.method == 'GET':
        chapter_manager.get_all_chapters(book_id)

    elif request.method == 'POST':
        chapter_manager.create_chapter(book_id)

@app.route('/api/chapters/<int:chapter_id>', methods=['GET', 'PUT', 'DELETE'])
def chapter_detail(chapter_id):
    if request.method == 'GET':
        chapter = chapter_manager.get_chapter(chapter_id)
        if not chapter:
            return {"error": "Book not found"}, 404
    elif request.method == 'PUT':
        data = request.get_json()
        chapter_manager.update_chapter(chapter_id, data)
    elif request.method == 'DELETE':
        chapter_manager.delete_chapter(chapter_id)


# pages handling
@app.route('/api/chapters/<int:chapter_id>/pages', methods=['GET', 'POST'])
def pages(chapter_id):
    if request.method == 'GET':
        page_manager.get_all_pages(chapter_id)

    elif request.method == 'POST':
        page_manager.create_page(chapter_id)

@app.route('/api/pages/<int:page_id>', methods=['GET', 'PUT', 'DELETE'])
def page_detail(page_id):
    if request.method == 'GET':
        page = page_manager.get_page(page_id)
        if not page:
            return {"error": "Book not found"}, 404
    elif request.method == 'PUT':
        data = request.get_json()
        page_manager.update_page(page_id, data)
    elif request.method == 'DELETE':
        page_manager.delete_page(page_id)


# personalization handling
@app.route('/api/parent/<int:parent_id>/personalization', methods=['GET', 'POST'])
def personalizations(parent_id):
    if request.method == 'GET':
        personalization_manager.get_all_personalizations(parent_id)

    elif request.method == 'POST':
        personalization_manager.create_personalization(parent_id)

@app.route('/api/parent/<int:parent_id>/personalization/<personalization_id>', methods=['GET', 'PUT', 'DELETE'])
def personalization_detail(personalization_id):
    if request.method == 'GET':
        personalization = personalization_manager.get_personalization(personalization_id)
        if not personalization:
            return {"error": "Book not found"}, 404
    elif request.method == 'PUT':
        personalization_manager.update_personalization(personalization_id)
    elif request.method == 'DELETE':
        personalization_manager.delete_personalization(personalization_id)


# reading process


if __name__ == "__main__":
    app.run(debug=True)