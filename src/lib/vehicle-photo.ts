import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "vehicles");
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export function isValidVehiclePhoto(file: File): boolean {
  return file.size > 0 && file.size <= MAX_SIZE_BYTES && ALLOWED_TYPES.has(file.type);
}

export async function saveVehiclePhoto(
  file: File,
  vehicleId: string
): Promise<string> {
  if (!isValidVehiclePhoto(file)) {
    throw new Error("Ungültiges Bild. Erlaubt: JPG, PNG oder WebP, max. 5 MB.");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const extension = EXTENSIONS[file.type];
  const filename = `${vehicleId}${extension}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filepath, buffer);

  return `/uploads/vehicles/${filename}`;
}

export async function deleteVehiclePhoto(photoUrl: string): Promise<void> {
  if (!photoUrl.startsWith("/uploads/vehicles/")) return;

  const filepath = path.join(process.cwd(), "public", photoUrl);
  try {
    await unlink(filepath);
  } catch {
    // Datei existiert nicht mehr – ignorieren
  }
}
