/*!
 * qqwing - Sudoku solver and generator
 * Copyright (C) 2014 Stephen Ostermiller
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
var qqwing = function(){

/**
 * Given the index of a cell (0-80) calculate
 * the column (0-8) in which that cell resides.
 */
var cellToColumn = function(cell){
	return cell%qqwing.ROW_COL_SEC_SIZE;
};

/**
 * Given the index of a cell (0-80) calculate
 * the row (0-8) in which it resides.
 */
var cellToRow = function(cell){
	return Math.floor(cell/qqwing.ROW_COL_SEC_SIZE);
};

/**
 * Given the index of a cell (0-80) calculate
 * the cell (0-80) that is the upper left start
 * cell of that section.
 */
var cellToSectionStartCell = function(cell){
	return Math.floor(cell/qqwing.SEC_GROUP_SIZE)*qqwing.SEC_GROUP_SIZE
			+ Math.floor(cellToColumn(cell)/qqwing.GRID_SIZE)*qqwing.GRID_SIZE;
};

/**
 * Given the index of a cell (0-80) calculate
 * the section (0-8) in which it resides.
 */
var cellToSection = function(cell){
	return Math.floor(cell/qqwing.SEC_GROUP_SIZE)*qqwing.GRID_SIZE
			+ Math.floor(cellToColumn(cell)/qqwing.GRID_SIZE);
};

/**
 * Given a row (0-8) calculate the first cell (0-80)
 * of that row.
 */
var rowToFirstCell = function(row){
	return qqwing.ROW_COL_SEC_SIZE*row;
};

/**
 * Given a column (0-8) calculate the first cell (0-80)
 * of that column.
 */
var columnToFirstCell = function(column){
	return column;
};

/**
 * Given a section (0-8) calculate the first cell (0-80)
 * of that section.
 */
var sectionToFirstCell = function(section){
	return (section%qqwing.GRID_SIZE*qqwing.GRID_SIZE) + Math.floor(section/qqwing.GRID_SIZE)*qqwing.SEC_GROUP_SIZE;
};

/**
 * Given a value for a cell (0-8) and a cell (0-80)
 * calculate the offset into the possibility array (0-728).
 */
var getPossibilityIndex = function(valueIndex, cell){
	return valueIndex+(qqwing.ROW_COL_SEC_SIZE*cell);
};

/**
 * Given a row (0-8) and a column (0-8) calculate the
 * cell (0-80).
 */
var rowColumnToCell = function(row, column){
	return (row*qqwing.ROW_COL_SEC_SIZE)+column;
};

/**
 * Given a section (0-8) and an offset into that section (0-8)
 * calculate the cell (0-80)
 */
var sectionToCell = function(section, offset){
	return sectionToFirstCell(section)
			+ Math.floor(offset/qqwing.GRID_SIZE)*qqwing.ROW_COL_SEC_SIZE
			+ (offset%qqwing.GRID_SIZE);
};

var println = function(s){
	if ((typeof console != 'undefined') && console.log) console.log(s);
};

var printnoln = function(s){
	if ((typeof process != 'undefined') && process.stdout && process.stdout.write) process.stdout.write(s);
	else println(s);
};

/**
 * The 81 integers that make up a sudoku puzzle.
 * Givens are 1-9, unknowns are 0.
 * Once initialized, this puzzle remains as is.
 * The answer is worked out in "solution".
 */
var puzzle = new Array(qqwing.BOARD_SIZE);

/**
 * The 81 integers that make up a sudoku puzzle.
 * The solution is built here, after completion
 * all will be 1-9.
 */
var solution = new Array(qqwing.BOARD_SIZE);

/**
 * Recursion depth at which each of the numbers
 * in the solution were placed.  Useful for backing
 * out solve branches that don't lead to a solution.
 */
var solutionRound = new Array(qqwing.BOARD_SIZE);

/**
 * The 729 integers that make up a the possible
 * values for a Sudoku puzzle. (9 possibilities
 * for each of 81 squares).  If possibilities[i]
 * is zero, then the possibility could still be
 * filled in according to the Sudoku rules.  When
 * a possibility is eliminated, possibilities[i]
 * is assigned the round (level) at
 * which it was determined that it could not be
 * a possibility.
 */
var possibilities = new Array(qqwing.POSSIBILITY_SIZE);

/**
 * An array the size of the board (81) containing each
 * of the numbers 0-n exactly once.  This array may
 * be shuffled so that operations that need to
 * look at each cell can do so in a random order.
 */
var randomBoardArray = new Array(qqwing.BOARD_SIZE);

for (var i=0; i<qqwing.BOARD_SIZE; i++){
	randomBoardArray[i] = i;
}

/**
 * An array with one element for each position (9), in
 * some random order to be used when trying each
 * position in turn during guesses.
 */
var randomPossibilityArray = new Array(qqwing.ROW_COL_SEC_SIZE);

for (var i=0; i<qqwing.ROW_COL_SEC_SIZE; i++){
	randomPossibilityArray[i] = i;
}

/**
 * Whether or not to record history
 */
var recordHistory = false;

/**
 * Whether or not to print history as it happens
 */
var logHistory = false;

/**
 * A list of moves used to solve the puzzle.
 * This list contains all moves, on solve
 * branches that did not lead to a solution.
 */
var solveHistory = [];

/**
 * A list of moves used to solve the puzzle.
 * This list contains only the moves needed
 * to solve the puzzle, doesn't contain
 * information about bad guesses.
 */
var solveInstructions = [];

/**
 * The style with which to print puzzles and solutions
 */
var printStyle = qqwing.PrintStyle.READABLE;

/**
 * The last round of solving
 */
var lastSolveRound = 0;

/**
 * Reset the board to its initial state with
 * only the givens.
 * This method clears any solution, resets statistics,
 * and clears any history messages.
 */
var reset = function(){
	for (var i=0; i<qqwing.BOARD_SIZE; i++){
		solution[i] = 0;
	}
	for (var i=0; i<qqwing.BOARD_SIZE; i++){
		solutionRound[i] = 0;
	}
	for (var i=0; i<qqwing.POSSIBILITY_SIZE; i++){
		possibilities[i] = 0;
	}
	solveHistory = [];
	solveInstructions = [];

	var round = 1;
	for (var position=0; position<qqwing.BOARD_SIZE; position++){
		if (puzzle[position] > 0){
			var valIndex = puzzle[position]-1;
			var valPos = getPossibilityIndex(valIndex,position);
			var value = puzzle[position];
			if (possibilities[valPos] != 0) return false;
			mark.call(this,position,round,value);
			if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.GIVEN, value, position));
		}
	}
	return true;
};

var singleSolveMove = function(round){
	if (onlyPossibilityForCell.call(this, round)) return true;
	if (onlyValueInSection.call(this, round)) return true;
	if (onlyValueInRow.call(this, round)) return true;
	if (onlyValueInColumn.call(this, round)) return true;
	if (handleNakedPairs.call(this, round)) return true;
	if (pointingRowReduction.call(this, round)) return true;
	if (pointingColumnReduction.call(this, round)) return true;
	if (rowBoxReduction.call(this, round)) return true;
	if (colBoxReduction.call(this, round)) return true;
	if (hiddenPairInRow.call(this, round)) return true;
	if (hiddenPairInColumn.call(this, round)) return true;
	if (hiddenPairInSection.call(this, round)) return true;
	return false;
};

/**
 * Mark exactly one cell that has a single possibility, if such a cell exists.
 * This method will look for a cell that has only one possibility.  This type
 * of cell is often called a "single"
 */
var onlyPossibilityForCell = function(round){
	for (var position=0; position<qqwing.BOARD_SIZE; position++){
		if (solution[position] == 0){
			var count = 0;
			var lastValue = 0;
			for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
				var valPos = getPossibilityIndex(valIndex,position);
				if (possibilities[valPos] == 0){
					count++;
					lastValue=valIndex+1;
				}
			}
			if (count == 1){
				mark.call(this, position, round, lastValue);
				if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.SINGLE, lastValue, position));
				return true;
			}
		}
	}
	return false;
};

/**
 * Mark exactly one cell which is the only possible value for some row, if
 * such a cell exists.
 * This method will look in a row for a possibility that is only listed
 * for one cell.  This type of cell is often called a "hidden single"
 */
var onlyValueInRow = function(round){
	for (var row=0; row<qqwing.ROW_COL_SEC_SIZE; row++){
		for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
			var count = 0;
			var lastPosition = 0;
			for (var col=0; col<qqwing.ROW_COL_SEC_SIZE; col++){
				var position = (row*qqwing.ROW_COL_SEC_SIZE)+col;
				var valPos = getPossibilityIndex(valIndex,position);
				if (possibilities[valPos] == 0){
					count++;
					lastPosition = position;
				}
			}
			if (count == 1){
				var value = valIndex+1;
				if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.HIDDEN_SINGLE_ROW, value, lastPosition));
				mark.call(this, lastPosition, round, value);
				return true;
			}
		}
	}
	return false;
}

