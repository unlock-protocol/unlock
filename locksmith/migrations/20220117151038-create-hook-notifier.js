'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('HookNotifiers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      network: {
        type: Sequelize.INTEGER,
      },
      lastSentKeyIds: {
        type: Sequelize.ARRAY(Sequelize.STRING),
      },
      lastSentLockIds: {
        type: Sequelize.ARRAY(Sequelize.STRING),
      },
      keyIds: {
        type: Sequelize.ARRAY(Sequelize.STRING),
      },
      lockIds: {
        type: Sequelize.ARRAY(Sequelize.STRING),
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
    await queryInterface.dropTable('HookNotifiers')
  },
}
