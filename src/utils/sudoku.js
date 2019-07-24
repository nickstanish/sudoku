import { segment } from './array';

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