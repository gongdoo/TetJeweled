// Game board settings
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const BLOCK_SIZE = 30;

// Bright and vibrant colors (Tetris style)
const VIBRANT_COLORS = [
  "#FF4136", // Red (Bright Red)
  "#FF851B", // Orange
  "#FFDC00", // Yellow
  "#2ECC40", // Green (Bright Green)
  "#0074D9", // Blue (Bright Blue)
  "#B10DC9", // Purple
];

// 3D effect outline color for blocks
const BLOCK_OUTLINE = "#000";

let canvas, ctx;
let board = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(null));
let currentPiece = null;
let nextPiece = null; // Store the next block
let score = 0;
let gameTime = 0; // Game time in seconds
let level = 1; // Level
let dropSpeed = 500; // Block drop speed in milliseconds (Fixed from 50 to 500)
let fadeOutAnimations = []; // Manage disappearing block animations
let gameTimer; // Timer for time updates
let gameLoopTimer; // Timer for game loop
let isGameRunning = true; // Game running state flag

// Initialize the game
function init() {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  
  // Reset game state
  board = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(null));
  score = 0;
  gameTime = 0;
  level = 1;
  dropSpeed = 500; // Reset to correct drop speed
  fadeOutAnimations = [];
  isGameRunning = true;
  
  // Generate current block and next block
  nextPiece = null;
  currentPiece = null;
  spawnPiece();
  
  // Setup event listeners and timers
  document.addEventListener("keydown", handleKeyPress);
  gameTimer = setInterval(updateTime, 1000);
  
  // Start game and animation loops
  gameLoop();
  animate();
}

// Generate a new tetromino (random colors for each cell)
function spawnPiece() {
  if (!nextPiece) spawnNextPiece(); // Generate next block if none exists
  currentPiece = nextPiece;
  spawnNextPiece(); // Generate new next block
  currentPiece.x = Math.floor(GRID_WIDTH / 2) - 1;
  currentPiece.y = 0;
  if (!canMove(currentPiece, 0, 0)) {
    gameOver();
  }
}

// Generate the next block
function spawnNextPiece() {
  const shapes = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]] // J
  ];
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  const colors = [];
  for (let i = 0; i < shape.length; i++) {
    colors[i] = [];
    for (let j = 0; j < shape[i].length; j++) {
      if (shape[i][j]) {
        colors[i][j] = VIBRANT_COLORS[Math.floor(Math.random() * VIBRANT_COLORS.length)];
      } else {
        colors[i][j] = null;
      }
    }
  }

  // Prevent three or more consecutive identical colors
  while (hasConsecutiveColors(colors)) {
    for (let i = 0; i < colors.length; i++) {
      for (let j = 0; j < colors[i].length; j++) {
        if (colors[i][j]) {
          colors[i][j] = VIBRANT_COLORS[Math.floor(Math.random() * VIBRANT_COLORS.length)];
        }
      }
    }
  }

  nextPiece = {
    shape: shape,
    colors: colors,
    x: 0,
    y: 0
  };
}

// Check for three or more consecutive identical colors
function hasConsecutiveColors(colors) {
  // Horizontal check
  for (let y = 0; y < colors.length; y++) {
    for (let x = 0; x < colors[y].length - 2; x++) {
      if (colors[y][x] && colors[y][x] === colors[y][x + 1] && colors[y][x] === colors[y][x + 2]) {
        return true;
      }
    }
  }
  // Vertical check
  for (let x = 0; x < colors[0].length; x++) {
    for (let y = 0; y < colors.length - 2; y++) {
      if (colors[y][x] && colors[y][x] === colors[y + 1][x] && colors[y][x] === colors[y + 2][x]) {
        return true;
      }
    }
  }
  return false;
}

// Handle keyboard input (including Space for instant drop)
function handleKeyPress(event) {
  if (!isGameRunning) return; // Ignore keypresses when game is over
  
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
    case " ":
      while (canMove(currentPiece, 0, 1)) currentPiece.y++; // Drop instantly with Space
      placePiece();
      break;
  }
  draw();
}

