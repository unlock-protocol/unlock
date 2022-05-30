const { reverts } = require('truffle-assertions')
const { errorMessages } = require('../helpers/constants')
const { HARDHAT_VM_ERROR } = errorMessages

const parseCustomError = (msg) =>
  `${HARDHAT_VM_ERROR} reverted with custom error '${msg}()'`

const revertsWithCustomError = (call, msg) =>
  reverts(call, parseCustomError(msg))

module.exports = {
  reverts,
  revertsWithCustomError,
}
