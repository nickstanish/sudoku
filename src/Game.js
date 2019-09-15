import React from 'react';
import './Game.css';
import Cell from './components/Cell';
import CellGroup from './components/CellGroup';
import Grid from './components/Grid';
import { ReactComponent as DeleteIcon } from './delete.svg' ;
import { ReactComponent as PencilIcon } from './edit-2.svg';
import Timer from './Timer';
import { groupBoxes } from './utils/sudoku';

const Game = (props) => {
  const renderCell = (cell) => {
    const onSelect = () => {
      props.updateCursor(cell.index);
    };
    return (
      <Cell
        key={cell.index}
        selected={props.cursor === cell.index}
        onSelect={onSelect}
        hint={cell.hint}
        pencils={props.pencils[cell.index]}
        value={cell.value}
        hightlightValue={props.sudoku.getValueAt(props.cursor)}
      />
    );
  };

  const gameBoxes = groupBoxes(props.sudoku.getCells());
  const valueCounts = props.sudoku.getValueCounts();
  return (
    <div>
      <header className="Game__Header">
        <div>
          { props.sudoku.getDifficulty() }
        </div>
        <div>
          <Timer startAt={props.startAt} stopAt={props.completedAt} />
        </div>
      </header>
      <div className="Game">
        <div className="Game__Table">
          <Grid className="BoardGrid">
            {
              gameBoxes.map((group, index) => <CellGroup key={index} group={group} renderCell={renderCell} />)
            }
          </Grid>
        </div>
      </div>
      {props.completedAt !== null &&
        <h2>Complete!</h2>
      }
      <div className="Game__Numpad">
        <div className="Game__NumButtonContainer">
          {
            Array(9).fill().map((_, index) => {
              const value = index + 1;
              return (
                <button
                  key={value}
                  className="Game__NumButton"
                  data-all-values={valueCounts[value] >= 9}
                  onClick={() => props.updateValue(value.toString())}>
                  {value}
                </button>
              );
            })
          }
          <div className="Game__NumButton"></div>
          <button className="Game__NumButton" onClick={() => props.updateValue('')}><span><DeleteIcon aria-label="Delete" /></span></button>
          <button className="Game__NumButton" data-active={props.pencilMode} onClick={props.togglePencilMode} ><span><PencilIcon aria-label="Pencil" /></span></button>
        </div>
      </div>
      <div className="Game__ButtonBar">
        <button onClick={props.solve}>Solve</button>
        <button onClick={props.newGame}>New Game</button>
      </div>
    </div>
  );
}

export default Game;
