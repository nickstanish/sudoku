import React, { useEffect, useState } from 'react';
// import SudokuGame from './adapters/sudoku-adapter';
import SudokuGame from './adapters/qqwing-adapter';
import Game from './Game';

// function addTouchListener() {
//   window.addEventListener('touchstart', function onFirstTouch() {
//     document.body.classList.add('is-touch');
//     window.removeEventListener('touchstart', onFirstTouch, false);
//   }, false);
// }

const useHistory = (initial) => {
  const [history, updateHistory] = useState([initial]);
  const [cursor, updateCursor] = useState(0);

  const reset = (initial) => {
    updateHistory([initial]);
    updateCursor(0);
  }

  const addState = (state) => {
    updateHistory([...history.slice(0, cursor + 1), state]);
    updateCursor(cursor + 1);
  }

  const applyNext = () => {
    updateHistory(Math.min(cursor + 1, history.length));
  }

  const applyPrevious = () => {
    updateHistory(Math.max(cursor - 1, 0));
  }

  return {
    current: history[cursor],
    reset,
    applyNext,
    applyPrevious,
    addState,
    hasNext: cursor < history.length,
    hasPrevious: cursor > 0,
  }
};

const GameContainer = (props) => {
  const {
    current: sudoku,
    reset: resetSudokuHistory,
    applyNext,
    applyPrevious,
    addState: addSudokuHistory,
    hasNext,
    hasPrevious
  } = useHistory(new SudokuGame());
  const [cursor, updateCursor] = useState(0);
  const [startAt, updateStartAt] = useState(new Date());
  const [completedAt, updateCompletedAt] = useState(null);
  const [pencilMode, updatePencilMode] = useState(false);
  const [pencils, updatePencils] = useState({});

  const solve = () => {
    addSudokuHistory(sudoku.clone({ board: sudoku.solve() }));
    updateCompletedAt(new Date());
  }

  const newGame = () => {
    resetSudokuHistory(new SudokuGame());
    updateStartAt(new Date());
    updateCompletedAt(null);
    updateCursor(0);
    updatePencilMode(false);
    updatePencils({});
  }

  const togglePencilMode = () => {
    updatePencilMode(!pencilMode);
  }

  const updateValue = (value) => {
    if (cursor !== null) {
      if (pencilMode) {
        const currentValues = pencils[cursor];
        const currentPencils = new Set(currentValues);
        if (value !== '') {
          if (currentPencils.has(value)) {
            currentPencils.delete(value);
          } else {
            currentPencils.add(value);
          }
        } else {
          currentPencils.clear();
        }
        updatePencils({
          ...pencils,
          [cursor]: currentPencils
        })
      } else {
        const nextSudoku = sudoku.updateCell(cursor, value);
        addSudokuHistory(nextSudoku);

        if (nextSudoku.isSolved()) {
          updateCompletedAt(new Date());
        }
      }
    }
  }

  const onKeyDown = (event) => {
    if ([
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'Backspace'
    ].includes(event.key)) {
      event.preventDefault();
    }
    switch (event.key) {
      case 'ArrowUp': {
        updateCursor((81 + cursor - 9) % 81);
        break;
      }
      case 'ArrowDown': {
        updateCursor((81 + cursor + 9) % 81);
        break;
      }
      case 'ArrowLeft': {
        updateCursor((81 + cursor - 1) % 81);
        break;
      }
      case 'ArrowRight': {
        updateCursor((81 + cursor + 1) % 81);
        break;
      }
      case 'p':
      case 'P': {
        togglePencilMode();
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
        updateValue(value);
        break;
      }
      default: {
        break;
      }
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  });

  const gameProps = {
    completedAt,
    cursor,
    newGame,
    pencilMode,
    pencils,
    solve,
    startAt,
    sudoku,
    togglePencilMode,
    updateCursor,
    updateValue
  };

  return (
    <Game { ...gameProps } />
  );
}
export default GameContainer;