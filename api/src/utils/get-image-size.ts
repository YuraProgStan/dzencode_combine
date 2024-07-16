import { Buffer } from 'buffer';
import fromBuffer from 'image-size';
import { UserInputError } from 'apollo-server-express';

export const getImageSize = (
  fileBuffer: Buffer,
): { width: number; height: number } => {
  try {
    const dimensions = fromBuffer(fileBuffer);
    if (!dimensions || !dimensions.width || !dimensions.height) {
      throw new UserInputError('Invalid image dimensions');
    }
    return { width: dimensions.width, height: dimensions.height };
  } catch (error) {
    throw new UserInputError('Invalid image file');
  }
};
