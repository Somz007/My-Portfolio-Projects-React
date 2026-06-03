"""
Database Models — User and Post
────────────────────────────────────────────────────────────────────
SQLAlchemy ORM: each class here maps to one database table.

  Python class  →  SQL table
  attribute     →  column
  instance      →  row

The relationship between User and Post:
  - One user can have MANY posts (one-to-many)
  - db.relationship('Post', backref='author') lets us write:
      post.author          → the User who wrote it
      user.posts           → list of all their Post objects
  - db.ForeignKey('user.id') on Post.user_id is the actual SQL link

Flask-Login requires the User model to implement 4 properties/methods.
Inheriting UserMixin provides default implementations of all four:
  is_authenticated, is_active, is_anonymous, get_id()
"""
from datetime import datetime, timezone

from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

from . import db, login_manager


class User(UserMixin, db.Model):
    """
    Represents a registered user.

    Columns:
        id           — auto-incremented primary key
        username     — unique display name (used in profile URLs)
        email        — unique email address (used for login)
        password_hash — bcrypt hash, NEVER the raw password
        created_at   — when the account was created
        posts        — virtual relationship to this user's Post rows
    """
    __tablename__ = 'user'

    id            = db.Column(db.Integer, primary_key=True)
    username      = db.Column(db.String(80),  unique=True, nullable=False)
    email         = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at    = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # backref='author' adds a virtual .author attribute to every Post,
    # so post.author returns the User object without an extra query.
    posts = db.relationship('Post', backref='author', lazy='dynamic')

    def set_password(self, password):
        """
        Hash and store a password.

        generate_password_hash uses PBKDF2-HMAC-SHA256 with a random salt
        and 600,000 iterations. The full string stored looks like:
          'pbkdf2:sha256:600000$randomsalt$hexdigest'

        The salt ensures the same password produces a different hash every
        time — so if two users share a password, their hashes differ.
        """
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """
        Verify a password against the stored hash.

        Returns True if the password matches, False otherwise.
        Never reverses the hash — re-hashes the attempt and compares.
        """
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'


class Post(db.Model):
    """
    Represents a single blog post.

    Columns:
        id         — auto-incremented primary key
        title      — post heading
        body       — full post content (Text = unlimited length)
        created_at — publication timestamp
        updated_at — last edit timestamp
        user_id    — foreign key to user.id (who wrote it)
    """
    __tablename__ = 'post'

    id         = db.Column(db.Integer, primary_key=True)
    title      = db.Column(db.String(200), nullable=False)
    body       = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    # ForeignKey creates the actual SQL constraint: post.user_id → user.id
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def excerpt(self, length=200):
        """Return a truncated preview of the post body for the feed."""
        return self.body[:length] + '…' if len(self.body) > length else self.body

    def __repr__(self):
        return f'<Post {self.title!r}>'


@login_manager.user_loader
def load_user(user_id):
    """
    Flask-Login user loader callback.

    Flask-Login stores the user's id in the session cookie. On every
    request it calls this function to load the full User object from
    the database. Returning None means 'not logged in'.
    """
    return db.session.get(User, int(user_id))
