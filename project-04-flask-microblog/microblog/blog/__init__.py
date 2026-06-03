"""Blog Blueprint — owns all post-related routes."""
from flask import Blueprint

blog = Blueprint('blog', __name__)

from . import routes  # noqa: F401, E402
