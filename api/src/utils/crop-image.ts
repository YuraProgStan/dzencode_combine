import sharp from 'sharp';
import { Buffer } from 'buffer';
import { IMAGE_DIMENSION_HIGH, IMAGE_DIMENSION_WITH } from '../constants';

export const cropImageToCenter = async (buffer: Buffer): Promise<Buffer> => {
  return sharp(buffer)
    .resize(IMAGE_DIMENSION_WITH, IMAGE_DIMENSION_HIGH, {
      fit: 'cover',
      position: 'center',
    })
    .toBuffer();
};
