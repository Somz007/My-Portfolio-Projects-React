"""
Configuration classes for the Flask app.

Using classes instead of a flat dict lets us inherit shared settings
and override only what changes between environments.

python-dotenv loads .env automatically when Flask starts, so
os.environ will contain the values from that file.
"""
import os

# Load .env into os.environ before reading
from dotenv import load_dotenv
load_dotenv()


class Config:
    """Base configuration — shared by all environments."""

    # SECRET_KEY is used by Flask to:
    #   - Sign session cookies (so users can't tamper with them)
    #   - Sign flash messages
    # It MUST be a long random string in production.
    SECRET_KEY = os.environ.get('SECRET_KEY', 'fallback-dev-key')

    # SQLAlchemy database URI.
    # sqlite:///microblog.db creates microblog.db in the instance folder.
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL', 'sqlite:///microblog.db'
    )

    # Disable modification tracking — we don't use it and it wastes memory.
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Show 10 posts per page on the home feed and profile pages.
    POSTS_PER_PAGE = 10


class DevelopmentConfig(Config):
    """Development: debug mode on, verbose errors."""
    DEBUG = True


class ProductionConfig(Config):
    """Production: debug off, strong secret key required."""
    DEBUG = False


# Map string names to config classes — used by create_app().
config = {
    'development': DevelopmentConfig,
    'production':  ProductionConfig,
    'default':     DevelopmentConfig,
}
