export function generateFileName(inp: string | undefined): string {
  const filename = `${inp?.split('.')[0]}_${Date.now()}.webp`;
  return filename;
}
