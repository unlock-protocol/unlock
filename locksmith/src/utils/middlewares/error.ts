import { ZodError } from 'zod'
import { ErrorRequestHandler } from 'express'

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next
) => {
  if (error instanceof ZodError) {
    return response.status(400).send({
      message: error.message,
      error: error.format(),
    })
  } else {
    return response.status(500).send({
      message: error.message,
    })
  }
}
