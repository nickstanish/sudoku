const Sudoku = window.sudoku;

const difficulties = [
  'easy',
  'medium',
  'hard',
  'very-hard',
  'insane',
  'inhuman'
];

export default class SudokuGame {
  constructor(difficulty = difficulties[1], _data) {
    if (_data) {
      Object.getOwnPropertyNames(_data).forEach((key) => {
        this[key] = _data[key]
      });
    } else {
      this.difficulty = difficulty;
      this.initialBoard = this.board = Sudoku.generate(difficulty);
    }
  }

  solve(board) {
    return Sudoku.solve(board || this.initialBoard);
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