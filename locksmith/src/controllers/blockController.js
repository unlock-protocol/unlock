const ethers = require('ethers')
const logger = require('../locksmithLogger')
const { Block } = require('../models')

const blockGet = async (req, res) => {
  let chain
  const provider = ethers.getDefaultProvider(chain)
  const { blockNumber } = req.params

  try {
    chain = prepareChainId(req.query.chain)
  } catch (error) {
    res.sendStatus(400)
    return
  }

  const block = await Block.findOne({
    where: { number: blockNumber, chain },
  })

  if (block) {
    res.json({
      timestamp: block.timestamp,
    })
  } else {
    try {
      const block = await provider.getBlock(parseInt(req.params.blockNumber))

      if (block) {
        await Block.create({
          number: blockNumber,
          chain,
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

const prepareChainId = (chainIdentifier) => {
  if (chainIdentifier === null || chainIdentifier === undefined) {
    return 1
  }
  if (isNaN(chainIdentifier)) {
    const network = ethers.utils.getNetwork(chainIdentifier)

    if (network) {
      return network.chainId
    }
    throw 'Unknown Chain Provided'
  } else {
    return parseInt(chainIdentifier)
  }
}

module.exports = { blockGet }
