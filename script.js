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
  gameLoop();
}

// 새로운 테트로미노 생성
function spawnPiece() {
  const shapes = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[1, 1, 1], [0, 1, 0]] // T
  ];
  const colors = ["red", "blue", "yellow", "green"];
  currentPiece = {
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    color: colors[Math.floor(Math.random() * colors.length)],
    x: GRID_WIDTH / 2 - 1,
    y: 0
  };
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
    checkMatches();
    spawnPiece();
  }
}

// 보석 매칭 체크
function checkMatches() {
  // 가로, 세로, 대각선에서 3개 이상 연결된 보석 탐지
  // 연결되면 제거하고 위 블록 떨어뜨리기
}

// 그리기
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBoard();
  drawPiece(currentPiece);
}

window.onload = init;
