import app from '../src/app'
const port = process.env.PORT || 8080

const server = app.listen(port)

export default server
