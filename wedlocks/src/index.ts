import { handler } from './functions/handler/handler'

export interface Env {}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const body = await request.text()
    const url = new URL(request.url)
    const headers = {}
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
      (error, response) => {
        if (error) {
          return new Response(error.message, {
            status: 500,
            headers: {},
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
