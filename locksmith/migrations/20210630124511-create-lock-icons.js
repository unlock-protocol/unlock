'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('LockIcons', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      lock: {
        type: Sequelize.STRING,
      },
      chain: {
        type: Sequelize.INTEGER,
      },
      icon: {
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
    await queryInterface.addIndex('LockIcons', {
      unique: true,
      fields: ['lock', 'chain'],
      name: 'lock_chain_index',
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('LockIcons')
  },
}