/**
 * Mark exactly one cell which is the only possible value for some column, if
 * such a cell exists.
 * This method will look in a column for a possibility that is only listed
 * for one cell.  This type of cell is often called a "hidden single"
 */
var onlyValueInColumn = function(round){
	for (var col=0; col<qqwing.ROW_COL_SEC_SIZE; col++){
		for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
			var count = 0;
			var lastPosition = 0;
			for (var row=0; row<qqwing.ROW_COL_SEC_SIZE; row++){
				var position = rowColumnToCell(row,col);
				var valPos = getPossibilityIndex(valIndex,position);
				if (possibilities[valPos] == 0){
					count++;
					lastPosition = position;
				}
			}
			if (count == 1){
				var value = valIndex+1;
				if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.HIDDEN_SINGLE_COLUMN, value, lastPosition));
				mark.call(this, lastPosition, round, value);
				return true;
			}
		}
	}
	return false;
}


/**
 * Mark exactly one cell which is the only possible value for some section, if
 * such a cell exists.
 * This method will look in a section for a possibility that is only listed
 * for one cell.  This type of cell is often called a "hidden single"
 */
var onlyValueInSection = function(round){
	for (var sec=0; sec<qqwing.ROW_COL_SEC_SIZE; sec++){
		var secPos = sectionToFirstCell(sec);
		for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
			var count = 0;
			var lastPosition = 0;
			for (var i=0; i<qqwing.GRID_SIZE; i++){
				for (var j=0; j<qqwing.GRID_SIZE; j++){
					var position = secPos + i + qqwing.ROW_COL_SEC_SIZE*j;
					var valPos = getPossibilityIndex(valIndex,position);
					if (possibilities[valPos] == 0){
						count++;
						lastPosition = position;
					}
				}
			}
			if (count == 1){
				var value = valIndex+1;
				if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.HIDDEN_SINGLE_SECTION, value, lastPosition));
				mark.call(this, lastPosition, round, value);
				return true;
			}
		}
	}
	return false;
}

var guess = function(round, guessNumber){
	var localGuessCount = 0;
	var position = findPositionWithFewestPossibilities.call(this);
	for (var i=0; i<qqwing.ROW_COL_SEC_SIZE; i++){
		var valIndex = randomPossibilityArray[i];
		var valPos = getPossibilityIndex(valIndex,position);
		if (possibilities[valPos] == 0){
			if (localGuessCount == guessNumber){
				var value = valIndex+1;
				if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.GUESS, value, position));
				mark.call(this, position, round, value);
				return true;
			}
			localGuessCount++;
		}
	}
	return false;
};

var isImpossible = function(){
	for (var position=0; position<qqwing.BOARD_SIZE; position++){
		if (solution[position] == 0){
			var count = 0;
			for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
				var valPos = getPossibilityIndex(valIndex,position);
				if (possibilities[valPos] == 0) count++;
			}
			if (count == 0) {
				return true;
			}
		}
	}
	return false;
};

var rollbackRound = function(round){
	if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.ROLLBACK));
	for (var i=0; i<qqwing.BOARD_SIZE; i++){
		if (solutionRound[i] == round){
			solutionRound[i] = 0;
			solution[i] = 0;
		}
	}
	{for (var i=0; i<qqwing.POSSIBILITY_SIZE; i++){
		if (possibilities[i] == round){
			possibilities[i] = 0;
		}
	}}

	while(solveInstructions.length > 0 && solveInstructions[solveInstructions.length-1] == round){
		solveInstructions.pop();
	}
};

var pointingRowReduction = function(round){
	for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
		for (var section=0; section<qqwing.ROW_COL_SEC_SIZE; section++){
			var secStart = sectionToFirstCell(section);
			var inOneRow = true;
			var boxRow = -1;
			for (var j=0; j<qqwing.GRID_SIZE; j++){
				for (var i=0; i<qqwing.GRID_SIZE; i++){
					var secVal=secStart+i+(qqwing.ROW_COL_SEC_SIZE*j);
					var valPos = getPossibilityIndex(valIndex,secVal);
					if(possibilities[valPos] == 0){
						if (boxRow == -1 || boxRow == j){
							boxRow = j;
						} else {
							inOneRow = false;
						}
					}
				}
			}
			if (inOneRow && boxRow != -1){
				var doneSomething = false;
				var row = cellToRow(secStart) + boxRow;
				var rowStart = rowToFirstCell(row);

				for (var i=0; i<qqwing.ROW_COL_SEC_SIZE; i++){
					var position = rowStart+i;
					var section2 = cellToSection(position);
					var valPos = getPossibilityIndex(valIndex,position);
					if (section != section2 && possibilities[valPos] == 0){
						possibilities[valPos] = round;
						doneSomething = true;
					}
				}
				if (doneSomething){
					if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.POINTING_PAIR_TRIPLE_ROW, valIndex+1, rowStart));
					return true;
				}
			}
		}
	}
	return false;
};

var rowBoxReduction = function(round){
	for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
		for (var row=0; row<qqwing.ROW_COL_SEC_SIZE; row++){
			var rowStart = rowToFirstCell(row);
			var inOneBox = true;
			var rowBox = -1;
			for (var i=0; i<qqwing.GRID_SIZE; i++){
				for (var j=0; j<qqwing.GRID_SIZE; j++){
					var column = i*qqwing.GRID_SIZE+j;
					var position = rowColumnToCell(row, column);
					var valPos = getPossibilityIndex(valIndex,position);
					if(possibilities[valPos] == 0){
						if (rowBox == -1 || rowBox == i){
							rowBox = i;
						} else {
							inOneBox = false;
						}
					}
				}
			}
			if (inOneBox && rowBox != -1){
				var doneSomething = false;
				var column = qqwing.GRID_SIZE*rowBox;
				var secStart = cellToSectionStartCell(rowColumnToCell(row, column));
				var secStartRow = cellToRow(secStart);
				var secStartCol = cellToColumn(secStart);
				for (var i=0; i<qqwing.GRID_SIZE; i++){
					for (var j=0; j<qqwing.GRID_SIZE; j++){
						var row2 = secStartRow+i;
						var col2 = secStartCol+j;
						var position = rowColumnToCell(row2, col2);
						var valPos = getPossibilityIndex(valIndex,position);
						if (row != row2 && possibilities[valPos] == 0){
							possibilities[valPos] = round;
							doneSomething = true;
						}
					}
				}
				if (doneSomething){
					if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.ROW_BOX, valIndex+1, rowStart));
					return true;
				}
			}
		}
	}
	return false;
};

var colBoxReduction = function(round){
	for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
		for (var row=0; row<qqwing.ROW_COL_SEC_SIZE; row++){
			var rowStart = rowToFirstCell(row);
			var inOneBox = true;
			var rowBox = -1;
			for (var i=0; i<qqwing.GRID_SIZE; i++){
				for (var j=0; j<qqwing.GRID_SIZE; j++){
					var column = i*qqwing.GRID_SIZE+j;
					var position = rowColumnToCell(row, column);
					var valPos = getPossibilityIndex(valIndex,position);
					if(possibilities[valPos] == 0){
						if (rowBox == -1 || rowBox == i){
							rowBox = i;
						} else {
							inOneBox = false;
						}
					}
				}
			}
			if (inOneBox && rowBox != -1){
				var doneSomething = false;
				var column = qqwing.GRID_SIZE*rowBox;
				var secStart = cellToSectionStartCell(rowColumnToCell(row, column));
				var secStartRow = cellToRow(secStart);
				var secStartCol = cellToColumn(secStart);
				for (var i=0; i<qqwing.GRID_SIZE; i++){
					for (var j=0; j<qqwing.GRID_SIZE; j++){
						var row2 = secStartRow+i;
						var col2 = secStartCol+j;
						var position = rowColumnToCell(row2, col2);
						var valPos = getPossibilityIndex(valIndex,position);
						if (row != row2 && possibilities[valPos] == 0){
							possibilities[valPos] = round;
							doneSomething = true;
						}
					}
				}
				if (doneSomething){
					if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.ROW_BOX, valIndex+1, rowStart));
					return true;
				}
			}
		}
	}
	return false;
};

