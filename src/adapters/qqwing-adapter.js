const QQWing = window.qqwing;

function buildGame(board) {
  const game = new QQWing();
  game.setPrintStyle(QQWing.PrintStyle.ONE_LINE);
  game.setRecordHistory(true);
  if (board) {
    const values = board.split('').map((value) => {
      if (value === 0) {
        return undefined;
      }
      return parseInt(value, 10);
    });
    game.setPuzzle(values);
  } else {
    game.generatePuzzle();
  }
  game.countSolutions();
  game.solve();
  return game;
}

export default class SudokuGame {
  constructor(difficulty, _data) {
    if (_data) {
      Object.getOwnPropertyNames(_data).forEach((key) => {
        this[key] = _data[key]
      });
    } else {
      const game = buildGame();
      this.difficulty = game.getDifficultyAsString();
      this.initialBoard = this.board = game.getPuzzleString().trim();
    }
  }

  getDifficulty() {
    return this.difficulty;
  }

  solve(board) {
    const game = buildGame(this.initialBoard);
    return game.getSolutionString().trim();
  }

  isSolved() {
    return this.solve(this.board) === this.board;
  }

  hasError() {
    return !this.solve(this.board);
  }

  getCells() {
    const initialBoard = Array.from(this.initialBoard);
    return Array.from(this.board).map((value, index) => {
      return {
        hint: initialBoard[index] !== '.',
        value: value === '.' ? '' : value,
        row: Math.floor(index / 9.0),
        column: index % 9,
        index: index
      };
    });
  }

  getValueAt(index) {
    if (index === null) {
      return null;
    }
    const value = this.board.charAt(index);
    return value === '.' ? '' : value;
  }

  getValueCounts() {
    const counts = {};
    Array.from(this.board).forEach((value) => {
      const key = value === '.' ? '' : value
      if (counts[key]) {
        counts[key]++;
      } else {
        counts[key] = 1;
      }
    });
    return counts;
  }

  clone(mergeObj) {
    const data = Object.assign({}, this.toHash(), mergeObj);
    return new SudokuGame(null, data);
  }

  toHash() {
    const obj = {};
    Object.getOwnPropertyNames(this).forEach(key => {
      obj[key] = this[key];
    });
    return obj;
  }

  updateCell(index, value) {
    const selectedCell = this.getCells()[index];
    if (selectedCell.hint) {
      // invalid move
      return this;
    }
    const nextValue = value === '' ? '.' : value;
    const nextBoard = this.board.substring(0, index) + nextValue + this.board.substring(index + 1);
    return this.clone({ board: nextBoard });
  }
}