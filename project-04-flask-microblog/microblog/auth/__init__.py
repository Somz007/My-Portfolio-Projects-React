"""
Auth Blueprint
────────────────────────────────────────────────────────────────────
A Blueprint is a collection of routes, templates, and static files
that can be registered on a Flask app.

Think of it like a React feature folder — all the auth-related
logic (register, login, logout) lives here, separate from the blog.

Blueprint('auth', __name__) means:
  - The blueprint is named 'auth' (used in url_for: 'auth.login')
  - __name__ tells Flask where to find this blueprint's templates
"""
from flask import Blueprint

auth = Blueprint('auth', __name__)

# Import routes AFTER creating the blueprint to avoid circular imports.
# routes.py uses the `auth` object defined above.
from . import routes  # noqa: F401, E402