// Rotate the block (rotate colors as well)
function rotatePiece() {
  const newShape = [];
  const rows = currentPiece.shape.length;
  const cols = currentPiece.shape[0].length;
  const newColors = [];
  for (let x = 0; x < cols; x++) {
    newShape[x] = [];
    newColors[x] = [];
    for (let y = 0; y < rows; y++) {
      newShape[x][rows - 1 - y] = currentPiece.shape[y][x];
      newColors[x][rows - 1 - y] = currentPiece.colors[y][x];
    }
  }
  const oldShape = currentPiece.shape;
  const oldColors = currentPiece.colors;
  currentPiece.shape = newShape;
  currentPiece.colors = newColors;
  if (!canMove(currentPiece, 0, 0)) {
    currentPiece.shape = oldShape;
    currentPiece.colors = oldColors;
  }
}

// Check if a block can move
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

// Place the block on the board
function placePiece() {
  for (let y = 0; y < currentPiece.shape.length; y++) {
    for (let x = 0; x < currentPiece.shape[y].length; x++) {
      if (currentPiece.shape[y][x]) {
        const boardX = currentPiece.x + x;
        const boardY = currentPiece.y + y;
        if (boardY >= 0) board[boardY][boardX] = currentPiece.colors[y][x];
      }
    }
  }
  checkMatches();
  spawnPiece();
}

// Check for matches and line clears (with animations)
function checkMatches() {
  let matches = [];
  let fullLines = [];

  // 1. Bejeweled-style: Check for 3 or more consecutive identical colors
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH - 2; x++) {
      if (board[y][x] && board[y][x] === board[y][x + 1] && board[y][x] === board[y][x + 2]) {
        matches.push([y, x], [y, x + 1], [y, x + 2]);
      }
    }
  }
  for (let x = 0; x < GRID_WIDTH; x++) {
    for (let y = 0; y < GRID_HEIGHT - 2; y++) {
      if (board[y][x] && board[y][x] === board[y + 1][x] && board[y][x] === board[y + 2][x]) {
        matches.push([y, x], [y + 1, x], [y + 2, x]);
      }
    }
  }

  // 2. Tetris-style: Check for full horizontal lines
  for (let y = 0; y < GRID_HEIGHT; y++) {
    let isFull = true;
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (!board[y][x]) {
        isFull = false;
        break;
      }
    }
    if (isFull) {
      fullLines.push(y);
    }
  }

  // 3. Process matches and line clears
  if (matches.length > 0 || fullLines.length > 0) {
    // Bejeweled match handling (fade out + sparkle)
    if (matches.length > 0) {
      matches.forEach(([y, x]) => {
        fadeOutAnimations.push({
          x,
          y,
          alpha: 1,
          color: board[y][x],
          type: "sparkle", // Sparkle effect
          particles: [] // Sparkle particles
        });
        board[y][x] = null;
      });
      score += matches.length * 50;
    }

    // Tetris line clear handling (fade out + explosion)
    if (fullLines.length > 0) {
      fullLines.sort((a, b) => b - a);
      fullLines.forEach(y => {
        for (let x = 0; x < GRID_WIDTH; x++) {
          fadeOutAnimations.push({
            x,
            y,
            alpha: 1,
            color: board[y][x],
            type: "explosion", // Explosion effect
            particles: [] // Explosion particles
          });
        }
        board.splice(y, 1);
        board.unshift(Array(GRID_WIDTH).fill(null));
      });
      score += fullLines.length * 50 * 10;
    }

    dropBlocks();
    checkMatches();
  }
}

// Drop blocks after clearing
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

// Update game time
function updateTime() {
  if (!isGameRunning) return;
  
  gameTime++;
  if (score > (level * 10000)) {
    level++;
    dropSpeed = Math.max(100, 500 - (level - 1) * 50); // Increase speed (minimum 100ms)
  }
  draw(); // Update UI after time changes
}

// Game loop (managed with setTimeout)
function gameLoop() {
  if (isGameRunning) { // Only run if game is active
    console.log("Game loop running, dropSpeed:", dropSpeed);
    update();
    draw();
    gameLoopTimer = setTimeout(gameLoop, dropSpeed);
  }
}

function update() {
  if (canMove(currentPiece, 0, 1)) {
    currentPiece.y++;
  } else {
    placePiece();
  }
}

// Animation loop
function animate() {
  if (isGameRunning) {
    requestAnimationFrame(animate);
    updateAnimations();
    draw();
  }
}

