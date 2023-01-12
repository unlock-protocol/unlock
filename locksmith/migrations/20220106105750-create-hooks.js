'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Hooks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      network: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      topic: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      lock: {
        type: Sequelize.STRING,
      },
      expiration: {
        type: Sequelize.DATE,
      },
      mode: {
        type: Sequelize.STRING,
      },
      callback: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      secret: {
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
    await queryInterface.dropTable('Hooks')
  },
}
