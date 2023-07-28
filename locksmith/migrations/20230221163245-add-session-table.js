'use strict'
const table = 'Sessions'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(table, {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.TEXT,
      },
      nonce: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      walletAddress: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      expireAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
    await queryInterface.addIndex(table, { fields: ['id'] })
    await queryInterface.addIndex(table, { fields: ['nonce'] })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(table)
  },
}
