export function getLatestVersion(versions: string[]): string {
  return versions.sort((a, b) => {
    return b.localeCompare(a, undefined, { numeric: true });
  })[0];
}

export function parseVersionedName(input: string): {
  name: string;
  version?: string;
} {
  if (input.includes("@")) {
    const parts = input.split("@");
    const name = parts[0];
    const version = parts[1];
    return { name, version };
  }
  return { name: input };
}
