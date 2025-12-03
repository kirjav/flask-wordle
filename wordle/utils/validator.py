from wordle.utils.word_picker import load_words

ALLOWED_GUESSES = load_words("official_allowed_guesses.txt")
VALID_WORDS = load_words("shuffled_real_wordles.txt")

def validate_guess(guess, secret):
    if guess.lower() not in [w.lower() for w in ALLOWED_GUESSES] and guess.lower() not in [w.lower() for w in VALID_WORDS]:
        return {"error": "Not in word list."}

    result = []
    # Y = correct spot, M = present but wrong spot, not in the word = N
    for g, s in zip(guess, secret):
        if g == s:
            result.append("Y")
        elif g in secret:
            result.append("M")
        else:
            result.append("N")

    return {
        "result": result,
        "isWin": guess == secret
    }
