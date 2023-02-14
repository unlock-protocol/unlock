const almostEqual = (bn1, bn2, epsilon = 2) => Math.abs(bn1.sub(bn2)) < epsilon

module.exports = {
  almostEqual,
}
