'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('PaymentIntents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      lockAddress: {
        type: Sequelize.STRING
      },
      chain: {
        type: Sequelize.INTEGER
      },
      userAddress: {
        type: Sequelize.STRING
      },
      intentId: {
        type: Sequelize.STRING
      },
      stripeCustomerId: {
        type: Sequelize.STRING
      },
      connectedStripeId: {
        type: Sequelize.STRING
      },
      connectedCustomerId: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    await queryInterface.addIndex('PaymentIntents', { fields: ['lockAddress'] })
    await queryInterface.addIndex('PaymentIntents', { fields: ['userAddress'] })
    await queryInterface.addIndex('PaymentIntents', { fields: ['intentId'] })
    await queryInterface.addIndex('PaymentIntents', { fields: ['connectedStripeId'] })
    await queryInterface.addIndex('PaymentIntents', { fields: ['connectedCustomerId'] })

  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('PaymentIntents');
  }
};