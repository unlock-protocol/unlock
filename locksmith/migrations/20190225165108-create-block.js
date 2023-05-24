'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Blocks', {
      timestamp: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      hash: {
        type: Sequelize.STRING,
      },
      number: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      chain: {
        allowNull: false,
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Blocks')
  },
}
