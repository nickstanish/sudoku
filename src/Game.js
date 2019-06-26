import React from 'react';
import './Game.css';
import { ReactComponent as DeleteIcon } from './delete.svg' ;
import { ReactComponent as PencilIcon } from './edit-2.svg';
// import SudokuGame from './adapters/sudoku-adapter';
import SudokuGame from './adapters/qqwing-adapter';


// function addTouchListener() {
//   window.addEventListener('touchstart', function onFirstTouch() {
//     document.body.classList.add('is-touch');
//     window.removeEventListener('touchstart', onFirstTouch, false);
//   }, false);
// }

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
      cursor: null,
      pencilMode: false,
      pencils: {}
    }
  }

  onKeyDown = (event) => {
    event.preventDefault();
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
      case 'p': 
      case 'P': {
        this.togglePencilMode();
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
        this.updateValue(value);
        break;
      }
      default: {
        break;
      }
    }
  }

  updateValue(value) {
    if (this.state.cursor !== null) {
      if (this.state.pencilMode) {
        if (value !== '') {
          const currentValues = this.state.pencils[this.state.cursor];
          const currentPencils = new Set(currentValues);
          if (currentPencils.has(value)) {
            currentPencils.delete(value);
          } else {
            currentPencils.add(value);
          }
          this.setState({ 
            pencils: { 
              ...this.state.pencils, 
              [this.state.cursor]: currentPencils 
            } 
          });
        }
      } else {
        this.setState({ sudoku: this.state.sudoku.updateCell(this.state.cursor, value) })
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
      cursor: null,
      pencils: {}
    });
  }

  togglePencilMode = () => {
    this.setState({ pencilMode: !this.state.pencilMode });
  }

  render() {
    const gameRows = cellsToRows(this.state.sudoku.getCells());
    return (
      <div>
        <div className="Game" tabIndex="0" onKeyDown={this.onKeyDown}>
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

                          const cellPencils = this.state.pencils[cell.index];

                          return (
                            <td className="Game__Cell" key={cell.index} data-hint={cell.hint} {...cellProps}>
                              {cell.value}
                              { cell.value === '' && cellPencils && 
                                <ul className="Game__Cell__Pencils">
                                  { 
                                    Array(9).fill().map((_, index) => {
                                      const value = index + 1;
                                      return (
                                        <li className="Pencils__Pencil" key={index}>
                                          <span>{cellPencils.has(value.toString()) ? value : null}</span>
                                        </li>
                                      );
                                    }) 
                                  }
                                </ul>
                              }
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
        {this.state.sudoku.isSolved() &&
          <h2>Complete!</h2>
        }
        <div className="Game__Numpad">
          <div className="Game__NumButtonContainer">
            <button className="Game__NumButton" onClick={() => this.updateValue('1')}>1</button>
            <button className="Game__NumButton" onClick={() => this.updateValue('2')}>2</button>
            <button className="Game__NumButton" onClick={() => this.updateValue('3')}>3</button>
            <button className="Game__NumButton" onClick={() => this.updateValue('4')}>4</button>
            <button className="Game__NumButton" onClick={() => this.updateValue('5')}>5</button>
            <button className="Game__NumButton" onClick={() => this.updateValue('6')}>6</button>
            <button className="Game__NumButton" onClick={() => this.updateValue('7')}>7</button>
            <button className="Game__NumButton" onClick={() => this.updateValue('8')}>8</button>
            <button className="Game__NumButton" onClick={() => this.updateValue('9')}>9</button>
            <div className="Game__NumButton"></div>
            <button className="Game__NumButton" onClick={() => this.updateValue('')}><span><DeleteIcon aria-label="Delete" /></span></button>
            <button className="Game__NumButton" data-active={this.state.pencilMode} onClick={this.togglePencilMode} ><span><PencilIcon aria-label="Pencil" /></span></button>
          </div>
        </div>
        <div className="Game__BottomBar">
          <p>
            <strong>Difficulty: </strong>
            { this.state.sudoku.getDifficulty() }
          </p>
          
        </div>
        <div className="Game__ButtonBar">
          <button onClick={this.solve}>Solve</button>
          <button onClick={this.newGame}>New Game</button>
        </div>
      </div>
    );
  }
}

export default Game;
