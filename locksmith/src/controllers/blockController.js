const ethers = require('ethers')
const logger = require('../locksmithLogger')
const Block = require('../block')

const block_get = async (req, res) => {
  let chain
  let provider = ethers.getDefaultProvider(chain)
  let blockNumber = req.params.blockNumber

  try {
    chain = prepareChainId(req.query.chain)
  } catch (error) {
    res.sendStatus(400)
    return
  }

  let block = await Block.findOne({
    where: { number: blockNumber, chain: chain },
  })

  if (block) {
    res.json({
      timestamp: block.timestamp,
    })
  } else {
    try {
      let block = await provider.getBlock(parseInt(req.params.blockNumber))

      if (block) {
        await Block.create({
          number: blockNumber,
          chain: chain,
          hash: block.hash,
          timestamp: block.timestamp,
        })
      }

      res.json({
        timestamp: block.timestamp,
      })
    } catch (error) {
      logger.logFailureRequestingBlockTimestamp(error)
    }
  }
}

const prepareChainId = chainIdentifier => {
  if (chainIdentifier === null || chainIdentifier === undefined) {
    return 1
  } else if (isNaN(chainIdentifier)) {
    let network = ethers.utils.getNetwork(chainIdentifier)

    if (network) {
      return network.chainId
    } else {
      throw 'Unknown Chain Provided'
    }
  } else {
    return parseInt(chainIdentifier)
  }
}

module.exports = { block_get }
