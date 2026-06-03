# Flask Microblog

> A full-stack microblogging web application built with Python and Flask. Users can register, log in, write posts, and read from a shared feed — with pagination, user profiles, and full CRUD.

---

## Features

- **User registration & login** — email + password auth with Werkzeug PBKDF2 hashing
- **Session persistence** — Flask-Login keeps users logged in across requests; optional 30-day "remember me"
- **Create / Read / Update / Delete posts** — full CRUD with owner-only guards (server-side, not just UI)
- **Paginated home feed** — 10 posts per page, newest first
- **User profile pages** — `/user/<username>` shows all posts by that user, paginated
- **Flash messages** — success, error, and info alerts with Bootstrap dismissal
- **CSRF protection** — Flask-WTF validates a token on every POST form; requests without it are rejected
- **XSS-safe rendering** — post bodies are auto-escaped by Jinja2 (no `| safe`); line breaks preserved via CSS
- **Custom error pages** — branded 404 and 403 templates instead of default Flask error screens
- **Responsive UI** — Bootstrap 5 grid; works on mobile and desktop
- **SQLite database** — zero configuration, file-based, managed via SQLAlchemy ORM

---

## Tech Stack

| Layer | Choice |
|---|---|
| Language | Python 3.10+ |
| Framework | Flask 3.0 |
| ORM | Flask-SQLAlchemy 3.1 |
| Database | SQLite (file: `instance/microblog.db`) |
| Auth | Flask-Login + Werkzeug password hashing |
| Security | Flask-WTF (CSRF protection) |
| Templating | Jinja2 (bundled with Flask) |
| CSS | Bootstrap 5 (CDN) + custom `style.css` |
| Config | python-dotenv `.env` file |

---

## Project Structure

```
project-04-flask-microblog/
├── microblog/                  ← Flask application package
│   ├── __init__.py             ← App factory (create_app)
│   ├── config.py               ← Dev / Prod config classes
│   ├── models.py               ← User + Post SQLAlchemy models
│   ├── auth/
│   │   ├── __init__.py         ← auth Blueprint
│   │   └── routes.py           ← /register /login /logout
│   ├── blog/
│   │   ├── __init__.py         ← blog Blueprint
│   │   └── routes.py           ← / /create /post/<id> /update /delete /user/<name>
│   ├── templates/
│   │   ├── base.html           ← Bootstrap 5 layout, navbar, flash messages
│   │   ├── index.html          ← Paginated home feed
│   │   ├── auth/
│   │   │   ├── login.html
│   │   │   └── register.html
│   │   ├── blog/
│   │   │   ├── post.html       ← Single post view
│   │   │   ├── create.html     ← New post form
│   │   │   └── update.html     ← Edit post form
│   │   └── user/
│   │       └── profile.html    ← User's post archive
│   └── static/
│       └── css/
│           └── style.css       ← Custom styles over Bootstrap
├── run.py                      ← Entry point
├── .env                        ← SECRET_KEY (not committed)
├── .env.example
└── requirements.txt
```

---

## Getting Started

### 1. Create and activate a virtual environment

```bash
cd project-04-flask-microblog

# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment

```bash
copy .env.example .env    # Windows
# or
cp .env.example .env      # macOS / Linux
```

The defaults in `.env.example` work for local development — no changes needed to run the app.

### 4. Run

```bash
python run.py
```

`db.create_all()` runs automatically on first start, creating `instance/microblog.db`.

Open [http://localhost:5000](http://localhost:5000).

---

## Flask Concepts Used

### App Factory Pattern

```python
def create_app(config_name='default'):
    app = Flask(__name__)
    db.init_app(app)          # extensions attach here, not globally
    app.register_blueprint(auth_blueprint)
    app.register_blueprint(blog_blueprint)
    return app
```

Allows multiple app instances — useful for testing with a separate in-memory database.

### Blueprints

```python
# microblog/auth/__init__.py
auth = Blueprint('auth', __name__)

# In a route file:
@auth.route('/login', methods=['GET', 'POST'])
def login(): ...

# In a template:
{{ url_for('auth.login') }}   {# generates /login #}
```

### Password Hashing

```python
# On registration — stores 'pbkdf2:sha256:600000$salt$hash'
user.set_password('mypassword')

# On login — re-hashes the attempt and compares
user.check_password('mypassword')  # → True
user.check_password('wrong')       # → False
```

### Pagination

```python
# Route
posts = Post.query.order_by(Post.created_at.desc()).paginate(page=page, per_page=10)

# Template — posts.items is the list for the current page
{% for post in posts.items %} ... {% endfor %}
{% if posts.has_next %} <a href="?page={{ posts.next_num }}">Next</a> {% endif %}
```

### Owner Guard (server-side)

```python
@blog.route('/post/<int:id>/update', methods=['GET', 'POST'])
@login_required
def update(id):
    post = db.get_or_404(Post, id)
    if post.author != current_user:
        abort(403)   # Forbidden — even if someone crafts the URL directly
```

---

## Routes

| Method | URL | Description |
|---|---|---|
| GET | `/` | Home feed (paginated) |
| GET | `/register` | Registration form |
| POST | `/register` | Process registration |
| GET | `/login` | Login form |
| POST | `/login` | Process login |
| GET | `/logout` | Log out |
| GET | `/post/<id>` | Single post |
| GET | `/create` | New post form |
| POST | `/create` | Publish post |
| GET | `/post/<id>/update` | Edit form |
| POST | `/post/<id>/update` | Save edits |
| POST | `/post/<id>/delete` | Delete post |
| GET | `/user/<username>` | User profile |

---

## Status

> Complete. Next: Markdown rendering for post bodies, user avatars (Gravatar), search, tags.

---

## License

MIT
