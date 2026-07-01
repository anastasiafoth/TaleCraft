from data_manager import UserManager, ChildManager, BookManager, ChapterManager, PageManager, BookCharacterTemplateManager, PersonalizationManager, PersonalizationCharactersManager, ReadingProgressManager
from models import db, User, R2File
from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
import flask_praetorian
import flask_cors
# Migrations
from flask_migrate import Migrate

# for S3 Storage config
import uuid
import boto3
from botocore.exceptions import ClientError

# mail config
from flask_mail import Mail

load_dotenv()

NEON_KEY = os.getenv("NEON_KEY")
# S3 Storage config with Cloudflare R2 + Neon
R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME")
R2_PUBLIC_BASE_URL = os.getenv("R2_PUBLIC_BASE_URL")
R2_ENDPOINT_URL = f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
s3_client = boto3.client(
    service_name='s3',
    endpoint_url=R2_ENDPOINT_URL,
    aws_access_key_id=os.getenv("R2_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("R2_SECRET_ACCESS_KEY"),
    region_name='auto'
)
app = Flask(__name__)
app.debug = True
app.config['SECRET_KEY'] = 'a_very_long_random_secret_key_at_least_32_chars'
app.config['JWT_ACCESS_LIFESPAN'] = {'hours': 24}
app.config['JWT_REFRESH_LIFESPAN'] = {'days': 30}

app.config['MAIL_SERVER'] = 'smtp.web.de'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME")
app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD")
app.config['MAIL_DEFAULT_SENDER'] = os.getenv("MAIL_USERNAME")
app.config['MAIL_TIMEOUT'] = 10

# mail
mail = Mail(app)

#jwt auth
guard = flask_praetorian.Praetorian()
# Initialize the flask-praetorian instance for the app
guard.init_app(app, User)

flask_cors.CORS(
    app,
    resources={r"/api/*": {"origins": ["http://localhost:5173", "https://talecraft-owts.onrender.com", "https://tale-craft-orpin.vercel.app",]}},
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["Authorization"],
    methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
)

app.config['SQLALCHEMY_DATABASE_URI'] = NEON_KEY
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
#Connection Pooling Problem
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_pre_ping': True,  # Checks connection before usage
    'pool_recycle': 300,    # Recycle connection after 5 min
}


# Link the database and the app. This is the reason you need to import db from models
db.init_app(app)

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

# S3 Storage config
# 1. Generate Presigned URL for Upload
@app.route("/presign-upload", methods=["POST"])
@flask_praetorian.auth_required
def presign_upload_route():
    try:
        user = flask_praetorian.current_user()
        user_id = user.id
        if not user_id:
            return jsonify({"success": False, "error": "Unauthorized"}), 401
        data = request.get_json()
        file_name = data.get('fileName')
        content_type = data.get('contentType')
        if not file_name or not content_type:
             raise ValueError("fileName and contentType required")
        object_key = f"{uuid.uuid4()}-{file_name}"
        public_file_url = f"{R2_PUBLIC_BASE_URL}/{object_key}" if R2_PUBLIC_BASE_URL else None
        presigned_url = s3_client.generate_presigned_url(
            'put_object',
            Params={'Bucket': R2_BUCKET_NAME, 'Key': object_key, 'ContentType': content_type},
            ExpiresIn=300
        )
        return jsonify({ "success": True, "presignedUrl": presigned_url, "objectKey": object_key, "publicFileUrl": public_file_url }), 200
    except (ClientError, ValueError) as e:
        print(f"Presign Error: {e}")
        return jsonify({"success": False, "error": f"Failed to prepare upload: {e}"}), 500
    except Exception as e:
        print(f"Unexpected Presign Error: {e}")
        return jsonify({"success": False, "error": "Server error"}), 500
# 2. Save Metadata after Client Upload Confirmation
@app.route("/save-metadata", methods=["POST"])
@flask_praetorian.auth_required
def save_metadata_route():
    user = flask_praetorian.current_user()
    user_id = user.id
    if not user_id:
        return jsonify({"success": False, "error": "Unauthorized"}), 401
    data = request.get_json()
    object_key = data.get('objectKey')
    public_file_url = data.get('publicFileUrl')
    if not object_key: raise ValueError("objectKey required")
    final_file_url = public_file_url or (f"{R2_PUBLIC_BASE_URL}/{object_key}" if R2_PUBLIC_BASE_URL else 'URL not available')

    new_file = R2File(object_key=object_key, file_url=final_file_url, user_id=user_id)
    db.session.add(new_file)
    db.session.commit()

    return jsonify({"success": True}), 201

