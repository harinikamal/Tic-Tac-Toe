




let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X"; 
let gameActive = false;
let gameMode = "pvc"; 
let difficulty = "medium"; 
let aiThinking = false;
let computerMoveTimeoutId = null;


const players = {
  X: "PLAYER 1",
  O: "CPU (MEDIUM)"
};


const scores = {
  X: 0,
  O: 0,
  draws: 0
};


const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], 
  [0, 3, 6], [1, 4, 7], [2, 5, 8], 
  [0, 4, 8], [2, 4, 6]             
];




const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");


const btnPvc = document.getElementById("btn-pvc");
const btnPvp = document.getElementById("btn-pvp");


const btnEasy = document.getElementById("btn-easy");
const btnMedium = document.getElementById("btn-medium");
const btnHard = document.getElementById("btn-hard");
const difficultyGroup = document.getElementById("difficulty-group");


const setupForm = document.getElementById("setup-form");
const p1Input = document.getElementById("p1-name-input");
const p2Input = document.getElementById("p2-name-input");
const p2InputContainer = document.getElementById("p2-input-container");


const turnIndicator = document.getElementById("turn-indicator");
const boardGrid = document.getElementById("game-board");
const cells = document.querySelectorAll(".cell");


const scoreP1Label = document.getElementById("score-p1-label");
const scoreP1Val = document.getElementById("score-p1-val");
const scoreDrawVal = document.getElementById("score-draw-val");
const scoreP2Label = document.getElementById("score-p2-label");
const scoreP2Val = document.getElementById("score-p2-val");


const btnPlayAgain = document.getElementById("btn-play-again");
const btnNewMatch = document.getElementById("btn-new-match");




const themeSelect = document.getElementById("theme-select");

function getSelectedTheme() {
  return themeSelect?.value || "retro";
}


const savedTheme = localStorage.getItem("ttt-theme") || "retro";
document.body.className = `theme-${savedTheme}`;
if (themeSelect) {
  themeSelect.value = savedTheme;
  themeSelect.addEventListener("change", (e) => {
    const newTheme = e.target.value;
    document.body.className = `theme-${newTheme}`;
    localStorage.setItem("ttt-theme", newTheme);
    updateTurnIndicator();
  });
}






btnPvc.addEventListener("click", () => {
  gameMode = "pvc";
  btnPvc.classList.add("active");
  btnPvc.setAttribute("aria-pressed", "true");
  btnPvp.classList.remove("active");
  btnPvp.setAttribute("aria-pressed", "false");
  
  p2InputContainer.classList.add("hidden");
  p2Input.removeAttribute("required");
  
  
  difficultyGroup.classList.remove("hidden");
});


btnPvp.addEventListener("click", () => {
  gameMode = "pvp";
  btnPvp.classList.add("active");
  btnPvp.setAttribute("aria-pressed", "true");
  btnPvc.classList.remove("active");
  btnPvc.setAttribute("aria-pressed", "false");
  
  p2InputContainer.classList.remove("hidden");
  p2Input.setAttribute("required", "required");
  
  
  difficultyGroup.classList.add("hidden");
});


btnEasy.addEventListener("click", () => {
  difficulty = "easy";
  btnEasy.classList.add("active");
  btnEasy.setAttribute("aria-pressed", "true");
  btnMedium.classList.remove("active");
  btnMedium.setAttribute("aria-pressed", "false");
  btnHard.classList.remove("active");
  btnHard.setAttribute("aria-pressed", "false");
});

btnMedium.addEventListener("click", () => {
  difficulty = "medium";
  btnMedium.classList.add("active");
  btnMedium.setAttribute("aria-pressed", "true");
  btnEasy.classList.remove("active");
  btnEasy.setAttribute("aria-pressed", "false");
  btnHard.classList.remove("active");
  btnHard.setAttribute("aria-pressed", "false");
});

