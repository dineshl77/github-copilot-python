"""Compatibility layer for the legacy Sudoku logic API."""

from generator import create_empty_board, deep_copy, generate_puzzle, remove_cells
from solver import fill_board, solve_board
from validator import EMPTY, SIZE, is_safe

__all__ = [
    "SIZE",
    "EMPTY",
    "deep_copy",
    "create_empty_board",
    "is_safe",
    "fill_board",
    "remove_cells",
    "generate_puzzle",
    "solve_board",
]
