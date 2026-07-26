// Client-side rendering and interaction for the Flask-backed Sudoku
const SIZE = 9;
let puzzle = [];
let solution = [];
let hintsUsed = 0;
let timerInterval = null;
let elapsedSeconds = 0;
let timerRunning = false;
let completed = false;
let difficulty = 'medium';
const LEADERBOARD_KEY = 'sudoku-leaderboard';
const THEME_KEY = 'sudoku-theme';

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function updateTimerDisplay() {
  document.getElementById('timer').innerText = formatTime(elapsedSeconds);
}

function startTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  elapsedSeconds = 0;
  timerRunning = true;
  updateTimerDisplay();
  timerInterval = window.setInterval(() => {
    if (!timerRunning) {
      return;
    }
    elapsedSeconds += 1;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  timerRunning = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function getLeaderboard() {
  const stored = localStorage.getItem(LEADERBOARD_KEY);
  if (!stored) {
    return [];
  }
  try {
    return JSON.parse(stored);
  } catch (error) {
    return [];
  }
}

function saveLeaderboardEntry() {
  const playerName = window.prompt('Enter your name for the leaderboard:');
  const trimmedName = playerName ? playerName.trim() : '';
  if (!trimmedName) {
    return;
  }

  const leaderboard = getLeaderboard();
  leaderboard.push({
    name: trimmedName,
    time: elapsedSeconds,
    difficulty,
    hintsUsed
  });

  leaderboard.sort((a, b) => a.time - b.time || a.name.localeCompare(b.name));
  const trimmed = leaderboard.slice(0, 10);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(trimmed));
  renderLeaderboard();
}

function renderLeaderboard() {
  const body = document.getElementById('leaderboard-body');
  if (!body) {
    return;
  }

  const leaderboard = getLeaderboard();
  body.innerHTML = '';

  if (leaderboard.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="5" class="leaderboard-empty">No scores yet</td>';
    body.appendChild(row);
    return;
  }

  leaderboard.forEach((entry, index) => {
    const row = document.createElement('tr');
    const difficultyLabel = entry.difficulty.charAt(0).toUpperCase() + entry.difficulty.slice(1);
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${entry.name}</td>
      <td>${formatTime(entry.time)}</td>
      <td>${difficultyLabel}</td>
      <td>${entry.hintsUsed}</td>
    `;
    body.appendChild(row);
  });
}

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
  }
  localStorage.setItem(THEME_KEY, theme);
}

function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(savedTheme);
}

function toggleTheme() {
  const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
}

function showCompletionDialog() {
  const message = `Congratulations!\n\nCompletion time: ${formatTime(elapsedSeconds)}\nDifficulty: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}\nHints used: ${hintsUsed}`;
  window.alert(message);
  saveLeaderboardEntry();
}

function lockBoard() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (!inp.disabled) {
      inp.disabled = true;
    }
  }
}

function completeGame() {
  if (completed) {
    return;
  }
  completed = true;
  stopTimer();
  lockBoard();
  showCompletionDialog();
}

function validateBoard() {
  if (completed) {
    return;
  }

  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const invalidIndices = new Set();

  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    const value = inp.value;
    if (!value) continue;

    const row = parseInt(inp.dataset.row, 10);
    const col = parseInt(inp.dataset.col, 10);
    const rowValue = parseInt(value, 10);

    for (let j = 0; j < SIZE; j++) {
      if (j === col) continue;
      const other = inputs[row * SIZE + j];
      if (other.value && parseInt(other.value, 10) === rowValue) {
        invalidIndices.add(idx);
        invalidIndices.add(row * SIZE + j);
      }
    }

    for (let i = 0; i < SIZE; i++) {
      if (i === row) continue;
      const other = inputs[i * SIZE + col];
      if (other.value && parseInt(other.value, 10) === rowValue) {
        invalidIndices.add(idx);
        invalidIndices.add(i * SIZE + col);
      }
    }

    const boxRowStart = Math.floor(row / 3) * 3;
    const boxColStart = Math.floor(col / 3) * 3;
    for (let i = boxRowStart; i < boxRowStart + 3; i++) {
      for (let j = boxColStart; j < boxColStart + 3; j++) {
        if (i === row && j === col) continue;
        const other = inputs[i * SIZE + j];
        if (other.value && parseInt(other.value, 10) === rowValue) {
          invalidIndices.add(idx);
          invalidIndices.add(i * SIZE + j);
        }
      }
    }
  }

  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (inp.disabled) continue;
    inp.className = 'sudoku-cell';
    if (invalidIndices.has(idx)) {
      inp.className = 'sudoku-cell invalid';
    }
  }

  const isSolved = Array.from(inputs).every((inp, idx) => {
    const row = parseInt(inp.dataset.row, 10);
    const col = parseInt(inp.dataset.col, 10);
    return inp.disabled || (inp.value && solution[row][col] === parseInt(inp.value, 10));
  });

  if (isSolved) {
    completeGame();
  }
}

function createBoardElement() {
  const boardDiv = document.getElementById('sudoku-board');
  boardDiv.innerHTML = '';
  for (let i = 0; i < SIZE; i++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'sudoku-row';
    for (let j = 0; j < SIZE; j++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.className = 'sudoku-cell';
      input.dataset.row = i;
      input.dataset.col = j;
      input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/[^1-9]/g, '');
        e.target.value = val;
        validateBoard();
      });
      rowDiv.appendChild(input);
    }
    boardDiv.appendChild(rowDiv);
  }
}

function renderPuzzle(puz, sol = null) {
  puzzle = puz;
  solution = sol || [];
  hintsUsed = 0;
  completed = false;
  stopTimer();
  startTimer();
  createBoardElement();
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = puzzle[i][j];
      const inp = inputs[idx];
      if (val !== 0) {
        inp.value = val;
        inp.disabled = true;
        inp.className += ' prefilled';
      } else {
        inp.value = '';
        inp.disabled = false;
      }
    }
  }
  validateBoard();
}

async function newGame() {
  difficulty = document.getElementById('difficulty-select').value;
  const res = await fetch(`/new?difficulty=${encodeURIComponent(difficulty)}`);
  const data = await res.json();
  renderPuzzle(data.puzzle, data.solution);
  document.getElementById('message').innerText = '';
}

function applyHint() {
  if (completed || !solution || solution.length === 0) {
    return;
  }

  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  let targetIndex = -1;

  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (inp.disabled) continue;
    const row = parseInt(inp.dataset.row, 10);
    const col = parseInt(inp.dataset.col, 10);
    if (puzzle[row][col] === 0) {
      targetIndex = idx;
      break;
    }
  }

  if (targetIndex === -1) {
    return;
  }

  const inp = inputs[targetIndex];
  const row = parseInt(inp.dataset.row, 10);
  const col = parseInt(inp.dataset.col, 10);
  const value = solution[row][col];

  puzzle[row][col] = value;
  inp.value = value;
  inp.disabled = true;
  inp.className = 'sudoku-cell hinted';
  hintsUsed += 1;
  document.getElementById('message').innerText = `Hint used (${hintsUsed})`;
  validateBoard();
}

async function checkSolution() {
  const boardDiv = document.getElementById('sudoku-board');
  const inputs = boardDiv.getElementsByTagName('input');
  const msg = document.getElementById('message');
  const board = [];

  for (let i = 0; i < SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = inputs[idx].value;
      board[i][j] = val ? parseInt(val, 10) : 0;
    }
  }

  const res = await fetch('/check', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({board})
  });
  const data = await res.json();

  if (data.error) {
    msg.style.color = '#d32f2f';
    msg.innerText = data.error;
    return;
  }

  const incorrect = new Set(data.incorrect.map(x => x[0] * SIZE + x[1]));

  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (inp.disabled) {
      continue;
    }
    inp.className = 'sudoku-cell';
    if (incorrect.has(idx)) {
      inp.className = 'sudoku-cell incorrect';
    }
  }

  if (incorrect.size === 0) {
    if (Array.from(inputs).every((inp, idx) => inp.disabled || (inp.value && solution[Math.floor(idx / SIZE)][idx % SIZE] === parseInt(inp.value, 10)))) {
      completeGame();
    }
    stopTimer();
    msg.style.color = '#388e3c';
    msg.innerText = 'No mistakes found!';
  } else {
    msg.style.color = '#d32f2f';
    msg.innerText = 'There are incorrect entries.';
  }
}

// Wire buttons
window.addEventListener('load', () => {
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  document.getElementById('hint-button').addEventListener('click', applyHint);
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  loadTheme();
  renderLeaderboard();
  // initialize
  newGame();
});