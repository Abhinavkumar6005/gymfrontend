const SECRET_KEY = process.env.NEXT_PUBLIC_API_URL || 'ironforge-secret-key';

// ─── Key bytes (computed once, reused) ───────────────────────────────────────

const getKeyBytes = (): Uint8Array => {
  console.log("0000")
  return new TextEncoder().encode(SECRET_KEY);
};

// ─── Encrypt ─────────────────────────────────────────────────────────────────

/**
 * Encrypts any string value into a Base64-encoded XOR cipher string.
 *
 * To store an object:
 *   encryptData(JSON.stringify(user))
 */
export const encryptData = (data: string): string => {
  console.log("11111")
  const keyBytes  = getKeyBytes();
  const dataBytes = new TextEncoder().encode(data);

  // XOR every byte against the key (cycling key with modulo)
  const xored = dataBytes.map((byte, i) => byte ^ keyBytes[i % keyBytes.length]);

  // Convert Uint8Array → binary string → Base64
  return btoa(String.fromCharCode(...xored));
};

// ─── Decrypt ─────────────────────────────────────────────────────────────────

/**
 * Decrypts a Base64-encoded XOR cipher string back to the original value.
 *
 * To recover an object:
 *   JSON.parse(decryptData(stored))
 */
export const decryptData = (encrypted: string): string => {
  console.log("222222")
  const keyBytes     = getKeyBytes();
  const binaryString = atob(encrypted);

  // Binary string → byte array
  const encryptedBytes = Uint8Array.from(binaryString, c => c.charCodeAt(0));

  // XOR is its own inverse — same operation decrypts
  const xored = encryptedBytes.map((byte, i) => byte ^ keyBytes[i % keyBytes.length]);

  // Byte array → UTF-8 string
  return new TextDecoder().decode(xored);
};

// ─── Safe wrappers (won't throw in production) ────────────────────────────────

/**
 * Same as decryptData but returns null instead of throwing if the value
 * is missing, corrupted, or from a different SECRET_KEY.
 * Use this when reading from localStorage where the value might be stale.
 */
export const safeDecrypt = (encrypted: string | null): string | null => {
  console.log("33333")
  if (!encrypted) return null;
  try {
    return decryptData(encrypted);
  } catch {
    console.warn('⚠️  Decryption failed — data may be corrupted or key mismatch.');
    return null;
  }
};

/**
 * Same as encryptData but returns null instead of throwing.
 */
export const safeEncrypt = (data: string | null): string | null => {
  console.log("44444")
  if (!data) return null;
  try {
    return encryptData(data);
  } catch {
    console.warn('⚠️  Encryption failed.');
    return null;
  }
};

// ─── Auth token helpers ───────────────────────────────────────────────────────

const TOKEN_KEY = 'auth_token';
const USER_KEY  = 'user_data';

/**
 * Call after a successful login — encrypts and stores the raw JWT.
 *
 * @example
 *   const { token, user } = await apiService.postPublic('/api/auth/login/', creds);
 *   saveAuthToken(token);
 *   saveUserData(user);
 */
export const saveAuthToken = (rawToken: string): void => {
  console.log("55555")
  localStorage.setItem(TOKEN_KEY, encryptData(rawToken));
};

/**
 * Returns the decrypted JWT, or null if not logged in / token corrupted.
 * Used internally by apiService — you generally don't need to call this directly.
 */
export const getAuthToken = (): string | null => {
  console.log("66666")
  const encrypted = localStorage.getItem(TOKEN_KEY);
  return safeDecrypt(encrypted);
};

/**
 * Stores any user object encrypted (pass JSON.stringify result or a plain string).
 */
export const saveUserData = (user: Record<string, unknown>): void => {
  console.log("7777")
  localStorage.setItem(USER_KEY, encryptData(JSON.stringify(user)));
};

/**
 * Retrieves and parses the stored user object, or null if not found.
 */
export const getUserData = <T = Record<string, unknown>>(): T | null => {
  console.log("88888")
  const encrypted = localStorage.getItem(USER_KEY);
  const raw = safeDecrypt(encrypted);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

/**
 * Wipes all auth data from localStorage — call on logout.
 */
export const clearAuthData = (): void => {
  console.log("99999")
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('token');  // legacy key cleanup
  localStorage.removeItem('user');
  localStorage.removeItem('role');
};