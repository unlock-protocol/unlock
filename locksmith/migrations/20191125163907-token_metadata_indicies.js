'use strict'

const table = 'UserTokenMetadata'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex(table, {
      fields: ['tokenAddress', 'userAddress'],
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex(
      table,
      'usertokenmetadata_tokenaddress_useraddress'
    )
  },
}
