"""Helpers for creating Sudoku puzzles and solutions."""

import copy
import random

from solver import fill_board
from validator import EMPTY, SIZE, is_safe


DIFFICULTY_CLUES = {
    "easy": 45,
    "medium": 35,
    "hard": 25,
}


def deep_copy(board):
    """Return a deep copy of a Sudoku board."""
    return copy.deepcopy(board)


def create_empty_board():
    """Create a fresh Sudoku board filled with empty cells."""
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]


def count_solutions(board, limit=2):
    """Count solutions for a Sudoku board, stopping after the limit is reached."""
    working_board = deep_copy(board)
    solutions = 0

    def search():
        nonlocal solutions
        if solutions >= limit:
            return

        for row in range(SIZE):
            for col in range(SIZE):
                if working_board[row][col] == EMPTY:
                    for candidate in range(1, SIZE + 1):
                        if is_safe(working_board, row, col, candidate):
                            working_board[row][col] = candidate
                            search()
                            working_board[row][col] = EMPTY
                            if solutions >= limit:
                                return
                    return

        solutions += 1

    search()
    return solutions


def remove_cells(board, clues):
    """Remove cells while ensuring the puzzle always has exactly one solution."""
    cells = [(row, col) for row in range(SIZE) for col in range(SIZE)]
    random.shuffle(cells)

    for row, col in cells:

        # Stop when the target clue count is reached.
        current_clues = sum(
            cell != EMPTY
            for row_values in board
            for cell in row_values
        )
        if current_clues <= clues:
            break

        if board[row][col] == EMPTY:
            continue

        original_value = board[row][col]
        board[row][col] = EMPTY

        # Keep the removal only if the puzzle still has exactly one solution.
        if count_solutions(deep_copy(board), limit=2) != 1:
            board[row][col] = original_value

def generate_puzzle(clues=35, difficulty=None):
    """Generate a playable puzzle and its solved board."""
    if difficulty is not None:
        difficulty = difficulty.lower()
        clues = DIFFICULTY_CLUES.get(difficulty, clues)

    for _ in range(100):
        board = create_empty_board()
        fill_board(board)
        solution = deep_copy(board)
        puzzle = deep_copy(board)
        remove_cells(puzzle, clues)

        if sum(cell != EMPTY for row_values in puzzle for cell in row_values) == clues:
            return puzzle, solution

    return puzzle, solution
