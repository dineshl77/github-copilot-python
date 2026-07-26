import os
import sys

import pytest

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'starter'))
sys.path.insert(0, ROOT_DIR)

from app import CURRENT, app as flask_app


@pytest.fixture(autouse=True)
def reset_game_state():
    """Ensure each test starts with a clean in-memory game state."""
    CURRENT["puzzle"] = None
    CURRENT["solution"] = None
    yield
    CURRENT["puzzle"] = None
    CURRENT["solution"] = None


@pytest.fixture
def client():
    with flask_app.test_client() as client:
        yield client
