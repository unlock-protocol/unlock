import { GraphQLDataSource } from 'apollo-datasource-graphql'

const config = require('../../../config/config')

// eslint-disable-next-line import/prefer-default-export
export class UnlockGraphQLDataSource extends GraphQLDataSource {
  baseURL = config.graphQLBaseURL
}
