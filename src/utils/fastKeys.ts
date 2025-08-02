import crypto from "crypto";

export function generateFastKey(fastStartName: string): string {
  const masterKey = process.env.FASTSTART_MASTER_KEY;

  if (!masterKey) {
    throw new Error("FASTSTART_MASTER_KEY environment variable is required");
  }

  const hash = crypto
    .createHmac("sha256", masterKey)
    .update(fastStartName)
    .digest("hex");

  return hash.substring(0, 32);
}

export function validateFastKey(
  sourceName: string,
  providedKey: string
): boolean {
  try {
    const expectedKey = generateFastKey(sourceName);
    return crypto.timingSafeEqual(
      Buffer.from(expectedKey, "utf8"),
      Buffer.from(providedKey, "utf8")
    );
  } catch {
    return false;
  }
}