var pointingColumnReduction = function(round){
	for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
		for (var section=0; section<qqwing.ROW_COL_SEC_SIZE; section++){
			var secStart = sectionToFirstCell(section);
			var inOneCol = true;
			var boxCol = -1;
			for (var i=0; i<qqwing.GRID_SIZE; i++){
				for (var j=0; j<qqwing.GRID_SIZE; j++){
					var secVal=secStart+i+(qqwing.ROW_COL_SEC_SIZE*j);
					var valPos = getPossibilityIndex(valIndex,secVal);
					if(possibilities[valPos] == 0){
						if (boxCol == -1 || boxCol == i){
							boxCol = i;
						} else {
							inOneCol = false;
						}
					}
				}
			}
			if (inOneCol && boxCol != -1){
				var doneSomething = false;
				var col = cellToColumn(secStart) + boxCol;
				var colStart = columnToFirstCell(col);

				for (var i=0; i<qqwing.ROW_COL_SEC_SIZE; i++){
					var position = colStart+(qqwing.ROW_COL_SEC_SIZE*i);
					var section2 = cellToSection(position);
					var valPos = getPossibilityIndex(valIndex,position);
					if (section != section2 && possibilities[valPos] == 0){
						possibilities[valPos] = round;
						doneSomething = true;
					}
				}
				if (doneSomething){
					if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.POINTING_PAIR_TRIPLE_COLUMN, valIndex+1, colStart));
					return true;
				}
			}
		}
	}
	return false;
}

var hiddenPairInRow = function(round){
	for (var row=0; row<qqwing.ROW_COL_SEC_SIZE; row++){
		for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
			var c1 = -1;
			var c2 = -1;
			var valCount = 0;
			for (var column=0; column<qqwing.ROW_COL_SEC_SIZE; column++){
				var position = rowColumnToCell(row,column);
				var valPos = getPossibilityIndex(valIndex,position);
				if (possibilities[valPos] == 0){
					if (c1 == -1 || c1 == column){
						c1 = column;
					} else if (c2 == -1 || c2 == column){
						c2 = column;
					}
					valCount++;
				}
			}
			if (valCount==2){
				for (var valIndex2=valIndex+1; valIndex2<qqwing.ROW_COL_SEC_SIZE; valIndex2++){
					var c3 = -1;
					var c4 = -1;
					var valCount2 = 0;
					for (var column=0; column<qqwing.ROW_COL_SEC_SIZE; column++){
						var position = rowColumnToCell(row,column);
						var valPos = getPossibilityIndex(valIndex2,position);
						if (possibilities[valPos] == 0){
							if (c3 == -1 || c3 == column){
								c3 = column;
							} else if (c4 == -1 || c4 == column){
								c4 = column;
							}
							valCount2++;
						}
					}
					if (valCount2==2 && c1==c3 && c2==c4){
						var doneSomething = false;
						for (var valIndex3=0; valIndex3<qqwing.ROW_COL_SEC_SIZE; valIndex3++){
							if (valIndex3 != valIndex && valIndex3 != valIndex2){
								var position1 = rowColumnToCell(row,c1);
								var position2 = rowColumnToCell(row,c2);
								var valPos1 = getPossibilityIndex(valIndex3,position1);
								var valPos2 = getPossibilityIndex(valIndex3,position2);
								if (possibilities[valPos1] == 0){
									possibilities[valPos1] = round;
									doneSomething = true;
								}
								if (possibilities[valPos2] == 0){
									possibilities[valPos2] = round;
									doneSomething = true;
								}
							}
						}
						if (doneSomething){
							if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.HIDDEN_PAIR_ROW, valIndex+1, rowColumnToCell(row,c1)));
							return true;
						}
					}
				}
			}
		}
	}
	return false;
};

var hiddenPairInColumn = function(round){
	for (var column=0; column<qqwing.ROW_COL_SEC_SIZE; column++){
		for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
			var r1 = -1;
			var r2 = -1;
			var valCount = 0;
			for (var row=0; row<qqwing.ROW_COL_SEC_SIZE; row++){
				var position = rowColumnToCell(row,column);
				var valPos = getPossibilityIndex(valIndex,position);
				if (possibilities[valPos] == 0){
					if (r1 == -1 || r1 == row){
						r1 = row;
					} else if (r2 == -1 || r2 == row){
						r2 = row;
					}
					valCount++;
				}
			}
			if (valCount==2){
				for (var valIndex2=valIndex+1; valIndex2<qqwing.ROW_COL_SEC_SIZE; valIndex2++){
					var r3 = -1;
					var r4 = -1;
					var valCount2 = 0;
					for (var row=0; row<qqwing.ROW_COL_SEC_SIZE; row++){
						var position = rowColumnToCell(row,column);
						var valPos = getPossibilityIndex(valIndex2,position);
						if (possibilities[valPos] == 0){
							if (r3 == -1 || r3 == row){
								r3 = row;
							} else if (r4 == -1 || r4 == row){
								r4 = row;
							}
							valCount2++;
						}
					}
					if (valCount2==2 && r1==r3 && r2==r4){
						var doneSomething = false;
						for (var valIndex3=0; valIndex3<qqwing.ROW_COL_SEC_SIZE; valIndex3++){
							if (valIndex3 != valIndex && valIndex3 != valIndex2){
								var position1 = rowColumnToCell(r1,column);
								var position2 = rowColumnToCell(r2,column);
								var valPos1 = getPossibilityIndex(valIndex3,position1);
								var valPos2 = getPossibilityIndex(valIndex3,position2);
								if (possibilities[valPos1] == 0){
									possibilities[valPos1] = round;
									doneSomething = true;
								}
								if (possibilities[valPos2] == 0){
									possibilities[valPos2] = round;
									doneSomething = true;
								}
							}
						}
						if (doneSomething){
							if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.HIDDEN_PAIR_COLUMN, valIndex+1, rowColumnToCell(r1,column)));
							return true;
						}
					}
				}
			}
		}
	}
	return false;
};

var hiddenPairInSection = function(round){
	for (var section=0; section<qqwing.ROW_COL_SEC_SIZE; section++){
		for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
			var si1 = -1;
			var si2 = -1;
			var valCount = 0;
			for (var secInd=0; secInd<qqwing.ROW_COL_SEC_SIZE; secInd++){
				var position = sectionToCell(section,secInd);
				var valPos = getPossibilityIndex(valIndex,position);
				if (possibilities[valPos] == 0){
					if (si1 == -1 || si1 == secInd){
						si1 = secInd;
					} else if (si2 == -1 || si2 == secInd){
						si2 = secInd;
					}
					valCount++;
				}
			}
			if (valCount==2){
				for (var valIndex2=valIndex+1; valIndex2<qqwing.ROW_COL_SEC_SIZE; valIndex2++){
					var si3 = -1;
					var si4 = -1;
					var valCount2 = 0;
					for (var secInd=0; secInd<qqwing.ROW_COL_SEC_SIZE; secInd++){
						var position = sectionToCell(section,secInd);
						var valPos = getPossibilityIndex(valIndex2,position);
						if (possibilities[valPos] == 0){
							if (si3 == -1 || si3 == secInd){
								si3 = secInd;
							} else if (si4 == -1 || si4 == secInd){
								si4 = secInd;
							}
							valCount2++;
						}
					}
					if (valCount2==2 && si1==si3 && si2==si4){
						var doneSomething = false;
						for (var valIndex3=0; valIndex3<qqwing.ROW_COL_SEC_SIZE; valIndex3++){
							if (valIndex3 != valIndex && valIndex3 != valIndex2){
								var position1 = sectionToCell(section,si1);
								var position2 = sectionToCell(section,si2);
								var valPos1 = getPossibilityIndex(valIndex3,position1);
								var valPos2 = getPossibilityIndex(valIndex3,position2);
								if (possibilities[valPos1] == 0){
									possibilities[valPos1] = round;
									doneSomething = true;
								}
								if (possibilities[valPos2] == 0){
									possibilities[valPos2] = round;
									doneSomething = true;
								}
							}
						}
						if (doneSomething){
							if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.HIDDEN_PAIR_SECTION, valIndex+1, sectionToCell(section,si1)));
							return true;
						}
					}
				}
			}
		}
	}
	return false;
};

/**
 * Mark the given value at the given position.  Go through
 * the row, column, and section for the position and remove
 * the value from the possibilities.
 *
 * @param position Position into the board (0-80)
 * @param round Round to mark for rollback purposes
 * @param value The value to go in the square at the given position
 */
