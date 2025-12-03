from flask import Blueprint, request, jsonify, session
from wordle.utils.validator import validate_guess

api_bp = Blueprint("api", __name__)

@api_bp.route("/guess", methods=["POST"])
def guess():
    data = request.get_json()
    guess = data.get("guess", "").upper()
    secret = session.get("secret_word")

    result = validate_guess(guess, secret)
    if "error" in result:
        return jsonify(result), 400

    return jsonify(result)
