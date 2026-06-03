"""
App Factory — microblog/__init__.py
────────────────────────────────────────────────────────────────────
This module defines create_app(), the factory function that builds and
returns a configured Flask application instance.

Why a factory?
  - A test suite can call create_app('testing') to get an isolated app
    with an in-memory database, without touching the dev database.
  - Extensions (db, login_manager, csrf) are created here without being
    bound to any app — they attach via init_app() inside the factory.
    This prevents circular imports between models, blueprints, and app.

Extension lifecycle:
  db = SQLAlchemy()       ← created, not bound
  db.init_app(app)        ← bound to THIS app instance inside factory
"""
from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_wtf.csrf import CSRFProtect

from .config import config

# ── Extensions created at module level, not bound to any app yet ──
db            = SQLAlchemy()
login_manager = LoginManager()
csrf          = CSRFProtect()

# Redirect unauthenticated users to the login page.
# 'auth.login' means: the 'login' route inside the 'auth' blueprint.
login_manager.login_view    = 'auth.login'
login_manager.login_message = 'Please log in to access this page.'
login_manager.login_message_category = 'info'


def create_app(config_name='default'):
    """
    Flask application factory.

    Args:
        config_name: Key into the config dict ('development', 'production').

    Returns:
        A fully configured Flask application instance.
    """
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # ── Attach extensions to this app instance ─────────────────────
    db.init_app(app)
    login_manager.init_app(app)
    # CSRFProtect validates the csrf_token hidden input on every POST
    # request automatically. Any POST without a valid token gets a 400.
    csrf.init_app(app)

    # ── Register Blueprints ────────────────────────────────────────
    # Blueprints are imported here (inside the factory) to avoid
    # circular imports — they need db and login_manager to exist first.
    from .auth import auth as auth_blueprint
    from .blog import blog as blog_blueprint

    app.register_blueprint(auth_blueprint)
    app.register_blueprint(blog_blueprint)

    # ── Custom error pages ─────────────────────────────────────────
    @app.errorhandler(404)
    def not_found(e):
        return render_template('errors/404.html'), 404

    @app.errorhandler(403)
    def forbidden(e):
        return render_template('errors/403.html'), 403

    # ── CLI command: flask init-db ─────────────────────────────────
    @app.cli.command('init-db')
    def init_db_command():
        """Create all database tables. Run once after cloning."""
        db.create_all()
        print('Database initialised successfully.')

    return app