var mark = function(position, round, value){
	if (solution[position] != 0) throw ("Marking position that already has been marked.");
	if (solutionRound[position] !=0) throw ("Marking position that was marked another round.");
	var valIndex = value-1;
	solution[position] = value;

	var possInd = getPossibilityIndex(valIndex,position);
	if (possibilities[possInd] != 0) throw ("Marking impossible position.");

	// Take this value out of the possibilities for everything in the row
	solutionRound[position] = round;
	var rowStart = cellToRow(position)*qqwing.ROW_COL_SEC_SIZE;
	for (var col=0; col<qqwing.ROW_COL_SEC_SIZE; col++){
		var rowVal=rowStart+col;
		var valPos = getPossibilityIndex(valIndex,rowVal);
		if (possibilities[valPos] == 0){
			possibilities[valPos] = round;
		}
	}

	// Take this value out of the possibilities for everything in the column
	var colStart = cellToColumn(position);
	for (var i=0; i<qqwing.ROW_COL_SEC_SIZE; i++){
		var colVal=colStart+(qqwing.ROW_COL_SEC_SIZE*i);
		var valPos = getPossibilityIndex(valIndex,colVal);
		if (possibilities[valPos] == 0){
			possibilities[valPos] = round;
		}
	}

	// Take this value out of the possibilities for everything in section
	var secStart = cellToSectionStartCell(position);
	for (var i=0; i<qqwing.GRID_SIZE; i++){
		for (var j=0; j<qqwing.GRID_SIZE; j++){
			var secVal=secStart+i+(qqwing.ROW_COL_SEC_SIZE*j);
			var valPos = getPossibilityIndex(valIndex,secVal);
			if (possibilities[valPos] == 0){
				possibilities[valPos] = round;
			}
		}
	}

	//This position itself is determined, it should have possibilities.
	for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
		var valPos = getPossibilityIndex(valIndex,position);
		if (possibilities[valPos] == 0){
			possibilities[valPos] = round;
		}
	}
};

var findPositionWithFewestPossibilities = function(){
	var minPossibilities = 10;
	var bestPosition = 0;
	for (var i=0; i<qqwing.BOARD_SIZE; i++){
		var position = randomBoardArray[i];
		if (solution[position] == 0){
			var count = 0;
			for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
				var valPos = getPossibilityIndex(valIndex,position);
				if (possibilities[valPos] == 0) count++;
			}
			if (count < minPossibilities){
				minPossibilities = count;
				bestPosition = position;
			}
		}
	}
	return bestPosition;
};

var handleNakedPairs = function(round){
	for (var position=0; position<qqwing.BOARD_SIZE; position++){
		var possibilities = countPossibilities(position);
		if (possibilities == 2){
			var row = cellToRow(position);
			var column = cellToColumn(position);
			var section = cellToSectionStartCell(position);
			for (var position2=position; position2<qqwing.BOARD_SIZE; position2++){
				if (position != position2){
					var possibilities2 = countPossibilities(position2);
					if (possibilities2 == 2 && arePossibilitiesSame(position, position2)){
						if (row == cellToRow(position2)){
							var doneSomething = false;
							for (var column2=0; column2<qqwing.ROW_COL_SEC_SIZE; column2++){
								var position3 = rowColumnToCell(row,column2);
								if (position3 != position && position3 != position2 && removePossibilitiesInOneFromTwo(position, position3, round)){
									doneSomething = true;
								}
							}
							if (doneSomething){
								if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.NAKED_PAIR_ROW, 0, position));
								return true;
							}
						}
						if (column == cellToColumn(position2)){
							var doneSomething = false;
							for (var row2=0; row2<qqwing.ROW_COL_SEC_SIZE; row2++){
								var position3 = rowColumnToCell(row2,column);
								if (position3 != position && position3 != position2 && removePossibilitiesInOneFromTwo(position, position3, round)){
									doneSomething = true;
								}
							}
							if (doneSomething){
								if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.NAKED_PAIR_COLUMN, 0, position));
								return true;
							}
						}
						if (section == cellToSectionStartCell(position2)){
							var doneSomething = false;
							var secStart = cellToSectionStartCell(position);
							for (var i=0; i<qqwing.GRID_SIZE; i++){
								for (var j=0; j<qqwing.GRID_SIZE; j++){
									var position3=secStart+i+(qqwing.ROW_COL_SEC_SIZE*j);
									if (position3 != position && position3 != position2 && removePossibilitiesInOneFromTwo(position, position3, round)){
										doneSomething = true;
									}
								}
							}
							if (doneSomething){
								if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.NAKED_PAIR_SECTION, 0, position));
								return true;
							}
						}
					}
				}
			}
		}
	}
	return false;
};

var countPossibilities = function(position){
	var count = 0;
	for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
		var valPos = getPossibilityIndex(valIndex,position);
		if (possibilities[valPos] == 0) count++;
	}
	return count;
};

var arePossibilitiesSame = function(position1, position2){
	for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
		var valPos1 = getPossibilityIndex(valIndex,position1);
		var valPos2 = getPossibilityIndex(valIndex,position2);
		if ((possibilities[valPos1] == 0 || possibilities[valPos2] == 0) && (possibilities[valPos1] != 0 || possibilities[valPos2] != 0)){
				return false;
		}
	}
	return true;
};

var addHistoryItem = function(l){
	if (logHistory) l.print();
	if (recordHistory){
		solveHistory.push(l);
		solveInstructions.push(l);
	}
};

var shuffleRandomArrays = function(){
	shuffleArray(randomBoardArray, qqwing.BOARD_SIZE);
	shuffleArray(randomPossibilityArray, qqwing.ROW_COL_SEC_SIZE);
};

/**
 * print the given BOARD_SIZEd array of ints
 * as a sudoku puzzle.  Use print options from
 * member variables.
 */
var print = function(puz){
	printnoln(sudokuToString.call(this, puz));
};

var sudokuToString = function(puz){
	var s = "";
	for(var i=0; i<qqwing.BOARD_SIZE; i++){
		if (printStyle == qqwing.PrintStyle.READABLE){
			s += " ";
		}
		if (puz[i]==0){
			s += '.';
		} else {
			s += puz[i];
		}
		if (i == qqwing.BOARD_SIZE-1){
			if (printStyle == qqwing.PrintStyle.CSV){
				s += ",";
			} else {
				s += "\n";
			}
			if (printStyle == qqwing.PrintStyle.READABLE || printStyle == qqwing.PrintStyle.COMPACT){
				s += "\n";
			}
		} else if (i%qqwing.ROW_COL_SEC_SIZE==qqwing.ROW_COL_SEC_SIZE-1){
			if (printStyle == qqwing.PrintStyle.READABLE || printStyle == qqwing.PrintStyle.COMPACT){
				s += "\n";
			}
			if (i%qqwing.SEC_GROUP_SIZE==qqwing.SEC_GROUP_SIZE-1){
				if (printStyle == qqwing.PrintStyle.READABLE){
					s += "-------|-------|-------\n";
				}
			}
		} else if (i%qqwing.GRID_SIZE==qqwing.GRID_SIZE-1){
			if (printStyle == qqwing.PrintStyle.READABLE){
				s += " |";
			}
		}
	}
	return s;
};

var rollbackNonGuesses = function(){
	// Guesses are odd rounds
	// Non-guesses are even rounds
	for (var i=2; i<=lastSolveRound; i+=2){
		rollbackRound.call(this, i);
	}
};

var clearPuzzle = function(){
	// Clear any existing puzzle
	for (var i=0; i<qqwing.BOARD_SIZE; i++){
		puzzle[i] = 0;
	}
	reset.call(this);
};

var printHistory = function(v){
	printnoln(getHistoryString(v));
};

var getHistoryString = function(v){
	var s = "";
	if (!recordHistory){
		s += "History was not recorded.";
		if (printStyle == qqwing.PrintStyle.CSV){
			s += " -- ";
		} else {
			s += "\n";
		}
	}
	for (var i=0;i<v.length;i++){
		s += i+1 + ". " + v[i].toString();
		if (printStyle == qqwing.PrintStyle.CSV){
			s += " -- ";
		} else {
			s += "\n";
		}
	}
	if (printStyle == qqwing.PrintStyle.CSV){
		s += ",";
	} else {
		s += "\n";
	}
	return s;
};

var removePossibilitiesInOneFromTwo = function(position1, position2, round){
	var doneSomething = false;
	for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
		var valPos1 = getPossibilityIndex(valIndex,position1);
		var valPos2 = getPossibilityIndex(valIndex,position2);
		if (possibilities[valPos1] == 0 && possibilities[valPos2] == 0){
			possibilities[valPos2] = round;
			doneSomething = true;
		}
	}
	return doneSomething;
};

/**
 * Shuffle the values in an array of integers.
 */
var shuffleArray = function(array, size){
	for (var i=0; i<size; i++){
		var tailSize = size-i;
		var randTailPos = Math.floor(Math.random() * tailSize) + i;
		var temp = array[i];
		array[i] = array[randTailPos];
		array[randTailPos] = temp;
	}
};

