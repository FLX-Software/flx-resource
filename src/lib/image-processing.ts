import sharp from "sharp";

const IMAGE_SIZE = 512;
const JPEG_QUALITY = 95;

export async function processSquareImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .resize(IMAGE_SIZE, IMAGE_SIZE, {
      fit: "cover",
      position: "attention",
    })
    .sharpen({ sigma: 0.6, m1: 0.5, m2: 0.35 })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toBuffer();
}

export async function processAvatarImage(buffer: Buffer): Promise<Buffer> {
  return processSquareImage(buffer);
}

export async function processVehicleImage(buffer: Buffer): Promise<Buffer> {
  return processSquareImage(buffer);
}
