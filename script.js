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
    currentPiece.shape