var getRandomSymmetry = function(){
	var rand = Math.floor(Math.random() * 4)
	switch (rand){
		case 0: return qqwing.Symmetry.ROTATE90;
		case 1: return qqwing.Symmetry.ROTATE180;
		case 2: return qqwing.Symmetry.MIRROR;
		case 3: return qqwing.Symmetry.FLIP;
	}
	throw ("Unexpected random value: " + rand);
};

var getLogCount = function(v, type){
	var count = 0;
	for (var i=0; i<v.length; i++){
		if((v[i]).getType() == type) count++;
	}
	return count;
};
this.LogItem = function(r, t, v, p){
	/**
	 * The recursion level at which this item was gathered.
	 * Used for backing out log items solve branches that
	 * don't lead to a solution.
	 */
	var round = r;

	/**
	 * The type of log message that will determine the
	 * message printed.
	 */
	var type = t;

	/**
	 * Value that was set by the operation (or zero for no value)
	 */
	var value = v;

	/**
	 * position on the board at which the value (if any) was set.
	 */
	var position = p;

	this.getRound = function (){
		return round;
	};

	this.print = function(){
		println(this.toString());
	};

	this.getType = function(){
		return type;
	};

	this.getColumn = function(){
		if (position == -1) return -1;
		return cellToColumn(position);
	};

	this.getRow = function(){
		if (position == -1) return -1;
		return cellToRow(position);
	}

	this.getPosition = function(){
		return position;
	}

	this.getValue = function(){
		return value;
	}

	this.getDescription = function(){
		switch(this.getType()){
			case qqwing.LogType.GIVEN: return "Mark given";
			case qqwing.LogType.ROLLBACK: return "Roll back round";
			case qqwing.LogType.GUESS: return "Mark guess (start round)";
			case qqwing.LogType.HIDDEN_SINGLE_ROW: return "Mark single possibility for value in row";
			case qqwing.LogType.HIDDEN_SINGLE_COLUMN: return "Mark single possibility for value in column";
			case qqwing.LogType.HIDDEN_SINGLE_SECTION: return "Mark single possibility for value in section";
			case qqwing.LogType.SINGLE: return "Mark only possibility for cell";
			case qqwing.LogType.NAKED_PAIR_ROW: return "Remove possibilities for naked pair in row";
			case qqwing.LogType.NAKED_PAIR_COLUMN: return "Remove possibilities for naked pair in column";
			case qqwing.LogType.NAKED_PAIR_SECTION: return "Remove possibilities for naked pair in section";
			case qqwing.LogType.POINTING_PAIR_TRIPLE_ROW: return "Remove possibilities for row because all values are in one section";
			case qqwing.LogType.POINTING_PAIR_TRIPLE_COLUMN: return "Remove possibilities for column because all values are in one section";
			case qqwing.LogType.ROW_BOX: return "Remove possibilities for section because all values are in one row";
			case qqwing.LogType.COLUMN_BOX: return "Remove possibilities for section because all values are in one column";
			case qqwing.LogType.HIDDEN_PAIR_ROW: return "Remove possibilities from hidden pair in row";
			case qqwing.LogType.HIDDEN_PAIR_COLUMN: return "Remove possibilities from hidden pair in column";
			case qqwing.LogType.HIDDEN_PAIR_SECTION: return "Remove possibilities from hidden pair in section";
			default: return "!!! Performed unknown optimization !!!";
		}
	}

	this.toString = function(){
		var s = "Round: " + this.getRound() + " - ";
		s += this.getDescription();
		if (value > 0 || position > -1){
			s += " (";
			var printed = false;
			if (position > -1){
				if (printed) s += " - ";
				s += "Row: " + (cellToRow(position)+1) + " - Column: " + (cellToColumn(position)+1);
				printed = true;
			}
			if (value > 0){
				if (printed) s += " - ";
				s += "Value: " + value;
				printed = true;
			}
			s += ")";
		}
		return s;
	}
};

/**
 * Set the board to the given puzzle.
 * The given puzzle must be an array of 81 integers.
 */
this.setPuzzle = function(initPuzzle){
	for (var i=0; i<qqwing.BOARD_SIZE; i++){
		puzzle[i] = initPuzzle[i];
	}
	return reset.call(this);
}

/**
 * Print the sudoku puzzle.
 */
this.printPuzzle = function(){
	return print.call(this, puzzle);
}

/**
 * Get the sudoku puzzle as a String.
 */
this.getPuzzleString = function(){
	return sudokuToString.call(this, puzzle);
}

/**
 * Print the sudoku solution.
 */
this.printSolution = function(){
	return print.call(this, solution);
}

/**
 * Get the sudoku puzzle as a String.
 */
this.getSolutionString = function(){
	return sudokuToString.call(this, solution);
}

this.solve = function(round){
	if (!round || round <= 1){
		reset.call(this);
		shuffleRandomArrays();
		return this.solve(2);
	}

	lastSolveRound = round;

	while (singleSolveMove.call(this, round)){
		if (this.isSolved()) return true;
		if (isImpossible.call(this)) return false;
	}

	var nextGuessRound = round+1;
	var nextRound = round+2;
	for (var guessNumber=0; guess.call(this, nextGuessRound, guessNumber); guessNumber++){
		if (isImpossible.call(this) || !this.solve(nextRound)){
			rollbackRound.call(this, nextRound);
			rollbackRound.call(this, nextGuessRound);
		} else {
			return true;
		}
	}
	return false;
};


this.countSolutions = function(round, limitToTwo){
	if (!round || round <= 1){
		// Don't record history while generating.
		var recHistory = recordHistory;
		this.setRecordHistory(false);
		var lHistory = logHistory;
		this.setLogHistory(false);

		reset.call(this);
		var solutionCount = this.countSolutions(2, false);

		// Restore recording history.
		this.setRecordHistory(recHistory);
		this.setLogHistory(lHistory);

		return solutionCount;
	} else {
		while (singleSolveMove.call(this, round)){
			if (this.isSolved()){
				rollbackRound.call(this, round);
				return 1;
			}
			if (isImpossible.call(this)){
				rollbackRound.call(this, round);
				return 0;
			}
		}

		var solutions = 0;
		var nextRound = round+1;
		for (var guessNumber=0; guess.call(this, nextRound, guessNumber); guessNumber++){
			solutions += this.countSolutions(nextRound, limitToTwo);
			if (limitToTwo && solutions >=2){
				rollbackRound.call(this, round);
				return solutions;
			}
		}
		rollbackRound.call(this, round);
		return solutions;
	}
};

this.isSolved = function(){
	for (var i=0; i<qqwing.BOARD_SIZE; i++){
		if (solution[i] == 0){
			return false;
		}
	}
	return true;
};

this.getSolveHistory = function(){
	if (this.isSolved()){
		return solveHistory;
	} else {
		return "No solve history - Puzzle is not possible to solve.";
	}
};

this.getSolveHistoryString = function(){
	if (this.isSolved()){
		return getHistoryString.call(this, solveHistory);
	} else {
		return "No solve history - Puzzle is not possible to solve.";
	}
};

this.printSolveHistory = function(){
	if (this.isSolved()){
		printHistory(solveHistory);
	} else {
		println("No solve history - Puzzle is not possible to solve.");
	}
};

this.setRecordHistory = function(recHistory){
	recordHistory = recHistory;
};

this.setLogHistory = function(logHist){
	logHistory = logHist;
};

this.setPrintStyle = function(ps){
	printStyle = ps;
};

this.generatePuzzle = function(){
	return this.generatePuzzleSymmetry(qqwing.Symmetry.NONE);
};

