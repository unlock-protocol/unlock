/* eslint no-console: 0 */
/* eslint import/prefer-default-export: 0 */
// AWS needs named exports
export const handler = (event, context, callback) => {
  // Do stuff with async and callback
  return callback(null, {
    statusCode: 200,
    body: 'Hello, World'
  })
}
