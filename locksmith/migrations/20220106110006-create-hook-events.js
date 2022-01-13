'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('HookEvents', {
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
      state: {
        type: Sequelize.STRING,
      },
      retry: {
        type: Sequelize.INTEGER,
      },
      body: {
        type: Sequelize.JSON,
      },
      hookId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      attempts: {
        type: Sequelize.INTEGER,
      },
      key: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      lastError: {
        type: Sequelize.STRING,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('HookEvents')
  },
}