this.generatePuzzleSymmetry = function(symmetry){
		if (symmetry == qqwing.Symmetry.RANDOM) symmetry = getRandomSymmetry.call(this);

		// Don't record history while generating.
		var recHistory = recordHistory;
		this.setRecordHistory(false);
		var lHistory = logHistory;
		this.setLogHistory(false);

		clearPuzzle.call(this);

		// Start by getting the randomness in order so that
		// each puzzle will be different from the last.
		shuffleRandomArrays.call(this);

		// Now solve the puzzle the whole way.  The solve
		// uses random algorithms, so we should have a
		// really randomly totally filled sudoku
		// Even when starting from an empty grid
		this.solve();

		if (symmetry == qqwing.Symmetry.NONE){
			// Rollback any square for which it is obvious that
			// the square doesn't contribute to a unique solution
			// (ie, squares that were filled by logic rather
			// than by guess)
			rollbackNonGuesses.call(this);
		}

		// Record all marked squares as the puzzle so
		// that we can call countSolutions without losing it.
		for (var i=0; i<qqwing.BOARD_SIZE; i++){
			puzzle[i] = solution[i];
		}

		// Rerandomize everything so that we test squares
		// in a different order than they were added.
		shuffleRandomArrays.call(this);

		// Remove one value at a time and see if
		// the puzzle still has only one solution.
		// If it does, leave it out the point because
		// it is not needed.
		for (var i=0; i<qqwing.BOARD_SIZE; i++){
			// check all the positions, but in shuffled order
			var position = randomBoardArray[i];
			if (puzzle[position] > 0){
				var positionsym1 = -1;
				var positionsym2 = -1;
				var positionsym3 = -1;
				switch (symmetry){
					case qqwing.Symmetry.ROTATE90:
						positionsym2 = rowColumnToCell(qqwing.ROW_COL_SEC_SIZE-1-cellToColumn(position),cellToRow(position));
						positionsym3 = rowColumnToCell(cellToColumn(position),qqwing.ROW_COL_SEC_SIZE-1-cellToRow(position));
					case qqwing.Symmetry.ROTATE180:
						positionsym1 = rowColumnToCell(qqwing.ROW_COL_SEC_SIZE-1-cellToRow(position),qqwing.ROW_COL_SEC_SIZE-1-cellToColumn(position));
					break;
					case qqwing.Symmetry.MIRROR:
						positionsym1 = rowColumnToCell(cellToRow(position),qqwing.ROW_COL_SEC_SIZE-1-cellToColumn(position));
					break;
					case qqwing.Symmetry.FLIP:
						positionsym1 = rowColumnToCell(qqwing.ROW_COL_SEC_SIZE-1-cellToRow(position),cellToColumn(position));
					break;
				}
				// try backing out the value and
				// counting solutions to the puzzle
				var savedValue = puzzle[position];
				puzzle[position] = 0;
				var savedSym1 = 0;
				if (positionsym1 >= 0){
					savedSym1 = puzzle[positionsym1];
					puzzle[positionsym1] = 0;
				}
				var savedSym2 = 0;
				if (positionsym2 >= 0){
					savedSym2 = puzzle[positionsym2];
					puzzle[positionsym2] = 0;
				}
				var savedSym3 = 0;
				if (positionsym3 >= 0){
					savedSym3 = puzzle[positionsym3];
					puzzle[positionsym3] = 0;
				}
				reset.call(this);
				if (this.countSolutions(2, true) > 1){
					// Put it back in, it is needed
					puzzle[position] = savedValue;
					if (positionsym1 >= 0 && savedSym1 != 0) puzzle[positionsym1] = savedSym1;
					if (positionsym2 >= 0 && savedSym2 != 0) puzzle[positionsym2] = savedSym2;
					if (positionsym3 >= 0 && savedSym3 != 0) puzzle[positionsym3] = savedSym3;
				}
			}
		}

		// Clear all solution info, leaving just the puzzle.
		reset.call(this);

		// Restore recording history.
		this.setRecordHistory(recHistory);
		this.setLogHistory(lHistory);

		return true;
};

/**
 * Get the number of cells that are
 * set in the puzzle (as opposed to
 * figured out in the solution
 */
this.getGivenCount = function(){
	var count = 0;
	for (var i=0; i<qqwing.BOARD_SIZE; i++){
		if (puzzle[i] != 0) count++;
	}
	return count;
};

/**
 * Get the number of cells for which the solution was determined
 * because there was only one possible value for that cell.
 */
this.getSingleCount = function(){
	return getLogCount.call(this, solveInstructions, qqwing.LogType.SINGLE);
}

/**
 * Get the number of cells for which the solution was determined
 * because that cell had the only possibility for some value in
 * the row, column, or section.
 */
this.getHiddenSingleCount = function(){
	return (
		getLogCount.call(this, solveInstructions, qqwing.LogType.HIDDEN_SINGLE_ROW) +
		getLogCount.call(this, solveInstructions, qqwing.LogType.HIDDEN_SINGLE_COLUMN) +
		getLogCount.call(this, solveInstructions, qqwing.LogType.HIDDEN_SINGLE_SECTION)
	);
};

/**
 * Get the number of naked pair reductions that were performed
 * in solving this puzzle.
 */

this.getNakedPairCount = function(){
	return (
		getLogCount.call(this, solveInstructions, qqwing.LogType.NAKED_PAIR_ROW) +
		getLogCount.call(this, solveInstructions, qqwing.LogType.NAKED_PAIR_COLUMN) +
		getLogCount.call(this, solveInstructions, qqwing.LogType.NAKED_PAIR_SECTION)
	);
};

/**
 * Get the number of hidden pair reductions that were performed
 * in solving this puzzle.
 */
this.getHiddenPairCount = function(){
	return (
		getLogCount.call(this, solveInstructions, qqwing.LogType.HIDDEN_PAIR_ROW) +
		getLogCount.call(this, solveInstructions, qqwing.LogType.HIDDEN_PAIR_COLUMN) +
		getLogCount.call(this, solveInstructions, qqwing.LogType.HIDDEN_PAIR_SECTION)
	);
};

/**
 * Get the number of box/line reductions that were performed
 * in solving this puzzle.
 */
this.getBoxLineReductionCount = function(){
	return (
		getLogCount.call(this, solveInstructions, qqwing.LogType.ROW_BOX)+
		getLogCount.call(this, solveInstructions, qqwing.LogType.COLUMN_BOX)
	);
};

/**
 * Get the number of pointing pair/triple reductions that were performed
 * in solving this puzzle.
 */

this.getPointingPairTripleCount = function(){
	return (
		getLogCount.call(this, solveInstructions, qqwing.LogType.POINTING_PAIR_TRIPLE_ROW)+
		getLogCount.call(this, solveInstructions, qqwing.LogType.POINTING_PAIR_TRIPLE_COLUMN)
	);
};

/**
 * Get the number lucky guesses in solving this puzzle.
 */
this.getGuessCount = function(){
	return getLogCount.call(this, solveInstructions, qqwing.LogType.GUESS);
};

/**
 * Get the number of backtracks (unlucky guesses) required
 * when solving this puzzle.
 */
this.getBacktrackCount = function(){
	return getLogCount.call(this, solveHistory, qqwing.LogType.ROLLBACK);
};

this.getSolveInstructions = function(){
	if (this.isSolved()){
		return solveInstructions;
	} else {
		return "No solve instructions - Puzzle is not possible to solve.";
	}
};

this.getSolveInstructionsString = function(){
	if (this.isSolved()){
		return getHistoryString.call(this, solveInstructions);
	} else {
		return "No solve instructions - Puzzle is not possible to solve.";
	}
};

this.printSolveInstructions = function(){
	if (this.isSolved()){
		printHistory(solveInstructions);
	} else {
		println("No solve instructions - Puzzle is not possible to solve.");
	}
};

this.getDifficulty = function(){
	if (this.getGuessCount() > 0) return qqwing.Difficulty.EXPERT;
	if (this.getBoxLineReductionCount() > 0) return qqwing.Difficulty.INTERMEDIATE;
	if (this.getPointingPairTripleCount() > 0) return qqwing.Difficulty.INTERMEDIATE;
	if (this.getHiddenPairCount() > 0) return qqwing.Difficulty.INTERMEDIATE;
	if (this.getNakedPairCount() > 0) return qqwing.Difficulty.INTERMEDIATE;
	if (this.getHiddenSingleCount() > 0) return qqwing.Difficulty.EASY;
	if (this.getSingleCount() > 0) return qqwing.Difficulty.SIMPLE;
	return qqwing.Difficulty.UNKNOWN;
};

this.getDifficultyAsString = function(){
	var difficulty = this.getDifficulty();
	switch (difficulty){
		case qqwing.Difficulty.EXPERT: return "Expert";
		case qqwing.Difficulty.INTERMEDIATE: return "Intermediate";
		case qqwing.Difficulty.EASY: return "Easy";
		case qqwing.Difficulty.SIMPLE: return "Simple";
		default: return "Unknown";
	}
};
};
qqwing.PrintStyle = {
	ONE_LINE: 0,
	COMPACT: 1,
	READABLE: 2,
	CSV: 3
};

qqwing.Difficulty = {
	UNKNOWN: 0,
	SIMPLE: 1,
	EASY: 2,
	INTERMEDIATE: 3,
	EXPERT: 4
};

qqwing.Symmetry = {
	NONE: 0,
	ROTATE90: 1,
	ROTATE180: 2,
	MIRROR: 3,
	FLIP: 4,
	RANDOM: 5
};

