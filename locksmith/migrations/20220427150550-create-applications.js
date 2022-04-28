'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Applications', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.TEXT,
      },
      name: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      description: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      revoked: Sequelize.BOOLEAN,
      walletAddress: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      secret: {
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Applications')
  },
}
