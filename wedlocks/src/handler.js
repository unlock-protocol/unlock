const handler = (event, context, callback) => {
  // Do stuff with async and callback
  return callback(null, 'Hello World')
}

export default handler
