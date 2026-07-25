"""Helpers for creating Sudoku puzzles and solutions."""

import copy
import random

from solver import fill_board
from validator import EMPTY, SIZE


def deep_copy(board):
    """Return a deep copy of a Sudoku board."""
    return copy.deepcopy(board)


def create_empty_board():
    """Create a fresh Sudoku board filled with empty cells."""
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]


def remove_cells(board, clues):
    """Remove cells from a completed board until the clue count is reached."""
    attempts = SIZE * SIZE - clues
    while attempts > 0:
        row = random.randrange(SIZE)
        col = random.randrange(SIZE)
        if board[row][col] != EMPTY:
            board[row][col] = EMPTY
            attempts -= 1


def generate_puzzle(clues=35):
    """Generate a playable puzzle and its solved board."""
    board = create_empty_board()
    fill_board(board)
    solution = deep_copy(board)
    remove_cells(board, clues)
    puzzle = deep_copy(board)
    return puzzle, solution
