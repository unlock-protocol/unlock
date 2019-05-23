/**
 * This module provides types and constructors for error values.
 * Example usage:
 *
 * import { StorageError } from '/path/to/Error.ts'
 * // oh no, an unrecoverable error has occurred!
 * dispatch(StorageError.Fatal('we ran out of magnetic tape.'))
 */

/* eslint-disable */
export enum ErrorLevel {
  Fatal,
  Warn,
}

export enum ErrorKind {
  StorageError,
  SignatureError,
  FormValidationError,
  LogInError,
  SignUpError,
}
/* eslint-enable */

export interface UnlockError {
  level: ErrorLevel
  kind: ErrorKind
  message: string
}

// We very purposely do not export this: error messaging should be centralized
// here. We want to avoid ad-hoc creation of unhandled error types.
const errorMaker = (kind: ErrorKind, level: ErrorLevel) => (
  message: string
): UnlockError => ({
  level,
  kind,
  message,
})

export const StorageError = {
  Fatal: errorMaker(ErrorKind.StorageError, ErrorLevel.Fatal),
  Warn: errorMaker(ErrorKind.StorageError, ErrorLevel.Warn),
}

export const SignatureError = {
  Fatal: errorMaker(ErrorKind.SignatureError, ErrorLevel.Fatal),
  Warn: errorMaker(ErrorKind.SignatureError, ErrorLevel.Warn),
}

export const FormValidationError = {
  Fatal: errorMaker(ErrorKind.FormValidationError, ErrorLevel.Fatal),
  Warn: errorMaker(ErrorKind.FormValidationError, ErrorLevel.Warn),
}

export const LogInError = {
  Fatal: errorMaker(ErrorKind.LogInError, ErrorLevel.Fatal),
  Warn: errorMaker(ErrorKind.LogInError, ErrorLevel.Warn),
}

export const SignUpError = {
  Fatal: errorMaker(ErrorKind.SignUpError, ErrorLevel.Fatal),
  Warn: errorMaker(ErrorKind.SignUpError, ErrorLevel.Warn),
}