btnHard.addEventListener("click", () => {
  difficulty = "hard";
  btnHard.classList.add("active");
  btnHard.setAttribute("aria-pressed", "true");
  btnEasy.classList.remove("active");
  btnEasy.setAttribute("aria-pressed", "false");
  btnMedium.classList.remove("active");
  btnMedium.setAttribute("aria-pressed", "false");
});


setupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  
  
  players.X = p1Input.value.trim().toUpperCase() || "PLAYER 1";
  
  if (gameMode === "pvc") {
    players.O = `CPU (${difficulty.toUpperCase()})`;
  } else {
    players.O = p2Input.value.trim().toUpperCase() || "PLAYER 2";
  }
  
  
  scoreP1Label.textContent = players.X;
  scoreP2Label.textContent = players.O;
  
  
  scores.X = 0;
  scores.O = 0;
  scores.draws = 0;
  updateScoreboardUI();
  
  
  startScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  
  
  resetRound();
});






function resetRound() {
  
  if (computerMoveTimeoutId) {
    clearTimeout(computerMoveTimeoutId);
    computerMoveTimeoutId = null;
  }
  
  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  gameActive = true;
  aiThinking = false;
  
  
  cells.forEach(cell => {
    cell.removeAttribute("data-symbol");
    cell.removeAttribute("aria-label");
    cell.classList.remove("winner");
  });
  
  
  const svg = document.getElementById("win-strike-svg");
  if (svg) svg.classList.add("hidden");
  
  
  updateTurnIndicator();
}


function updateTurnIndicator() {
  if (!gameActive) return;
  
  if (aiThinking) {
    turnIndicator.textContent = "COMPUTER IS THINKING...";
  } else {
    turnIndicator.innerHTML = `TURN: <span id="current-player-name">${players[currentPlayer]}</span>`;
  }
}


function updateScoreboardUI() {
  scoreP1Val.textContent = scores.X;
  scoreP2Val.textContent = scores.O;
  scoreDrawVal.textContent = scores.draws;
}


function checkWinningState(tempBoard) {
  for (let combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (tempBoard[a] !== "" && tempBoard[a] === tempBoard[b] && tempBoard[a] === tempBoard[c]) {
      return { winner: tempBoard[a], combination: combo };
    }
  }
  return null;
}


function checkDrawState(tempBoard) {
  return !tempBoard.includes("");
}


boardGrid.addEventListener("click", (event) => {
  const cell = event.target.closest(".cell");
  if (!cell) return;
  
  const index = parseInt(cell.getAttribute("data-index"), 10);
  
  
  if (!gameActive || aiThinking || board[index] !== "") return;
  
  executeMove(index, currentPlayer);
});


function executeMove(index, playerSymbol) {
  board[index] = playerSymbol;
  
  
  const cell = document.getElementById(`cell-${index}`);
  cell.setAttribute("data-symbol", playerSymbol);
  cell.setAttribute("aria-label", playerSymbol);
  
  const winCheck = checkWinningState(board);
  
  if (winCheck) {
    
    gameActive = false;
    scores[playerSymbol]++;
    updateScoreboardUI();
    
    
    winCheck.combination.forEach(i => {
      document.getElementById(`cell-${i}`).classList.add("winner");
    });
    
    
    drawWinStrikeLine(winCheck.combination);
    
    
    showThemedWinBanner(playerSymbol);
  } else if (checkDrawState(board)) {
    
    gameActive = false;
    scores.draws++;
    updateScoreboardUI();
    showThemedDrawBanner();
  } else {
    
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updateTurnIndicator();
    
    
    if (gameMode === "pvc" && currentPlayer === "O") {
      executeComputerTurn();
    }
  }
}


btnPlayAgain.addEventListener("click", () => {
  resetRound();
});


btnNewMatch.addEventListener("click", () => {
  if (computerMoveTimeoutId) {
    clearTimeout(computerMoveTimeoutId);
    computerMoveTimeoutId = null;
  }
  
  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  gameActive = false;
  aiThinking = false;
  
  
  startScreen.classList.remove("hidden");
  gameScreen.classList.add("hidden");
});





