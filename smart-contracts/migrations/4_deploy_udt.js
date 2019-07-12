const UnlockDiscountToken = artifacts.require("UnlockDiscountToken");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(UnlockDiscountToken);
  const unlockDiscountToken = await UnlockDiscountToken.deployed();
  await unlockDiscountToken.initialize();
};
