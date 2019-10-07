module.exports = {
  port: 8545,
  testrpcOptions: '-p 8545',
  testCommand: 'truffle test',
  norpc: true,
  copyPackages: [
    '@openzeppelin/contracts-ethereum-package',
    '@openzeppelin/upgrades'
  ]
};