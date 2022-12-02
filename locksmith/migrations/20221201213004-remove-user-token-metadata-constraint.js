'use strict'

const table = 'UserTokenMetadata'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.removeConstraint(
      table,
      'token_user_address_unique_constraint'
    )
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.addConstraint(table, {
      type: 'unique',
      fields: ['tokenAddress', 'userAddress'],
      name: 'token_user_address_unique_constraint',
    })
  },
}
