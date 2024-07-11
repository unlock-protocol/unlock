const config = require('./config')
const deploy = require('./deploy')

const initializeTasks = () => {
  config()
  deploy()
}

module.exports = { initializeTasks }
