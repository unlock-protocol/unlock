'use strict'
const table = 'UserTokenMetadata'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(table, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      tokenAddress: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      userAddress: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      data: {
        allowNull: false,
        type: Sequelize.JSON,
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
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable(table)
  },
}