// Update animations (handle effects)
function updateAnimations() {
  fadeOutAnimations = fadeOutAnimations.filter(anim => anim.alpha > 0);

  fadeOutAnimations.forEach(anim => {
    anim.alpha -= 0.05; // Fade out speed

    if (anim.type === "sparkle" && anim.alpha > 0.5) {
      // Generate sparkle particles (bright dots)
      if (anim.particles.length < 5) {
        anim.particles.push({
          x: anim.x * BLOCK_SIZE + BLOCK_SIZE / 2,
          y: anim.y * BLOCK_SIZE + BLOCK_SIZE / 2,
          radius: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 5,
          speedY: (Math.random() - 0.5) * 5,
          life: 20
        });
      }
      anim.particles = anim.particles.filter(p => p.life > 0);
      anim.particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.life--;
      });
    }

    if (anim.type === "explosion" && anim.alpha > 0.5) {
      // Generate explosion particles (small dots)
      if (anim.particles.length < 20) {
        anim.particles.push({
          x: anim.x * BLOCK_SIZE + BLOCK_SIZE / 2,
          y: anim.y * BLOCK_SIZE + BLOCK_SIZE / 2,
          radius: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 10,
          speedY: (Math.random() - 0.5) * 10,
          life: 30
        });
      }
      anim.particles = anim.particles.filter(p => p.life > 0);
      anim.particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.life--;
      });
    }
  });
}

// Draw the game
function draw() {
  if (!ctx) return; // Safety check
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Add a subtle grid background
  ctx.strokeStyle = "#ddd";
  ctx.lineWidth = 0.5;
  for (let y = 0; y <= GRID_HEIGHT; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * BLOCK_SIZE);
    ctx.lineTo(GRID_WIDTH * BLOCK_SIZE, y * BLOCK_SIZE);
    ctx.stroke();
  }
  for (let x = 0; x <= GRID_WIDTH; x++) {
    ctx.beginPath();
    ctx.moveTo(x * BLOCK_SIZE, 0);
    ctx.lineTo(x * BLOCK_SIZE, GRID_HEIGHT * BLOCK_SIZE);
    ctx.stroke();
  }
  
  drawBoard();
  if (currentPiece) drawPiece(currentPiece);
  drawAnimations();
  drawNextPiece();
  drawGameInfo();
  
  ctx.fillStyle = "#000";
  ctx.font = "16px Arial";
  ctx.fillText("Controls:", 10, GRID_HEIGHT * BLOCK_SIZE + 30);
  ctx.fillText("←: Left  →: Right", 10, GRID_HEIGHT * BLOCK_SIZE + 50);
  ctx.fillText("↓: Down  ↑: Rotate", 10, GRID_HEIGHT * BLOCK_SIZE + 70);
  ctx.fillText("Space: Drop", 10, GRID_HEIGHT * BLOCK_SIZE + 90);
}

function drawBoard() {
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (board[y][x]) {
        drawBlock(x * BLOCK_SIZE, y * BLOCK_SIZE, board[y][x]);
      }
    }
  }
}

function drawPiece(piece) {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        drawBlock(
          (piece.x + x) * BLOCK_SIZE,
          (piece.y + y) * BLOCK_SIZE,
          piece.colors[y][x]
        );
      }
    }
  }
}

// Draw 3D effect blocks
function drawBlock(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x + 2, y + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4); // Fill inner area
  ctx.strokeStyle = BLOCK_OUTLINE;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2); // 3D outline
}

