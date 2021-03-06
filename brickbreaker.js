var canvas, context;
var Ball = function(x, y) {
  this.x = x;
  this.y = y;
  this.radius = 5;
  this.velocityX = 5;
  this.velocityY = 5;
  this.reset = () => {
    this.x = canvas.width/2;
    this.y = canvas.height/2;
  }
  this.move = () => {
    this.x += this.velocityX;
    this.y += this.velocityY;

    if (this.x + this.velocityX >= canvas.width) {  // Right
      this.velocityX *= -1;
    }
    if (this.x + this.velocityX <= 0) { // Left
      this.velocityX *= -1;
    }
    if (this.y + this.velocityY <= 0) { // Top
      this.velocityY *= -1;
    }
    if (this.y + this.velocityY >= canvas.height) { // Bottom
      this.reset();
      lives--;
      if (lives < 0) {
        bricksReset();
      }
    }
  }
}
var Player = function(x, y) {
  this.x = x;
  this.y = y;
  this.height = 10;
  this.width = 100;
  this.distanceFromEdge = canvas.height/10;
}
var Bricks = function() {
  this.width = 40;
  this.height = 20;
  this.isAlive = true;
}
var ball;
var player;
var bricks;
const BRICK_ROWS = 14;
const BRICK_COLS = 20;
const BRICK_GAP = 2;
var bricksLeft = 0;
var lives = 3;
var mouseX = 0;
var mouseY = 0;

function updateMousePos(event) {
  var rect = canvas.getBoundingClientRect();
  var root = document.documentElement;
  mouseX = event.clientX - rect.left - root.scrollLeft;
  mouseY = event.clientY - rect.top - root.scrollTop;

  player.x = mouseX - player.width/2;
}

function rowColToArrayIndex(col, row) {
  return col + BRICK_COLS * row;
}

function bricksReset() {
  lives = 3;
  bricksLeft = 0;
  var i;
  for (i = 0; i < 3 * BRICK_COLS; i++) {
    bricks[i].isAlive = false;
  }
  for (; i < BRICK_ROWS * BRICK_COLS; i++) {
    bricks[i].isAlive = true;
    bricksLeft++;
  }
}

window.onload = function() {
  canvas = document.getElementById('canvas');
  context = canvas.getContext('2d');

  ball = new Ball(100, 100);
  player = new Player(400, canvas.height - 10);
  bricks = [];
  var i;
  for (i = 0; i < 3 * BRICK_COLS; i++) {
    bricks[i] = new Bricks();
    bricks[i].isAlive = false;
  }
  for (; i < BRICK_ROWS * BRICK_COLS; i++) {
    bricks[i] = new Bricks();
    bricksLeft++;
  }

  ball.reset();
  var framesPerSecond = 30;
  setInterval(update, 1000/framesPerSecond);
  canvas.addEventListener('mousemove', updateMousePos);
}
var update = function() {
  if (bricksLeft === 0) {
    colorRect(0,0,canvas.width,canvas.height, 'black');
    colorText("YOU WIN", canvas.width/2, canvas.height/2, 'white');
    console.log("YOU WIN");
  }

  moveAll();
  drawAll();
}

function isBrickAtRowCol(col, row) {
  if (col >= 0 && col < BRICK_COLS &&
      row >= 0 && row < BRICK_ROWS) {
        return bricks[rowColToArrayIndex(col, row)].isAlive;
  }
  else {
    return false;
  }
}

