export class AppError extends Error {
  constructor(
    message: string,
    public readonly code = 'unexpected',
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
/** Only errors explicitly created for visitors may cross into UI messages. */
export function errorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  return error instanceof AppError ? error.message : fallback;
}
export function isAbortError(error: unknown) {
  return error instanceof Error && error.name === 'AbortError';
}
