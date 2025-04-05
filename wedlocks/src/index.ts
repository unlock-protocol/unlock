import { handler } from './functions/handler/handler'

export type Env = Record<string, never>

interface HandlerResponse {
  statusCode: number
  body?: string
  headers?: Record<string, string>
}

export default {
  async fetch(request: Request): Promise<Response> {
    const body = await request.text()
    const url = new URL(request.url)
    const headers: Record<string, string> = {}
    for (const pair of request.headers.entries()) {
      headers[pair[0]] = pair[1]
    }

    return handler(
      {
        httpMethod: request.method,
        headers,
        body,
        path: url.pathname,
        queryStringParameters: Object.fromEntries(url.searchParams.entries()),
      },
      {},
      (error: Error | null, response: HandlerResponse) => {
        if (error) {
          return new Response(error.message, {
            status: 500,
            headers: {},
          })
        }

        // For 204 responses, body must be null
        if (response.statusCode === 204) {
          return new Response(null, {
            status: response.statusCode,
            headers: response.headers,
          })
        }

        return new Response(response.body, {
          status: response.statusCode,
          headers: response.headers,
        })
      }
    )
  },
}
