// 游戏配置
const config = {
    canvasId: 'gameCanvas',
    gridSize: 20,
    frameRate: 100,
    initialSnakeLength: 3,
    initialDirection: 'right'
};

// 游戏状态
let gameState = {
    running: false,
    paused: false,
    snake: [],
    food: null,
    direction: config.initialDirection,
    nextDirection: config.initialDirection,
    score: 0,
    highScore: localStorage.getItem('snakeHighScore') || 0
};

// DOM 元素
const canvas = document.getElementById(config.canvasId);
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startBtn');
const pauseButton = document.getElementById('pauseBtn');
const currentScoreElement = document.getElementById('currentScore');
const highScoreElement = document.getElementById('highScore');

// 设置画布大小
canvas.width = 400;
canvas.height = 400;

// 每个格子的实际像素大小
const cellSize = canvas.width / config.gridSize;

// 游戏主循环
let gameLoop;

// 初始化游戏
function initGame() {
    // 创建蛇
    gameState.snake = [];
    for (let i = 0; i < config.initialSnakeLength; i++) {
        gameState.snake.push({
            x: Math.floor(config.gridSize / 2) - i,
            y: Math.floor(config.gridSize / 2)
        });
    }
    
    // 创建食物
    createFood();
    
    // 更新分数
    gameState.score = 0;
    updateScore();
    
    // 重置方向
    gameState.direction = config.initialDirection;
    gameState.nextDirection = config.initialDirection;
}

// 创建食物
function createFood() {
    let foodPosition;
    
    do {
        foodPosition = {
            x: Math.floor(Math.random() * config.gridSize),
            y: Math.floor(Math.random() * config.gridSize)
        };
    } while (isPositionOccupied(foodPosition));
    
    gameState.food = foodPosition;
}

// 检查位置是否被蛇占用
function isPositionOccupied(position) {
    return gameState.snake.some(segment => 
        segment.x === position.x && segment.y === position.y
    );
}

// 移动蛇
function moveSnake() {
    // 更新方向
    gameState.direction = gameState.nextDirection;
    
    // 获取蛇头
    const head = { ...gameState.snake[0] };
    
    // 根据方向移动蛇头
    switch (gameState.direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }
    
    // 检查是否撞墙
    if (head.x < 0 || head.x >= config.gridSize || 
        head.y < 0 || head.y >= config.gridSize) {
        gameOver();
        return;
    }
    
    // 检查是否撞到自己
    if (isPositionOccupied(head)) {
        gameOver();
        return;
    }
    
    // 将新头部添加到蛇身前面
    gameState.snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === gameState.food.x && head.y === gameState.food.y) {
        // 增加分数
        gameState.score += 10;
        updateScore();
        
        // 创建新食物
        createFood();
    } else {
        // 如果没吃到食物，移除尾部
        gameState.snake.pop();
    }
}

// 渲染游戏
function renderGame() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制背景网格
    drawGrid();
    
    // 绘制蛇
    drawSnake();
    
    // 绘制食物
    drawFood();
}

// 绘制网格
function drawGrid() {
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= config.gridSize; i++) {
        // 垂直线
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, canvas.height);
        ctx.stroke();
        
        // 水平线
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.stroke();
    }
}

// 绘制蛇
function drawSnake() {
    gameState.snake.forEach((segment, index) => {
        // 蛇头使用不同颜色
        if (index === 0) {
            ctx.fillStyle = '#388E3C';
        } else {
            ctx.fillStyle = '#4CAF50';
        }
        
        ctx.fillRect(
            segment.x * cellSize + 1, 
            segment.y * cellSize + 1, 
            cellSize - 2, 
            cellSize - 2
        );
    });
}

// 绘制食物
function drawFood() {
    ctx.fillStyle = '#F44336';
    ctx.beginPath();
    ctx.arc(
        gameState.food.x * cellSize + cellSize / 2,
        gameState.food.y * cellSize + cellSize / 2,
        cellSize / 2 - 2,
        0,
        2 * Math.PI
    );
    ctx.fill();
}

// 更新分数
function updateScore() {
    currentScoreElement.textContent = gameState.score;
    
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('snakeHighScore', gameState.highScore);
        highScoreElement.textContent = gameState.highScore;
    }
}

// 游戏结束
function gameOver() {
    clearInterval(gameLoop);
    gameState.running = false;
    startButton.textContent = '重新开始';
    alert(`游戏结束！你的得分：${gameState.score}`);
}

// 开始游戏
function startGame() {
    if (!gameState.running) {
        initGame();
        gameState.running = true;
        gameState.paused = false;
        startButton.textContent = '重新开始';
        pauseButton.textContent = '暂停';
        
        gameLoop = setInterval(() => {
            if (!gameState.paused) {
                moveSnake();
                renderGame();
            }
        }, config.frameRate);
    } else {
        clearInterval(gameLoop);
        startGame();
    }
}

// 暂停/恢复游戏
function togglePause() {
    if (!gameState.running) return;
    
    gameState.paused = !gameState.paused;
    pauseButton.textContent = gameState.paused ? '继续' : '暂停';
}

// 添加键盘控制
document.addEventListener('keydown', (event) => {
    // 只在游戏运行且未暂停时响应方向键
    if (!gameState.running || gameState.paused) return;
    
    // 防止蛇反向移动
    switch (event.key) {
        case 'ArrowUp':
            if (gameState.direction !== 'down') {
                gameState.nextDirection = 'up';
            }
            break;
        case 'ArrowDown':
            if (gameState.direction !== 'up') {
                gameState.nextDirection = 'down';
            }
            break;
        case 'ArrowLeft':
            if (gameState.direction !== 'right') {
                gameState.nextDirection = 'left';
            }
            break;
        case 'ArrowRight':
            if (gameState.direction !== 'left') {
                gameState.nextDirection = 'right';
            }
            break;
    }
});

// 添加按钮事件监听
startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', togglePause);

// 移动端触摸控制
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
});

canvas.addEventListener('touchmove', (e) => {
    if (!gameState.running || gameState.paused) return;
    e.preventDefault();
    
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    
    // 需要最小的滑动距离来触发方向改变
    const minSwipeDistance = 30;
    
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipeDistance) {
        // 水平滑动
        if (dx > 0 && gameState.direction !== 'left') {
            gameState.nextDirection = 'right';
        } else if (dx < 0 && gameState.direction !== 'right') {
            gameState.nextDirection = 'left';
        }
    } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > minSwipeDistance) {
        // 垂直滑动
        if (dy > 0 && gameState.direction !== 'up') {
            gameState.nextDirection = 'down';
        } else if (dy < 0 && gameState.direction !== 'down') {
            gameState.nextDirection = 'up';
        }
    }
    
    // 更新起始点，以便连续滑动
    touchStartX = touchEndX;
    touchStartY = touchEndY;
});

// 页面加载时显示高分
document.addEventListener('DOMContentLoaded', () => {
    highScoreElement.textContent = gameState.highScore;
    drawGrid(); // 绘制初始网格
});