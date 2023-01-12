'use strict'

const table = 'UserTokenMetadata'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addConstraint(table, {
      type: 'unique',
      fields: ['tokenAddress', 'userAddress'],
      name: 'token_user_address_unique_constraint',
    })
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeContraint(
      table,
      'token_user_address_unique_constraint'
    )
  },
}