@app.route('/api/assets', methods=['GET'])
@flask_praetorian.auth_required
def get_assets():
    assets = R2File.query.all()
    return jsonify([{
        "id": a.id,
        "object_key": a.object_key,
        "file_url": a.file_url
    } for a in assets]), 200


@app.route('/api/assets/sync', methods=['POST'])
@flask_praetorian.auth_required
@flask_praetorian.roles_required("Author")
def sync_assets():
    """ Syncs images from R2 bucket to DB"""
    # Gets all objects from R2 bucket
    response = s3_client.list_objects_v2(Bucket=R2_BUCKET_NAME)
    objects = response.get('Contents', [])

    added = 0
    for obj in objects:
        object_key = obj['Key']

        # check if object already exists in DB
        exists = R2File.query.filter_by(object_key=object_key).first()
        if not exists:
            file_url = f"{R2_PUBLIC_BASE_URL}/{object_key}"
            new_file = R2File(
                object_key=object_key,
                file_url=file_url,
                user_id=flask_praetorian.current_user().id
            )
            db.session.add(new_file)
            added += 1

    db.session.commit()
    return jsonify({"success": True, "added": added}), 200


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

    if not email:
        raise ValueError("Please enter an email.")

    if not password:
        raise ValueError("Please enter an password.")

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
    # silent=True suppresses 415 if Content-Type is not application/json
    data = request.get_json(silent=True)

    # None means missing body, invalid JSON, or wrong Content-Type
    if data is None:
        return jsonify({"error": "Invalid or missing JSON body."}), 400

    new_user = user_manager.create_user(guard, data, mail)
    return jsonify(new_user), 201


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
        # silent=True suppresses 415 if Content-Type is not application/json
        data = request.get_json(silent=True)

        # None means missing body, invalid JSON, or wrong Content-Type
        if data is None:
            return jsonify({"error": "Invalid or missing JSON body."}), 400
        updated_user = user_manager.update_user(user.id, data)
        return jsonify(updated_user), 200

    return jsonify({"error": "Method not allowed"}), 405

@app.route('/api/auth/forgot-password', methods=['POST'])
def handle_forgot_password():
    if request.method == 'POST':
        data = request.get_json(silent=True)

        if data is None:
            return jsonify({"error": "Invalid or missing JSON body."}), 400

        response = user_manager.forgot_password(data, mail)
        return jsonify(response), 200

    return jsonify({"error": "Method not allowed"}), 405


@app.route('/api/auth/reset-password', methods=['POST'])
def handle_reset_password():

    if request.method == 'POST':
        data = request.get_json(silent=True)

        if data is None:
            return jsonify({"error": "Invalid or missing JSON body."}), 400

        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({"error": "Missing token"}), 401

        reset_token = auth_header.replace("Bearer ", "")
        updated_user = user_manager.reset_password(guard, data, reset_token)

        return jsonify(updated_user), 200

    return jsonify({"error": "Method not allowed"}), 405

@app.route('/api/contact', methods=['POST'])
def contact():
    if request.method == 'POST':
        data = request.get_json(silent=True)

        if data is None:
            return jsonify({"error": "Invalid or missing JSON body."}), 400

        if (data["first_name"] == "" == ""
                or data["email"] == ""
                or data["message"] == ""
                or data["privacy_policy"] == False):
            return jsonify({"error": "Please fill out required fields."}), 400
        else:
            return jsonify({"message": "Contact request received"}), 200

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
        # silent=True suppresses 415 if Content-Type is not application/json
        data = request.get_json(silent=True)

        # None means missing body, invalid JSON, or wrong Content-Type
        if data is None:
            return jsonify({"error": "Invalid or missing JSON body."}), 400
        new_child = child_manager.create_child(
            parent_id=user.id,
            first_name=data.get("first_name"),
            birthdate=data.get("birthdate"),
            profile_img=data.get("profile_img"))

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
        # silent=True suppresses 415 if Content-Type is not application/json
        data = request.get_json(silent=True)

        # None means missing body, invalid JSON, or wrong Content-Type
        if data is None:
            return jsonify({"error": "Invalid or missing JSON body."}), 400

        updated_child = child_manager.update_child(child_id, data, parent_id=user.id)
        return jsonify(updated_child), 200

    elif request.method == 'DELETE':
        deleted_child = child_manager.delete_child(child_id, parent_id=user.id)
        return jsonify(deleted_child), 200

    return jsonify({"error": "Method not allowed"}), 405


