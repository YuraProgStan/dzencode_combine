import * as path from 'path';

export const editFileName = (filename) => {
  const name = filename.split('.')[0];
  const fileExtName = path.extname(filename);
  const randomName = Array(10)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  return `${name}-${randomName}${fileExtName}`;
};
