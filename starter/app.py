"""Flask entrypoint for the Sudoku web app."""

from flask import Flask, jsonify, render_template, request

from generator import generate_puzzle
from validator import find_incorrect_cells

app = Flask(__name__)

DEFAULT_CLUES = 35
DIFFICULTY_CLUES = {
    "easy": 45,
    "medium": 35,
    "hard": 25,
}

# Keep a simple in-memory store for current puzzle and solution.
CURRENT = {
    "puzzle": None,
    "solution": None,
}


def resolve_clues(request_args):
    """Resolve the requested clue count from difficulty or legacy clues input."""
    difficulty = (request_args.get("difficulty") or "").strip().lower()
    if difficulty in DIFFICULTY_CLUES:
        return DIFFICULTY_CLUES[difficulty]

    clues = request_args.get("clues")
    if clues is not None:
        try:
            return int(clues)
        except ValueError:
            pass

    return DEFAULT_CLUES


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/new")
def new_game():
    clues = resolve_clues(request.args)
    puzzle, solution = generate_puzzle(clues)
    CURRENT["puzzle"] = puzzle
    CURRENT["solution"] = solution
    return jsonify({"puzzle": puzzle, "solution": solution})


@app.route("/check", methods=["POST"])
def check_solution():
    data = request.json or {}
    board = data.get("board")
    solution = CURRENT.get("solution")

    if solution is None:
        return jsonify({"error": "No game in progress"}), 400

    incorrect = find_incorrect_cells(board, solution)
    return jsonify({"incorrect": incorrect})


if __name__ == "__main__":
    app.run(debug=True)