""" __________________ Books ________________________"""
@app.route('/api/books')
def books_get_all():
    """ Get only published books. """
    all_books = book_manager.get_all_books(published_only=True)
    return jsonify(all_books), 200

@app.route('/api/my-books')
@flask_praetorian.auth_required
def get_authors_books():
    """ Get all books of Author, only Author can have access to unpublished books. """
    user = flask_praetorian.current_user()
    all_books = book_manager.get_all_books(author_id=user.id)
    return jsonify(all_books), 200

@app.route('/api/books/<int:book_id>')
@flask_praetorian.auth_required
def book_get_by_id(book_id):
    """ Get book by id """
    user = flask_praetorian.current_user()

    book = book_manager.get_book(book_id)

    # Only Authors can get their own book if book is not published
    if not book["is_published"]:
        if user.id != book["author_id"]:
            return jsonify({"error": "Book not found"}), 404
    return jsonify(book), 200

@app.route('/api/books', methods=['POST'])
@flask_praetorian.auth_required
@flask_praetorian.roles_required("Author")
def add_book():
    user = flask_praetorian.current_user()
    # silent=True suppresses 415 if Content-Type is not application/json
    data = request.get_json(silent=True)

    # None means missing body, invalid JSON, or wrong Content-Type
    if data is None:
        return jsonify({"error": "Invalid or missing JSON body."}), 400

    new_book = book_manager.create_book(user, data)
    return jsonify(new_book), 201

@app.route('/api/books/<int:book_id>', methods=['PATCH', 'DELETE'])
@flask_praetorian.auth_required
@flask_praetorian.roles_required("Author")
def book_detail(book_id):
    user = flask_praetorian.current_user()

    if request.method == 'PATCH':
        # silent=True suppresses 415 if Content-Type is not application/json
        data = request.get_json(silent=True)

        # None means missing body, invalid JSON, or wrong Content-Type
        if data is None:
            return jsonify({"error": "Invalid or missing JSON body."}), 400

        updated_book = book_manager.update_book(book_id, data, author_id=user.id)
        return jsonify(updated_book), 200

    elif request.method == 'DELETE':
        deleted_book = book_manager.delete_book(book_id, author_id=user.id)
        return jsonify(deleted_book), 200

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
    # silent=True suppresses 415 if Content-Type is not application/json
    data = request.get_json(silent=True)

    # None means missing body, invalid JSON, or wrong Content-Type
    if data is None:
        return jsonify({"error": "Invalid or missing JSON body."}), 400

    new_chapter = chapter_manager.create_chapter(book_id, data, author_id=user.id)

    return jsonify(new_chapter), 201

@app.route('/api/chapters/<int:chapter_id>', methods=['PATCH', 'DELETE'])
@flask_praetorian.auth_required
@flask_praetorian.roles_required("Author")
def chapter_detail(chapter_id):
    user = flask_praetorian.current_user()
    if request.method == 'PATCH':
        # silent=True suppresses 415 if Content-Type is not application/json
        data = request.get_json(silent=True)

        # None means missing body, invalid JSON, or wrong Content-Type
        if data is None:
            return jsonify({"error": "Invalid or missing JSON body."}), 400

        updated_chapter = chapter_manager.update_chapter(chapter_id, data, author_id=user.id)
        return jsonify(updated_chapter), 200
    elif request.method == 'DELETE':
        deleted_chapter = chapter_manager.delete_chapter(chapter_id, author_id=user.id)
        return jsonify(deleted_chapter), 200

    return jsonify({"error": "Method not allowed"}), 405


""" __________________ Pages ________________________"""

