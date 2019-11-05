/* eslint-disable no-console */
const net = require('net')
const { execSync } = require('child_process')

let graphHost = 'graph-node'
let graphPort = '8020'
let subgraph = 'unlock-protocol/unlock'
let ipfsHost = 'ipfs'

let creationCommand = `npx graph create --node http://${graphHost}:${graphPort}/ ${subgraph}`
let deploymentCommand = `npx graph deploy --node http://${graphHost}:${graphPort}/ --ipfs http://${ipfsHost}:5001 ${subgraph}`

const serverIsUp = (delay, maxAttempts) =>
  new Promise((resolve, reject) => {
    let attempts = 1
    const tryConnecting = () => {
      const socket = net.connect(graphPort, graphHost, () => {
        resolve()
        return socket.end() // clean-up
      })

      socket.on('error', error => {
        if (error.code === 'ECONNREFUSED') {
          if (attempts < maxAttempts) {
            attempts += 1
            return setTimeout(tryConnecting, delay)
          }
          return reject(error)
        }
        return reject(error)
      })
    }
    tryConnecting()
  })

serverIsUp(1000 /* every second */, 120 /* up to 2 minutes */)
  .then(() => {
    let createOutput = execSync(creationCommand)
    console.log(createOutput.toString())
    let deployOutput = execSync(deploymentCommand)
    console.log(deployOutput.toString())
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
