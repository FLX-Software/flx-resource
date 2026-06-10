import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { processAvatarImage } from "./image-processing";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "employees");
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function isValidEmployeePhoto(file: File): boolean {
  return file.size > 0 && file.size <= MAX_SIZE_BYTES && ALLOWED_TYPES.has(file.type);
}

export async function saveEmployeePhoto(
  file: File,
  employeeId: string
): Promise<string> {
  if (!isValidEmployeePhoto(file)) {
    throw new Error("Ungültiges Foto. Erlaubt: JPG, PNG oder WebP, max. 5 MB.");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const filename = `${employeeId}.jpg`;
  const filepath = path.join(UPLOAD_DIR, filename);
  const raw = Buffer.from(await file.arrayBuffer());
  const processed = await processAvatarImage(raw);

  await writeFile(filepath, processed);

  return `/uploads/employees/${filename}`;
}

export async function deleteEmployeePhoto(photoUrl: string): Promise<void> {
  if (!photoUrl.startsWith("/uploads/employees/")) return;

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
