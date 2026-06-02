export function requireEnv(name: string, value = process.env[name]) {
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}
