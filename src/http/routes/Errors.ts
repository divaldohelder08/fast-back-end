export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized.");
  }
}

export class NotAManagerError extends Error {
  constructor() {
    super("User is not a manager.");
  }
}