function ballBrickHandling() {
  var ballBrickCol = Math.floor(ball.x / bricks[0].width);
  var ballBrickRow = Math.floor(ball.y / bricks[0].height);
  var brickIndexUnderball = rowColToArrayIndex(ballBrickCol, ballBrickRow);

  if (ballBrickCol >= 0 && ballBrickCol < BRICK_COLS &&
      ballBrickRow >= 0 && ballBrickRow < BRICK_ROWS) {
    if (isBrickAtRowCol(ballBrickCol, ballBrickRow)) {
      bricks[brickIndexUnderball].isAlive = false;
      bricksLeft--;

      var prevBallX = ball.x - ball.velocityX;
      var prevBallY = ball.y - ball.velocityY;
      var prevBrickCol = Math.floor(prevBallX / bricks[0].width);
      var prevBrickRow = Math.floor(prevBallY / bricks[0].height);

      var bothTestsFailed = true;
      if (prevBrickCol != ballBrickCol) {
        if (isBrickAtRowCol(prevBrickCol, ballBrickRow) === false) {
          ball.velocityX *= -1;
          bothTestsFailed = false;
          bricksLeft--;
        }
      }
      if (prevBrickRow != ballBrickRow) {
        if (isBrickAtRowCol(ballBrickCol, prevBrickRow) === false) {
          ball.velocityY *= -1;
          bothTestsFailed = false;
          bricksLeft--;
        }
      }
      if (bothTestsFailed) {
        ball.velocityX *= -1;
        ball.velocityY *= -1;
        bricksLeft--;
      }
    }
  }
}
function ballPlayerHandling() {
  var topEdgeY = canvas.height - player.distanceFromEdge;
  var bottomEdgeY = topEdgeY + player.height;
  var leftEdgeX = player.x;
  var rightEdgeX = leftEdgeX + player.width;

  if (ball.y + ball.velocityY + ball.radius >= topEdgeY &&    // below top of paddle
      ball.y + ball.velocityY + ball.radius <= bottomEdgeY && // above bottom of paddle
      ball.x + ball.velocityX + ball.radius >= leftEdgeX &&   // right of the left side
      ball.x + ball.velocityX + ball.radius <= rightEdgeX) {  // left of the right
        ball.velocityY *= -1;

        var centerOfPlayer = player.x + player.width / 2;
        var distanceFromCenter = ball.x - centerOfPlayer;
        ball.velocityX = distanceFromCenter * 0.35;

        if (bricksLeft == 0) {
          bricksReset();
        }
      }
}
function moveAll() {
  ball.move();
  ballBrickHandling();
  ballPlayerHandling();
}

function drawAll() {
  colorRect(0,0, canvas.width,canvas.height, 'black');
  colorCircle(ball.x,ball.y, ball.radius, 'white');
  colorRect(player.x, player.y - player.distanceFromEdge, player.width, player.height, 'white');
  context.font = '15pt bold';
  colorText("Lives: " + lives, canvas.width/2, 50, 'white');
  drawBricks();
}

function drawBricks() {
  for (eachRow = 0; eachRow < BRICK_ROWS; eachRow++) {
    for (eachCol = 0; eachCol < BRICK_COLS; eachCol++) {
      // var my_gradient=context.createLinearGradient(bricks[eachCol].width * eachCol,
      //    bricks[eachCol].height * eachRow,
      //    bricks[eachCol].width * eachCol + bricks[eachCol].width - BRICK_GAP,
      //    bricks[eachCol].height * eachRow + bricks[eachCol].height - BRICK_GAP);
      var my_gradient=context.createRadialGradient(bricks[eachCol].width * eachCol,
          bricks[eachCol].height * eachRow,
          bricks[eachCol].width,
          bricks[eachCol].width * eachCol + bricks[eachCol].width - BRICK_GAP,
          bricks[eachCol].height * eachRow + bricks[eachCol].height - BRICK_GAP,
          bricks[eachCol].height);
      my_gradient.addColorStop(0,"blue");
      my_gradient.addColorStop(0.5, 'cyan')
      my_gradient.addColorStop(1,"blue");
      if (bricks[rowColToArrayIndex(eachCol, eachRow)].isAlive) {
        colorRect(bricks[eachCol].width * eachCol, bricks[eachCol].height * eachRow,  bricks[eachCol].width - BRICK_GAP, bricks[eachCol].height - BRICK_GAP, my_gradient);
        }
    }
  }
}
function colorRect(x,y, boxWidth,boxHeight, fillColor) {
  context.fillStyle = fillColor;
  context.fillRect(x,y, boxWidth,boxHeight);
}
function colorCircle(centerX,centerY, radius, fillColor) {
  context.fillStyle = fillColor;
  context.beginPath();
  context.arc(centerX,centerY, radius, 0,Math.PI*2, true);
  context.fill();
}
function colorText(showWords, x, y, fillColor) {
  context.fillStyle = fillColor;
  context.fillText(showWords, x, y);
}
