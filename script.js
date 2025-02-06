const boardSize = 6;
const candyTypes = ['red', 'green', 'blue', 'yellow', 'purple', 'orange'];
let board = [];
let score = 0;
let moves = 20;
let firstSelected = null;

// 初期化処理
document.addEventListener('DOMContentLoaded', () => {
  initBoard();
  renderBoard();
});

// ボードの初期化
function initBoard() {
  board = [];
  for (let row = 0; row < boardSize; row++) {
    const rowArray = [];
    for (let col = 0; col < boardSize; col++) {
      rowArray.push(randomCandy());
    }
    board.push(rowArray);
  }
}

// ランダムなキャンディーを返す
function randomCandy() {
  const index = Math.floor(Math.random() * candyTypes.length);
  return candyTypes[index];
}

// ボードを描画
function renderBoard() {
  const gameBoard = document.getElementById('game-board');
  gameBoard.innerHTML = '';
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const candyDiv = document.createElement('div');
      candyDiv.classList.add('candy');
      candyDiv.style.backgroundColor = board[row][col];
      candyDiv.dataset.row = row;
      candyDiv.dataset.col = col;
      candyDiv.addEventListener('click', handleCandyClick);
      gameBoard.appendChild(candyDiv);
    }
  }
}

// キャンディー選択時の処理
function handleCandyClick(e) {
  const candyDiv = e.target;
  const row = parseInt(candyDiv.dataset.row);
  const col = parseInt(candyDiv.dataset.col);

  if (!firstSelected) {
    firstSelected = { row, col, element: candyDiv };
    candyDiv.style.border = '2px solid #000';
  } else {
    // 同じキャンディーがクリックされた場合は選択解除
    if (firstSelected.row === row && firstSelected.col === col) {
      firstSelected.element.style.border = '2px solid #fff';
      firstSelected = null;
      return;
    }
    // 隣接チェック
    if (isAdjacent(firstSelected.row, firstSelected.col, row, col)) {
      swapCandies(firstSelected.row, firstSelected.col, row, col);
      moves--;
      updateGameInfo();
      // マッチがあるか確認
      if (checkAndProcessMatches()) {
        playMatchSound();
      } else {
        // マッチがなければ元に戻す
        setTimeout(() => {
          swapCandies(firstSelected.row, firstSelected.col, row, col);
          renderBoard();
        }, 300);
      }
    }
    // 選択解除
    const firstCandyElem = document.querySelector(`.candy[data-row='${firstSelected.row}'][data-col='${firstSelected.col}']`);
    if (firstCandyElem) {
      firstCandyElem.style.border = '2px solid #fff';
    }
    firstSelected = null;
  }
}

// 隣接しているかを確認
function isAdjacent(r1, c1, r2, c2) {
  const rowDiff = Math.abs(r1 - r2);
  const colDiff = Math.abs(c1 - c2);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

// キャンディーを入れ替え
function swapCandies(r1, c1, r2, c2) {
  const temp = board[r1][c1];
  board[r1][c1] = board[r2][c2];
  board[r2][c2] = temp;
  renderBoard();
}

// マッチのチェックと処理
function checkAndProcessMatches() {
  const matches = findMatches();
  if (matches.length === 0) {
    return false;
  }
  removeMatches(matches);
  dropCandies();
  refillBoard();
  score += matches.length * 10;
  updateGameInfo();
  // チェーンマッチがある場合、再度チェック
  setTimeout(() => {
    if (findMatches().length > 0) {
      checkAndProcessMatches();
    }
  }, 300);
  return true;
}

// 水平・垂直のマッチを検出
function findMatches() {
  let matchedPositions = [];
  
  // 横方向チェック
  for (let row = 0; row < boardSize; row++) {
    let count = 1;
    for (let col = 0; col < boardSize; col++) {
      if (col < boardSize - 1 && board[row][col] === board[row][col + 1]) {
        count++;
      } else {
        if (count >= 3) {
          for (let k = 0; k < count; k++) {
            matchedPositions.push({ row, col: col - k });
          }
        }
        count = 1;
      }
    }
  }
  
  // 縦方向チェック
  for (let col = 0; col < boardSize; col++) {
    let count = 1;
    for (let row = 0; row < boardSize; row++) {
      if (row < boardSize - 1 && board[row][col] === board[row + 1][col]) {
        count++;
      } else {
        if (count >= 3) {
          for (let k = 0; k < count; k++) {
            matchedPositions.push({ row: row - k, col });
          }
        }
        count = 1;
      }
    }
  }
  
  return matchedPositions;
}

// マッチしたキャンディーを削除
function removeMatches(matches) {
  matches.forEach(pos => {
    board[pos.row][pos.col] = null;
  });
}

// 落下処理：上のキャンディーを落とす
function dropCandies() {
  for (let col = 0; col < boardSize; col++) {
    for (let row = boardSize - 1; row >= 0; row--) {
      if (board[row][col] === null) {
        let upperRow = row - 1;
        while (upperRow >= 0 && board[upperRow][col] === null) {
          upperRow--;
        }
        if (upperRow >= 0) {
          board[row][col] = board[upperRow][col];
          board[upperRow][col] = null;
        }
      }
    }
  }
}

// 空いた部分に新たなキャンディーを補充する
function refillBoard() {
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      if (board[row][col] === null) {
        board[row][col] = randomCandy();
      }
    }
  }
  renderBoard();
}

// ゲーム情報の更新
function updateGameInfo() {
  document.getElementById('score').textContent = score;
  document.getElementById('moves').textContent = moves;
  if (moves <= 0) {
    setTimeout(() => {
      alert('ゲームオーバー！スコア: ' + score);
    }, 100);
  }
}

// マッチ時の効果音を再生
function playMatchSound() {
  const sound = document.getElementById('match-sound');
  if (sound) {
    sound.currentTime = 0;
    sound.play();
  }
}