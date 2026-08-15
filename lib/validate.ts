// Registration input rules. Shared so the API and the tests agree on one definition.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: unknown): string | null {
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return "Enter a valid email address.";
  }
  if (email.trim().length > 254) return "That email address is too long.";
  return null;
}

export function validatePassword(password: unknown): string | null {
  if (typeof password !== "string" || password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  // bcrypt silently truncates past 72 bytes, so reject rather than pretend.
  if (Buffer.byteLength(password, "utf8") > 72) {
    return "Password must be 72 bytes or fewer.";
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must contain at least one letter and one number.";
  }
  return null;
}

export function validateName(name: unknown): string | null {
  if (typeof name !== "string" || name.trim().length < 2) {
    return "Architect name must be at least 2 characters.";
  }
  if (name.trim().length > 50) return "Architect name must be 50 characters or fewer.";
  return null;
}
