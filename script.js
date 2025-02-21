// 게임 보드 설정
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const BLOCK_SIZE = 30;

let canvas, ctx;
let board = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(null));
let currentPiece = null;
let score = 0;

// 게임 초기화
function init() {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  spawnPiece();
  document.addEventListener("keydown", handleKeyPress);
  gameLoop();
}

// 새로운 테트로미노 생성
function spawnPiece() {
  const shapes = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]] // J
  ];
  const colors = ["red", "blue", "yellow", "green"];
  currentPiece = {
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    color: colors[Math.floor(Math.random() * colors.length)],
    x: Math.floor(GRID_WIDTH / 2) - 1,
    y: 0
  };
  if (!canMove(currentPiece, 0, 0)) {
    gameOver();
  }
}

// 키보드 입력 처리
function handleKeyPress(event) {
  switch (event.key) {
    case "ArrowLeft":
      if (canMove(currentPiece, -1, 0)) currentPiece.x--;
      break;
    case "ArrowRight":
      if (canMove(currentPiece, 1, 0)) currentPiece.x++;
      break;
    case "ArrowDown":
      if (canMove(currentPiece, 0, 1)) currentPiece.y++;
      break;
    case "ArrowUp":
      rotatePiece();
      break;
  }
  draw();
}

// 블록 회전
function rotatePiece() {
  const newShape = [];
  const rows = currentPiece.shape.length;
  const cols = currentPiece.shape[0].length;
  for (let x = 0; x < cols; x++) {
    newShape[x] = [];
    for (let y = 0; y < rows; y++) {
      newShape[x][rows - 1 - y] = currentPiece.shape[y][x];
    }
  }
  const oldShape = currentPiece.shape;
  currentPiece.shape = newShape;
  if (!canMove(currentPiece, 0, 0)) {
    currentPiece.shape = oldShape; // 회전 불가능하면 원래대로
  }
}

// 이동 가능 여부 확인
function canMove(piece, dx, dy) {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const newX = piece.x + x + dx;
        const newY = piece.y + y + dy;
        if (newX < 0 || newX >= GRID_WIDTH || newY >= GRID_HEIGHT || (newY >= 0 && board[newY][newX])) {
          return false;
        }
      }
    }
  }
  return true;
}

// 블록 배치
function placePiece() {
  for (let y = 0; y < currentPiece.shape.length; y++) {
    for (let x = 0; x < currentPiece.shape[y].length; x++) {
      if (currentPiece.shape[y][x]) {
        const boardX = currentPiece.x + x;
        const boardY = currentPiece.y + y;
        if (boardY >= 0) {
          board[boardY][boardX] = currentPiece.color;
        }
      }
    }
  }
  checkMatches();
  spawnPiece();
}

// 보석 매칭 체크
function checkMatches() {
  let matches = [];
  // 가로 체크
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH - 2; x++) {
      if (board[y][x] && board[y][x] === board[y][x + 1] && board[y][x] === board[y][x + 2]) {
        matches.push([y, x], [y, x + 1], [y, x + 2]);
      }
    }
  }
  // 세로 체크
  for (let x = 0; x < GRID_WIDTH; x++) {
    for (let y = 0; y < GRID_HEIGHT - 2; y++) {
      if (board[y][x] && board[y][x] === board[y + 1][x] && board[y][x] === board[y + 2][x]) {
        matches.push([y, x], [y + 1, x], [y + 2, x]);
      }
    }
  }

  if (matches.length > 0) {
    matches.forEach(([y, x]) => (board[y][x] = null));
    score += matches.length * 50; // 매칭된 칸당 50점
    dropBlocks();
    checkMatches(); // 연쇄 반응 체크
  }
}

// 블록 떨어뜨리기
function dropBlocks() {
  for (let x = 0; x < GRID_WIDTH; x++) {
    for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
      if (!board[y][x]) {
        for (let above = y - 1; above >= 0; above--) {
          if (board[above][x]) {
            board[y][x] = board[above][x];
            board[above][x] = null;
            break;
          }
        }
      }
    }
  }
}

// 게임 루프
function gameLoop() {
  update();
  draw();
  setTimeout(gameLoop, 500); // 0.5초마다 업데이트
}

// 블록 이동 및 충돌 감지
function update() {
  if (canMove(currentPiece, 0, 1)) {
    currentPiece.y++;
  } else {
    placePiece();
  }
}

// 그리기
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBoard();
  drawPiece(currentPiece);
  document.getElementById("score").textContent = `Score: ${score}`;
}

function drawBoard() {
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (board[y][x]) {
        ctx.fillStyle = board[y][x];
        ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
      }
    }
  }
}

function drawPiece(piece) {
  ctx.fillStyle = piece.color;
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        ctx.fillRect((piece.x + x) * BLOCK_SIZE, (piece.y + y) * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
      }
    }
  }
}

// 게임 오버
function gameOver() {
  alert(`Game Over! Score: ${score}`);
  board = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(null));
  score = 0;
  spawnPiece();
}

window.onload = init;
