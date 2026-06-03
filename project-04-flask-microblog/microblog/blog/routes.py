"""
Blog Routes — home feed, post CRUD, user profile
────────────────────────────────────────────────────────────────────
Route patterns:
  /                        — paginated home feed (all posts)
  /post/<int:id>           — single post view
  /create                  — create a new post
  /post/<int:id>/update    — edit an existing post (owner only)
  /post/<int:id>/delete    — delete a post (owner only, POST only)
  /user/<username>         — public profile + their posts

<int:id> is a URL converter — Flask extracts the integer from the URL
and passes it as the `id` argument to the route function.
"""
from flask import (
    render_template, redirect, url_for, flash,
    request, abort, current_app,
)
from flask_login import login_required, current_user

from . import blog
from .. import db
from ..models import Post, User


@blog.route('/')
def index():
    """
    Home feed — all posts, newest first, paginated.

    request.args.get('page', 1, type=int) reads ?page=2 from the URL.
    paginate() returns a Pagination object:
      - .items        → list of Post rows for this page
      - .has_prev/next → bool for rendering prev/next links
      - .iter_pages() → generates page numbers (with None for gaps)
    """
    page = request.args.get('page', 1, type=int)
    per_page = current_app.config['POSTS_PER_PAGE']

    posts = (
        Post.query
        .order_by(Post.created_at.desc())
        .paginate(page=page, per_page=per_page, error_out=False)
    )

    return render_template('index.html', title='Home', posts=posts)


@blog.route('/post/<int:id>')
def post(id):
    """
    Single post view.

    db.get_or_404() fetches a row by primary key and raises a 404
    HTTP error if it doesn't exist — Flask renders an error page.
    """
    post = db.get_or_404(Post, id)
    return render_template('blog/post.html', title=post.title, post=post)


@blog.route('/create', methods=['GET', 'POST'])
@login_required
def create():
    """
    Create a new post.

    @login_required redirects unauthenticated users to the login page.
    current_user is provided by Flask-Login — it's the logged-in User object.
    """
    if request.method == 'POST':
        title = request.form.get('title', '').strip()
        body  = request.form.get('body', '').strip()

        if not title:
            flash('Title is required.', 'danger')
        elif not body:
            flash('Post body is required.', 'danger')
        else:
            post = Post(title=title, body=body, author=current_user)
            db.session.add(post)
            db.session.commit()
            flash('Post published!', 'success')
            return redirect(url_for('blog.post', id=post.id))

    return render_template('blog/create.html', title='New Post')


@blog.route('/post/<int:id>/update', methods=['GET', 'POST'])
@login_required
def update(id):
    """
    Edit an existing post.

    abort(403) raises a Forbidden HTTP error if someone tries to edit
    a post they didn't write. This is server-side authorisation —
    hiding the button in the template is only a UI convenience.
    """
    post = db.get_or_404(Post, id)

    # Only the author can edit their post.
    if post.author != current_user:
        abort(403)

    if request.method == 'POST':
        title = request.form.get('title', '').strip()
        body  = request.form.get('body', '').strip()

        if not title:
            flash('Title is required.', 'danger')
        elif not body:
            flash('Post body is required.', 'danger')
        else:
            post.title = title
            post.body  = body
            db.session.commit()
            flash('Post updated.', 'success')
            return redirect(url_for('blog.post', id=post.id))

    return render_template('blog/update.html', title='Edit Post', post=post)


@blog.route('/post/<int:id>/delete', methods=['POST'])
@login_required
def delete(id):
    """
    Delete a post.

    methods=['POST'] only — delete should never happen on a GET request
    (browser pre-fetching, bots, or accidental link clicks could trigger it).
    The template submits a small hidden form to trigger this route.
    """
    post = db.get_or_404(Post, id)

    if post.author != current_user:
        abort(403)

    db.session.delete(post)
    db.session.commit()
    flash('Post deleted.', 'info')
    return redirect(url_for('blog.index'))


@blog.route('/user/<username>')
def profile(username):
    """
    Public profile page for a given username.

    first_or_404() returns the first matching row or raises 404.
    The profile shows the user's info and a paginated list of their posts.
    """
    user = User.query.filter_by(username=username).first_or_404()
    page = request.args.get('page', 1, type=int)
    per_page = current_app.config['POSTS_PER_PAGE']

    posts = (
        Post.query
        .filter_by(author=user)
        .order_by(Post.created_at.desc())
        .paginate(page=page, per_page=per_page, error_out=False)
    )

    return render_template(
        'user/profile.html',
        title=f'{user.username} — Profile',
        user=user,
        posts=posts,
    )
