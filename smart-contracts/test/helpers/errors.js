const { expectRevert } = require('@openzeppelin/test-helpers')

const { errorMessages } = require('../helpers/constants')
const { HARDHAT_VM_ERROR } = errorMessages

const parseCustomError = (msg) =>
  `${HARDHAT_VM_ERROR} reverted with custom error '${msg}()'`

const revertsWithCustomError = (call, msg) =>
  reverts(call, parseCustomError(msg))

const reverts = (call, msg) =>
  msg ? expectRevert(call, msg) : expectRevert.unspecified(call)

module.exports = {
  reverts,
  revertsWithCustomError,
}
