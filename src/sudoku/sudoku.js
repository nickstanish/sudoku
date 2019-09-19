import { groupBoxes } from '../utils/sudoku';
const NINE_TIMES = Array(9).fill().map((_, index) => index);

const checkSet = (set) => {
  const VALUES = NINE_TIMES.map(index => index + 1);
  return VALUES.every((value) => set.has(value));
}

const checkRows = (game) => {
  return NINE_TIMES.every(rowNumber => {
    const rowSet = new Set(game.slice(rowNumber * 9, (rowNumber + 1) * 9));
    return checkSet(rowSet);
  });
}

const checkColumns = (game) => {
  return NINE_TIMES.every(columnNumber => {
    const columnSet = new Set(
      NINE_TIMES.map(rowNumber => game[rowNumber * 9 + columnNumber])
    );
    return checkSet(columnSet);
  });
}

const checkBlocks = (game) => {
  return groupBoxes(game).every(block => {
    return checkSet(new Set(block));
  });
}

export const isSolved = (game) => {
  return checkRows(game) && checkColumns(game) && checkBlocks(game);
}