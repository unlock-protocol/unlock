'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('KeySubscriptions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      keyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      lockAddress: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      userAddress: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      network: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      stripeCustomerId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      connectedCustomer: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      unlockServiceFee: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      recurring: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
    await queryInterface.dropTable('KeySubscriptions')
  },
}
