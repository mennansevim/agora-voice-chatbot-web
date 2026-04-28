export function compositeScore(rangeWidthHz: number, octaveWidth: number, successfulNotes: number): number {
  const rangeScore = Math.min(rangeWidthHz / 5.0, 100);
  const octaveScore = Math.min(octaveWidth * 25, 100);
  const notesScore = Math.min(successfulNotes * 5, 100);
  return rangeScore * 0.6 + octaveScore * 0.3 + notesScore * 0.1;
}
