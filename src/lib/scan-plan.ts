export function chunkTokenIds(supply: number, size: number): number[][] {
  if (supply <= 0 || size <= 0) return [];
  const chunks: number[][] = [];
  let cursor = 1;
  while (cursor <= supply) {
    const chunk: number[] = [];
    for (let i = 0; i < size && cursor <= supply; i += 1) {
      chunk.push(cursor);
      cursor += 1;
    }
    chunks.push(chunk);
  }
  return chunks;
}

export function keepOwned(
  ids: number[],
  owners: (string | null)[],
  me: string,
): number[] {
  const mine = me.toLowerCase();
  const found: number[] = [];
  ids.forEach((id, index) => {
    const owner = owners[index];
    if (owner && owner.toLowerCase() === mine) found.push(id);
  });
  return found;
}
