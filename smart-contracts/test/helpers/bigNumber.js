const { BigNumber } = require('ethers')
const { assert } = require('chai')

function isBigNumber(object) {
  return object instanceof BigNumber
}

function compareBigNumbers(bn1, bn2) {
  assert.equal(
    typeof bn1 === 'string' ? bn1 : bn1.toString(),
    typeof bn2 === 'string' ? bn2 : bn2.toString(),
    `${bn1.toString()} does not match ${bn2.toString()}`
  )
}

function compareBigNumberArrays(bn1, bn2) {
  assert.equal(
    bn1.length,
    bn2.length,
    `Length mismatch while comparing arrays ${bn1} and ${bn2}`
  )
  Array.from(bn1).map((_, i) => compareBigNumbers(bn1[i], bn2[i]))
}

module.exports = {
  isBigNumber,
  compareBigNumbers,
  compareBigNumberArrays,
}
