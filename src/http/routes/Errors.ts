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

export class NotAgentError extends Error {
  constructor() {
    super("Agent não encontrado ou offline.");
  }
}

export class NotDriverError extends Error {
  constructor() {
    super("Driver não encontrado ou offline.");
  }
}

export class NotClientError extends Error {
  constructor() {
    super("Cliente não encontrado.");
  }
}

export class NotSupperManagerError extends Error {
  constructor() {
    super("Usuario não é um sup-manager.");
  }
}
