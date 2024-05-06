const almostEqual = (bn1, bn2, epsilon = 2) => Math.abs(bn1 - bn2) < epsilon

module.exports = {
  almostEqual,
}
