from data_manager import DataManager
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
app.config['SECRET_KEY'] = 'top secret'
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

"""with app.app_context():
    db.create_all()"""

# Create an object of your DataManager class
data_manager = DataManager()

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

""" eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzA4OTMzNjAsImV4cCI6MTc3MDk3OTc2MCwianRpIjoiOGIxNzlmMjktMmJkZC00ODVmLTkwODUtNzc2MGZhODFkNGJkIiwiaWQiOjEsInJscyI6IkF1dGhvciIsInJmX2V4cCI6MTc3MzQ4NTM2MH0.u8eaeOUomgXYLmByCoA6uJdJexOsIU1tRZ4FT5ZkX3A"""

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

    new_user = data_manager.create_user(
        first_name=data["first_name"],
        last_name=data["last_name"],
        email=data["email"],
        role=data["role"],
        password=guard.hash_password(data["password"])
    )

    return jsonify({
        "id": new_user.id,
        "first_name": new_user.first_name,
        "last_name": new_user.last_name,
        "email": new_user.email,
        "role": new_user.role
    }), 201

@app.route('/api/logout', methods=['POST'])
@flask_praetorian.auth_required
def logout():
    """
    JWT token delete??
    """
    return jsonify({"message": "Successfully logged out"}), 200


# children handling
@app.route('/api/children', methods=['GET', 'POST'])
@flask_praetorian.auth_required
@flask_praetorian.roles_required("parent")
def children():
    user = flask_praetorian.current_user()

    if request.method == 'GET':
        data_manager.get_all_children(parent_id=user.id)

    elif request.method == 'POST':
        data = request.get_json()
        data_manager.create_child(parent_id=user.id, data=data)

@app.route('/api/children/<int:child_id>', methods=['GET', 'PUT', 'DELETE'])
@flask_praetorian.auth_required
@flask_praetorian.roles_required("parent")
def children_detail(child_id):
    user = flask_praetorian.current_user()

    if request.method == 'GET':
        child = data_manager.get_child(child_id, parent_id=user.id)
        if not child:
            return {"error": "Book not found"}, 404
    elif request.method == 'PUT':
        data = request.get_json()
        data_manager.update_child(child_id, data, parent_id=user.id)
    elif request.method == 'DELETE':
        data_manager.delete_child(child_id, parent_id=user.id)


# books handling
@app.route('/api/books', methods=['GET', 'POST'])
@flask_praetorian.auth_required
def books():
    user = flask_praetorian.current_user()

    if request.method == 'GET':
        data_manager.get_all_books()

    elif request.method == 'POST':
        #flask_praetorian.roles_required("author")
        data = request.get_json()
        data_manager.create_book(data)

@app.route('/api/books/<int:book_id>', methods=['GET', 'PUT', 'DELETE'])
@flask_praetorian.auth_required
def book_detail(book_id):
    if request.method == 'GET':
        book = data_manager.get_book(book_id)
        if not book:
            return {"error": "Book not found"}, 404
    elif request.method == 'PUT':
        #flask_praetorian.roles_required("author")
        data = request.get_json()
        data_manager.update_book(book_id, data)
    elif request.method == 'DELETE':
        #flask_praetorian.roles_required("author")
        data_manager.delete_book(book_id)


# chapters handling
@app.route('/api/books/<int:book_id>/chapters', methods=['GET', 'POST'])

def chapters(book_id):
    if request.method == 'GET':
        data_manager.get_all_chapters(book_id)

    elif request.method == 'POST':
        data_manager.create_chapter(book_id)

@app.route('/api/chapters/<int:chapter_id>', methods=['GET', 'PUT', 'DELETE'])
def chapter_detail(chapter_id):
    if request.method == 'GET':
        chapter = data_manager.get_chapter(chapter_id)
        if not chapter:
            return {"error": "Book not found"}, 404
    elif request.method == 'PUT':
        data = request.get_json()
        data_manager.update_chapter(chapter_id, data)
    elif request.method == 'DELETE':
        data_manager.delete_chapter(chapter_id)


# pages handling
@app.route('/api/chapters/<int:chapter_id>/pages', methods=['GET', 'POST'])
def pages(chapter_id):
    if request.method == 'GET':
        data_manager.get_all_pages(chapter_id)

    elif request.method == 'POST':
        data_manager.create_page(chapter_id)

@app.route('/api/pages/<int:page_id>', methods=['GET', 'PUT', 'DELETE'])
def page_detail(page_id):
    if request.method == 'GET':
        page = data_manager.get_page(page_id)
        if not page:
            return {"error": "Book not found"}, 404
    elif request.method == 'PUT':
        data = request.get_json()
        data_manager.update_page(page_id, data)
    elif request.method == 'DELETE':
        data_manager.delete_page(page_id)


# personalization handling
@app.route('/api/parent/<int: parent_id>/personalization', methods=['GET', 'POST'])
def personalizations(parent_id):
    if request.method == 'GET':
        data_manager.get_all_personalizations(parent_id)

    elif request.method == 'POST':
        data_manager.create_personalization(parent_id)

@app.route('/api/parent/<int: parent_id>/personalization/<personalization_id>', methods=['GET', 'PUT', 'DELETE'])
def personalization_detail(personalization_id):
    if request.method == 'GET':
        personalization = data_manager.get_personalization(personalization_id)
        if not personalization:
            return {"error": "Book not found"}, 404
    elif request.method == 'PUT':
        data_manager.update_personalization(personalization_id)
    elif request.method == 'DELETE':
        data_manager.delete_personalization(personalization_id)


# reading process


if __name__ == "__main__":
    app.run(debug=True)