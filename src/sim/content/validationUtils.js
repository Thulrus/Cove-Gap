// Shared helpers for failing loud on malformed content at load time.

export class ContentValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ContentValidationError";
  }
}

export function assert(condition, message) {
  if (!condition) {
    throw new ContentValidationError(message);
  }
}

export function assertArray(value, path) {
  assert(Array.isArray(value), `${path} must be an array`);
}

export function assertPositiveNumber(value, path) {
  assert(typeof value === "number" && value > 0, `${path} must be a positive number`);
}
