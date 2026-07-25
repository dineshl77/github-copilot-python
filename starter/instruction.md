# GitHub Copilot Instructions

## Coding Style
- Follow PEP8.
- Use Python type hints where appropriate.
- Keep functions small and reusable.
- Prefer readable code over clever code.
- Add docstrings to public functions.

## Project Structure
- Keep Flask routes minimal.
- Move Sudoku logic into separate modules.
- Avoid duplicate code.
- Use reusable helper functions.

## Error Handling
- Handle invalid inputs gracefully.
- Return proper HTTP status codes.
- Avoid crashing on unexpected input.

## Frontend
- Use clean HTML, CSS, and JavaScript.
- Support responsive layouts.
- Support dark mode.
- Alternate colors for each 3×3 Sudoku box.

## Features
- Difficulty selector
- Timer
- Hint button
- Check button
- Top 10 leaderboard
- LocalStorage persistence

## Testing
- Keep all existing tests passing.
- Add tests when adding major features.