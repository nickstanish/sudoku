import React from 'react';
import './Game.css';
import Cell from './components/Cell';
import CellGroup from './components/CellGroup';
import Grid from './components/Grid';
import { ReactComponent as DeleteIcon } from './delete.svg' ;
import { ReactComponent as PencilIcon } from './edit-2.svg';
// import SudokuGame from './adapters/sudoku-adapter';
import SudokuGame from './adapters/qqwing-adapter';
import Timer from './Timer';
import { groupBoxes } from './utils/sudoku';


// function addTouchListener() {
//   window.addEventListener('touchstart', function onFirstTouch() {
//     document.body.classList.add('is-touch');
//     window.removeEventListener('touchstart', onFirstTouch, false);
//   }, false);
// }


class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sudoku: new SudokuGame(),
      startAt: new Date(),
      completedAt: null,
      cursor: null,
      pencilMode: false,
      pencils: {}
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
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
        const nextState = {
          sudoku: this.state.sudoku.updateCell(this.state.cursor, value)
        };

        if (nextState.sudoku.isSolved()) {
          nextState.completedAt = new Date();
        }

        this.setState(nextState)
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
    this.setState({
      sudoku: this.state.sudoku.clone({ board: this.state.sudoku.solve() }),
      completedAt: new Date()
    });
  }

  newGame = () => {
    this.setState({
      sudoku: new SudokuGame(),
      startAt: new Date(),
      completedAt: null,
      cursor: null,
      pencils: {}
    });
  }

  togglePencilMode = () => {
    this.setState({ pencilMode: !this.state.pencilMode });
  }

  renderCell = (cell) => {
    return (
      <Cell
        key={cell.index}
        selected={this.state.cursor === cell.index}
        onSelect={() => this.updateCursor(cell)}
        hint={cell.hint}
        pencils={this.state.pencils[cell.index]}
        value={cell.value}
        hightlightValue={this.state.sudoku.getValueAt(this.state.cursor)}
      />
    );
  }

  render() {
    const gameBoxes = groupBoxes(this.state.sudoku.getCells());
    const valueCounts = this.state.sudoku.getValueCounts();
    return (
      <div>
        <header className="Game__Header">
          <div>
            { this.state.sudoku.getDifficulty() }
          </div>
          <div>
            <Timer startAt={this.state.startAt} stopAt={this.state.completedAt} />
          </div>
        </header>
        <div className="Game">
          <div className="Game__Table">
            <Grid className="BoardGrid">
              {
                gameBoxes.map((group, index) => <CellGroup key={index} group={group} renderCell={this.renderCell} />)
              }
            </Grid>
          </div>
        </div>
        {this.state.completedAt !== null &&
          <h2>Complete!</h2>
        }
        <div className="Game__Numpad">
          <div className="Game__NumButtonContainer">
            <button className="Game__NumButton" disabled={valueCounts[1] >= 9} onClick={() => this.updateValue('1')}>1</button>
            <button className="Game__NumButton" disabled={valueCounts[2] >= 9} onClick={() => this.updateValue('2')}>2</button>
            <button className="Game__NumButton" disabled={valueCounts[3] >= 9} onClick={() => this.updateValue('3')}>3</button>
            <button className="Game__NumButton" disabled={valueCounts[4] >= 9} onClick={() => this.updateValue('4')}>4</button>
            <button className="Game__NumButton" disabled={valueCounts[5] >= 9} onClick={() => this.updateValue('5')}>5</button>
            <button className="Game__NumButton" disabled={valueCounts[6] >= 9} onClick={() => this.updateValue('6')}>6</button>
            <button className="Game__NumButton" disabled={valueCounts[7] >= 9} onClick={() => this.updateValue('7')}>7</button>
            <button className="Game__NumButton" disabled={valueCounts[8] >= 9} onClick={() => this.updateValue('8')}>8</button>
            <button className="Game__NumButton" disabled={valueCounts[9] >= 9} onClick={() => this.updateValue('9')}>9</button>
            <div className="Game__NumButton"></div>
            <button className="Game__NumButton" onClick={() => this.updateValue('')}><span><DeleteIcon aria-label="Delete" /></span></button>
            <button className="Game__NumButton" data-active={this.state.pencilMode} onClick={this.togglePencilMode} ><span><PencilIcon aria-label="Pencil" /></span></button>
          </div>
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