function drawWinStrikeLine(combination) {
  const svg = document.getElementById("win-strike-svg");
  const line = document.getElementById("win-strike-line");
  if (!svg || !line) return;
  
  const sorted = [...combination].sort((a, b) => a - b);
  let x1, y1, x2, y2;
  
  if (sorted[0] === 0 && sorted[1] === 1 && sorted[2] === 2) {
    x1 = 5; y1 = 16.66; x2 = 95; y2 = 16.66;
  } else if (sorted[0] === 3 && sorted[1] === 4 && sorted[2] === 5) {
    x1 = 5; y1 = 50; x2 = 95; y2 = 50;
  } else if (sorted[0] === 6 && sorted[1] === 7 && sorted[2] === 8) {
    x1 = 5; y1 = 83.33; x2 = 95; y2 = 83.33;
  } else if (sorted[0] === 0 && sorted[1] === 3 && sorted[2] === 6) {
    x1 = 16.66; y1 = 5; x2 = 16.66; y2 = 95;
  } else if (sorted[0] === 1 && sorted[1] === 4 && sorted[2] === 7) {
    x1 = 50; y1 = 5; x2 = 50; y2 = 95;
  } else if (sorted[0] === 2 && sorted[1] === 5 && sorted[2] === 8) {
    x1 = 83.33; y1 = 5; x2 = 83.33; y2 = 95;
  } else if (sorted[0] === 0 && sorted[1] === 4 && sorted[2] === 8) {
    x1 = 8; y1 = 8; x2 = 92; y2 = 92;
  } else if (sorted[0] === 2 && sorted[1] === 4 && sorted[2] === 6) {
    x1 = 92; y1 = 8; x2 = 8; y2 = 92;
  } else {
    return;
  }
  
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  
  
  line.style.animation = "none";
  line.offsetHeight; 
  line.style.animation = null;
  
  svg.classList.remove("hidden");
}

function showThemedWinBanner(playerSymbol) {
  const theme = getSelectedTheme();
  let iconLeft = "";
  let iconRight = "";
  
  if (theme === "forest") {
    iconLeft = `<svg class="theme-svg-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L7.09,20.14C9.11,20.68 11.23,20.19 12.78,18.84C14.8,17.08 15.34,14.28 14.5,11.83C16.89,11.11 18.79,9.45 19.86,7.2C20.64,5.56 20.73,3.75 20.1,2.1C18.45,1.47 16.64,1.56 15,2.34C12.75,3.41 11.09,5.31 10.37,7.7C7.92,6.86 5.12,7.4 3.36,9.42C2,10.97 1.5,13.09 2.06,15.11L0,16.5L0.66,18.39C5.83,16.3 12,14.2 14,5C16.24,5.9 17,8 17,8Z"/></svg>`;
    iconRight = iconLeft;
  } else if (theme === "chalkboard") {
    iconLeft = `<svg class="theme-svg-icon" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" d="M12,2 L15,9 L22,10 L17,15 L18,22 L12,18 L6,22 L7,15 L2,10 L9,9 Z" stroke-dasharray="2,2"/></svg>`;
    iconRight = iconLeft;
  } else if (theme === "notebook") {
    iconLeft = `<svg class="theme-svg-icon" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" d="M12,2 L14,8 L20,7 L16,11 L19,17 L13,14 L11,19 L10,13 L4,14 L9,10 L5,4 L11,6 Z"/></svg>`;
    iconRight = iconLeft;
  }
  
  if (iconLeft) {
    turnIndicator.innerHTML = `<div class="win-banner-content">${iconLeft}<span>${players[playerSymbol]} WINS!</span>${iconRight}</div>`;
  } else {
    turnIndicator.innerHTML = `${players[playerSymbol]} WINS!`;
  }
}

