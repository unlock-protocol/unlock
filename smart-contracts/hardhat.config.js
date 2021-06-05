// hardhat.config.js
require('hardhat-deploy');
require('hardhat-deploy-ethers');

require("@nomiclabs/hardhat-truffle5");
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
};

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  // defaultNetwork: "hardhat",
  // networks: {
  //   hardhat: {
  //     chainId: 4,
  //   }
  // },
  namedAccounts: {
    unlockOwner: 0,
    minter: 1,
    proxyAdmin: 9
  },
  solidity: {
    compilers: [
      { version: '0.5.17', settings },
      { version: '0.8',  settings }
    ]
  }
};
