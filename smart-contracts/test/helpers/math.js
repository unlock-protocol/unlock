const almostEqual = (bn1, bn2, epsilon = 2n) => Math.abs(bn1 - bn2) < epsilon

module.exports = {
  almostEqual,
}
