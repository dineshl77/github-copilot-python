from app import CURRENT


def count_clues(board):
    """Return the number of filled cells in a Sudoku board."""
    return sum(cell != 0 for row in board for cell in row)


def test_index_route(client):
    response = client.get('/')
    assert response.status_code == 200
    assert b'<html' in response.data or b'<!DOCTYPE html>' in response.data


def test_new_game_route_returns_puzzle(client):
    response = client.get('/new?clues=35')
    assert response.status_code == 200

    data = response.get_json()

    assert 'puzzle' in data
    assert 'solution' in data
    assert len(data['puzzle']) == 9
    assert all(len(row) == 9 for row in data['puzzle'])
    assert len(data['solution']) == 9
    assert all(len(row) == 9 for row in data['solution'])


def test_new_game_route_uses_difficulty_mapping(client):
    for difficulty, expected_clues in [('easy', 45), ('medium', 35), ('hard', 25)]:
        response = client.get(f'/new?difficulty={difficulty}')
        assert response.status_code == 200

        puzzle = response.get_json()['puzzle']
        assert count_clues(puzzle) == expected_clues


def test_new_game_route_with_invalid_clues_falls_back_to_default(client):
    response = client.get('/new?clues=not-a-number')

    assert response.status_code == 200
    data = response.get_json()
    assert count_clues(data['puzzle']) == 35
    assert len(data['solution']) == 9


def test_check_solution_route_returns_incorrect_positions(client):
    client.get('/new?clues=35')

    puzzle = CURRENT['puzzle']
    solution = CURRENT['solution']

    board = [row[:] for row in puzzle]

    found = False
    for row in range(9):
        for col in range(9):
            if puzzle[row][col] == 0:
                board[row][col] = 1 if solution[row][col] != 1 else 2
                wrong_cell = [row, col]
                found = True
                break
        if found:
            break

    response = client.post('/check', json={'board': board})

    assert response.status_code == 200
    data = response.get_json()

    assert 'incorrect' in data
    assert isinstance(data['incorrect'], list)
    assert wrong_cell in data['incorrect']


def test_check_solution_route_returns_empty_list_for_completed_board(client):
    client.get('/new?clues=35')

    response = client.post(
        '/check',
        json={'board': [row[:] for row in CURRENT['solution']]}
    )

    assert response.status_code == 200
    assert response.get_json()['incorrect'] == []


def test_check_solution_route_without_game(client):
    response = client.post(
        '/check',
        json={'board': [[0] * 9 for _ in range(9)]}
    )

    assert response.status_code == 400
    assert response.get_json()['error'] == 'No game in progress'