import React from 'react';
import './Game.css';

const Sudoku = window.sudoku;

const difficulties = [
  'easy',
  'medium',
  'hard',
  'very-hard',
  'insane',
  'inhuman'
]

class SudokuGame {
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
    const nextValue = value === '' ? '.'  : value;
    const nextBoard = this.board.substring(0, index) + nextValue + this.board.substring(index + 1);
    return this.clone({ board: nextBoard });
  }
}

function cellsToRows(cells) {
  const rows = [];
  for (let i = 0; i < 9; i++) {
    rows.push(cells.slice(i * 9, (i + 1) * 9));
  }
  return rows;
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sudoku: new SudokuGame(),
      cursor: null
    }
  }

  onKeyDown = (event) => {
    switch(event.key) {
      case 'ArrowUp': {
        this.setState({ cursor: (81 + this.state.cursor - 9) % 81 });
        break;
      }
      case 'ArrowDown': {
        this.setState({ cursor: (81 + this.state.cursor + 9) % 81 });
        break;
      }
      case 'ArrowLeft': {
        this.setState({ cursor: (81 + this.state.cursor - 1) % 81 });
        break;
      }
      case 'ArrowRight': {
        this.setState({ cursor: (81 + this.state.cursor + 1) % 81 });
        break;
      }
      case 'Backspace':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9': {
        const value = event.key === 'Backspace' ? '' : event.key;
        this.setState({ sudoku: this.state.sudoku.updateCell(this.state.cursor, value) })
        break;
      }
      default: {
        break;
      }
    }
  }

  updateCursor(cell) {
    this.setState({
      cursor: cell.index
    });
  }

  clearCursor = () => {
    this.setState({
      cursor: null
    });
  }

  solve = () => {
    this.setState({ sudoku: this.state.sudoku.clone({ board: this.state.sudoku.solve() }) })
  }

  newGame = () => {
    this.setState({
      sudoku: new SudokuGame(),
      cursor: null
    });
  }

  render() {
    const gameRows = cellsToRows(this.state.sudoku.getCells());
    return (
      <div>
        <div className="Game" tabIndex="0" onKeyDown={this.onKeyDown} onBlur={this.clearCursor}>
          <table className="Game__Table">
            <tbody>
              { 
                gameRows.map((row, index) => {
                  return (
                    <tr key={index} className="Game__TableRow">
                      { 
                        row.map((cell) => {
                          const cellProps = {
                            'data-selected': this.state.cursor === cell.index, 
                            onClick: () => this.updateCursor(cell)
                          };

                          return (
                            <td className="Game__Cell" key={cell.index} data-hint={cell.hint} {...cellProps}>
                              {cell.value}
                            </td>
                          );
                        })
                      }
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
        <div>
          { this.state.sudoku.isSolved() &&
            <h2>Complete!</h2>
          }
          <button onClick={this.solve}>Solve</button>
          <button onClick={this.newGame}>New Game</button>
        </div>
      </div>
    );
  }
}

export default Game;
