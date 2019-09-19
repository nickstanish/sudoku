import { segment } from './array';
// [
//   0 0 0 1 1 1 2 2 2
//   0 0 0 1 1 1 2 2 2
//   0 0 0 1 1 1 2 2 2
//   3 3 3 4 4 4 5 5 5
//   3 3 3 4 4 4 5 5 5
//   3 3 3 4 4 4 5 5 5
//   6 6 6 7 7 7 8 8 8
//   6 6 6 7 7 7 8 8 8
//   6 6 6 7 7 7 8 8 8
// ]
export function groupBoxes(cells) {
  const rows = segment(cells, 9);
  return Array(9).fill().map((_, index) => {
    const x = Math.floor(index / 3) * 3;
    const y = index % 3;
    return [
      ...rows[x].slice(y * 3, (y + 1) * 3),
      ...rows[x + 1].slice(y * 3, (y + 1) * 3),
      ...rows[x + 2].slice(y * 3, (y + 1) * 3)
    ]
  });
}