// Draw fade-out animations (effect-specific rendering)
function drawAnimations() {
  fadeOutAnimations.forEach(anim => {
    if (anim.alpha > 0) {
      ctx.fillStyle = `rgba(${hexToRgb(anim.color).join(',')}, ${anim.alpha})`;
      ctx.fillRect(anim.x * BLOCK_SIZE, anim.y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);

      // Sparkle effect (bright white dots)
      if (anim.type === "sparkle") {
        ctx.fillStyle = `rgba(255, 255, 255, ${anim.alpha})`;
        anim.particles.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Explosion effect (small colored dots)
      if (anim.type === "explosion") {
        const rgb = hexToRgb(anim.color);
        ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${anim.alpha})`;
        anim.particles.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    }
  });
}

// Draw the next piece (Centered above the grid)
function drawNextPiece() {
  const NEXT_BOX_WIDTH = 5 * BLOCK_SIZE; // 150px
  const NEXT_BOX_HEIGHT = 5 * BLOCK_SIZE; // 150px
  const NEXT_BOX_X = (GRID_WIDTH * BLOCK_SIZE) ; // Position to the right of the grid
  const NEXT_BOX_Y = 10; // Top margin

  // Draw the box with a thicker border for separation
  ctx.fillStyle = "#fff";
  ctx.fillRect(NEXT_BOX_X, NEXT_BOX_Y, NEXT_BOX_WIDTH, NEXT_BOX_HEIGHT);
  ctx.strokeStyle = "#000"; // Black border for clear separation
  ctx.lineWidth = 4; // Thicker border for distinction
  ctx.strokeRect(NEXT_BOX_X, NEXT_BOX_Y, NEXT_BOX_WIDTH, NEXT_BOX_HEIGHT);

  // "Next" text
  ctx.fillStyle = "#000";
  ctx.font = "16px Arial";
  ctx.fillText("Next", NEXT_BOX_X + 10, NEXT_BOX_Y + 30);

  // Draw the next block (centered in the box, ensuring visibility)
  if (nextPiece) {
    const maxWidth = Math.max(...nextPiece.shape.map(row => row.length));
    const maxHeight = nextPiece.shape.length;
    const offsetX = (NEXT_BOX_WIDTH - maxWidth * BLOCK_SIZE) / 2;
    const offsetY = (NEXT_BOX_HEIGHT - maxHeight * BLOCK_SIZE) / 2 + 30; // Adjust below "Next" text

    for (let y = 0; y < nextPiece.shape.length; y++) {
      for (let x = 0; x < nextPiece.shape[y].length; x++) {
        if (nextPiece.shape[y][x]) {
          drawBlock(
            NEXT_BOX_X + offsetX + x * BLOCK_SIZE,
            NEXT_BOX_Y + offsetY + y * BLOCK_SIZE,
            nextPiece.colors[y][x]
          );
        }
      }
    }
  }
}

// Draw game information (Below the next piece box, centered)
function drawGameInfo() {
  const INFO_X = (GRID_WIDTH * BLOCK_SIZE + 5);
  const INFO_Y = 180; // Position below the next box

  ctx.fillStyle = "#000";
  ctx.font = "16px Arial";
  ctx.fillText(`Score: ${score}`, INFO_X, INFO_Y);
  ctx.fillText(`Time: ${gameTime}s`, INFO_X, INFO_Y + 25);
  ctx.fillText(`Level: ${level}`, INFO_X, INFO_Y + 50);
  ctx.fillText(`Speed: ${dropSpeed}ms`, INFO_X, INFO_Y + 75); // Added to show drop speed
  ctx.fillText(`isGameRunning: ${isGameRunning}`, INFO_X, INFO_Y + 100); 
}

// Convert HEX color to RGB
function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') {
    return [0, 0, 0]; // 기본값(검정) 반환
  }
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

// Game Over
function gameOver() {
  clearInterval(gameTimer); // Stop time update timer
  clearTimeout(gameLoopTimer); // Stop game loop timer
  isGameRunning = false; // Stop game running

  // Create Game Over popup
  const overlay = document.createElement("div");
  overlay.id = "gameOverOverlay";
  overlay.style.position = "absolute";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0,0,0,0.7)";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = "100";
  
  overlay.innerHTML = `
    <div style="background: white; padding: 20px; border-radius: 10px; text-align: center;">
      <h2>TetJeweled Game Over</h2>
      <p>Score: ${score}</p>
      <p>Level: ${level}</p>
      <p>Time: ${gameTime}s</p>
      <button id="newGameButton" style="padding: 10px 20px; background: #0074D9; color: white; border: none; border-radius: 5px; cursor: pointer;">New Game</button>
    </div>
  `;
  document.body.appendChild(overlay);

  // "New Game" button click to start a new game
  document.getElementById("newGameButton").addEventListener("click", () => {
    document.body.removeChild(overlay);
    init(); // Initialize a new game
  });
}

// Make sure the game starts when the page loads
window.onload = init;