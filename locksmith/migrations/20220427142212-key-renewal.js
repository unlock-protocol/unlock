'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('KeyRenewals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      network: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      lockAddress: {
        type: Sequelize.STRING,
      },
      keyId: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      initiatedBy: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      tx: {
        allowNull: true,
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
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('KeyRenewals')
  },
}
