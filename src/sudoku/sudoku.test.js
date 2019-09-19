import { isSolved } from './sudoku';

const VALID1 = '974236158638591742125487936316754289742918563589362417867125394253649871491873625';
const VALID2 = '256489173374615982981723456593274861712836549468591327635147298127958634849362715';
const VALID3 = '365427819487931526129856374852793641613248957974165283241389765538674192796512438';
const VALID4 = '672435198549178362831629547368951274917243856254867931193784625486592713725316489';

const INVALID1 = '974236158238591742125487936316754289742918563589362417867125394253649871491873625';
const INVALID2 = '156489173374615982981723456593274861712836549468591327635147298127958634849362715';

const toGame = (testCase) => testCase.split('').map((value) => parseInt(value, 10));

describe('isSolved', () => {
  it('verifies VALID1', () => {
    expect(isSolved(toGame(VALID1))).toBe(true)
  });

  it('verifies VALID2', () => {
    expect(isSolved(toGame(VALID2))).toBe(true)
  });

  it('verifies VALID3', () => {
    expect(isSolved(toGame(VALID3))).toBe(true)
  });

  it('verifies VALID4', () => {
    expect(isSolved(toGame(VALID4))).toBe(true)
  });

  it('catches INVALID1', () => {
    expect(isSolved(toGame(INVALID1))).toBe(false)
  })

  it('catches INVALID2', () => {
    expect(isSolved(toGame(INVALID2))).toBe(false)
  })
});