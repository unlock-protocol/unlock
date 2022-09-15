'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FiatRecurringPurchase', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      recurring: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      transacted: {
        allowNull: false,
        type: Sequelize.INTEGER,
        default: 0,
      },
      amount: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      keyId: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      lockAddress: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      userAddress: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      customerId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      network: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
    await queryInterface.dropTable('FiatRecurringPurchase')
  },
}