function showThemedDrawBanner() {
  const theme = getSelectedTheme();
  let iconLeft = "";
  let iconRight = "";
  
  if (theme === "forest") {
    iconLeft = `<svg class="theme-svg-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M17,12C17,14.42 15.28,16.44 13,16.9V14.82C14.15,14.4 15,13.3 15,12C15,10.7 14.15,9.6 13,9.18V7.1C15.28,7.56 17,9.58 17,12M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12C15,10.66 13.9,9.57 12,9M11,14.82V16.9C8.72,16.44 7,14.42 7,12C7,9.58 8.72,7.56 11,7.1V9.18C9.85,9.6 9,10.7 9,12C9,13.3 9.85,14.4 11,14.82M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/></svg>`;
    iconRight = iconLeft;
  } else if (theme === "chalkboard") {
    iconLeft = `<svg class="theme-svg-icon" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" d="M8,12 L16,12 M12,8 L12,16" stroke-dasharray="2,2"/></svg>`;
    iconRight = iconLeft;
  } else if (theme === "notebook") {
    iconLeft = `<svg class="theme-svg-icon" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" d="M6,18 L18,6 M6,6 L18,18"/></svg>`;
    iconRight = iconLeft;
  }
  
  if (iconLeft) {
    turnIndicator.innerHTML = `<div class="win-banner-content">${iconLeft}<span>DRAW!</span>${iconRight}</div>`;
  } else {
    turnIndicator.innerHTML = "DRAW!";
  }
}






function executeComputerTurn() {
  aiThinking = true;
  updateTurnIndicator();
  
  
  let bestCellIndex;
  let makeRandomMove = false;
  
  if (difficulty === "easy") {
    makeRandomMove = Math.random() < 0.70; 
  } else if (difficulty === "medium") {
    makeRandomMove = Math.random() < 0.35; 
  }
  
  if (makeRandomMove) {
    const emptyCells = [];
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        emptyCells.push(i);
      }
    }
    bestCellIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  } else {
    
    bestCellIndex = getBestMove(board);
  }
  
  
  computerMoveTimeoutId = setTimeout(() => {
    aiThinking = false;
    
    
    
    if (!gameActive || board[bestCellIndex] !== "") return;
    
    executeMove(bestCellIndex, "O");
  }, 400);
}


function getBestMove(boardState) {
  let bestScore = -Infinity;
  let optimalMove = -1;
  
  
  for (let i = 0; i < 9; i++) {
    if (boardState[i] === "") {
      
      boardState[i] = "O";
      
      
      
      
      let moveScore = minimax(boardState, 0, false);
      
      
      boardState[i] = "";
      
      
      if (moveScore > bestScore) {
        bestScore = moveScore;
        optimalMove = i;
      }
    }
  }
  
  return optimalMove;
}


function minimax(tempBoard, depth, isMaximizing) {
  
  const winCheck = checkWinningState(tempBoard);
  if (winCheck) {
    
    
    if (winCheck.winner === "O") {
      return 10 - depth;
    }
    
    
    if (winCheck.winner === "X") {
      return -10 + depth;
    }
  }
  
  
  if (checkDrawState(tempBoard)) {
    return 0; 
  }
  
  
  if (isMaximizing) {
    
    let maxEval = -Infinity;
    
    for (let i = 0; i < 9; i++) {
      if (tempBoard[i] === "") {
        tempBoard[i] = "O"; 
        let evaluation = minimax(tempBoard, depth + 1, false); 
        tempBoard[i] = ""; 
        maxEval = Math.max(maxEval, evaluation);
      }
    }
    return maxEval;
    
  } else {
    
    let minEval = Infinity;
    
    for (let i = 0; i < 9; i++) {
      if (tempBoard[i] === "") {
        tempBoard[i] = "X"; 
        let evaluation = minimax(tempBoard, depth + 1, true); 
        tempBoard[i] = ""; 
        minEval = Math.min(minEval, evaluation);
      }
    }
    return minEval;
  }
}
