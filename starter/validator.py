"""Validation helpers for Sudoku boards."""

SIZE = 9
EMPTY = 0


def is_safe(board, row, col, num):
    """Return True when placing num at row,col would not violate Sudoku rules."""
    for x in range(SIZE):
        if board[row][x] == num or board[x][col] == num:
            return False

    start_row = row - row % 3
    start_col = col - col % 3
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False

    return True


def find_incorrect_cells(board, solution):
    """Return the coordinates that differ from the solved board."""
    incorrect = []
    if not board or not solution:
        return incorrect

    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] != solution[row][col]:
                incorrect.append([row, col])
    return incorrect