qqwing.LogType = {
	GIVEN: 0,
	SINGLE: 1,
	HIDDEN_SINGLE_ROW: 2,
	HIDDEN_SINGLE_COLUMN: 3,
	HIDDEN_SINGLE_SECTION: 4,
	GUESS: 5,
	ROLLBACK: 6,
	NAKED_PAIR_ROW: 7,
	NAKED_PAIR_COLUMN: 8,
	NAKED_PAIR_SECTION: 9,
	POINTING_PAIR_TRIPLE_ROW: 10,
	POINTING_PAIR_TRIPLE_COLUMN: 11,
	ROW_BOX: 12,
	COLUMN_BOX: 13,
	HIDDEN_PAIR_ROW: 14,
	HIDDEN_PAIR_COLUMN: 15,
	HIDDEN_PAIR_SECTION: 16
};

qqwing.GRID_SIZE = 3;
qqwing.ROW_COL_SEC_SIZE = qqwing.GRID_SIZE*qqwing.GRID_SIZE;
qqwing.SEC_GROUP_SIZE = qqwing.ROW_COL_SEC_SIZE*qqwing.GRID_SIZE;
qqwing.BOARD_SIZE = qqwing.ROW_COL_SEC_SIZE*qqwing.ROW_COL_SEC_SIZE;
qqwing.POSSIBILITY_SIZE = qqwing.BOARD_SIZE*qqwing.ROW_COL_SEC_SIZE;
try {
	// Start time for the application for timing
	var applicationStartTime = getMicroseconds();

	// The number of puzzles solved or generated.
	var puzzleCount = 0;

	// defaults for options
	var printPuzzle = false;
	var printSolution = false;
	var printHistory = false;
	var printInstructions = false;
	var timer = false;
	var countSolutions = false;
	var action = "NONE";
	var logHistory = false;
	var printStyle = qqwing.PrintStyle.READABLE;
	var numberToGenerate = 1;
	var printStats = false;
	var difficulty = qqwing.Difficulty.UNKNOWN;
	var symmetry = qqwing.Symmetry.NONE;
	var argv = process.argv;

	// Read the arguments and set the options
	for (var i=2; i<argv.length; i++){
		if (argv[i] == "--puzzle"){
			printPuzzle = true;
		} else if (argv[i] == "--nopuzzle"){
			printPuzzle = false;
		} else if (argv[i] == "--solution"){
			printSolution = true;
		} else if (argv[i] == "--nosolution"){
			printSolution = false;
		} else if (argv[i] == "--history"){
			printHistory = true;
		} else if (argv[i] == "--nohistory"){
			printHistory = false;
		} else if (argv[i] == "--instructions"){
			printInstructions = true;
		} else if (argv[i] == "--noinstructions"){
			printInstructions = false;
		} else if (argv[i] == "--stats"){
			printStats = true;
		} else if (argv[i] == "--nostats"){
			printStats = false;
		} else if (argv[i] == "--timer"){
			timer = true;
		} else if (argv[i] == "--notimer"){
			timer = false;
		} else if (argv[i] == "--count-solutions"){
			countSolutions = true;
		} else if (argv[i] == "--nocount-solutions"){
			countSolutions = false;
		} else if (argv[i] == "--generate"){
			action = "GENERATE";
			printPuzzle = true;
			if (i+1 < argv.length && argv[i+1].charAt(0) != "-"){
				numberToGenerate = parseInt(argv[i+1]);
				if (isNaN(numberToGenerate) || numberToGenerate <= 0){
					console.log("Bad number of puzzles to generate: "+argv[i+1]);
					process.exit(1);
				}
				i++;
			}
		} else if (argv[i] == "--difficulty") {
			if (argv.length <= i+1){
				console.log("Please specify a difficulty.");
				process.exit(1);
			} else if (argv[i+1].toLowerCase() == "simple"){
				difficulty = qqwing.Difficulty.SIMPLE;
			} else if (argv[i+1].toLowerCase() == "easy"){
				difficulty = qqwing.Difficulty.EASY;
			} else if (argv[i+1].toLowerCase() == "intermediate"){
				difficulty = qqwing.Difficulty.INTERMEDIATE;
			} else if (argv[i+1].toLowerCase() == "expert"){
				difficulty = qqwing.Difficulty.EXPERT;
			} else if (argv[i+1].toLowerCase() == "any"){
				difficulty = qqwing.Difficulty.UNKNOWN;
			} else {
				console.log("Difficulty expected to be simple, easy, intermediate, expert, or any, not "+argv[i+1]);
				process.exit(1);
			}
			i++;
		} else if (argv[i] == "--symmetry") {
			if (argv.length <= i+1){
				console.log("Please specify a symmetry.");
				process.exit(1);
			} else if (argv[i+1] == "none") {
				symmetry = qqwing.Symmetry.NONE;
			} else if (argv[i+1] == "rotate90") {
				symmetry = qqwing.Symmetry.ROTATE90;
			} else if (argv[i+1] == "rotate180") {
				symmetry = qqwing.Symmetry.ROTATE180;
			} else if (argv[i+1] == "mirror") {
				symmetry = qqwing.Symmetry.MIRROR;
			} else if (argv[i+1] == "flip") {
				symmetry = qqwing.Symmetry.FLIP;
			} else if (argv[i+1] == "random") {
				symmetry = qqwing.Symmetry.RANDOM;
			} else {
				console.log("Symmetry expected to be none, rotate90, rotate180, mirror, flip, or random, not " + argv[i+1]);
				process.exit(1);
			}
			i++;
		} else if (argv[i] == "--solve") {
			action = "SOLVE";
			printSolution = true;
		} else if (argv[i] == "--log-history") {
			logHistory = true;
		} else if (argv[i] == "--nolog-history") {
			logHistory = false;
		} else if (argv[i] == "--one-line") {
			printStyle=qqwing.PrintStyle.ONE_LINE;
		} else if (argv[i] == "--compact") {
			printStyle=qqwing.PrintStyle.COMPACT;
		} else if (argv[i] == "--readable") {
			printStyle=qqwing.PrintStyle.READABLE;
		} else if (argv[i] == "--csv") {
			printStyle=qqwing.PrintStyle.CSV;
		} else if (argv[i] == "-n" || argv[i] == "--number") {
			if (i+1 < argv.length){
				numberToGenerate = parseInt(argv[i+1]);
				i++;
			} else {
				console.log("Please specify a number.");
				process.exit(1);
			}
		} else if (argv[i] == "-h" || argv[i] == "--help" || argv[i] == "help" || argv[i] == "?") {
			printHelp();
			process.exit(0);
		} else if (argv[i] == "--version") {
			printVersion();
			process.exit(0);
		} else if (argv[i] == "--about") {
			printAbout();
			process.exit(0);
		} else {
			console.log("Unknown argument: '"+argv[i]+"'");
			printHelp();
			process.exit(0);
		}
	}

	if (action == "NONE"){
		console.log("Either --solve or --generate must be specified.");
		printHelp();
		process.exit(1);
	}

	// If printing out CSV, print a header
	if (printStyle == qqwing.PrintStyle.CSV){
		if (printPuzzle) process.stdout.write("Puzzle,");
		if (printSolution) process.stdout.write("Solution,");
		if (printHistory) process.stdout.write("Solve History,");
		if (printInstructions) process.stdout.write("Solve Instructions,");
		if (countSolutions) process.stdout.write("Solution Count,");
		if (timer) process.stdout.write("Time (milliseconds),");
		if (printStats) process.stdout.write("Givens,Singles,Hidden Singles,Naked Pairs,Hidden Pairs,Pointing Pairs/Triples,Box/Line Intersections,Guesses,Backtracks,Difficulty");
		console.log("");
	}

	// Create a new puzzle board
	// and set the options
	var ss = new qqwing();
	ss.setRecordHistory(printHistory || printInstructions || printStats || difficulty!=qqwing.Difficulty.UNKNOWN);
	ss.setLogHistory(logHistory);
	ss.setPrintStyle(printStyle);

	// Solve puzzle or generate puzzles
	// until end of input for solving, or
	// until we have generated the specified number.
	var done = false;
	var numberGenerated = 0;
	while (!done){
		// record the start time for the timer.
		var puzzleStartTime = getMicroseconds();

		// iff something has been printed for this particular puzzle
		var printedSomething = false;

		// Record whether the puzzle was possible or not,
		// so that we don't try to solve impossible givens.
		var havePuzzle = false;
		if (action == "GENERATE"){
			// Generate a puzzle
			havePuzzle = ss.generatePuzzleSymmetry(symmetry);
			if (!havePuzzle && printPuzzle){
				process.stdout.write("Could not generate puzzle.");
				if (printStyle==qqwing.PrintStyle.CSV){
					console.log(",");
				} else {
					console.log("");
				}
				printedSomething = true;
					process.exit(1);
			}
		} else {
			// Read the next puzzle on STDIN
			var puzzle = [];
			if (readPuzzleFromStdIn(puzzle)){
				havePuzzle = ss.setPuzzle(puzzle);
				if (!havePuzzle){
					if (printPuzzle){
						ss.printPuzzle();
						printedSomething = true;
					}
					if (printSolution) {
						process.stdout.write("Puzzle is not possible.");
						if (printStyle==qqwing.PrintStyle.CSV){
							process.stdout.write(",");
						} else {
							console.log("");
						}
						printedSomething = true;
					}
				}
			} else {
				// Set loop to terminate when nothing is left on STDIN
				havePuzzle = false;
				done = true;
			}
			puzzle = null;
		}

		var solutions = 0;

		if (havePuzzle){

			// Count the solutions if requested.
			// (Must be done before solving, as it would
			// mess up the stats.)
			if (countSolutions){
				solutions = ss.countSolutions();
			}

			// Solve the puzzle
			if (printSolution || printHistory || printStats || printInstructions || difficulty!=qqwing.Difficulty.UNKNOWN){
				ss.solve();
			}

			// Bail out if it didn't meet the difficulty standards for generation
			if (action == "GENERATE"){
				if (difficulty!=qqwing.Difficulty.UNKNOWN && difficulty!=ss.getDifficulty()){
					havePuzzle = false;
				} else {
					numberGenerated++;
					// Set loop to terminate if enough have been generated.
					if (numberGenerated >= numberToGenerate) done = true;
				}
			}
		}

		// Check havePuzzle again, it may have changed based on difficulty
		if (havePuzzle){

			// With a puzzle now in hand and possibly solved
			// print out the solution, stats, etc.
			printedSomething = true;

			// Record the end time for the timer.
			var puzzleDoneTime = getMicroseconds();

			// Print the puzzle itself.
			if (printPuzzle) ss.printPuzzle();

			// Print the solution if there is one
			if (printSolution){
				if (ss.isSolved()){
					ss.printSolution();
				} else {
					process.stdout.write("Puzzle has no solution.");
					if (printStyle==qqwing.PrintStyle.CSV){
						process.stdout.write(",");
					} else {
						console.log("");
					}
				}
			}

			// Print the steps taken to solve or attempt to solve the puzzle.
			if (printHistory) ss.printSolveHistory();
			// Print the instructions for solving the puzzle
			if (printInstructions) ss.printSolveInstructions();

			// Print the number of solutions to the puzzle.
			if (countSolutions){
				if (printStyle == qqwing.PrintStyle.CSV){
					process.stdout.write(solutions+",");
				} else {
					if (solutions == 0){
						console.log("There are no solutions to the puzzle.");
					} else if (solutions == 1){
						console.log("The solution to the puzzle is unique.");
					} else {
						console.log("There are "+solutions+" solutions to the puzzle.");
					}
				}
			}

			// Print out the time it took to solve the puzzle.
			if (timer){
				var t = (puzzleDoneTime - puzzleStartTime)/1000.0;
				if (printStyle == qqwing.PrintStyle.CSV){
					process.stdout.write(t+",");
				} else {
					console.log("Time: "+t +" milliseconds");
				}
			}

			// Print any stats we were able to gather while solving the puzzle.
			if (printStats){
				var givenCount = ss.getGivenCount();
				var singleCount = ss.getSingleCount();
				var hiddenSingleCount = ss.getHiddenSingleCount();
				var nakedPairCount = ss.getNakedPairCount();
				var hiddenPairCount = ss.getHiddenPairCount();
				var pointingPairTripleCount = ss.getPointingPairTripleCount();
				var boxReductionCount = ss.getBoxLineReductionCount();
				var guessCount = ss.getGuessCount();
				var backtrackCount = ss.getBacktrackCount();
				var difficultyString = ss.getDifficultyAsString();
				if (printStyle == qqwing.PrintStyle.CSV){
					console.log(givenCount+"," +singleCount+","+hiddenSingleCount
							+","+nakedPairCount+","+hiddenPairCount
							+"," +pointingPairTripleCount +"," +boxReductionCount
							+","+guessCount+","+backtrackCount
							+","+difficultyString+",");
				} else {
					console.log("Number of Givens: "+givenCount );
					console.log("Number of Singles: "+singleCount);
					console.log("Number of Hidden Singles: "+hiddenSingleCount );
					console.log("Number of Naked Pairs: "+nakedPairCount );
					console.log("Number of Hidden Pairs: "+hiddenPairCount );
					console.log("Number of Pointing Pairs/Triples: "+pointingPairTripleCount );
					console.log("Number of Box/Line Intersections: "+boxReductionCount );
					console.log("Number of Guesses: "+guessCount );
					console.log("Number of Backtracks: "+backtrackCount );
					console.log("Difficulty: "+difficultyString );
				}
			}
			puzzleCount++;
		}
		if (printedSomething && printStyle == qqwing.PrintStyle.CSV){
			console.log("");
		}
	}

	var applicationDoneTime = getMicroseconds();
	// Print out the time it took to do everything
	if (timer){
		var t = (applicationDoneTime - applicationStartTime)/1000000.0;
		console.log(puzzleCount+" puzzle"+((puzzleCount==1)?"":"s")+" "+(action=="GENERATE"?"generated":"solved")+" in "+t+" seconds.");
	}
} catch (e){
	console.log(e.stack);
	process.exit(1);
}
process.exit(0);

