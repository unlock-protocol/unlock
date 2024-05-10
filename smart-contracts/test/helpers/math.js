const almostEqual = (bn1, bn2, epsilon = 2n) => abs(bn1 - bn2) < epsilon

const abs = (n) => (n < 0n ? -n : n)

module.exports = {
  almostEqual,
  abs,
}
