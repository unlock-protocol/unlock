'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Charges', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      lock: {
        type: Sequelize.STRING,
      },
      userAddress: {
        type: Sequelize.STRING,
      },
      stripeCharge: {
        type: Sequelize.STRING,
      },
      stripeCustomerId: {
        type: Sequelize.STRING,
      },
      connectedCustomer: {
        type: Sequelize.STRING,
      },
      totalPriceInCents: {
        type: Sequelize.INTEGER,
      },
      unlockServiceFee: {
        type: Sequelize.INTEGER,
      },
      chain: {
        type: Sequelize.INTEGER,
      },
      transactionHash: {
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
    await queryInterface.addIndex('Charges', { fields: ['lock'] })
    await queryInterface.addIndex('Charges', { fields: ['userAddress'] })
    await queryInterface.addIndex('Charges', { fields: ['stripeCharge'] })
    await queryInterface.addIndex('Charges', { fields: ['stripeCustomerId'] })
    await queryInterface.addIndex('Charges', { fields: ['connectedCustomer'] })
    await queryInterface.addIndex('Charges', { fields: ['chain'] })
    await queryInterface.addIndex('Charges', { fields: ['transactionHash'] })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Charges')
  },
}
