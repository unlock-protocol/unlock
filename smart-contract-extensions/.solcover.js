module.exports = {
  skipFiles: ['Migrations.sol'], // , 'test-artifacts/', 'test-helpers/'
  providerOptions: {
    total_accounts: 100,
    default_balance_ether: 10000000000,
    hardfork: 'istanbul'
  },
  mocha: {
    reporter: null
  }
}; 