function printHelp(){
	console.log("qqwing <options>");
	console.log("Sudoku solver and generator.");
	console.log("  --generate <num>     Generate new puzzles");
	console.log("  --solve              Solve all the puzzles from standard input");
	console.log("  --difficulty <diff>  Generate only simple, easy, intermediate, expert, or any");
	console.log("  --symmetry <sym>     Symmetry: none, rotate90, rotate180, mirror, flip, or random");
	console.log("  --puzzle             Print the puzzle (default when generating)");
	console.log("  --nopuzzle           Do not print the puzzle (default when solving)");
	console.log("  --solution           Print the solution (default when solving)");
	console.log("  --nosolution         Do not print the solution (default when generating)");
	console.log("  --stats              Print statistics about moves used to solve the puzzle");
	console.log("  --nostats            Do not print statistics (default)");
	console.log("  --timer              Print time to generate or solve each puzzle");
	console.log("  --notimer            Do not print solve or generation times (default)");
	console.log("  --count-solutions    Count the number of solutions to puzzles");
	console.log("  --nocount-solutions  Do not count the number of solutions (default)");
	console.log("  --history            Print trial and error used when solving");
	console.log("  --nohistory          Do not print trial and error to solve (default)");
	console.log("  --instructions       Print the steps (at least 81) needed to solve the puzzle");
	console.log("  --noinstructions     Do not print steps to solve (default)");
	console.log("  --log-history        Print trial and error to solve as it happens");
	console.log("  --nolog-history      Do not print trial and error  to solve as it happens");
	console.log("  --one-line           Print puzzles on one line of 81 characters");
	console.log("  --compact            Print puzzles on 9 lines of 9 characters");
	console.log("  --readable           Print puzzles in human readable form (default)");
	console.log("  --csv                Output CSV format with one line puzzles");
	console.log("  --help               Print this message");
	console.log("  --about              Author and license information");
	console.log("  --version            Display current version number");
}

function printVersion(){
	console.log("qqwing 1.3.4");
}

function printAbout(){
	console.log("qqwing - Sudoku solver and generator");
	console.log("Copyright (C) 2014 Stephen Ostermiller");
	console.log("");
	console.log("This program is free software; you can redistribute it and/or modify");
	console.log("it under the terms of the GNU General Public License as published by");
	console.log("the Free Software Foundation; either version 2 of the License, or");
	console.log("(at your option) any later version.");
	console.log("");
	console.log("This program is distributed in the hope that it will be useful,");
	console.log("but WITHOUT ANY WARRANTY; without even the implied warranty of");
	console.log("MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the");
	console.log("GNU General Public License for more details.");
	console.log("");
	console.log("You should have received a copy of the GNU General Public License along");
	console.log("with this program; if not, write to the Free Software Foundation, Inc.,");
	console.log("51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.");
}

function getMicroseconds(){
	return new Date().getTime() * 1000;
}


/**
 * Read a sudoku puzzle from standard input.
 * STDIN is processed one character at a time
 * until the sudoku is filled in.  Any digit
 * or period is used to fill the sudoku, any
 * other character is ignored.
 */
function readPuzzleFromStdIn(puzzle){
	var fs = require('fs');
	var read = 0;
	while (read < qqwing.BOARD_SIZE){
		var c = fs.readSync(process.stdin.fd, 1);
		if (c[1] == 0) return false;
		if (c[0] >= '1' && c[0] <='9'){
			puzzle[read] = c[0]-'0';
			read++;
		}
		if (c[0] == '.' || c[0] == '0'){
			puzzle[read] = 0;
			read++;
		}
	}
	return true;
}
