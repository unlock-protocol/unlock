// hardhat.config.js
require('hardhat-deploy');
require('hardhat-deploy-ethers');

require("@nomiclabs/hardhat-truffle5");
require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-ethers');
require('@openzeppelin/hardhat-upgrades');


task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const settings = {
  optimizer: {
    enabled: true,
    runs: 200,
  },
}

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  namedAccounts: {
    unlockOwner: 0,
    minter: 1,
    proxyAdmin: 9
  },
  solidity: {
    compilers: [
      { version: '0.5.17', settings },
      { version: '0.6.12', settings },
      { version: '0.7.6', settings },
      { version: '0.8.4', settings }
    ]
  }
}