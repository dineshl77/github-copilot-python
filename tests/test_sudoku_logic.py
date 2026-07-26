import sudoku_logic
from generator import count_solutions


def test_create_empty_board():
    board = sudoku_logic.create_empty_board()
    assert len(board) == sudoku_logic.SIZE
    assert all(len(row) == sudoku_logic.SIZE for row in board)
    assert all(cell == sudoku_logic.EMPTY for row in board for cell in row)


def test_is_safe_detects_conflict():
    board = sudoku_logic.create_empty_board()
    board[0][0] = 5

    assert not sudoku_logic.is_safe(board, 0, 1, 5)
    assert not sudoku_logic.is_safe(board, 1, 0, 5)
    assert not sudoku_logic.is_safe(board, 1, 1, 5)
    assert sudoku_logic.is_safe(board, 0, 1, 4)


def test_generate_puzzle_returns_valid_puzzle_and_solution():
    puzzle, solution = sudoku_logic.generate_puzzle(clues=30)

    assert len(puzzle) == sudoku_logic.SIZE
    assert len(solution) == sudoku_logic.SIZE
    assert all(len(row) == sudoku_logic.SIZE for row in puzzle)
    assert all(len(row) == sudoku_logic.SIZE for row in solution)
    assert all(0 <= cell <= sudoku_logic.SIZE for row in puzzle for cell in row)
    assert all(1 <= cell <= sudoku_logic.SIZE for row in solution for cell in row)
    assert sum(cell != 0 for row in puzzle for cell in row) <= 30
    assert all(
        puzzle[row][col] == solution[row][col]
        for row in range(sudoku_logic.SIZE)
        for col in range(sudoku_logic.SIZE)
        if puzzle[row][col] != 0
    )


def test_generate_puzzle_for_each_difficulty_has_unique_solution():
    difficulty_specs = [("easy", 45), ("medium", 35), ("hard", 25)]

    for difficulty, expected_clues in difficulty_specs:
        for _ in range(3):
            puzzle, _ = sudoku_logic.generate_puzzle(difficulty=difficulty)
            assert count_solutions(puzzle) == 1
            assert sum(cell != 0 for row in puzzle for cell in row) == expected_clues
