from datetime import date
import random
import os

def load_words(filename):
    path = os.path.join(os.path.dirname(__file__), "..", "wordlists", filename)
    with open(path, "r") as f:
        return [w.strip().upper() for w in f.readlines()]

ANSWERS = load_words("shuffled_real_wordles.txt")

def pick_word_of_day():
    idx = date.today().toordinal() % len(ANSWERS)
    return ANSWERS[idx]
