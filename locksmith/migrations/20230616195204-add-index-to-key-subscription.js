'use strict'
const tableName = 'KeySubscriptions'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex(tableName, {
      unique: true,
      name: 'network_lockAddress_keyId_userAddress_index',
      fields: ['network', 'lockAddress', 'keyId', 'userAddress'],
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      tableName,
      'network_lockAddress_keyId_userAddress_index'
    )
  },
}
