export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}

export function validateUsername(username: string): string | null {
  if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
    return "Benutzername: 3–32 Zeichen, nur Kleinbuchstaben, Zahlen, Punkt, Unterstrich oder Bindestrich.";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Das Passwort muss mindestens 8 Zeichen lang sein.";
  }
  return null;
}
