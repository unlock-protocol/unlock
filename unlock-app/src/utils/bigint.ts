// @ts-expect-error 🚧 This is a workaround for ethers 6 support
BigInt.prototype.toJSON = function () {
  return this.toString()
}
