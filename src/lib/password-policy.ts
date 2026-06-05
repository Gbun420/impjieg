export const MIN_PASSWORD_LENGTH = 8;

const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

export function validatePasswordPolicy(password: string) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }

  if (!PASSWORD_COMPLEXITY_REGEX.test(password)) {
    return "Password must include uppercase, lowercase, number and special character.";
  }

  return null;
}
