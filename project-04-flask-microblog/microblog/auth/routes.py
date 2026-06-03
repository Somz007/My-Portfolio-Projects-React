"""
Auth Routes — /register, /login, /logout
────────────────────────────────────────────────────────────────────
Flask routes are Python functions decorated with @blueprint.route().
The decorator maps a URL pattern to the function beneath it.

Methods=['GET', 'POST'] means:
  GET  → user is visiting the page (show the form)
  POST → user submitted the form (process the data)

This is the standard Flask pattern for form handling.
"""
from flask import render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required, current_user

from . import auth
from .. import db
from ..models import User


@auth.route('/register', methods=['GET', 'POST'])
def register():
    """
    Registration page.

    GET:  Render the registration form.
    POST: Validate input, create the user, redirect to login.

    redirect() sends the browser to a different URL.
    url_for('auth.login') generates the URL for the login route —
    'auth' is the blueprint name, 'login' is the function name.
    """
    # If the user is already logged in, send them to the home page.
    if current_user.is_authenticated:
        return redirect(url_for('blog.index'))

    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        email    = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        confirm  = request.form.get('confirm_password', '')

        # ── Validation ─────────────────────────────────────────────
        error = None
        if not username or len(username) < 3:
            error = 'Username must be at least 3 characters.'
        elif not email or '@' not in email:
            error = 'A valid email address is required.'
        elif len(password) < 6:
            error = 'Password must be at least 6 characters.'
        elif password != confirm:
            error = 'Passwords do not match.'
        elif User.query.filter_by(username=username).first():
            error = f'Username "{username}" is already taken.'
        elif User.query.filter_by(email=email).first():
            error = 'An account with that email already exists.'

        if error:
            # flash() stores a one-time message in the session.
            # The second argument ('danger') becomes the Bootstrap alert class.
            flash(error, 'danger')
        else:
            # Create the new user — set_password() hashes for us.
            user = User(username=username, email=email)
            user.set_password(password)
            db.session.add(user)
            db.session.commit()

            flash('Account created! You can now log in.', 'success')
            return redirect(url_for('auth.login'))

    # render_template() renders a Jinja2 template and returns the HTML.
    return render_template('auth/register.html', title='Register')


@auth.route('/login', methods=['GET', 'POST'])
def login():
    """
    Login page.

    GET:  Render the login form.
    POST: Look up the user by email, verify the password hash, create a session.

    login_user() from Flask-Login creates a signed session cookie that
    persists the user's id. On every subsequent request, Flask-Login
    reads this cookie and calls load_user() to restore current_user.
    """
    if current_user.is_authenticated:
        return redirect(url_for('blog.index'))

    if request.method == 'POST':
        email    = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        remember = bool(request.form.get('remember'))  # "Remember me" checkbox

        user = User.query.filter_by(email=email).first()

        if user is None or not user.check_password(password):
            # Deliberately vague — don't reveal whether the email exists.
            flash('Invalid email or password.', 'danger')
        else:
            # remember=True makes the session cookie persist after
            # the browser closes (30 days by default with Flask-Login).
            login_user(user, remember=remember)
            flash(f'Welcome back, {user.username}!', 'success')

            # If Flask-Login redirected the user here from a protected page,
            # 'next' contains that URL — send them there after login.
            next_page = request.args.get('next')
            return redirect(next_page or url_for('blog.index'))

    return render_template('auth/login.html', title='Log In')


@auth.route('/logout')
@login_required
def logout():
    """
    Log the current user out and redirect to home.

    @login_required ensures only authenticated users can reach this route.
    logout_user() clears the session cookie.
    """
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('blog.index'))
