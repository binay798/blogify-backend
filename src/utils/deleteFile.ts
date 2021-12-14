import fs from 'fs';

const fsPromise = fs.promises;

export async function deleteFile(filePath: string) {
  await fsPromise.unlink(filePath);
}
