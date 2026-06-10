import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { processVehicleImage } from "./image-processing";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "vehicles");
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

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

  const filename = `${vehicleId}.jpg`;
  const filepath = path.join(UPLOAD_DIR, filename);
  const raw = Buffer.from(await file.arrayBuffer());
  const processed = await processVehicleImage(raw);

  await writeFile(filepath, processed);

  return `/uploads/vehicles/${filename}`;
}

export async function deleteVehiclePhoto(photoUrl: string): Promise<void> {
  if (!photoUrl.startsWith("/uploads/vehicles/")) return;

  const filepath = path.join(process.cwd(), "public", photoUrl);
  const base = path.join(UPLOAD_DIR, path.basename(photoUrl, path.extname(photoUrl)));

  try {
    await unlink(filepath);
  } catch {
    // Datei existiert nicht mehr – ignorieren
  }

  for (const ext of [".jpg", ".jpeg", ".png", ".webp"]) {
    try {
      await unlink(`${base}${ext}`);
    } catch {
      // ältere Dateiendungen mit aufräumen
    }
  }
}
