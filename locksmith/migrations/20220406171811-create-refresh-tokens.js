'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('RefreshTokens', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      token: Sequelize.TEXT,
      nonce: Sequelize.TEXT,
      revoked: Sequelize.BOOLEAN,
      walletAddress: {
        allowNull: false,
        type: Sequelize.TEXT,
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
    await queryInterface.addIndex('RefreshTokens', { fields: ['token'] })
    await queryInterface.addIndex('RefreshTokens', { fields: ['nonce'] })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('RefreshTokens')
  },
}
