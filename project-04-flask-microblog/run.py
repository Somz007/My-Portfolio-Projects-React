"""
Application entry point.

Run the development server with:
  python run.py

Or use the Flask CLI:
  flask --app run run --debug

The FLASK_APP environment variable can also be set to 'run' in .env.
"""
from microblog import create_app, db

app = create_app('development')

if __name__ == '__main__':
    # Create all database tables if they don't exist yet.
    # In production you'd use Flask-Migrate for schema migrations.
    with app.app_context():
        db.create_all()

    app.run(debug=True, host='0.0.0.0', port=5000)
