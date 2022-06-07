const { argv } = require('yargs')
const { exec } = require('child_process')
const networksConfig = require('@unlock-protocol/networks')

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
  development: {},
  production: {}
}



Object.keys(networksConfig).forEach((network) => {
  if (['network', 'default'].indexOf(network) == -1) {
    if (networksConfig[network].subgraphURI) {
      const base = (networksConfig[network].subgraphURI).match(/https:\/\/api\.thegraph\.com\/subgraphs\/name\/(.*)/)
      if (base) {
        networkMap.development[network] = {
          subgraph: base[1],
          graphNode: 'http://graph-node:8020/',
          ipfs: 'http://ipfs:5001',
        }
        networkMap.production[network] = {
          subgraph: base[1],
          graphNode: 'https://api.thegraph.com/deploy/',
          ipfs: 'https://api.thegraph.com/ipfs/',
        }

      }
    }
  }
})

function selectConfig() {
  const network = argv.network || 'mainnet'
  const environment = argv.environment || 'development'

  return networkMap[environment][network]
}

function process(operation) {
  const config = selectConfig()

  if (!argv.accessToken) {
    throw new Error(
      'Missing --access-token from https://thegraph.com/hosted-service/dashboard?account=unlock-protocol'
    )
  }
  if (!config) {
    throw new Error('This is an invalid configuration')
  }

  if (operation === 'deploy') {
    const label = argv.label ? `--version-label ${argv.label}` : ''
    const cmd = `graph ${operation} --product hosted-service --access-token ${argv.accessToken} --node ${config.graphNode} --ipfs ${config.ipfs} ${label} ${config.subgraph}`
    executeCommand(cmd)
  } else {
    executeCommand(
      `graph ${operation} --node ${config.graphNode} ${config.subgraph}`
    )
  }
}

module.exports = { process }
