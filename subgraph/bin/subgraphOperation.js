const { argv } = require('yargs')
const { exec } = require('child_process')

const executeCommand = (command) => {
  exec(command, function (error, stdout, stderr) {
    console.log(stdout)
    if (stderr) {
      console.log(`stderr: ${stderr}`)
    }
    if (error !== null) {
      console.log(`exec error: ${error}`)
    }
  })
}

const networkMap = {
  development: {
    mainnet: {
      subgraph: 'unlock-protocol/unlock',
      graphNode: 'http://localhost:8020/',
      ipfs: 'http://localhost:5001',
    },
    kovan: {
      subgraph: 'unlock-protocol/unlock-kovan',
      graphNode: 'http://localhost:8020/',
      ipfs: 'http://localhost:5001',
    },
    rinkeby: {
      subgraph: 'unlock-protocol/unlock-rinkeby',
      graphNode: 'http://localhost:8020/',
      ipfs: 'http://localhost:5001',
    },
    ropsten: {
      subgraph: 'unlock-protocol/unlock-ropsten',
      graphNode: 'http://localhost:8020/',
      ipfs: 'http://localhost:5001',
    },
    xdai: {
      subgraph: 'unlock-protocol/xdai',
      graphNode: 'http://localhost:8020/',
      ipfs: 'http://localhost:5001',
    },
  },
  production: {
    kovan: {
      subgraph: 'unlock-protocol/unlock-kovan',
      graphNode: 'https://api.thegraph.com/deploy/',
      ipfs: 'https://api.thegraph.com/ipfs/',
    },
    mainnet: {
      subgraph: 'unlock-protocol/unlock',
      graphNode: 'https://api.thegraph.com/deploy/',
      ipfs: 'https://api.thegraph.com/ipfs/',
    },
    rinkeby: {
      subgraph: 'unlock-protocol/unlock-rinkeby',
      graphNode: 'https://api.thegraph.com/deploy/',
      ipfs: 'https://api.thegraph.com/ipfs/',
    },
    ropsten: {
      subgraph: 'unlock-protocol/unlock-ropsten',
      graphNode: 'https://api.thegraph.com/deploy/',
      ipfs: 'https://api.thegraph.com/ipfs/',
    },
    xdai: {
      subgraph: 'unlock-protocol/xdai',
      graphNode: 'https://api.thegraph.com/deploy/',
      ipfs: 'https://api.thegraph.com/ipfs/',
    },
    matic: {
      subgraph: 'unlock-protocol/polygon',
      graphNode: 'https://api.thegraph.com/deploy/',
      ipfs: 'https://api.thegraph.com/ipfs/',
    },
    demorinkeby: {
      subgraph: 'unlock-protocol/demo-rinkeby',
      graphNode: 'https://api.thegraph.com/deploy/',
      ipfs: 'https://api.thegraph.com/ipfs/',
    },
  },
}

function selectConfig() {
  const network = argv.network || 'mainnet'
  const environment = argv.environment || 'development'

  return networkMap[environment][network]
}

function process(operation) {
  const config = selectConfig()

  if (!config) {
    throw new Error('This is an invalid configuration')
  }

  if (operation === 'deploy') {
    executeCommand(
      `graph ${operation} --node ${config.graphNode} --ipfs ${config.ipfs} ${config.subgraph}`
    )
  } else {
    executeCommand(
      `graph ${operation} --node ${config.graphNode} ${config.subgraph}`
    )
  }
}

module.exports = { process }
