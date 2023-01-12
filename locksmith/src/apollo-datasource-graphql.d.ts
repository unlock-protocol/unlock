declare module 'apollo-datasource-graphql' {
  import { DocumentNode } from 'graphql'

  export class GraphQLDataSource {
    baseURL: string | undefined

    query(
      query: DocumentNode,
      variables?: Record<string, unknown>
    ): Promise<any>

    mutation(
      mutation: DocumentNode,
      variables?: Record<string, unknown>
    ): Promise<any>
  }
}
