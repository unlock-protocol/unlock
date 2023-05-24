'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('StripeConnectLocks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      lock: {
        type: Sequelize.STRING,
      },
      manager: {
        type: Sequelize.STRING,
      },
      chain: {
        type: Sequelize.INTEGER,
      },
      stripeAccount: {
        type: Sequelize.STRING,
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
    await queryInterface.addIndex('StripeConnectLocks', { fields: ['lock'] })
    await queryInterface.addIndex('StripeConnectLocks', {
      fields: ['stripeAccount'],
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('StripeConnectLocks')
  },
}