@app.route('/api/books/<int:book_id>/pages')
def all_pages_by_book(book_id):
    pages = page_manager.get_all_pages_by_book(book_id)
    return jsonify(pages), 200

@app.route('/api/chapters/<int:chapter_id>/pages')
def all_pages(chapter_id):
    all_pages = page_manager.get_all_pages(chapter_id)
    return jsonify(all_pages), 200

@app.route('/api/chapters/<int:chapter_id>/pages', methods=['POST'])
@flask_praetorian.auth_required
@flask_praetorian.roles_required("Author")
def add_page(chapter_id):
    user = flask_praetorian.current_user()
    # silent=True suppresses 415 if Content-Type is not application/json
    data = request.get_json(silent=True)

    # None means missing body, invalid JSON, or wrong Content-Type
    if data is None:
        return jsonify({"error": "Invalid or missing JSON body."}), 400

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
        # silent=True suppresses 415 if Content-Type is not application/json
        data = request.get_json(silent=True)

        # None means missing body, invalid JSON, or wrong Content-Type
        if data is None:
            return jsonify({"error": "Invalid or missing JSON body."}), 400

        updated_page = page_manager.update_page(page_id, data, author_id=user.id)
        return jsonify(updated_page), 200
    elif request.method == 'DELETE':
        deleted_page = page_manager.delete_page(page_id, author_id=user.id)
        return jsonify(deleted_page), 200

    return jsonify({"error": "Method not allowed"}), 405


""" __________________ Personalization ________________________"""
@app.route('/api/personalizations')
@flask_praetorian.auth_required
@flask_praetorian.roles_required("Parent")
def personalizations():
    user = flask_praetorian.current_user()

    all_personalizations = personalization_manager.get_all_personalizations(parent_id=user.id)
    return jsonify(all_personalizations)

@app.route('/api/books/<int:book_id>/personalization', methods=['POST'])
@flask_praetorian.auth_required
@flask_praetorian.roles_required("Parent")
def post_personalizations(book_id):
    user = flask_praetorian.current_user()

    personalization = personalization_manager.create_personalization(book_id, parent_id=user.id)
    return jsonify(personalization)

@app.route('/api/personalization/<personalization_id>', methods=['GET', 'DELETE'])
@flask_praetorian.auth_required
@flask_praetorian.roles_required("Parent")
def personalization_detail(personalization_id):
    user = flask_praetorian.current_user()
    if request.method == 'GET':
        personalization = (
            personalization_manager.get_personalization
            (personalization_id, parent_id=user.id))
        if not personalization:
            return {"error": "Personalization not found"}, 404
        return jsonify(personalization)

    elif request.method == 'DELETE':
        deleted_personalization = (
            personalization_manager.delete_personalization
            (personalization_id, parent_id=user.id))

        return jsonify(deleted_personalization), 200

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
        deleted_template = book_character_template_manager.delete_book_character_template(
            template_id=template_id,
            author_id=user.id
        )
        return jsonify(deleted_template), 200

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

    if request.method == 'GET':
        # Query Param instead of JSON Body, since GET is forbidding bodies
        child_id = request.args.get("child_id", type=int)

        if not child_id:
            return jsonify({"error": "Missing child_id"}), 400

        progress = reading_progress_manager.get_all_reading_progress(
            child_id, parent_id=user.id
        )

        return jsonify(progress), 200


    elif request.method == 'POST':
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing JSON body"}), 400

        try:
            progress = reading_progress_manager.create_reading_progress(
                data, parent_id=user.id
            )

            return jsonify(progress), 200  # 200 für beide Fälle, Frontend muss nicht unterscheiden

        except ValueError as e:
            return jsonify({"error": str(e)}), 400

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
        delete_progress = reading_progress_manager.delete_reading_progress(
            progress_id=progress_id,
            parent_id=user.id
        )
        return jsonify(delete_progress), 200

    return jsonify({"error": "Method not allowed"}), 405

""" __________________ Errors ________________________"""
@app.errorhandler(ValueError)
def handle_value_error(e):
    return jsonify({"error": str(e)}), 400

@app.errorhandler(PermissionError)
def handle_permission_error(e):
    return jsonify({"error": str(e)}), 403

if __name__ == "__main__":
    app.run(debug=True)