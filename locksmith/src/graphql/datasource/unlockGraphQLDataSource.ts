import { GraphQLDataSource } from 'apollo-datasource-graphql'

const env = process.env.NODE_ENV || 'development'
const config = require('../../../config/config')[env]

// eslint-disable-next-line import/prefer-default-export
export class UnlockGraphQLDataSource extends GraphQLDataSource {
  baseURL = config.graphQLBaseURL
}
