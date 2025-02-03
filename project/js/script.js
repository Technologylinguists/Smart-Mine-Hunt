// 获取弹窗和关闭按钮
const welcomePopup = document.getElementById("welcome-popup");
const closePopupButton = document.getElementById("close-popup");

// 页面加载时显示弹窗
window.onload = function () {
  welcomePopup.style.display = "flex";
};

// 关闭弹窗
closePopupButton.addEventListener("click", () => {
  welcomePopup.style.display = "none";
});

// 点击弹窗外部也可以关闭弹窗
window.addEventListener("click", (event) => {
  if (event.target === welcomePopup) {
    welcomePopup.style.display = "none";
  }
});

// 其他代码保持不变...
const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");
const remainingMinesElement = document.getElementById("remaining-mines");
const resetButton = document.getElementById("reset");
const easyButton = document.getElementById("easy");
const mediumButton = document.getElementById("medium");
const expertButton = document.getElementById("expert");
const fullscreenButton = document.getElementById("fullscreen");
const customRowsInput = document.getElementById("custom-rows");
const customColsInput = document.getElementById("custom-cols");
const customMinesInput = document.getElementById("custom-mines");
const customStartButton = document.getElementById("custom-start");
const timerElement = document.getElementById("timer");

let ROWS = 10;
let COLS = 10;
let MINES = 15;

let board = [];
let mines = [];
let revealed = [];
let flags = [];
let gameOver = false;
let startTime = null;
let timerInterval = null;

function initBoard() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  revealed = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  flags = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  mines = [];
  gameOver = false;
  statusElement.textContent = "游戏进行中";
  updateRemainingMines();
  startTimer();
  renderBoard();
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function updateTimer() {
  const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
  timerElement.textContent = elapsedTime;
}

function placeMines() {
  let minesPlaced = 0;
  while (minesPlaced < MINES) {
    const row = Math.floor(Math.random() * ROWS);
    const col = Math.floor(Math.random() * COLS);
    if (!board[row][col]) {
      board[row][col] = -1;
      mines.push([row, col]);
      minesPlaced++;
    }
  }
}

function calculateNumbers() {
  for (const [row, col] of mines) {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const newRow = row + i;
        const newCol = col + j;
        if (
          newRow >= 0 &&
          newRow < ROWS &&
          newCol >= 0 &&
          newCol < COLS &&
          board[newRow][newCol] !== -1
        ) {
          board[newRow][newCol]++;
        }
      }
    }
  }
}

function renderBoard() {
  boardElement.innerHTML = "";
  boardElement.style.gridTemplateColumns = `repeat(${COLS}, 30px)`;
  boardElement.style.gridTemplateRows = `repeat(${ROWS}, 30px)`;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      if (revealed[row][col]) {
        cell.classList.add("revealed");
        if (board[row][col] === -1) {
          cell.textContent = "💣";
        } else if (board[row][col] > 0) {
          cell.textContent = board[row][col];
        }
      } else if (flags[row][col]) {
        cell.classList.add("flagged");
        cell.textContent = "🚩";
      }
      cell.addEventListener("click", () => revealCell(row, col));
      cell.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        toggleFlag(row, col);
      });
      boardElement.appendChild(cell);
    }
  }
}

function revealCell(row, col) {
  if (gameOver || revealed[row][col] || flags[row][col]) return;

  revealed[row][col] = true;

  if (board[row][col] === -1) {
    gameOver = true;
    statusElement.textContent = "游戏结束！你输了！";
    stopTimer();
    revealAllMines();
  } else if (board[row][col] === 0) {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const newRow = row + i;
        const newCol = col + j;
        if (
          newRow >= 0 &&
          newRow < ROWS &&
          newCol >= 0 &&
          newCol < COLS &&
          !revealed[newRow][newCol]
        ) {
          revealCell(newRow, newCol);
        }
      }
    }
  }

  checkWin();
  renderBoard();
}

function toggleFlag(row, col) {
  if (gameOver || revealed[row][col]) return;

  flags[row][col] = !flags[row][col];
  updateRemainingMines();
  renderBoard();
}

function revealAllMines() {
  for (const [row, col] of mines) {
    revealed[row][col] = true;
  }
  renderBoard();
}

function checkWin() {
  let unrevealedCount = 0;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (!revealed[row][col] && board[row][col] !== -1) {
        unrevealedCount++;
      }
    }
  }
  if (unrevealedCount === 0) {
    gameOver = true;
    statusElement.textContent = "恭喜！你赢了！";
    stopTimer();
  }
}

function updateRemainingMines() {
  const flaggedCount = flags.flat().filter((flag) => flag).length;
  remainingMinesElement.textContent = MINES - flaggedCount;
}

function setDifficulty(rows, cols, minesCount) {
  ROWS = rows;
  COLS = cols;
  MINES = minesCount;
  initBoard();
  placeMines();
  calculateNumbers();
  renderBoard();
}

easyButton.addEventListener("click", () => setDifficulty(8, 8, 10));
mediumButton.addEventListener("click", () => setDifficulty(10, 10, 15));
expertButton.addEventListener("click", () => setDifficulty(16, 16, 40));
fullscreenButton.addEventListener("click", () => setDifficulty(20, 20, 80));

customStartButton.addEventListener("click", () => {
  const rows = parseInt(customRowsInput.value);
  const cols = parseInt(customColsInput.value);
  const mines = parseInt(customMinesInput.value);
  if (rows > 0 && cols > 0 && mines > 0 && mines < rows * cols) {
    setDifficulty(rows, cols, mines);
  } else {
    alert("请输入有效的行数、列数和地雷数。");
  }
});

resetButton.addEventListener("click", () => {
  initBoard();
  placeMines();
  calculateNumbers();
  renderBoard();
});

initBoard();
placeMines();
calculateNumbers();
renderBoard();
