export function segment(items, count) {
  const bins = [];
  for (let i = 0; i < count; i++) {
    bins.push(items.slice(i * count, (i + 1) * count));
  }
  return bins;
}