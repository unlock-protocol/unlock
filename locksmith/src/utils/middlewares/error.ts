import { ZodError } from 'zod'
import { ErrorRequestHandler } from 'express'

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next
) => {
  if (response.headersSent) {
    return _next(error)
  }
  if (error instanceof ZodError) {
    response.status(400).send({
      message: error.message,
      error: error.format(),
    })
    return
  } else {
    response.status(500).send({
      message: error.message,
    })
    return
  }
}
