from flask import Blueprint, render_template, session
from wordle.utils.word_picker import pick_word_of_day

main_bp = Blueprint("main", __name__)

@main_bp.route("/")
def index():
    secret_word = session.setdefault("secret_word", pick_word_of_day())
    return render_template("index.html", word_length=len(secret_word), max_attempts=6)

