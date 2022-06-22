const { expectRevert } = require('@openzeppelin/test-helpers')

const reverts = (call, msg) =>
  msg ? expectRevert(call, msg) : expectRevert.unspecified(call)

module.exports = {
  reverts,
}
