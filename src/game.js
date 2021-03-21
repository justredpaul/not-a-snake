const notASnake = () => {
  const WORLD_SIZE = 20;
  let SNAKE = [
    [WORLD_SIZE / 2 + 5, WORLD_SIZE / 2 - 4],
    [WORLD_SIZE / 2 + 5, WORLD_SIZE / 2 - 5],
    [WORLD_SIZE / 2 + 5, WORLD_SIZE / 2 - 6],
  ];
  let APPLE = [
    WORLD_SIZE / 2 - 5, WORLD_SIZE / 2 + 5,
  ]
  const BLOCKS = {
    SPACE: 0,
    WALL: 1,
    SNAKE_TAIL: 2,
    SNAKE_HEAD: 3,
    APPLE: 4,
  }
  const MOVEMENTS = {
    LEFT: [-1, 0],
    RIGHT: [1, 0],
    DOWN: [0, 1],
    UP: [0, -1],
  };
  const DIRECTIONS = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    DOWN: 'DOWN',
    UP: 'UP',
  }
  const SCORE_EL = document.querySelector('.score__value');
  const LOSE_EL = document.querySelector('.message_lose');
  const WIN_EL = document.querySelector('.message_win');

  let world = [];
  let snakeDirection = DIRECTIONS.RIGHT;
  let appleDirection;
  let snakeSpeed = 2;
  let growSpeed = 5;
  let playerSpeed = 10;
  let snakeDead = false;
  let appleEaten = false;
  let score = 0;

  const initWorld = () => {
    for (let i = 0; i < WORLD_SIZE; i++) {
      world[i] = [];

      for (let j = 0; j < WORLD_SIZE; j++) {
        let blockType = BLOCKS.SPACE;

        if (i === 0 || j === 0 || i + 1 === WORLD_SIZE || j + 1 === WORLD_SIZE) {
          blockType = BLOCKS.WALL;
        }

        world[i][j] = blockType;
      }
    }

    for (let snakeIndex in SNAKE) {
      const [snakeBlockX, snakeBlockY] = SNAKE[snakeIndex];
      world[snakeBlockX][snakeBlockY] = snakeIndex > 0
        ? BLOCKS.SNAKE_TAIL
        : BLOCKS.SNAKE_HEAD;
    }

    const [appleX, appleY] = APPLE;

    world[appleX][appleY] = BLOCKS.APPLE;
  }

  const drawWorld = () => {
    const rows = document.querySelectorAll('.game-field__row');

    for (let i = 0; i < WORLD_SIZE; i++) {
      const cells = rows[i].querySelectorAll('.game-field__cell');

      for (let j = 0; j < WORLD_SIZE; j++) {
        cells[j].className = 'game-field__cell';

        switch (world[i][j]) {
          case BLOCKS.WALL:
            cells[j].classList.add('game-field__cell_wall');
            break;
          case BLOCKS.SNAKE_TAIL:
            cells[j].classList.add('game-field__cell_tail');
            break;
          case BLOCKS.SNAKE_HEAD:
            cells[j].classList.add('game-field__cell_head');
            break;
          case BLOCKS.APPLE:
            cells[j].classList.add('game-field__cell_apple');
            break;
        }
      }
    }
  }

  const moveSnake = (isGrow) => {
    const movement = MOVEMENTS[snakeDirection];
    const [snakeHead] = SNAKE;
    SNAKE.unshift([
      snakeHead[0] + movement[1],
      snakeHead[1] + movement[0],
    ])

    if (!isGrow) {
      SNAKE.pop();
    }
  }

  const moveApple = () => {
    if (!appleDirection) return;

    const movement = MOVEMENTS[appleDirection];

    const newCoordinates = [APPLE[0] + movement[1], APPLE[1] + movement[0]];

    if (world[newCoordinates[0]][newCoordinates[1]] !== BLOCKS.SPACE) return;

    APPLE = newCoordinates;

    appleDirection = null;
  }

  const checkCollisions = () => {
    const [snakeHead] = SNAKE;

    if (world[snakeHead[0]][snakeHead[1]] === BLOCKS.WALL) {
      snakeDead = true;
    }
    if (world[snakeHead[0]][snakeHead[1]] === BLOCKS.APPLE) {
      appleEaten = true;
    }

    let snakeMap = new Map();
    SNAKE.forEach(block => {
      if (snakeMap.has(`${block[0]}${block[1]}`)) {
        snakeDead = true;
      } else {
        snakeMap.set(`${block[0]}${block[1]}`, 1);
      }
    })
  }

  const findApple = () => {
    let preferredMove;
    const [snakeHead] = SNAKE;
    let yDifference = APPLE[0] - snakeHead[0];
    let xDifference = APPLE[1] - snakeHead[1];

    if (Math.abs(yDifference) > Math.abs(xDifference)) {
      if (yDifference <= 0) {
        preferredMove = DIRECTIONS.UP;
      } else {
        preferredMove = DIRECTIONS.DOWN;
      }
    } else {
      if (xDifference > 0) {
        preferredMove = DIRECTIONS.RIGHT;
      } else {
        preferredMove = DIRECTIONS.LEFT;
      }
    }

    snakeDirection = preferredMove;
  }

  const gameCycle = () => {
    let growCounter = 0;

    let clearAllIntervals = () => {
      clearInterval(snakeCycle);
      clearInterval(playerCycle);
      clearInterval(surviveCycle);

      if (appleEaten) {
        LOSE_EL.style.visibility = 'visible';
      }

      if (snakeDead) {
        WIN_EL.style.visibility = 'visible';
      }
    };

    const surviveCycle = setInterval(() => {
      score++;

      SCORE_EL.textContent = score;
    }, 1000);

    const snakeCycle = setInterval(() => {
      initWorld();

      if (growCounter === growSpeed) {
        growCounter = 0;
        moveSnake(true);
      } else {
        growCounter++;
        moveSnake(false);
      }

      checkCollisions();
      drawWorld();

      if (snakeDead || appleEaten) {
        clearAllIntervals();
      }
    }, Math.floor(1000 / snakeSpeed));

    const playerCycle = setInterval(() => {
      initWorld();
      moveApple();
      checkCollisions();
      findApple();
      drawWorld();

      if (appleEaten) {
        clearAllIntervals();
      }
    }, Math.floor(1000 / playerSpeed));
  }

  const bindKeys = () => {
    const moveUp = () => appleDirection = DIRECTIONS.UP;
    const moveDown = () => appleDirection = DIRECTIONS.DOWN;
    const moveLeft = () => appleDirection = DIRECTIONS.LEFT;
    const moveRight = () => appleDirection = DIRECTIONS.RIGHT;

    const up = document.querySelector('.controls__button_up');
    up.addEventListener('click', moveUp);
    const down = document.querySelector('.controls__button_down');
    down.addEventListener('click', moveDown);
    const left = document.querySelector('.controls__button_left');
    left.addEventListener('click', moveLeft);
    const right = document.querySelector('.controls__button_right');
    right.addEventListener('click', moveRight);

    window.addEventListener('keydown', (evt) => {
      switch (evt.key) {
        case 'ArrowUp':
          moveUp()
          break;
        case 'ArrowDown':
          moveDown();
          break;
        case 'ArrowLeft':
          moveLeft();
          break;
        case 'ArrowRight':
          moveRight();
          break;
      }
    });
  }

  initWorld();
  drawWorld();
  gameCycle();
  bindKeys();
};


notASnake();
